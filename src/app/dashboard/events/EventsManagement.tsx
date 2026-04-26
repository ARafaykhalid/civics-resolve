"use client";

import { useState } from "react";
import { createEvent } from "@/actions/community";
import ImageUpload from "@/components/ImageUpload";
import { formatDate } from "@/lib/utils";
import { Plus, Loader2, MapPin, Calendar, Users } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function EventsManagement({ events }: { events: any[] }) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [eventImages, setEventImages] = useState<string[]>([]);
  const [form, setForm] = useState({ title: "", description: "", location: "", date: "", endDate: "", organizer: "", maxAttendees: "" });

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const [error, setError] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setError("");
    setLoading(true);
    const result = await createEvent({ ...form, image: eventImages[0] || "", maxAttendees: form.maxAttendees ? parseInt(form.maxAttendees) : undefined });
    if (result.success) {
      setLoading(false); setShowForm(false);
      window.location.reload();
    } else {
      setError(result.error || "Failed to create event");
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Community Events</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm"><Plus className="h-4 w-4" /> New Event</button>
      </div>

      {showForm && (
        <div className="glass-card p-6 mb-6">
          <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
            {error && <div className="sm:col-span-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">{error}</div>}
            <div className="sm:col-span-2"><label className="label-text">Title *</label><input value={form.title} onChange={(e) => update("title", e.target.value)} className="input-field" required /></div>
            <div><label className="label-text">Location *</label><input value={form.location} onChange={(e) => update("location", e.target.value)} className="input-field" required /></div>
            <div><label className="label-text">Organizer *</label><input value={form.organizer} onChange={(e) => update("organizer", e.target.value)} className="input-field" required /></div>
            <div><label className="label-text">Start Date *</label><input type="datetime-local" value={form.date} onChange={(e) => update("date", e.target.value)} className="input-field" required /></div>
            <div><label className="label-text">End Date</label><input type="datetime-local" value={form.endDate} onChange={(e) => update("endDate", e.target.value)} className="input-field" /></div>
            <div><label className="label-text">Max Attendees</label><input type="number" min="1" value={form.maxAttendees} onChange={(e) => update("maxAttendees", e.target.value)} className="input-field" /></div>
            <div><label className="label-text">Event Image</label><ImageUpload images={eventImages} onChange={setEventImages} maxFiles={1} /></div>
            <div className="sm:col-span-2"><label className="label-text">Description *</label><textarea value={form.description} onChange={(e) => update("description", e.target.value)} className="input-field min-h-[80px]" required /></div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Event"}</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {events.map((e) => (
          <div key={e._id} className="glass-card p-5">
            {e.image && <img src={e.image} alt={e.title} className="w-full h-32 object-cover rounded-lg mb-3" />}
            <h3 className="text-base font-semibold text-white">{e.title}</h3>
            <div className="mt-2 space-y-1 text-xs text-slate-500">
              <div className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(e.date)}</div>
              <div className="flex items-center gap-1"><MapPin className="h-3 w-3" />{e.location}</div>
              <div className="flex items-center gap-1"><Users className="h-3 w-3" />{e.attendees?.length || 0} attending</div>
            </div>
          </div>
        ))}
      </div>
      {events.length === 0 && <div className="glass-card p-12 text-center text-slate-500">No events yet.</div>}
    </div>
  );
}
