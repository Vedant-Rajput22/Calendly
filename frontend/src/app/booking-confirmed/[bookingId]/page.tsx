"use client";

import { api } from "@/lib/api";
import { Booking } from "@/lib/types";
import {
  Calendar as CalendarIcon,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Globe,
  User,
  Video,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function BookingConfirmedPage() {
  const params = useParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [copiedMeet, setCopiedMeet] = useState(false);

  useEffect(() => {
    async function fetchBooking() {
      try {
        const b = await api.getBooking(String(params.bookingId));
        setBooking(b);

        if (!b.meetingUrl) {
          setTimeout(async () => {
            try {
              const refreshed = await api.getBooking(String(params.bookingId));
              setBooking(refreshed);
            } catch {
              // ignore retry error
            }
          }, 3000);
        }
      } catch {
        // ignore fetch error
      }
    }

    void fetchBooking();
  }, [params.bookingId]);

  const gcalLink = useMemo(() => {
    if (!booking) return "#";
    const start = booking.startTime.replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
    const end = booking.endTime.replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      booking.eventType.name,
    )}&dates=${start}/${end}`;
  }, [booking]);

  function handleCopyMeet() {
    if (!booking?.meetingUrl) return;
    navigator.clipboard.writeText(booking.meetingUrl);
    setCopiedMeet(true);
    setTimeout(() => setCopiedMeet(false), 2000);
  }

  if (!booking) {
    return (
      <div className="cal-shell flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-[#d4e7ff] border-t-[#006bff] animate-spin" />
      </div>
    );
  }

  return (
    <main className="cal-shell flex min-h-screen items-center justify-center px-4 py-8">
      <div className="cal-card w-full max-w-[860px] p-7 text-center sm:p-10">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#e9f9ee] text-[#15823d]">
          <CheckCircle2 size={34} />
        </div>

        <h1 className="mb-2 text-3xl font-bold" style={{ color: "var(--color-text)" }}>
          You are scheduled
        </h1>
        <p className="mb-8 text-sm" style={{ color: "var(--color-text-muted)" }}>
          A calendar invitation has been sent to your email.
        </p>

        <div className="cal-muted-card mx-auto mb-6 max-w-[620px] p-5 text-left">
          <h2 className="mb-5 text-lg font-semibold" style={{ color: "var(--color-text)" }}>
            {booking.eventType.name}
          </h2>

          <div className="space-y-4 text-sm" style={{ color: "var(--color-text-muted)" }}>
            <div className="flex items-start gap-3">
              <User size={17} className="mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold" style={{ color: "var(--color-text)" }}>
                  Invitee
                </p>
                <p>{booking.inviteeName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CalendarIcon size={17} className="mt-0.5 shrink-0" />
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
                  {" - "}
                  {new Date(booking.endTime).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Globe size={17} className="mt-0.5 shrink-0" />
              <p>{booking.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
            </div>
          </div>
        </div>

        {booking.meetingUrl && (
          <div className="mx-auto mb-7 max-w-[620px] rounded-xl border border-[#cfe0ff] bg-[#f0f6ff] p-5 text-left">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#e0edff] text-[#006bff]">
                <Video size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                  Google Meet
                </p>
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  Meeting link
                </p>
              </div>
            </div>

            <div className="mb-3 flex items-center gap-2">
              <input
                readOnly
                value={booking.meetingUrl}
                className="cal-input h-[42px] py-2 text-sm"
              />
              <button onClick={handleCopyMeet} className="cal-btn-secondary h-[42px] px-3" title="Copy link">
                {copiedMeet ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>

            <a
              href={booking.meetingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cal-btn-primary w-full"
            >
              <ExternalLink size={15} />
              Join Meeting
            </a>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-center gap-3 border-t pt-6" style={{ borderColor: "var(--color-border)" }}>
          <a href={gcalLink} target="_blank" rel="noopener noreferrer" className="cal-btn-secondary">
            Add to Google Calendar <ExternalLink size={16} />
          </a>

          <button
            onClick={() => {
              const start = booking.startTime.replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
              const end = booking.endTime.replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
              const meetLine = booking.meetingUrl ? `\nGoogle Meet: ${booking.meetingUrl}` : "";
              const ics = [
                "BEGIN:VCALENDAR",
                "VERSION:2.0",
                "PRODID:-//Calendly//EN",
                "BEGIN:VEVENT",
                `DTSTART:${start}`,
                `DTEND:${end}`,
                `SUMMARY:${booking.eventType.name}`,
                `DESCRIPTION:Meeting with ${booking.inviteeName}${meetLine}`,
                booking.meetingUrl ? `URL:${booking.meetingUrl}` : "",
                "END:VEVENT",
                "END:VCALENDAR",
              ]
                .filter(Boolean)
                .join("\r\n");

              const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${booking.eventType.name.replace(/\s+/g, "_")}.ics`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="cal-btn-secondary"
          >
            Download .ics <CalendarIcon size={16} />
          </button>
        </div>
      </div>
    </main>
  );
}
