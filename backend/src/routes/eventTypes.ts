import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response, Router } from "express";
import prisma from "../lib/prisma";
import {
    createEventTypeSchema,
    updateEventTypeSchema,
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

// Next.js explicitly defines req.userId typing workaround via module merging or inline casting.
// We'll pass it continuously as a local const.

// GET /api/event-types — List all event types FOR LOGGED IN USER
router.get("/", requireAuth, async (req: Request, res: Response) => {
  const userId = req.headers["x-user-id"] as string;
  try {
    const eventTypes = await prisma.eventType.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    res.json(eventTypes);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch event types" });
  }
});

// GET /api/event-types/:slug — Get by slug (PUBLIC: Anyone can view a booking link)
router.get("/:slug", async (req: Request, res: Response) => {
  try {
    const eventType = await prisma.eventType.findUnique({
      where: { slug: String(req.params.slug) },
    });
    if (!eventType) return res.status(404).json({ error: "Event type not found" });
    if (!eventType.isActive) return res.status(403).json({ error: "Event type is inactive" });
    
    res.json(eventType);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch event type" });
  }
});

// POST /api/event-types — Create
router.post("/", requireAuth, async (req: Request, res: Response) => {
  const userId = req.headers["x-user-id"] as string;
  try {
    const parsed = createEventTypeSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    // Ensure slug uniqueness globally
    const existing = await prisma.eventType.findUnique({ where: { slug: parsed.data.slug } });
    if (existing) return res.status(409).json({ error: "Slug already in use" });

    const eventType = await prisma.eventType.create({
      data: { ...parsed.data, userId },
    });
    res.status(201).json(eventType);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return res.status(409).json({ error: "Event type with this value already exists" });
      }
      if (error.code === "P2003") {
        return res.status(400).json({ error: "Invalid user context for creating event type" });
      }
    }
    console.error("Error creating event type:", error);
    res.status(500).json({ error: "Failed to create event type" });
  }
});

// PUT /api/event-types/:id — Update
router.put("/:id", requireAuth, async (req: Request, res: Response) => {
  const userId = req.headers["x-user-id"] as string;
  try {
    const parsed = updateEventTypeSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    // Validate ownership
    const existing = await prisma.eventType.findUnique({ where: { id: String(req.params.id) } });
    if (!existing || existing.userId !== userId) return res.status(404).json({ error: "Not found or unauthorized" });

    const eventType = await prisma.eventType.update({
      where: { id: existing.id },
      data: parsed.data,
    });
    res.json(eventType);
  } catch (error) {
    res.status(500).json({ error: "Failed to update event type" });
  }
});

// DELETE /api/event-types/:id — Delete
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  const userId = req.headers["x-user-id"] as string;
  try {
    // Validate ownership
    const existing = await prisma.eventType.findUnique({ where: { id: String(req.params.id) } });
    if (!existing || existing.userId !== userId) return res.status(404).json({ error: "Not found or unauthorized" });

    await prisma.eventType.delete({ where: { id: existing.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: "Failed to delete event type" });
  }
});

export default router;
