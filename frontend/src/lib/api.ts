import { AvailabilityResponse, Booking, DateOverride, EventType } from "./types";

const API_BASE = "/api/proxy";
const PUBLIC_API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

// Authenticated requests — go through Next.js proxy which injects x-user-id
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
    cache: "no-store",
  });

  if (!response.ok) {
    let errorText = "Request failed";
    try {
      const errorJson = await response.json();
      errorText = typeof errorJson.error === 'object' ? JSON.stringify(errorJson.error) : (errorJson.error || errorText);
    } catch {
      // no-op
    }
    throw new Error(errorText);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

// Public requests — go directly to Express (no auth needed)
async function publicRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${PUBLIC_API}${path}`, {
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
    cache: "no-store",
  });

  if (!response.ok) {
    let errorText = "Request failed";
    try {
      const errorJson = await response.json();
      errorText = typeof errorJson.error === 'object' ? JSON.stringify(errorJson.error) : (errorJson.error || errorText);
    } catch {
      // no-op
    }
    throw new Error(errorText);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export const api = {
  // ─── Authenticated (dashboard) ───
  getEventTypes: () => request<EventType[]>("/event-types"),
  createEventType: (data: Partial<EventType>) =>
    request<EventType>("/event-types", { method: "POST", body: JSON.stringify(data) }),
  updateEventType: (id: string, data: Partial<EventType>) =>
    request<EventType>(`/event-types/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteEventType: (id: string) => request<void>(`/event-types/${id}`, { method: "DELETE" }),

  getAvailability: () => request<AvailabilityResponse>("/availability"),
  updateAvailability: (data: { timezone: string; days: { dayOfWeek: number; isEnabled: boolean; startTime: string; endTime: string; windows?: { startTime: string; endTime: string }[] }[] }) =>
    request("/availability", { method: "PUT", body: JSON.stringify(data) }),
  getDateOverrides: () => request<DateOverride[]>("/availability/date-overrides"),
  upsertDateOverride: (data: { date: string; isBlocked: boolean; startTime?: string; endTime?: string }) =>
    request<DateOverride>("/availability/date-overrides", { method: "POST", body: JSON.stringify(data) }),
  deleteDateOverride: (id: string) => request<void>(`/availability/date-overrides/${id}`, { method: "DELETE" }),

  getUpcomingBookings: () => request<Booking[]>("/bookings/upcoming"),
  getPastBookings: () => request<Booking[]>("/bookings/past"),
  cancelBooking: (id: string) => request<Booking>(`/bookings/${id}/cancel`, { method: "PATCH" }),

  // ─── Public (no auth needed) ───
  getEventTypeBySlug: (slug: string) => publicRequest<EventType>(`/event-types/${slug}`),
  getAvailableSlots: (slug: string, date: string) =>
    publicRequest<{ slots: { start: string; end: string }[]; date: string; slug: string }>(`/available-slots?slug=${encodeURIComponent(slug)}&date=${encodeURIComponent(date)}`),
  createBooking: (data: { eventTypeId: string; startTime: string; inviteeName: string; inviteeEmail: string; timezone: string; inviteeNotes?: string }) =>
    publicRequest<Booking>("/bookings", { method: "POST", body: JSON.stringify(data) }),
  rescheduleByToken: (cancelToken: string, data: { startTime: string; timezone: string }) =>
    publicRequest<Booking>(`/bookings/cancel-token/${cancelToken}/reschedule`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  getBooking: (id: string) => publicRequest<Booking>(`/bookings/${id}`),
  getBookingByCancelToken: (cancelToken: string) =>
    publicRequest<Booking>(`/bookings/cancel-token/${cancelToken}`),
  cancelByToken: (cancelToken: string) =>
    publicRequest<Booking>(`/bookings/cancel-token/${cancelToken}`, { method: "PATCH" }),
};
