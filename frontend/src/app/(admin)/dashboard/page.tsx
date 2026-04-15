"use client";

import { useToast } from "@/components/Toast";
import { api } from "@/lib/api";
import { EventType } from "@/lib/types";
import { Clock3, Link as LinkIcon, Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

function SkeletonCard() {
  return (
    <div className="cal-card overflow-hidden">
      <div className="skeleton h-1.5 w-full" />
      <div className="p-5">
        <div className="skeleton mb-3 h-6 w-3/4" />
        <div className="skeleton mb-3 h-4 w-1/3" />
        <div className="skeleton h-4 w-1/2" />
      </div>
      <div className="border-t px-5 py-3" style={{ borderColor: "var(--color-border)" }}>
        <div className="skeleton h-8 w-full" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast, confirm } = useToast();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    durationMins: 30,
    color: "#006bff",
    bufferBeforeMins: 0,
    bufferAfterMins: 0,
  });

  async function load() {
    try {
      setLoading(true);
      setEventTypes(await api.getEventTypes());
      setError("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();

    const handler = () => setIsCreateOpen(true);
    window.addEventListener("open-create-modal", handler);
    return () => window.removeEventListener("open-create-modal", handler);
  }, []);

  function resetForm() {
    setForm({
      name: "",
      slug: "",
      description: "",
      durationMins: 30,
      color: "#006bff",
      bufferBeforeMins: 0,
      bufferAfterMins: 0,
    });
    setEditingId(null);
  }

  function openEdit(item: EventType) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      slug: item.slug,
      description: item.description || "",
      durationMins: item.durationMins,
      color: item.color,
      bufferBeforeMins: item.bufferBeforeMins,
      bufferAfterMins: item.bufferAfterMins,
    });
    setIsCreateOpen(true);
  }

  async function createEventType(e: React.FormEvent) {
    e.preventDefault();

    try {
      if (editingId) {
        await api.updateEventType(editingId, form);
        toast("success", "Event type updated successfully.");
      } else {
        await api.createEventType(form);
        toast("success", "Event type created successfully.");
      }

      resetForm();
      setIsCreateOpen(false);
      await load();
    } catch (err) {
      toast("error", (err as Error).message);
    }
  }

  async function toggleActive(item: EventType) {
    try {
      await api.updateEventType(item.id, { isActive: !item.isActive });
      toast("info", `${item.name} ${item.isActive ? "deactivated" : "activated"}`);
      await load();
    } catch (err) {
      toast("error", (err as Error).message);
    }
  }

  async function remove(item: EventType) {
    const yes = await confirm(`Delete "${item.name}"? This cannot be undone.`);
    if (!yes) return;

    try {
      await api.deleteEventType(item.id);
      toast("success", `"${item.name}" deleted`);
      await load();
    } catch (err) {
      toast("error", (err as Error).message);
    }
  }

  const handleCopyLink = (slug: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/${slug}`);
    toast("success", "Booking link copied to clipboard.");
  };

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b pb-4" style={{ borderColor: "var(--color-border)" }}>
        <div>
          <h1 className="cal-heading-lg">Event Types</h1>
          <p className="cal-subtext mt-1">Create and manage your booking links.</p>
        </div>
        <button onClick={() => setIsCreateOpen(true)} className="cal-btn-primary">
          <Plus size={16} /> New Event Type
        </button>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border px-4 py-3 text-sm font-semibold" style={{ borderColor: "#f2b9b9", backgroundColor: "#fff4f4", color: "#af2a2a" }}>
          {error}
        </div>
      ) : eventTypes.length === 0 ? (
        <div className="cal-card border-dashed p-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: "#e6f0ff", color: "#006bff" }}>
            <Plus size={24} />
          </div>
          <h3 className="text-lg font-semibold" style={{ color: "var(--color-text)" }}>
            No event types yet
          </h3>
          <p className="cal-subtext mt-1">Create your first event type to start sharing booking links.</p>
          <button onClick={() => setIsCreateOpen(true)} className="cal-btn-secondary mt-4">
            <Plus size={14} /> Create event type
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {eventTypes.map((item) => (
            <article
              key={item.id}
              className={`cal-card relative flex flex-col overflow-hidden ${!item.isActive ? "opacity-55" : ""}`}
            >
              <div className="absolute inset-x-0 top-0 h-1.5" style={{ backgroundColor: item.color }} />

              <div className="mt-1 flex-1 p-5">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h3 className="text-lg font-semibold leading-tight" style={{ color: "var(--color-text)" }}>
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-1">
                    <button
                      title="Edit"
                      onClick={() => openEdit(item)}
                      className="rounded-lg p-2 transition-colors hover:bg-[#f0f3f8]"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      title="Delete"
                      onClick={() => void remove(item)}
                      className="rounded-lg p-2 transition-colors hover:bg-red-50"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {item.description && (
                  <p className="mb-2 line-clamp-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
                    {item.description}
                  </p>
                )}

                <p className="flex items-center gap-1.5 text-sm" style={{ color: "var(--color-text-muted)" }}>
                  <Clock3 size={14} /> {item.durationMins} min
                </p>
              </div>

              <div
                className="flex items-center justify-between border-t px-5 py-3"
                style={{ borderColor: "var(--color-border)", backgroundColor: "#fbfcff" }}
              >
                <button
                  onClick={() => handleCopyLink(item.slug)}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold"
                  style={{ color: "var(--color-brand)" }}
                >
                  <LinkIcon size={13} /> Copy link
                </button>

                <label className="cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={item.isActive}
                    onChange={() => void toggleActive(item)}
                  />
                  <span className="cal-toggle" data-on={item.isActive ? "true" : "false"}>
                    <span className="cal-toggle-thumb" data-on={item.isActive ? "true" : "false"} />
                  </span>
                </label>
              </div>
            </article>
          ))}
        </div>
      )}

      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="cal-card w-full max-w-[720px] max-h-[90vh] overflow-hidden">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4" style={{ borderColor: "var(--color-border)" }}>
              <h2 className="text-xl font-semibold" style={{ color: "var(--color-text)" }}>
                {editingId ? "Edit Event Type" : "New Event Type"}
              </h2>
              <button
                onClick={() => {
                  setIsCreateOpen(false);
                  resetForm();
                }}
                className="rounded-lg p-2 transition-colors hover:bg-[#f0f3f8]"
                style={{ color: "var(--color-text-muted)" }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={createEventType} className="max-h-[calc(90vh-72px)] overflow-y-auto p-6">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="cal-label">Event Name</label>
                  <input
                    required
                    placeholder="e.g. 15 Minute Meeting"
                    value={form.name}
                    onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                    className="cal-input"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="cal-label">Description (optional)</label>
                  <textarea
                    placeholder="Add a short description"
                    value={form.description}
                    onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                    rows={2}
                    className="cal-textarea resize-none"
                  />
                </div>

                <div>
                  <label className="cal-label">URL Slug</label>
                  <div className="relative">
                    <span
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      /
                    </span>
                    <input
                      required
                      placeholder="15min"
                      value={form.slug}
                      onChange={(e) =>
                        setForm((s) => ({
                          ...s,
                          slug: e.target.value.replace(/[^a-z0-9-]/g, ""),
                        }))
                      }
                      className="cal-input pl-6"
                    />
                  </div>
                </div>

                <div>
                  <label className="cal-label">Duration</label>
                  <select
                    value={form.durationMins}
                    onChange={(e) => setForm((s) => ({ ...s, durationMins: Number(e.target.value) }))}
                    className="cal-select"
                  >
                    {[15, 30, 45, 60, 90, 120].map((m) => (
                      <option key={m} value={m}>
                        {m} min
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="cal-label">Event Color</label>
                  <div className="flex flex-wrap items-center gap-3">
                    {["#006bff", "#ff5b4d", "#2f9e44", "#f08c00", "#7048e8", "#e64980", "#0b3558"].map((c) => (
                      <button
                        type="button"
                        key={c}
                        onClick={() => setForm((s) => ({ ...s, color: c }))}
                        className={`h-8 w-8 rounded-full border-2 transition-transform ${
                          form.color === c ? "scale-110 border-[#0b3558]" : "border-white hover:scale-105"
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="cal-label">Buffer Before</label>
                  <select
                    value={form.bufferBeforeMins}
                    onChange={(e) => setForm((s) => ({ ...s, bufferBeforeMins: Number(e.target.value) }))}
                    className="cal-select"
                  >
                    {[0, 5, 10, 15, 30].map((m) => (
                      <option key={m} value={m}>
                        {m} min
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="cal-label">Buffer After</label>
                  <select
                    value={form.bufferAfterMins}
                    onChange={(e) => setForm((s) => ({ ...s, bufferAfterMins: Number(e.target.value) }))}
                    className="cal-select"
                  >
                    {[0, 5, 10, 15, 30].map((m) => (
                      <option key={m} value={m}>
                        {m} min
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-7 flex justify-end gap-3 border-t pt-4" style={{ borderColor: "var(--color-border)" }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen(false);
                    resetForm();
                  }}
                  className="cal-btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="cal-btn-primary">
                  {editingId ? "Update & Close" : "Save & Close"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
