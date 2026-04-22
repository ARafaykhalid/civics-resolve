"use client";

import { useState } from "react";
import { createVolunteerOpportunity } from "@/actions/community";
import ImageUpload from "@/components/ImageUpload";
import { formatDate } from "@/lib/utils";
import { Plus, Loader2, MapPin, Calendar, Users } from "lucide-react";

const categories = ["Cleanup", "Teaching", "Healthcare", "Disaster Relief", "Tree Plantation", "Other"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function VolunteersManagement({ opportunities }: { opportunities: any[] }) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", category: "", location: "", date: "", spotsTotal: "10",
    contactEmail: "", contactPhone: "", images: [] as string[],
  });

  const update = (k: string, v: string | string[]) => setForm((p) => ({ ...p, [k]: v }));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    await createVolunteerOpportunity({ ...form, spotsTotal: parseInt(form.spotsTotal) });
    setLoading(false); setShowForm(false);
    window.location.reload();
  };

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Volunteer Opportunities</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm"><Plus className="h-4 w-4" /> New</button>
      </div>

      {showForm && (
        <div className="glass-card p-6 mb-6">
          <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><label className="label-text">Title *</label><input value={form.title} onChange={(e) => update("title", e.target.value)} className="input-field" required /></div>
            <div><label className="label-text">Category *</label><select value={form.category} onChange={(e) => update("category", e.target.value)} className="select-field" required><option value="">Select...</option>{categories.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
            <div><label className="label-text">Location *</label><input value={form.location} onChange={(e) => update("location", e.target.value)} className="input-field" required /></div>
            <div><label className="label-text">Date *</label><input type="datetime-local" value={form.date} onChange={(e) => update("date", e.target.value)} className="input-field" required /></div>
            <div><label className="label-text">Total Spots *</label><input type="number" min="1" value={form.spotsTotal} onChange={(e) => update("spotsTotal", e.target.value)} className="input-field" required /></div>
            <div><label className="label-text">Contact Email *</label><input type="email" value={form.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} className="input-field" required /></div>
            <div><label className="label-text">Phone (optional)</label><input value={form.contactPhone} onChange={(e) => update("contactPhone", e.target.value)} className="input-field" /></div>
            <div className="sm:col-span-2"><label className="label-text">Description *</label><textarea value={form.description} onChange={(e) => update("description", e.target.value)} className="input-field min-h-[80px]" required /></div>
            <div className="sm:col-span-2"><label className="label-text">Images</label><ImageUpload images={form.images} onChange={(imgs) => update("images", imgs)} maxFiles={3} /></div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {opportunities.map((v) => (
          <div key={v._id} className="glass-card p-5">
            <span className="rounded-full bg-teal-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-teal-400 border border-teal-500/20">{v.category}</span>
            <h3 className="text-base font-semibold text-white mt-2">{v.title}</h3>
            <div className="mt-2 space-y-1 text-xs text-slate-500">
              <div className="flex items-center gap-1"><MapPin className="h-3 w-3" />{v.location}</div>
              <div className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(v.date)}</div>
              <div className="flex items-center gap-1"><Users className="h-3 w-3" />{v.spotsFilled}/{v.spotsTotal} joined</div>
            </div>
          </div>
        ))}
      </div>
      {opportunities.length === 0 && <div className="glass-card p-12 text-center text-slate-500">No opportunities created yet.</div>}
    </div>
  );
}
