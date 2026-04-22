"use client";

import { useState } from "react";
import { createAnnouncement, deleteAnnouncement } from "@/actions/community";
import { formatDate, cn } from "@/lib/utils";
import { Plus, Trash2, Loader2, AlertTriangle, Bell, Info, Megaphone, Pin } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function AnnouncementsManagement({ announcements }: { announcements: any[] }) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", content: "", type: "info", isPinned: false });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    await createAnnouncement(form);
    setLoading(false); setShowForm(false);
    window.location.reload();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete?")) return;
    setDeleting(id);
    await deleteAnnouncement(id);
    setDeleting(null);
    window.location.reload();
  };

  const typeIcons: Record<string, typeof AlertTriangle> = { emergency: AlertTriangle, warning: Bell, info: Info, update: Megaphone };
  const typeColors: Record<string, string> = {
    emergency: "border-red-500/30 bg-red-500/10 text-red-400",
    warning: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    info: "border-blue-500/30 bg-blue-500/10 text-blue-400",
    update: "border-green-500/30 bg-green-500/10 text-green-400",
  };

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Announcements</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary text-sm"><Plus className="h-4 w-4" /> New</button>
      </div>

      {showForm && (
        <div className="glass-card p-6 mb-6">
          <form onSubmit={handleCreate} className="space-y-4">
            <div><label className="label-text">Title *</label><input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="input-field" required /></div>
            <div><label className="label-text">Content *</label><textarea value={form.content} onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))} className="input-field min-h-[80px]" required /></div>
            <div className="flex gap-4">
              <div className="flex-1"><label className="label-text">Type</label><select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))} className="select-field"><option value="info">Info</option><option value="warning">Warning</option><option value="emergency">Emergency</option><option value="update">Update</option></select></div>
              <label className="flex items-center gap-2 mt-6"><input type="checkbox" checked={form.isPinned} onChange={(e) => setForm((p) => ({ ...p, isPinned: e.target.checked }))} className="h-4 w-4 rounded border-slate-600 text-indigo-500" /><span className="text-sm text-slate-300">Pin to top</span></label>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={loading} className="btn-primary flex-1">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Post"}</button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {announcements.map((a) => {
          const Icon = typeIcons[a.type] || Info;
          return (
            <div key={a._id} className={cn("flex items-start gap-3 rounded-xl border p-4", typeColors[a.type])}>
              <Icon className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{a.title}</p>
                  {a.isPinned && <Pin className="h-3.5 w-3.5 opacity-60" />}
                </div>
                <p className="text-sm opacity-80 mt-0.5">{a.content}</p>
                <p className="text-xs opacity-50 mt-1">{formatDate(a.createdAt)}</p>
              </div>
              <button onClick={() => handleDelete(a._id)} disabled={deleting === a._id} className="shrink-0 opacity-60 hover:opacity-100">
                {deleting === a._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </button>
            </div>
          );
        })}
        {announcements.length === 0 && <div className="glass-card p-12 text-center text-slate-500">No announcements.</div>}
      </div>
    </div>
  );
}
