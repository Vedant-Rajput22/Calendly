import { z } from "zod";

// Event Type schemas
export const createEventTypeSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().max(500).optional(),
  durationMins: z.number().int().min(5).max(480),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  bufferBeforeMins: z.number().int().min(0).max(60).optional(),
  bufferAfterMins: z.number().int().min(0).max(60).optional(),
});

export const updateEventTypeSchema = createEventTypeSchema.partial().extend({
  isActive: z.boolean().optional(),
});

// Availability schemas
export const availabilityDaySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  isEnabled: z.boolean(),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/, "Time must be in HH:MM format"),
  endTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Time must be in HH:MM format"),
  windows: z
    .array(
      z.object({
        startTime: z
          .string()
          .regex(/^\d{2}:\d{2}(:\d{2})?$/, "Time must be in HH:MM format"),
        endTime: z
          .string()
          .regex(/^\d{2}:\d{2}(:\d{2})?$/, "Time must be in HH:MM format"),
      })
    )
    .optional(),
});

export const updateAvailabilitySchema = z.object({
  timezone: z.string().optional(),
  days: z.array(availabilityDaySchema).min(1).max(7),
});

// Booking schemas
export const createBookingSchema = z.object({
  eventTypeId: z.string().uuid(),
  startTime: z.string().datetime(),
  inviteeName: z.string().min(1, "Name is required").max(100),
  inviteeEmail: z.string().email("Valid email is required"),
  timezone: z.string().optional(),
  inviteeNotes: z.string().max(500).optional(),
});

export const rescheduleBookingSchema = z.object({
  startTime: z.string().datetime(),
  timezone: z.string().optional(),
});

// Available slots query
export const availableSlotsQuerySchema = z.object({
  slug: z.string().min(1),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  timezone: z.string().optional(),
});

// Date override schemas
export const createDateOverrideSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  isBlocked: z.boolean(),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/)
    .optional(),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/)
    .optional(),
});
