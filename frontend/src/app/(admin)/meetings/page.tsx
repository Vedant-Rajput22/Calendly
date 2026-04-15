"use client";

import { useToast } from "@/components/Toast";
import { api } from "@/lib/api";
import { Booking } from "@/lib/types";
import {
  Calendar,
  Check,
  Clock3,
  Copy,
  ExternalLink,
  Globe,
  Mail,
  User,
  Video,
  X,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function MeetingsPage() {
  const { toast, confirm } = useToast();
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const [rows, setRows] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [copiedMeet, setCopiedMeet] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(tab === "upcoming" ? await api.getUpcomingBookings() : await api.getPastBookings());
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    void load();
  }, [load]);

  const grouped = rows.reduce((acc, booking) => {
    const d = new Date(booking.startTime);
    const dateStr = d.toLocaleDateString([], {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(booking);
    return acc;
  }, {} as Record<string, Booking[]>);

  const selectedBooking = rows.find((b) => b.id === selectedBookingId) || null;

  function copyMeetLink(url: string) {
    navigator.clipboard.writeText(url);
    setCopiedMeet(true);
    setTimeout(() => setCopiedMeet(false), 2000);
  }

  return (
    <>
      <div className="mb-6 border-b pb-4" style={{ borderColor: "var(--color-border)" }}>
        <h1 className="cal-heading-lg">Meetings</h1>
        <p className="cal-subtext mt-1">View and manage your scheduled events.</p>
      </div>

      <div className="cal-section overflow-hidden">
        <div className="flex items-end border-b px-5 pt-2" style={{ borderColor: "var(--color-border)", backgroundColor: "#fbfcff" }}>
          <button
            onClick={() => {
              setTab("upcoming");
              setSelectedBookingId(null);
            }}
            className={`cal-tab ${tab === "upcoming" ? "cal-tab-active" : ""}`}
          >
            Upcoming
          </button>
          <button
            onClick={() => {
              setTab("past");
              setSelectedBookingId(null);
            }}
            className={`cal-tab ${tab === "past" ? "cal-tab-active" : ""}`}
          >
            Past
          </button>
        </div>

        {loading ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="cal-card p-4">
                <div className="skeleton mb-3 h-4 w-44" />
                <div className="skeleton h-4 w-32" />
              </div>
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: "#e6f0ff", color: "#006bff" }}>
              <Clock3 size={26} />
            </div>
            <h3 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>
              No events yet
            </h3>
            <p className="cal-subtext mt-1">When you have {tab} events, they will appear here.</p>
          </div>
        ) : (
          <div className="p-5">
            {Object.entries(grouped).map(([dateLabel, dateBookings]) => (
              <section key={dateLabel} className="mb-7 last:mb-0">
                <h3
                  className="mb-3 border-b pb-2 text-sm font-semibold uppercase tracking-wide"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}
                >
                  {dateLabel}
                </h3>

                <div className="space-y-3">
                  {dateBookings.map((b) => {
                    const d = new Date(b.startTime);
                    const endD = new Date(b.endTime);
                    const isCancelled = b.status !== "confirmed";
                    const isSelected = selectedBookingId === b.id;

                    return (
                      <article
                        key={b.id}
                        onClick={() => setSelectedBookingId(isSelected ? null : b.id)}
                        className={`relative cursor-pointer rounded-xl border bg-white p-4 transition-all ${
                          isCancelled
                            ? "opacity-65"
                            : isSelected
                            ? "border-[#9fc2ef] ring-1 ring-[#dce9ff]"
                            : "hover:border-[#9fc2ef]"
                        }`}
                        style={{ borderColor: "var(--color-border)" }}
                      >
                        <span
                          className="absolute left-0 top-0 h-full w-1.5 rounded-l-xl"
                          style={{ backgroundColor: isCancelled ? "#c8d2df" : b.eventType.color }}
                        />

                        <div className="grid gap-4 pl-3 sm:grid-cols-[180px_1fr_auto] sm:items-center">
                          <div className="border-b pb-2 sm:border-b-0 sm:border-r sm:pb-0 sm:pr-4" style={{ borderColor: "var(--color-border)" }}>
                            <p className="text-base font-semibold" style={{ color: "var(--color-text)" }}>
                              {d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              <span className="ml-1 text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>
                                - {endD.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </p>
                            <p className="text-xs font-semibold" style={{ color: "var(--color-text-muted)" }}>
                              {b.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone}
                            </p>
                          </div>

                          <div>
                            <h4 className="flex items-center gap-2 text-[15px] font-semibold" style={{ color: "var(--color-text)" }}>
                              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: isCancelled ? "#c8d2df" : b.eventType.color }} />
                              {b.eventType.name}
                            </h4>
                            <p className="mt-0.5 flex items-center gap-1.5 text-sm" style={{ color: "var(--color-text-muted)" }}>
                              <User size={13} />
                              {b.isOrganizer
                                ? `${b.inviteeName} · ${b.inviteeEmail}`
                                : `${b.organizerName || "Host"} · ${b.organizerEmail || ""}`}
                            </p>
                            {b.meetingUrl && !isCancelled && (
                              <p className="mt-1 flex items-center gap-1 text-xs font-semibold" style={{ color: "var(--color-brand)" }}>
                                <Video size={12} /> Google Meet attached
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-end">
                            {isCancelled ? (
                              <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">
                                <XCircle size={13} /> Cancelled
                              </span>
                            ) : tab === "upcoming" && b.isOrganizer ? (
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  const yes = await confirm("Are you sure you want to cancel this meeting?");
                                  if (!yes) return;

                                  try {
                                    await api.cancelBooking(b.id);
                                    toast("success", "Meeting cancelled");
                                    setSelectedBookingId(null);
                                    await load();
                                  } catch (err) {
                                    toast("error", (err as Error).message);
                                  }
                                }}
                                className="cal-btn-secondary px-3 py-1.5 text-xs"
                              >
                                Cancel
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {selectedBooking && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={() => setSelectedBookingId(null)} />
          <aside className="fixed right-0 top-0 z-50 h-full w-full overflow-y-auto border-l bg-white shadow-2xl sm:w-[430px]" style={{ borderColor: "var(--color-border)" }}>
            <header className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4" style={{ borderColor: "var(--color-border)" }}>
              <h2 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>
                Event details
              </h2>
              <button
                onClick={() => setSelectedBookingId(null)}
                className="rounded-lg p-2 transition-colors hover:bg-[#f0f3f8]"
                style={{ color: "var(--color-text-muted)" }}
              >
                <X size={18} />
              </button>
            </header>

            <div className="space-y-6 px-6 py-6">
              <div>
                <div className="mb-1 flex items-center gap-3">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{
                      backgroundColor:
                        selectedBooking.status === "confirmed"
                          ? selectedBooking.eventType.color
                          : "#c8d2df",
                    }}
                  />
                  <h3 className="text-xl font-bold" style={{ color: "var(--color-text)" }}>
                    {selectedBooking.eventType.name}
                  </h3>
                </div>

                {selectedBooking.status !== "confirmed" && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                    <XCircle size={13} /> Cancelled
                  </span>
                )}
              </div>

              <div className="space-y-4 text-sm" style={{ color: "var(--color-text-muted)" }}>
                <div className="flex items-start gap-3">
                  <Calendar size={17} className="mt-0.5" />
                  <div>
                    <p className="font-semibold" style={{ color: "var(--color-text)" }}>
                      {new Date(selectedBooking.startTime).toLocaleDateString([], {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                    <p>
                      {new Date(selectedBooking.startTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {" - "}
                      {new Date(selectedBooking.endTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      <span> · {selectedBooking.eventType.durationMins} min</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Globe size={17} className="mt-0.5" />
                  <p>{selectedBooking.timezone}</p>
                </div>

                <div className="flex items-start gap-3">
                  <User size={17} className="mt-0.5" />
                  <div>
                    <p className="font-semibold" style={{ color: "var(--color-text)" }}>
                      {selectedBooking.inviteeName}
                    </p>
                    <p>{selectedBooking.inviteeEmail}</p>
                  </div>
                </div>
              </div>

              {selectedBooking.meetingUrl && selectedBooking.status === "confirmed" && (
                <div className="rounded-xl border border-[#cfe0ff] bg-[#f0f6ff] p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#dfecff] text-[#006bff]">
                      <Video size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                        Google Meet
                      </p>
                      <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                        Auto-generated link
                      </p>
                    </div>
                  </div>

                  <div className="mb-3 flex items-center gap-2">
                    <input
                      readOnly
                      value={selectedBooking.meetingUrl}
                      className="cal-input h-[40px] py-1.5 text-xs"
                    />
                    <button
                      onClick={() => copyMeetLink(selectedBooking.meetingUrl!)}
                      className="cal-btn-secondary h-[40px] px-3"
                      title="Copy link"
                    >
                      {copiedMeet ? <Check size={15} /> : <Copy size={15} />}
                    </button>
                  </div>

                  <a
                    href={selectedBooking.meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cal-btn-primary w-full justify-center"
                  >
                    <ExternalLink size={14} /> Join meeting
                  </a>
                </div>
              )}

              {!selectedBooking.meetingUrl && selectedBooking.status === "confirmed" && (
                <div className="rounded-xl border px-4 py-3 text-sm" style={{ borderColor: "var(--color-border)", color: "var(--color-text-muted)", backgroundColor: "#fbfcff" }}>
                  No meeting link is attached. Connect Google Calendar in Settings to auto-create Meet links.
                </div>
              )}

              <a
                href={`mailto:${selectedBooking.inviteeEmail}`}
                className="cal-btn-secondary w-full justify-center"
              >
                <Mail size={15} /> Email {selectedBooking.inviteeName}
              </a>

              {selectedBooking.status === "confirmed" && tab === "upcoming" && selectedBooking.isOrganizer && (
                <button
                  onClick={async () => {
                    const yes = await confirm("Are you sure you want to cancel this meeting?");
                    if (!yes) return;

                    try {
                      await api.cancelBooking(selectedBooking.id);
                      toast("success", "Meeting cancelled");
                      setSelectedBookingId(null);
                      await load();
                    } catch (err) {
                      toast("error", (err as Error).message);
                    }
                  }}
                  className="inline-flex w-full items-center justify-center rounded-lg border border-red-300 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                >
                  Cancel this event
                </button>
              )}
            </div>
          </aside>
        </>
      )}
    </>
  );
}
