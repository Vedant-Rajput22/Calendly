import { Request, Response, Router } from "express";
import { google } from "googleapis";
import prisma from "../lib/prisma";
import { availableSlotsQuerySchema } from "../schemas/validation";

const router = Router();
const FALLBACK_GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_CALENDAR_REFRESH_TOKEN;

// GET /api/available-slots?slug=xxx&date=YYYY-MM-DD&timezone=xxx
router.get("/", async (req: Request, res: Response) => {
  try {
    const parsed = availableSlotsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const { slug, date } = parsed.data;

    // 1. Fetch event_type by slug → get duration_mins
    const eventType = await prisma.eventType.findUnique({
      where: { slug },
      include: { user: { select: { id: true, timezone: true } } },
    });

    if (!eventType || !eventType.isActive) {
      return res.status(404).json({ error: "Event type not found or inactive" });
    }

    const userId = eventType.userId;
    const durationMins = eventType.durationMins;
    const bufferBefore = eventType.bufferBeforeMins;
    const bufferAfter = eventType.bufferAfterMins;

    // Parse the requested date
    const requestedDate = new Date(date + "T00:00:00.000Z");
    const dayOfWeek = requestedDate.getUTCDay(); // 0=Sun ... 6=Sat

    // 2. Check date_overrides first
    const dateOverride = await prisma.dateOverride.findUnique({
      where: {
        userId_date: {
          userId,
          date: requestedDate,
        },
      },
    });

    if (dateOverride?.isBlocked) {
      return res.json({ slots: [], date, slug });
    }

    // 3. Get availability for that day (or use override's custom hours)
    let dailyWindows: { startTime: string; endTime: string }[] = [];

    if (dateOverride && !dateOverride.isBlocked && dateOverride.startTime && dateOverride.endTime) {
      dailyWindows = [{ startTime: dateOverride.startTime, endTime: dateOverride.endTime }];
    } else {
      const availability = await prisma.availability.findUnique({
        where: {
          userId_dayOfWeek: {
            userId,
            dayOfWeek,
          },
        },
        include: { windows: { orderBy: { sortOrder: "asc" } } },
      });

      const availabilityWithWindows = availability as
        | (typeof availability & {
            windows?: { startTime: string; endTime: string }[];
          })
        | null;

      if (!availabilityWithWindows || !availabilityWithWindows.isEnabled) {
        return res.json({ slots: [], date, slug });
      }

      const windows = availabilityWithWindows.windows || [];
      dailyWindows =
        windows.length > 0
          ? windows.map((w) => ({ startTime: w.startTime, endTime: w.endTime }))
          : [{ startTime: availabilityWithWindows.startTime, endTime: availabilityWithWindows.endTime }];
    }

    // 4. Generate slot list (start..end step duration)
    const dayStart = new Date(requestedDate);
    dayStart.setUTCHours(0, 0, 0, 0);

    const dayEnd = new Date(requestedDate);
    dayEnd.setUTCHours(23, 59, 59, 999);

    const slots: { start: string; end: string }[] = [];
    const slotDuration = durationMins * 60000;

    for (const window of dailyWindows) {
      const [startHour, startMin] = window.startTime.split(":").map(Number);
      const [endHour, endMin] = window.endTime.split(":").map(Number);

      const windowStart = new Date(requestedDate);
      windowStart.setUTCHours(startHour, startMin, 0, 0);

      const windowEnd = new Date(requestedDate);
      windowEnd.setUTCHours(endHour, endMin, 0, 0);

      let cursor = windowStart.getTime();
      while (cursor + slotDuration <= windowEnd.getTime()) {
        slots.push({
          start: new Date(cursor).toISOString(),
          end: new Date(cursor + slotDuration).toISOString(),
        });
        cursor += slotDuration;
      }
    }

    // 5. Fetch all confirmed bookings natively
    const bookings = await prisma.booking.findMany({
      where: {
        eventType: { userId },
        status: "confirmed",
        startTime: { lt: dayEnd },
        endTime: { gt: dayStart },
      },
    });

    // 6. Fetch live Google Calendar Free/Busy if User connected Account
    const account = await prisma.account.findFirst({
      where: {
        userId,
        provider: 'google',
        refresh_token: { not: null },
        OR: [
          { scope: { contains: "https://www.googleapis.com/auth/calendar" } },
          { scope: { contains: "https://www.googleapis.com/auth/calendar.events" } },
        ],
      },
    });

    let googleBusySlots: { start: string; end: string }[] = [];
    let refreshToken = account?.refresh_token || FALLBACK_GOOGLE_REFRESH_TOKEN;

    if (!refreshToken) {
      const fallbackAccount = await prisma.account.findFirst({
        where: {
          provider: "google",
          refresh_token: { not: null },
          OR: [
            { scope: { contains: "https://www.googleapis.com/auth/calendar" } },
            { scope: { contains: "https://www.googleapis.com/auth/calendar.events" } },
          ],
        },
        orderBy: { id: "desc" },
      });
      refreshToken = fallbackAccount?.refresh_token || undefined;
    }

     if (refreshToken) {
       const oauth2Client = new google.auth.OAuth2(
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_CLIENT_SECRET
       );
       oauth2Client.setCredentials({
        refresh_token: refreshToken,
         access_token: account?.access_token ?? undefined,
         expiry_date: account?.expires_at ? account.expires_at * 1000 : undefined,
       });
       
       const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
       
       try {
         const response = await calendar.freebusy.query({
           requestBody: {
             timeMin: dayStart.toISOString(),
             timeMax: dayEnd.toISOString(),
             items: [{ id: 'primary' }]
           }
         });
         
         const busy = response.data.calendars?.['primary']?.busy;
         if (busy) {
            googleBusySlots = busy as { start: string; end: string }[];
         }
       } catch(e) {
         console.error("GCal Free/Busy Check Failed:", e);
       }
    }

    // 7. Filter out booked slots (with buffer time consideration + Google Conflicts)
    const availableSlots = slots.filter((slot) => {
      const slotStart = new Date(slot.start).getTime();
      const slotEnd = new Date(slot.end).getTime();

      const effectiveStart = slotStart - bufferBefore * 60000;
      const effectiveEnd = slotEnd + bufferAfter * 60000;

      // Check Local Bookings
      const localOverlap = bookings.some((booking) => {
        const bStart = booking.startTime.getTime();
        const bEnd = booking.endTime.getTime();
        return bStart < effectiveEnd && bEnd > effectiveStart;
      });

      if (localOverlap) return false;

      // Check Google Bookings
      const googleOverlap = googleBusySlots.some((busy) => {
        const gStart = new Date(busy.start).getTime();
        const gEnd = new Date(busy.end).getTime();
        return gStart < effectiveEnd && gEnd > effectiveStart;
      });

      if (googleOverlap) return false;

      return true;
    });

    // 8. Filter out past slots if the date is today
    const now = new Date();
    const finalSlots = availableSlots.filter((slot) => {
      return new Date(slot.start) > now;
    });

    res.json({ slots: finalSlots, date, slug });
  } catch (error) {
    console.error("Error fetching available slots:", error);
    res.status(500).json({ error: "Failed to fetch available slots" });
  }
});

export default router;
