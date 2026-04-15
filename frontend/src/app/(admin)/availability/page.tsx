"use client";

import { useToast } from "@/components/Toast";
import { api } from "@/lib/api";
import { AvailabilityDay, DateOverride } from "@/lib/types";
import { CalendarDays, Globe, MinusCircle, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

const labels = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

function ensureDayWindows(day: AvailabilityDay) {
  if (day.windows && day.windows.length > 0) {
    return day.windows;
  }
  return [{ startTime: day.startTime, endTime: day.endTime }];
}

export default function AvailabilityPage() {
  const { toast } = useToast();
  const [days, setDays] = useState<AvailabilityDay[]>([]);
  const [timezone, setTimezone] = useState("UTC");
  const [overrides, setOverrides] = useState<DateOverride[]>([]);
  const [date, setDate] = useState("");
  const [isBlocked, setIsBlocked] = useState(false);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [activeTab, setActiveTab] = useState<"weekly" | "overrides">("weekly");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [timezones, setTimezones] = useState<string[]>([]);

  async function load() {
    setLoading(true);
    try {
      const [a, d] = await Promise.all([api.getAvailability(), api.getDateOverrides()]);
      if (a.days && a.days.length > 0) {
        setDays(
          a.days.map((day) => ({
            ...day,
            windows: ensureDayWindows(day),
          })),
        );
      } else {
        setDays(
          Array.from({ length: 7 }, (_, i) => ({
            dayOfWeek: i,
            isEnabled: i > 0 && i < 6,
            startTime: "09:00",
            endTime: "17:00",
            windows: [{ startTime: "09:00", endTime: "17:00" }],
          })) as AvailabilityDay[],
        );
      }
      setTimezone(a.timezone);
      setOverrides(d);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setTimezones(Intl.supportedValuesOf("timeZone"));
    void load();
  }, []);

  async function handleSaveWeekly() {
    setSaving(true);
    try {
      await api.updateAvailability({
        timezone,
        days: days.map((day) => {
          const windows = ensureDayWindows(day)
            .filter((w) => w.startTime < w.endTime)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

          const first = windows[0] || { startTime: day.startTime, endTime: day.endTime };
          return {
            dayOfWeek: day.dayOfWeek,
            isEnabled: day.isEnabled,
            startTime: first.startTime,
            endTime: first.endTime,
            windows,
          };
        }),
      });
      await load();
      toast("success", "Availability saved successfully.");
    } catch (err) {
      toast("error", (err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="mb-6 border-b pb-4" style={{ borderColor: "var(--color-border)" }}>
        <h1 className="cal-heading-lg">Availability</h1>
        <p className="cal-subtext mt-1">Configure your weekly hours and date-specific overrides.</p>
      </div>

      <div className="cal-section overflow-hidden">
        <div className="flex items-end border-b px-5 pt-2" style={{ borderColor: "var(--color-border)", backgroundColor: "#fbfcff" }}>
          <button
            onClick={() => setActiveTab("weekly")}
            className={`cal-tab ${activeTab === "weekly" ? "cal-tab-active" : ""}`}
          >
            Weekly hours
          </button>
          <button
            onClick={() => setActiveTab("overrides")}
            className={`cal-tab ${activeTab === "overrides" ? "cal-tab-active" : ""}`}
          >
            Date overrides
          </button>
        </div>

        {loading ? (
          <div className="p-16 text-center text-sm" style={{ color: "var(--color-text-muted)" }}>
            Loading...
          </div>
        ) : activeTab === "weekly" ? (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4" style={{ borderColor: "var(--color-border)" }}>
              <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                <Globe size={15} />
                Timezone
                <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="cal-select ml-2 h-[40px] min-w-[220px] py-1 text-sm">
                  {timezones.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
              </div>

              <button onClick={() => void handleSaveWeekly()} disabled={saving} className="cal-btn-primary">
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>

            <div className="divide-y" style={{ borderColor: "var(--color-border)" }}>
              {days.map((day) => (
                <div key={day.dayOfWeek} className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center">
                  <div className="flex w-[210px] items-center gap-4">
                    <label className="cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={day.isEnabled}
                        onChange={(e) =>
                          setDays((prev) =>
                            prev.map((p) =>
                              p.dayOfWeek === day.dayOfWeek ? { ...p, isEnabled: e.target.checked } : p,
                            ),
                          )
                        }
                      />
                      <span className="cal-toggle" data-on={day.isEnabled ? "true" : "false"}>
                        <span className="cal-toggle-thumb" data-on={day.isEnabled ? "true" : "false"} />
                      </span>
                    </label>

                    <span className="text-sm font-semibold" style={{ color: day.isEnabled ? "var(--color-text)" : "#9cb0c6" }}>
                      {labels[day.dayOfWeek]}
                    </span>
                  </div>

                  <div className="flex-1">
                    {!day.isEnabled ? (
                      <p className="text-sm italic" style={{ color: "var(--color-text-muted)" }}>
                        Unavailable
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {ensureDayWindows(day).map((window, index) => (
                          <div key={`${day.dayOfWeek}-${index}`} className="flex flex-wrap items-center gap-2">
                            <input
                              type="time"
                              className="cal-input h-[40px] w-[140px] py-1 text-sm"
                              value={window.startTime}
                              onChange={(e) =>
                                setDays((prev) =>
                                  prev.map((p) =>
                                    p.dayOfWeek === day.dayOfWeek
                                      ? {
                                          ...p,
                                          windows: ensureDayWindows(p).map((w, i) =>
                                            i === index ? { ...w, startTime: e.target.value } : w,
                                          ),
                                          startTime: index === 0 ? e.target.value : p.startTime,
                                        }
                                      : p,
                                  ),
                                )
                              }
                            />
                            <span style={{ color: "var(--color-text-muted)" }}>-</span>
                            <input
                              type="time"
                              className="cal-input h-[40px] w-[140px] py-1 text-sm"
                              value={window.endTime}
                              onChange={(e) =>
                                setDays((prev) =>
                                  prev.map((p) =>
                                    p.dayOfWeek === day.dayOfWeek
                                      ? {
                                          ...p,
                                          windows: ensureDayWindows(p).map((w, i) =>
                                            i === index ? { ...w, endTime: e.target.value } : w,
                                          ),
                                          endTime: index === 0 ? e.target.value : p.endTime,
                                        }
                                      : p,
                                  ),
                                )
                              }
                            />

                            {ensureDayWindows(day).length > 1 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setDays((prev) =>
                                    prev.map((p) => {
                                      if (p.dayOfWeek !== day.dayOfWeek) return p;
                                      const nextWindows = ensureDayWindows(p).filter((_, i) => i !== index);
                                      const first = nextWindows[0] || {
                                        startTime: "09:00",
                                        endTime: "17:00",
                                      };
                                      return {
                                        ...p,
                                        windows: nextWindows,
                                        startTime: first.startTime,
                                        endTime: first.endTime,
                                      };
                                    }),
                                  )
                                }
                                className="rounded-lg p-1"
                                style={{ color: "var(--color-text-muted)" }}
                                title="Remove window"
                              >
                                <MinusCircle size={17} />
                              </button>
                            )}
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() =>
                            setDays((prev) =>
                              prev.map((p) =>
                                p.dayOfWeek === day.dayOfWeek
                                  ? {
                                      ...p,
                                      windows: [...ensureDayWindows(p), { startTime: "09:00", endTime: "17:00" }],
                                    }
                                  : p,
                              ),
                            )
                          }
                          className="inline-flex items-center gap-1 text-xs font-semibold"
                          style={{ color: "var(--color-brand)" }}
                        >
                          <Plus size={13} /> Add time window
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-5">
            <div className="mb-7 rounded-xl border p-5" style={{ borderColor: "var(--color-border)", backgroundColor: "#fbfcff" }}>
              <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                <CalendarDays size={16} style={{ color: "var(--color-brand)" }} /> Add an override
              </h3>

              <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
                <div className="w-full xl:max-w-[220px]">
                  <label className="cal-label">Date</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="cal-input" />
                </div>

                <label className="flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                  <input
                    type="checkbox"
                    checked={isBlocked}
                    onChange={(e) => setIsBlocked(e.target.checked)}
                    className="h-4 w-4"
                  />
                  Mark as unavailable
                </label>

                {!isBlocked && (
                  <>
                    <div className="w-full xl:max-w-[150px]">
                      <label className="cal-label">Start</label>
                      <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="cal-input" />
                    </div>
                    <div className="w-full xl:max-w-[150px]">
                      <label className="cal-label">End</label>
                      <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="cal-input" />
                    </div>
                  </>
                )}

                <button
                  onClick={() =>
                    void api
                      .upsertDateOverride({
                        date,
                        isBlocked,
                        startTime: isBlocked ? undefined : startTime,
                        endTime: isBlocked ? undefined : endTime,
                      })
                      .then(() => {
                        load();
                        setDate("");
                      })
                  }
                  disabled={!date}
                  className="cal-btn-primary"
                >
                  Add
                </button>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                Active overrides
              </h3>
              {overrides.length === 0 ? (
                <p className="text-sm italic" style={{ color: "var(--color-text-muted)" }}>
                  No date overrides currently set.
                </p>
              ) : (
                <div className="space-y-3">
                  {overrides.map((o) => (
                    <div key={o.id} className="cal-card flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 flex-col items-center justify-center rounded-md" style={{ backgroundColor: "#e6f0ff", color: "#004eba" }}>
                          <span className="text-[10px] font-semibold uppercase leading-none">
                            {new Date(o.date).toLocaleString("default", { month: "short" })}
                          </span>
                          <span className="text-base font-bold leading-none">{new Date(o.date).getDate()}</span>
                        </div>

                        <div>
                          <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                            {new Date(o.date).toLocaleDateString([], {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </p>
                          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                            {o.isBlocked ? "Unavailable" : `${o.startTime} - ${o.endTime}`}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => void api.deleteDateOverride(o.id).then(load)}
                        className="rounded-lg p-2 transition-colors hover:bg-red-50"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
