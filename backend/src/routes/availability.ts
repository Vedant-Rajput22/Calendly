import { NextFunction, Request, Response, Router } from "express";
import prisma from "../lib/prisma";
import {
  createDateOverrideSchema,
  updateAvailabilitySchema,
} from "../schemas/validation";

const router = Router();

// Middleware to enforce authentication
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const userId = req.headers["x-user-id"] as string;
  if (!userId || userId === "unauthenticated") {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

// GET /api/availability — Get all availability + timezone
router.get("/", requireAuth, async (req: Request, res: Response) => {
  const userId = req.headers["x-user-id"] as string;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { timezone: true },
    });

    const availability = await prisma.availability.findMany({
      where: { userId },
      include: { windows: { orderBy: { sortOrder: "asc" } } },
      orderBy: { dayOfWeek: "asc" },
    });

    res.json({
      timezone: user?.timezone || "Asia/Kolkata",
      days: availability,
    });
  } catch (error) {
    console.error("Error fetching availability:", error);
    res.status(500).json({ error: "Failed to fetch availability" });
  }
});

// PUT /api/availability — Upsert all 7 days + timezone
router.put("/", requireAuth, async (req: Request, res: Response) => {
  const userId = req.headers["x-user-id"] as string;
  try {
    const parsed = updateAvailabilitySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    if (parsed.data.timezone) {
      await prisma.user.update({
        where: { id: userId },
        data: { timezone: parsed.data.timezone },
      });
    }

    const results = await prisma.$transaction(async (tx) => {
      const out = [];

      for (const day of parsed.data.days) {
        const normalizedWindows = (day.windows && day.windows.length > 0
          ? day.windows
          : [{ startTime: day.startTime, endTime: day.endTime }])
          .filter((w) => w.startTime < w.endTime)
          .sort((a, b) => a.startTime.localeCompare(b.startTime));

        const primaryWindow = normalizedWindows[0] || {
          startTime: day.startTime,
          endTime: day.endTime,
        };

        const availabilityRow = await tx.availability.upsert({
          where: {
            userId_dayOfWeek: {
              userId,
              dayOfWeek: day.dayOfWeek,
            },
          },
          create: {
            userId,
            dayOfWeek: day.dayOfWeek,
            isEnabled: day.isEnabled,
            startTime: primaryWindow.startTime,
            endTime: primaryWindow.endTime,
          },
          update: {
            isEnabled: day.isEnabled,
            startTime: primaryWindow.startTime,
            endTime: primaryWindow.endTime,
          },
        });

        await tx.availabilityWindow.deleteMany({
          where: { availabilityId: availabilityRow.id },
        });

        if (normalizedWindows.length > 0) {
          await tx.availabilityWindow.createMany({
            data: normalizedWindows.map((window, index) => ({
              availabilityId: availabilityRow.id,
              startTime: window.startTime,
              endTime: window.endTime,
              sortOrder: index,
            })),
          });
        }

        const withWindows = await tx.availability.findUnique({
          where: { id: availabilityRow.id },
          include: { windows: { orderBy: { sortOrder: "asc" } } },
        });

        out.push(withWindows);
      }

      return out;
    }, {
      // Keep existing behavior but allow enough time for all per-day writes.
      timeout: 15000,
    });
    res.json(results);
  } catch (error) {
    console.error("Error updating availability:", error);
    res.status(500).json({ error: "Failed to update availability" });
  }
});

// GET /api/availability/date-overrides — List date overrides
router.get("/date-overrides", requireAuth, async (req: Request, res: Response) => {
  const userId = req.headers["x-user-id"] as string;
  try {
    const overrides = await prisma.dateOverride.findMany({
      where: { userId },
      orderBy: { date: "asc" },
    });
    res.json(overrides);
  } catch (error) {
    console.error("Error fetching date overrides:", error);
    res.status(500).json({ error: "Failed to fetch date overrides" });
  }
});

// POST /api/availability/date-overrides — Create/update date override
router.post("/date-overrides", requireAuth, async (req: Request, res: Response) => {
  const userId = req.headers["x-user-id"] as string;
  try {
    const parsed = createDateOverrideSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const dateObj = new Date(parsed.data.date + "T00:00:00.000Z");

    const override = await prisma.dateOverride.upsert({
      where: {
        userId_date: {
          userId,
          date: dateObj,
        },
      },
      create: {
        userId,
        date: dateObj,
        isBlocked: parsed.data.isBlocked,
        startTime: parsed.data.startTime || null,
        endTime: parsed.data.endTime || null,
      },
      update: {
        isBlocked: parsed.data.isBlocked,
        startTime: parsed.data.startTime || null,
        endTime: parsed.data.endTime || null,
      },
    });

    res.json(override);
  } catch (error) {
    console.error("Error creating date override:", error);
    res.status(500).json({ error: "Failed to create date override" });
  }
});

// DELETE /api/availability/date-overrides/:id — Delete date override
router.delete("/date-overrides/:id", requireAuth, async (req: Request, res: Response) => {
  const userId = req.headers["x-user-id"] as string;
  try {
    const existing = await prisma.dateOverride.findUnique({
      where: { id: String(req.params.id) }
    });
    
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ error: "Not found or unauthorized" });
    }

    await prisma.dateOverride.delete({
      where: { id: existing.id },
    });
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting date override:", error);
    res.status(500).json({ error: "Failed to delete date override" });
  }
});

export default router;
