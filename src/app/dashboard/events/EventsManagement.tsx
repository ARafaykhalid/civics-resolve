"use client";

import { useState } from "react";
import { createEvent, updateEvent, deleteEvent } from "@/actions/community";
import ImageUpload from "@/components/ImageUpload";
import ConfirmModal from "@/components/ConfirmModal";
import { formatDate, cn } from "@/lib/utils";
import {
  Plus,
  Loader2,
  MapPin,
  Calendar,
  Users,
  Trash2,
  Pencil,
  X,
} from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function EventsManagement({ events }: { events: any[] }) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [eventImages, setEventImages] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    endDate: "",
    organizer: "",
    maxAttendees: "",
  });
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Edit modal state
  const [editModal, setEditModal] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    endDate: "",
    organizer: "",
    maxAttendees: "",
    image: "",
  });
  const [editImages, setEditImages] = useState<string[]>([]);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await createEvent({
      ...form,
      image: eventImages[0] || "",
      maxAttendees: form.maxAttendees ? parseInt(form.maxAttendees) : undefined,
    });
    if (result.success) {
      setLoading(false);
      setShowForm(false);
      window.location.reload();
    } else {
      setError(result.error || "Failed to create event");
      setLoading(false);
    }
  };

  const openEdit = (ev: any) => {
    const dateStr = ev.date ? new Date(ev.date).toISOString().slice(0, 16) : "";
    const endDateStr = ev.endDate
      ? new Date(ev.endDate).toISOString().slice(0, 16)
      : "";
    setEditForm({
      title: ev.title || "",
      description: ev.description || "",
      location: ev.location || "",
      date: dateStr,
      endDate: endDateStr,
      organizer: ev.organizer || "",
      maxAttendees: ev.maxAttendees?.toString() || "",
      image: ev.image || "",
    });
    setEditImages(ev.image ? [ev.image] : []);
    setEditModal(ev);
    setEditError("");
  };

  const handleEdit = async () => {
    if (!editModal) return;
    setEditLoading(true);
    setEditError("");
    const result = await updateEvent(editModal._id, {
      title: editForm.title,
      description: editForm.description,
      location: editForm.location,
      date: editForm.date,
      endDate: editForm.endDate || undefined,
      organizer: editForm.organizer,
      image: editImages[0] || "",
      maxAttendees: editForm.maxAttendees
        ? parseInt(editForm.maxAttendees)
        : undefined,
    });
    if (result.success) {
      setEditModal(null);
      setEditLoading(false);
      window.location.reload();
    } else {
      setEditError(result.error || "Failed to update event");
      setEditLoading(false);
    }
  };

  const executeDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(confirmDelete);
    await deleteEvent(confirmDelete);
    setDeleting(null);
    setConfirmDelete(null);
    window.location.reload();
  };

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Community Events</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary text-sm">
          <Plus className="h-4 w-4" /> New Event
        </button>
      </div>

      {showForm && (
        <div className="glass-card p-6 mb-6">
          <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
            {error && (
              <div className="sm:col-span-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                {error}
              </div>
            )}
            <div className="sm:col-span-2">
              <label className="label-text">Title *</label>
              <input
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label-text">Location *</label>
              <input
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label-text">Organizer *</label>
              <input
                value={form.organizer}
                onChange={(e) => update("organizer", e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label-text">Start Date *</label>
              <input
                type="datetime-local"
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label-text">End Date</label>
              <input
                type="datetime-local"
                value={form.endDate}
                onChange={(e) => update("endDate", e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="label-text">Max Attendees</label>
              <input
                type="number"
                min="1"
                value={form.maxAttendees}
                onChange={(e) => update("maxAttendees", e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="label-text">Event Image</label>
              <ImageUpload
                images={eventImages}
                onChange={setEventImages}
                maxFiles={1}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label-text">Description *</label>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                className="input-field min-h-[80px]"
                required
              />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary flex-1">
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Create Event"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {events.map((e) => (
          <div key={e._id} className="glass-card p-5 group">
            {e.image && (
              <img
                src={e.image}
                alt={e.title}
                className="w-full h-32 object-cover rounded-lg mb-3"
              />
            )}
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base font-semibold text-white">{e.title}</h3>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => openEdit(e)}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-indigo-500/10 hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all"
                  title="Edit">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setConfirmDelete(e._id)}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-red-500/10 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                  title="Delete">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              {e.description}
            </p>
            <div className="mt-3 space-y-1 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(e.date)}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {e.location}
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {e.attendees?.length || 0}
                {e.maxAttendees ? `/${e.maxAttendees}` : ""} attending
              </div>
            </div>
            {!e.isActive && (
              <span className="mt-2 inline-block rounded-full bg-red-500/10 text-red-400 text-[10px] font-semibold px-2 py-0.5 border border-red-500/20">
                Inactive
              </span>
            )}
          </div>
        ))}
      </div>
      {events.length === 0 && (
        <div className="glass-card p-12 text-center text-slate-500">
          No events yet.
        </div>
      )}

      {/* Edit Modal */}
      {editModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setEditModal(null)}>
          <div
            className="w-full max-w-xl glass-card p-6 m-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-white">Edit Event</h3>
              <button
                onClick={() => setEditModal(null)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            {editError && (
              <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                {editError}
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label-text">Title</label>
                <input
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, title: e.target.value }))
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="label-text">Location</label>
                <input
                  value={editForm.location}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, location: e.target.value }))
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="label-text">Organizer</label>
                <input
                  value={editForm.organizer}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, organizer: e.target.value }))
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="label-text">Start Date</label>
                <input
                  type="datetime-local"
                  value={editForm.date}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, date: e.target.value }))
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="label-text">End Date</label>
                <input
                  type="datetime-local"
                  value={editForm.endDate}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, endDate: e.target.value }))
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="label-text">Max Attendees</label>
                <input
                  type="number"
                  min="1"
                  value={editForm.maxAttendees}
                  onChange={(e) =>
                    setEditForm((p) => ({
                      ...p,
                      maxAttendees: e.target.value,
                    }))
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="label-text">Event Image</label>
                <ImageUpload
                  images={editImages}
                  onChange={setEditImages}
                  maxFiles={1}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label-text">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((p) => ({
                      ...p,
                      description: e.target.value,
                    }))
                  }
                  className="input-field min-h-[80px]"
                />
              </div>
              <div className="sm:col-span-2 flex gap-3">
                <button
                  onClick={() => setEditModal(null)}
                  className="btn-secondary flex-1">
                  Cancel
                </button>
                <button
                  onClick={handleEdit}
                  disabled={editLoading}
                  className="btn-primary flex-1">
                  {editLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={executeDelete}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
        loading={!!deleting && deleting === confirmDelete}
      />
    </div>
  );
}
