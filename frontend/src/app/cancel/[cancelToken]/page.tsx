"use client";

import { api } from "@/lib/api";
import { Booking } from "@/lib/types";
import { ArrowRight, Calendar, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CancelPage() {
  const params = useParams<{ cancelToken: string }>();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    void api.getBookingByCancelToken(String(params.cancelToken)).then(setBooking);
  }, [params.cancelToken]);

  async function cancelNow() {
    if (!booking) return;
    const updated = await api.cancelByToken(String(params.cancelToken));
    setBooking(updated);
  }

  if (!booking) {
    return (
      <div className="cal-shell flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-[#d4e7ff] border-t-[#006bff] animate-spin" />
      </div>
    );
  }

  const isCancelled = booking.status === "cancelled";

  return (
    <main className="cal-shell flex min-h-screen items-center justify-center px-4 py-8">
      <div className="cal-card w-full max-w-[620px] p-8 sm:p-10">
        {isCancelled ? (
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#fff2f2] text-[#c63030]">
              <X size={31} strokeWidth={2.5} />
            </div>
            <h1 className="mb-2 text-3xl font-bold" style={{ color: "var(--color-text)" }}>
              Meeting cancelled
            </h1>
            <p className="mb-7 text-sm" style={{ color: "var(--color-text-muted)" }}>
              {booking.eventType.name} on {new Date(booking.startTime).toLocaleDateString()} was cancelled successfully.
            </p>
            <button onClick={() => router.push(`/${booking.eventType.slug}`)} className="cal-btn-primary w-full justify-center py-3">
              Book a new meeting
            </button>
          </div>
        ) : (
          <div>
            <h1 className="mb-2 text-3xl font-bold" style={{ color: "var(--color-text)" }}>
              Cancel or reschedule
            </h1>
            <p className="mb-7 text-sm" style={{ color: "var(--color-text-muted)" }}>
              Are you sure you want to cancel or reschedule this event?
            </p>

            <div className="cal-muted-card mb-8 p-5">
              <h2 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>
                {booking.eventType.name}
              </h2>
              <div className="mt-4 flex items-start gap-3 text-sm" style={{ color: "var(--color-text-muted)" }}>
                <Calendar size={18} className="mt-0.5" />
                <div>
                  <p style={{ color: "var(--color-text)" }}>
                    {new Date(booking.startTime).toLocaleString([], {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p>
                    {new Date(booking.startTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => void cancelNow()}
                className="inline-flex items-center justify-center rounded-lg border border-red-300 px-5 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
              >
                Yes, cancel meeting
              </button>

              <button
                onClick={() =>
                  router.push(
                    `/${booking.eventType.slug}?date=${booking.startTime.slice(0, 10)}&time=${encodeURIComponent(
                      booking.startTime,
                    )}&cancelToken=${booking.cancelToken}`,
                  )
                }
                className="cal-btn-primary justify-center py-3"
              >
                Reschedule <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
