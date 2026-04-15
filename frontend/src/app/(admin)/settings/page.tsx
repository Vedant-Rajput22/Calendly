"use client";

import { useToast } from "@/components/Toast";
import { Calendar, Check, ExternalLink, Globe, Loader2, Shield, User } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { toast, confirm } = useToast();

  // Defer timezone computation to client to avoid hydration mismatch
  const [timezones, setTimezones] = useState<string[]>([]);
  const [timezone, setTimezone] = useState("");
  const [mounted, setMounted] = useState(false);

  const [gcalConnected, setGcalConnected] = useState<boolean | null>(null);
  const [gcalLoading, setGcalLoading] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const user = session?.user;

  // Initialize timezone data only on the client
  useEffect(() => {
    setTimezones(Intl.supportedValuesOf("timeZone"));
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    setMounted(true);
  }, []);

  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch("/api/auth/google-calendar/status");
        const data = await res.json();
        setGcalConnected(data.connected);
      } catch {
        setGcalConnected(false);
      }
    }
    void checkStatus();
  }, []);

  useEffect(() => {
    const gcal = new URLSearchParams(window.location.search).get("gcal");
    if (gcal === "success") {
      toast("success", "Google Calendar connected successfully.");
      setGcalConnected(true);
      window.history.replaceState({}, "", "/settings");
    } else if (gcal === "error") {
      toast("error", "Failed to connect Google Calendar. Please try again.");
      window.history.replaceState({}, "", "/settings");
    }
  }, [toast]);

  const handleConnectGCal = () => {
    setGcalLoading(true);
    window.location.href = "/api/auth/google-calendar";
  };

  const handleDisconnectGCal = async () => {
    const yes = await confirm(
      "Are you sure you want to disconnect Google Calendar? This will stop automatic event synchronization.",
    );
    if (!yes) return;

    setDisconnecting(true);
    try {
      const res = await fetch("/api/auth/disconnect-google", { method: "DELETE" });
      if (res.ok) {
        toast("success", "Google Calendar disconnected");
        setGcalConnected(false);
      } else {
        toast("error", "Failed to disconnect Google Calendar");
      }
    } catch {
      toast("error", "Network error");
    } finally {
      setDisconnecting(false);
    }
  };

  return (
    <>
      <div className="mb-6 border-b pb-4" style={{ borderColor: "var(--color-border)" }}>
        <h1 className="cal-heading-lg">Settings</h1>
        <p className="cal-subtext mt-1">Manage account details and integrations.</p>
      </div>

      <div className="space-y-6">
        <section className="cal-section overflow-hidden">
          <div className="border-b px-5 py-3" style={{ borderColor: "var(--color-border)", backgroundColor: "#fbfcff" }}>
            <h2 className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--color-text)" }}>
              <User size={15} style={{ color: "var(--color-text-muted)" }} /> Profile
            </h2>
          </div>

          <div className="p-5">
            <div className="mb-5 flex items-center gap-4">
              {user?.image ? (
                <Image src={user.image} alt={user.name || "User"} width={60} height={60} className="rounded-full border" style={{ borderColor: "var(--color-border)" }} />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold" style={{ backgroundColor: "#e6f0ff", color: "#006bff" }}>
                  {user?.name?.charAt(0) || "U"}
                </div>
              )}

              <div>
                <p className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>
                  {user?.name || "-"}
                </p>
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  {user?.email || "-"}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="cal-label">Display name</label>
                <input type="text" defaultValue={user?.name || ""} readOnly className="cal-input bg-[#f5f8fc]" />
              </div>

              <div>
                <label className="cal-label">Email</label>
                <input type="email" defaultValue={user?.email || ""} readOnly className="cal-input bg-[#f5f8fc]" />
              </div>
            </div>
          </div>
        </section>

        <section className="cal-section overflow-hidden">
          <div className="border-b px-5 py-3" style={{ borderColor: "var(--color-border)", backgroundColor: "#fbfcff" }}>
            <h2 className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--color-text)" }}>
              <Globe size={15} style={{ color: "var(--color-text-muted)" }} /> Timezone
            </h2>
          </div>

          <div className="p-5">
            <label className="cal-label">Your timezone</label>
            {mounted ? (
              <select
                value={timezone}
                onChange={(e) => {
                  setTimezone(e.target.value);
                  toast("success", `Timezone set to ${e.target.value}`);
                }}
                className="cal-select max-w-[360px]"
              >
                {timezones.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            ) : (
              <div className="skeleton h-[44px] max-w-[360px] rounded-lg" />
            )}
            <p className="mt-2 text-xs" style={{ color: "var(--color-text-muted)" }}>
              This affects how times are displayed in your dashboard.
            </p>
          </div>
        </section>

        <section className="cal-section overflow-hidden">
          <div className="border-b px-5 py-3" style={{ borderColor: "var(--color-border)", backgroundColor: "#fbfcff" }}>
            <h2 className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--color-text)" }}>
              <Calendar size={15} style={{ color: "var(--color-text-muted)" }} /> Connected Accounts
            </h2>
          </div>

          <div className="p-5">
            <div className="rounded-xl border p-4" style={{ borderColor: "var(--color-border)" }}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-white" style={{ borderColor: "var(--color-border)" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                  </div>

                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                      Google Calendar
                    </p>
                    {gcalConnected === null ? (
                      <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                        Checking...
                      </p>
                    ) : gcalConnected ? (
                      <p className="flex items-center gap-1 text-xs font-semibold text-green-600">
                        <Check size={12} /> Connected
                      </p>
                    ) : (
                      <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                        Not connected
                      </p>
                    )}
                  </div>
                </div>

                {gcalConnected ? (
                  <div className="flex items-center gap-3">
                    <a
                      href="https://myaccount.google.com/permissions"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-semibold"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      Manage <ExternalLink size={14} />
                    </a>
                    <button
                      onClick={handleDisconnectGCal}
                      disabled={disconnecting}
                      className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-60"
                    >
                      {disconnecting ? <Loader2 size={14} className="animate-spin" /> : "Disconnect"}
                    </button>
                  </div>
                ) : (
                  <button onClick={handleConnectGCal} disabled={gcalLoading} className="cal-btn-primary">
                    {gcalLoading ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Connecting...
                      </>
                    ) : (
                      "Connect"
                    )}
                  </button>
                )}
              </div>
            </div>

            <p className="mt-3 text-xs" style={{ color: "var(--color-text-muted)" }}>
              Connect Google Calendar to prevent double-bookings and auto-sync meetings.
            </p>
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border border-red-300 bg-white">
          <div className="border-b border-red-200 bg-red-50/60 px-5 py-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-red-700">
              <Shield size={15} className="text-red-500" /> Danger Zone
            </h2>
          </div>

          <div className="p-5">
            <p className="mb-4 text-sm" style={{ color: "var(--color-text-muted)" }}>
              Once you delete your account, all event types, availability settings, and booking history are permanently removed.
            </p>

            <button
              onClick={async () => {
                const yes = await confirm(
                  "Are you absolutely sure? This will permanently delete your account and all associated data.",
                );
                if (!yes) return;

                setDeleting(true);
                try {
                  const res = await fetch("/api/auth/delete-account", { method: "DELETE" });
                  if (res.ok) {
                    await signOut({ callbackUrl: "/" });
                  } else {
                    toast("error", "Failed to delete account");
                    setDeleting(false);
                  }
                } catch {
                  toast("error", "Network error");
                  setDeleting(false);
                }
              }}
              disabled={deleting}
              className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-60"
            >
              {deleting ? <Loader2 size={15} className="animate-spin" /> : "Delete my account"}
            </button>
          </div>
        </section>
      </div>
    </>
  );
}
