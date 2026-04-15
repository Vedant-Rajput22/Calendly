import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response, Router } from "express";
import rateLimit from "express-rate-limit";
import { google } from "googleapis";
import {
    sendBookingEmails,
    sendCancellationEmails,
    triggerBookingWebhook,
} from "../lib/integrations";
import prisma from "../lib/prisma";
import {
    createBookingSchema,
    rescheduleBookingSchema,
} from "../schemas/validation";

const router = Router();
const FALLBACK_GOOGLE_REFRESH_TOKEN = process.env.GOOGLE_CALENDAR_REFRESH_TOKEN;

// Middleware securely resolving proxy token
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.headers["x-user-id"] as string;
  if (!userId || userId === "unauthenticated") {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

const bookingLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many booking attempts, please try again later" },
});

async function getCalendarClient(userId: string) {
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

  let refreshToken = account?.refresh_token || FALLBACK_GOOGLE_REFRESH_TOKEN;

  // Last fallback for assignment mode: use any connected Google account token.
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

  if (!refreshToken) return null;

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  oauth2Client.setCredentials({
    refresh_token: refreshToken,
    access_token: account?.access_token ?? undefined,
    expiry_date: account?.expires_at ? account.expires_at * 1000 : undefined,
  });

  return google.calendar({ version: 'v3', auth: oauth2Client });
}

type BookingWithOrganizerContext = Prisma.BookingGetPayload<{
  include: {
    eventType: {
      select: {
        name: true;
        slug: true;
        color: true;
        durationMins: true;
        userId: true;
        user: { select: { name: true; email: true } };
      };
    };
  };
}>;

function extractMeetLink(event: any): string | null {
  const fromHangout = event?.hangoutLink;
  if (fromHangout) return fromHangout;
  const videoEntry = event?.conferenceData?.entryPoints?.find(
    (entry: any) => entry?.entryPointType === "video" && entry?.uri
  );
  return videoEntry?.uri ?? null;
}


// ─── PUBLIC: POST /api/bookings — Create with double-booking prevention & GCal Sync ───
router.post("/", bookingLimiter, async (req: Request, res: Response) => {
  try {
    const parsed = createBookingSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const {
      eventTypeId,
      startTime: startTimeStr,
      inviteeName,
      inviteeEmail,
      timezone,
      inviteeNotes,
    } = parsed.data;

    const eventType = await prisma.eventType.findUnique({
      where: { id: eventTypeId },
    });
    if (!eventType) return res.status(404).json({ error: "Event type not found" });
    if (!eventType.isActive) return res.status(400).json({ error: "Event type is not active" });

    const startTime = new Date(startTimeStr);
    const endTime = new Date(startTime.getTime() + eventType.durationMins * 60000);

    const booking = await prisma.$transaction(async (tx) => {
      const bufferBefore = eventType.bufferBeforeMins * 60000;
      const bufferAfter = eventType.bufferAfterMins * 60000;
      const effectiveStart = new Date(startTime.getTime() - bufferBefore);
      const effectiveEnd = new Date(endTime.getTime() + bufferAfter);

      const overlapping = await tx.$queryRaw<Array<{ id: string }>>(Prisma.sql`
        SELECT b.id
        FROM bookings b
        INNER JOIN event_types e ON e.id = b.event_type_id
        WHERE e.user_id = ${eventType.userId}
          AND b.status = 'confirmed'
          AND b.start_time < ${effectiveEnd}
          AND b.end_time > ${effectiveStart}
        FOR UPDATE
      `);

      if (overlapping.length > 0) throw new Error("SLOT_TAKEN");

      return tx.booking.create({
        data: {
          eventTypeId,
          inviteeName,
          inviteeEmail,
          startTime,
          endTime,
          timezone: timezone || "Asia/Kolkata",
        },
        include: {
          eventType: { select: { name: true, slug: true, color: true, durationMins: true, userId: true } },
        },
      });
    });

    try {
      const calendar = await getCalendarClient(booking.eventType.userId);
      if (calendar) {
        const event = await calendar.events.insert({
          calendarId: 'primary',
          sendUpdates: 'all',
          conferenceDataVersion: 1,
          requestBody: {
            summary: `${inviteeName} and Calendly Host: ${eventType.name}`,
            description: `Event scheduled via Calendly.\nInvitee Email: ${inviteeEmail}${
              inviteeNotes ? `\nInvitee Notes: ${inviteeNotes}` : ""
            }`,
            start: { dateTime: startTime.toISOString(), timeZone: booking.timezone },
            end: { dateTime: endTime.toISOString(), timeZone: booking.timezone },
            attendees: [{ email: inviteeEmail }],
            conferenceData: {
              createRequest: {
                requestId: booking.id,
                conferenceSolutionKey: {
                  type: 'hangoutsMeet'
                }
              }
            }
          }
        });

        if (event.data.id) {
          let meetingUrl = extractMeetLink(event.data);

          if (!meetingUrl) {
            const refreshedEvent = await calendar.events.get({
              calendarId: "primary",
              eventId: event.data.id,
            });
            meetingUrl = extractMeetLink((refreshedEvent as any).data);
          }

          await prisma.booking.update({
            where: { id: booking.id },
            data: {
              googleEventId: event.data.id,
              meetingUrl,
            }
          });
        }
      }
    } catch (gcalError) {
      console.error("Failed to sync to Google Calendar:", gcalError);
    }

    // Re-fetch booking to include meetingUrl from GCal sync
    const finalBooking = await prisma.booking.findUnique({
      where: { id: booking.id },
      include: {
        eventType: { select: { name: true, slug: true, color: true, durationMins: true, userId: true } },
      },
    });

    // Send emails AFTER re-fetch so they include the Google Meet link
    try {
      await Promise.all([
        sendBookingEmails({ ...(finalBooking as any), inviteeNotes: inviteeNotes || null }),
        triggerBookingWebhook({ type: "booking.created", booking: finalBooking }),
      ]);
    } catch (integrationError) {
      console.error("Post-booking integrations failed:", integrationError);
    }

    res.status(201).json(finalBooking);
  } catch (error: any) {
    if (error.message === "SLOT_TAKEN") {
      return res.status(409).json({ error: "This time slot is no longer available" });
    }
    console.error("Error creating booking:", error);
    res.status(500).json({ error: "Failed to create booking" });
  }
});


// ─── AUTHENTICATED: GET /api/bookings/upcoming ───
router.get("/upcoming", requireAuth, async (req: Request, res: Response) => {
  const userId = req.headers["x-user-id"] as string;
  try {
    const viewer = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    const bookings = (await prisma.booking.findMany({
      where: {
        OR: [
          { eventType: { userId } },
          ...(viewer?.email ? [{ inviteeEmail: viewer.email }] : []),
        ],
        status: "confirmed",
        startTime: { gte: new Date() },
      },
      include: {
        eventType: {
          select: {
            name: true,
            slug: true,
            color: true,
            durationMins: true,
            userId: true,
            user: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: { startTime: "asc" },
    })) as BookingWithOrganizerContext[];

    const shaped = bookings.map((booking) => ({
      ...booking,
      isOrganizer: booking.eventType.userId === userId,
      organizerName: booking.eventType.user?.name || "Host",
      organizerEmail: booking.eventType.user?.email || null,
    }));

    res.json(shaped);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch upcoming bookings" });
  }
});

// ─── AUTHENTICATED: GET /api/bookings/past ───
router.get("/past", requireAuth, async (req: Request, res: Response) => {
  const userId = req.headers["x-user-id"] as string;
  try {
    const viewer = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });

    const bookings = (await prisma.booking.findMany({
      where: {
        AND: [
          {
            OR: [
              { eventType: { userId } },
              ...(viewer?.email ? [{ inviteeEmail: viewer.email }] : []),
            ],
          },
          {
            OR: [
              { startTime: { lt: new Date() } },
              { status: "cancelled" },
            ],
          },
        ],
      },
      include: {
        eventType: {
          select: {
            name: true,
            slug: true,
            color: true,
            durationMins: true,
            userId: true,
            user: { select: { name: true, email: true } },
          },
        },
      },
      orderBy: { startTime: "desc" },
    })) as BookingWithOrganizerContext[];

    const shaped = bookings.map((booking) => ({
      ...booking,
      isOrganizer: booking.eventType.userId === userId,
      organizerName: booking.eventType.user?.name || "Host",
      organizerEmail: booking.eventType.user?.email || null,
    }));

    res.json(shaped);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch past bookings" });
  }
});

// ─── PUBLIC: GET /api/bookings/:id ───
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: String(req.params.id) },
      include: {
        eventType: { select: { name: true, slug: true, color: true, durationMins: true, userId: true } },
      },
    });
    if (!booking) return res.status(404).json({ error: "Booking not found" });
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch booking" });
  }
});


// ─── AUTHENTICATED: PATCH /api/bookings/:id/cancel ───
router.patch("/:id/cancel", requireAuth, async (req: Request, res: Response) => {
  const userId = req.headers["x-user-id"] as string;
  try {
    const verify = await prisma.booking.findUnique({
      where: { id: String(req.params.id) },
      include: { eventType: { select: { userId: true } } }
    });

    if (!verify || verify.eventType.userId !== userId) {
      return res.status(404).json({ error: "Booking not found or unauth" });
    }

    const booking = await prisma.booking.update({
      where: { id: verify.id },
      data: { status: "cancelled" },
      include: {
        eventType: { select: { name: true, slug: true, color: true, durationMins: true, userId: true } },
      },
    });

    if (booking.googleEventId) {
      try {
        const calendar = await getCalendarClient(booking.eventType.userId);
        if (calendar) {
          await calendar.events.delete({
            calendarId: 'primary',
            eventId: booking.googleEventId,
            sendUpdates: 'all'
          });
        }
      } catch (e) {
        console.error("GCal event deletion failed", e);
      }
    }

    try {
      await sendCancellationEmails(booking as any);
    } catch (e) {
      console.error("Post-cancellation email failed", e);
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: "Failed to cancel booking" });
  }
});

// ─── PUBLIC: cancel tokens ───
router.get("/cancel-token/:cancelToken", async (req, res) => {
  const booking = await prisma.booking.findUnique({
    where: { cancelToken: String(req.params.cancelToken) },
    include: { eventType: { select: { name: true, slug: true, color: true, durationMins: true } } },
  });
  if (!booking) return res.status(404).json({ error: "Not found" });
  res.json(booking);
});

router.patch("/cancel-token/:cancelToken", async (req, res) => {
  const bookingToCancel = await prisma.booking.findUnique({
    where: { cancelToken: String(req.params.cancelToken) },
  });
  if (!bookingToCancel) return res.status(404).json({ error: "Booking not found" });

  const updated = await prisma.booking.update({
    where: { id: bookingToCancel.id },
    data: { status: "cancelled" },
    include: { eventType: { select: { name: true, slug: true, color: true, durationMins: true, userId: true } } },
  });

  if (updated.googleEventId) {
    try {
      const calendar = await getCalendarClient(updated.eventType.userId);
      if (calendar) {
        await calendar.events.delete({
          calendarId: 'primary',
          eventId: updated.googleEventId,
          sendUpdates: 'all'
        });
      }
    } catch (e) { console.error(e); }
  }

  try {
    await sendCancellationEmails(updated as any);
  } catch (e) {
    console.error("Post-cancellation email failed", e);
  }

  res.json(updated);
});

// ─── PUBLIC: reschedule via cancel token ───
router.patch("/cancel-token/:cancelToken/reschedule", bookingLimiter, async (req, res) => {
  const parsed = rescheduleBookingSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const bookingToReschedule = await prisma.booking.findUnique({
    where: { cancelToken: String(req.params.cancelToken) },
    include: {
      eventType: {
        select: { id: true, userId: true, durationMins: true, slug: true, name: true, color: true },
      },
    },
  });

  if (!bookingToReschedule) {
    return res.status(404).json({ error: "Booking not found" });
  }

  if (bookingToReschedule.status === "cancelled") {
    return res.status(400).json({ error: "Cancelled bookings cannot be rescheduled" });
  }

  const startTime = new Date(parsed.data.startTime);
  const endTime = new Date(startTime.getTime() + bookingToReschedule.eventType.durationMins * 60000);

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const overlapping = await tx.$queryRaw<Array<{ id: string }>>(Prisma.sql`
        SELECT b.id
        FROM bookings b
        INNER JOIN event_types e ON e.id = b.event_type_id
        WHERE e.user_id = ${bookingToReschedule.eventType.userId}
          AND b.status = 'confirmed'
          AND b.id <> ${bookingToReschedule.id}
          AND b.start_time < ${endTime}
          AND b.end_time > ${startTime}
        FOR UPDATE
      `);

      if (overlapping.length > 0) throw new Error("SLOT_TAKEN");

      return tx.booking.update({
        where: { id: bookingToReschedule.id },
        data: {
          startTime,
          endTime,
          timezone: parsed.data.timezone || bookingToReschedule.timezone,
          status: "confirmed",
        },
        include: {
          eventType: {
            select: { name: true, slug: true, color: true, durationMins: true, userId: true },
          },
        },
      });
    });

    try {
      const calendar = await getCalendarClient(bookingToReschedule.eventType.userId);
      if (calendar) {
        if (bookingToReschedule.googleEventId) {
          await calendar.events.patch({
            calendarId: "primary",
            eventId: bookingToReschedule.googleEventId,
            sendUpdates: "all",
            requestBody: {
              start: { dateTime: updated.startTime.toISOString(), timeZone: updated.timezone },
              end: { dateTime: updated.endTime.toISOString(), timeZone: updated.timezone },
            },
          });
        } else {
          const event = await calendar.events.insert({
            calendarId: "primary",
            sendUpdates: "all",
            conferenceDataVersion: 1,
            requestBody: {
              summary: `${updated.inviteeName} and Calendly Host: ${updated.eventType.name}`,
              description: `Rescheduled via Calendly.\nInvitee Email: ${updated.inviteeEmail}`,
              start: { dateTime: updated.startTime.toISOString(), timeZone: updated.timezone },
              end: { dateTime: updated.endTime.toISOString(), timeZone: updated.timezone },
              attendees: [{ email: updated.inviteeEmail }],
              conferenceData: {
                createRequest: {
                  requestId: `reschedule-${updated.id}`,
                  conferenceSolutionKey: { type: "hangoutsMeet" },
                },
              },
            },
          });

          if (event.data.id) {
            let meetingUrl = extractMeetLink(event.data);
            if (!meetingUrl) {
              const refreshedEvent = await calendar.events.get({
                calendarId: "primary",
                eventId: event.data.id,
              });
              meetingUrl = extractMeetLink((refreshedEvent as any).data);
            }

            await prisma.booking.update({
              where: { id: updated.id },
              data: {
                googleEventId: event.data.id,
                meetingUrl,
              },
            });
          }
        }
      }
    } catch (gcalError) {
      console.error("Failed to sync reschedule to Google Calendar:", gcalError);
    }

    const finalBooking = await prisma.booking.findUnique({
      where: { id: updated.id },
      include: {
        eventType: {
          select: { name: true, slug: true, color: true, durationMins: true, userId: true },
        },
      },
    });

    try {
      await Promise.all([
        sendBookingEmails(finalBooking as any),
        triggerBookingWebhook({ type: "booking.rescheduled", booking: finalBooking }),
      ]);
    } catch (integrationError) {
      console.error("Post-reschedule integrations failed:", integrationError);
    }

    res.json(finalBooking);
  } catch (error: any) {
    if (error.message === "SLOT_TAKEN") {
      return res.status(409).json({ error: "This time slot is no longer available" });
    }
    console.error("Error rescheduling booking:", error);
    res.status(500).json({ error: "Failed to reschedule booking" });
  }
});

export default router;
