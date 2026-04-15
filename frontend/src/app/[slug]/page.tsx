"use client";

import { api } from "@/lib/api";
import { EventType } from "@/lib/types";
import {
  AlertCircle,
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock3,
  Globe,
  User,
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

function formatLocalDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDateParam(value: string | null): Date {
  if (!value) return new Date();
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return new Date();
  return new Date(y, m - 1, d);
}

export default function PublicBookingPage() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const slug = String(params.slug);

  const [eventType, setEventType] = useState<EventType | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [step, setStep] = useState<"calendar" | "form">("calendar");
  const [date, setDate] = useState<Date>(parseDateParam(searchParams.get("date")));
  const [slots, setSlots] = useState<{ start: string; end: string }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState("");

  const [selectedSlot, setSelectedSlot] = useState<string>(searchParams.get("time") || "");
  const [showNext, setShowNext] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [inviteeNotes, setInviteeNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const cancelToken = searchParams.get("cancelToken");

  const timezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);

  useEffect(() => {
    void api
      .getEventTypeBySlug(slug)
      .then(setEventType)
      .catch(() => {
        setNotFound(true);
      });
  }, [slug]);

  const dateText = useMemo(() => formatLocalDate(date), [date]);

  useEffect(() => {
    if (!eventType) return;

    setLoadingSlots(true);
    setSlotsError("");

    void api
      .getAvailableSlots(slug, dateText)
      .then((r) => {
        setSlots(r.slots);
        setLoadingSlots(false);
        if (!searchParams.get("time")) {
          setSelectedSlot("");
          setShowNext(false);
        }
      })
      .catch((err) => {
        setSlots([]);
        setLoadingSlots(false);
        setSlotsError((err as Error).message || "Failed to load available slots");
      });
  }, [slug, dateText, searchParams, eventType]);

  const handleSlotSelection = (slot: string) => {
    setSelectedSlot(slot);
    setShowNext(true);
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!eventType || !selectedSlot) return;

    setSubmitting(true);
    try {
      const booking = cancelToken
        ? await api.rescheduleByToken(cancelToken, {
            startTime: selectedSlot,
            timezone,
          })
        : await api.createBooking({
            eventTypeId: eventType.id,
            startTime: selectedSlot,
            inviteeName: name,
            inviteeEmail: email,
            timezone,
            inviteeNotes:
              [
                company ? `Company: ${company}` : "",
                phone ? `Phone: ${phone}` : "",
                inviteeNotes ? `Notes: ${inviteeNotes}` : "",
              ]
                .filter(Boolean)
                .join("\n") || undefined,
          });

      router.push(`/booking-confirmed/${booking.id}`);
    } catch (err) {
      setError((err as Error).message);
      setSubmitting(false);
    }
  }

  if (notFound) {
    return (
      <main className="cal-shell flex min-h-screen items-center justify-center px-4 py-10">
        <div className="cal-card w-full max-w-md p-10 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: "#fff4f4", color: "#d83838" }}>
            <AlertCircle size={28} />
          </div>
          <h1 className="mb-2 text-2xl font-bold" style={{ color: "var(--color-text)" }}>
            Page not found
          </h1>
          <p className="mb-6 text-sm" style={{ color: "var(--color-text-muted)" }}>
            The event type /{slug} does not exist or has been deactivated.
          </p>
          <button onClick={() => router.push("/")} className="cal-btn-primary">
            Go to homepage
          </button>
        </div>
      </main>
    );
  }

  if (!eventType) {
    return (
      <div className="cal-shell flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-[#d4e7ff] border-t-[#006bff] animate-spin" />
      </div>
    );
  }

  return (
    <main className="cal-shell flex min-h-screen items-center justify-center px-4 py-6 lg:px-8">
      <div className="cal-card grid w-full max-w-[1120px] overflow-hidden md:grid-cols-[360px_1fr]">
        <aside className="border-b p-6 md:border-b-0 md:border-r md:p-8" style={{ borderColor: "var(--color-border)" }}>
          {step === "form" && (
            <button
              onClick={() => setStep("calendar")}
              className="mb-5 inline-flex h-9 w-9 items-center justify-center rounded-full border"
              style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)" }}
              aria-label="Go back"
            >
              <ArrowLeft size={16} />
            </button>
          )}

          <p className="text-sm font-semibold" style={{ color: "var(--color-text-muted)" }}>
            Account name
          </p>
          <h1 className="mt-2 text-2xl font-bold leading-tight" style={{ color: "var(--color-text)" }}>
            {eventType.name}
          </h1>

          <div className="mt-6 space-y-4 text-[15px]" style={{ color: "var(--color-text-muted)" }}>
            <p className="flex items-start gap-2">
              <Clock3 size={17} className="mt-0.5 shrink-0" />
              <span>{eventType.durationMins} min</span>
            </p>
            {step === "form" && selectedSlot && (
              <p className="flex items-start gap-2 rounded-lg border bg-[#f4f8ff] p-3" style={{ borderColor: "#dce9ff", color: "var(--color-text)" }}>
                <CalendarIcon size={17} className="mt-0.5 shrink-0" />
                <span>
                  {new Date(selectedSlot).toLocaleString([], {
                    weekday: "short",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                  <br />
                  {new Date(selectedSlot).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </p>
            )}
            <p className="flex items-start gap-2">
              <Globe size={17} className="mt-0.5 shrink-0" />
              <span>{timezone}</span>
            </p>
          </div>
        </aside>

        <section className="p-6 md:p-8">
          {step === "calendar" ? (
            <div>
              <h2 className="mb-6 text-2xl font-bold" style={{ color: "var(--color-text)" }}>
                Select a Date & Time
              </h2>

              <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
                <div className="mx-auto w-full max-w-[340px]">
                  <Calendar value={date} onChange={(d) => setDate(d as Date)} minDate={new Date()} />
                </div>

                <div>
                  <p className="mb-3 text-sm font-semibold" style={{ color: "var(--color-text-muted)" }}>
                    {date.toLocaleDateString([], {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>

                  <div className="max-h-[365px] overflow-y-auto pr-1">
                    {loadingSlots ? (
                      <div className="flex justify-center py-10">
                        <div className="h-7 w-7 rounded-full border-2 border-[#d4e7ff] border-t-[#006bff] animate-spin" />
                      </div>
                    ) : slotsError ? (
                      <p className="text-sm" style={{ color: "#c53838" }}>
                        {slotsError}
                      </p>
                    ) : slots.length === 0 ? (
                      <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                        No slots available on this date.
                      </p>
                    ) : (
                      <div className="space-y-2.5">
                        {slots.map((slot) => {
                          const isSelected = selectedSlot === slot.start;

                          return (
                            <div key={slot.start} className="flex gap-2">
                              <button
                                onClick={() => handleSlotSelection(slot.start)}
                                className={`h-[46px] rounded-lg border px-4 text-sm font-semibold transition-colors ${
                                  isSelected
                                    ? "bg-[#0b3558] border-[#0b3558] text-white"
                                    : "border-[#9dc0ee] text-[#006bff] hover:border-[#006bff]"
                                }`}
                                style={{ width: isSelected ? "50%" : "100%" }}
                              >
                                {new Date(slot.start).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </button>

                              {isSelected && showNext && (
                                <button onClick={() => setStep("form")} className="cal-btn-primary h-[46px] w-1/2">
                                  Next
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-[520px]">
              <h2 className="mb-6 text-2xl font-bold" style={{ color: "var(--color-text)" }}>
                Enter Details
              </h2>

              <form onSubmit={submit} className="space-y-4">
                <div>
                  <label className="cal-label">Name *</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-muted)" }} />
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="cal-input pl-9"
                    />
                  </div>
                </div>

                <div>
                  <label className="cal-label">Email *</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="cal-input"
                  />
                </div>

                {!cancelToken && (
                  <div>
                    <label className="cal-label">Company (optional)</label>
                    <input value={company} onChange={(e) => setCompany(e.target.value)} className="cal-input" />
                  </div>
                )}

                {!cancelToken && (
                  <div>
                    <label className="cal-label">Phone (optional)</label>
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} className="cal-input" />
                  </div>
                )}

                {!cancelToken && (
                  <div>
                    <label className="cal-label">What would you like to discuss? (optional)</label>
                    <textarea
                      value={inviteeNotes}
                      onChange={(e) => setInviteeNotes(e.target.value)}
                      rows={3}
                      maxLength={500}
                      className="cal-textarea resize-none"
                    />
                  </div>
                )}

                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  By proceeding, you agree to Calendly terms and privacy policy.
                </p>

                <button type="submit" disabled={submitting} className="cal-btn-primary px-5 py-2.5">
                  {submitting
                    ? "Confirming..."
                    : cancelToken
                    ? "Reschedule Event"
                    : "Schedule Event"}
                </button>

                {error && <p className="text-sm" style={{ color: "#c53838" }}>{error}</p>}
              </form>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
