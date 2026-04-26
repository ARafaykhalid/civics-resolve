"use client";

import { useState } from "react";
import { createVolunteerOpportunity } from "@/actions/community";
import ImageUpload from "@/components/ImageUpload";
import Dropdown from "@/components/Dropdown";
import { formatDate } from "@/lib/utils";
import { Plus, Loader2, MapPin, Calendar, Users } from "lucide-react";

const categories = ["Cleanup", "Teaching", "Healthcare", "Disaster Relief", "Tree Plantation", "Other"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function VolunteersManagement({ opportunities }: { opportunities: any[] }) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<{
    title: string; description: string; category: string; location: string; date: string; spotsTotal: string;
    contactEmail: string; contactPhone: string; images: string[];
    customFields: { id: string; label: string; type: "text" | "number" | "email" | "textarea" | "checkbox"; required: boolean; }[];
  }>({
    title: "", description: "", category: "", location: "", date: "", spotsTotal: "10",
    contactEmail: "", contactPhone: "", images: [],
    customFields: []
  });

  const update = (k: keyof typeof form, v: any) => setForm((p) => ({ ...p, [k]: v }));

  const [error, setError] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setError("");
    setLoading(true);
    const result = await createVolunteerOpportunity({ ...form, spotsTotal: parseInt(form.spotsTotal) });
    if (result.success) {
      setLoading(false); setShowForm(false);
      window.location.reload();
    } else {
      setError(result.error || "Failed to create opportunity");
      setLoading(false);
    }
  };

  const [editModal, setEditModal] = useState<any>(null);
  const [editForm, setEditForm] = useState({ spotsTotal: "", spotsFilled: "" });
  const [updating, setUpdating] = useState(false);

  const openEdit = (v: any) => {
    setEditForm({ spotsTotal: v.spotsTotal.toString(), spotsFilled: v.spotsFilled.toString() });
    setEditModal(v);
  };

  const handleUpdate = async () => {
    if (!editModal) return;
    setUpdating(true);
    const { updateVolunteerOpportunity } = await import("@/actions/community");
    await updateVolunteerOpportunity(editModal._id, { 
      spotsTotal: parseInt(editForm.spotsTotal), 
      spotsFilled: parseInt(editForm.spotsFilled) 
    });
    setUpdating(false);
    setEditModal(null);
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
            {error && <div className="sm:col-span-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">{error}</div>}
            <div className="sm:col-span-2"><label className="label-text">Title *</label><input value={form.title} onChange={(e) => update("title", e.target.value)} className="input-field" required /></div>
            <div className="z-20 relative">
              <label className="label-text">Category *</label>
              <Dropdown
                value={form.category}
                onChange={(val) => update("category", val)}
                options={[
                  { label: "Select...", value: "" },
                  ...categories.map(c => ({ label: c, value: c }))
                ]}
              />
            </div>
            <div><label className="label-text">Location *</label><input value={form.location} onChange={(e) => update("location", e.target.value)} className="input-field" required /></div>
            <div><label className="label-text">Date *</label><input type="datetime-local" value={form.date} onChange={(e) => update("date", e.target.value)} className="input-field" required /></div>
            <div><label className="label-text">Total Spots *</label><input type="number" min="1" value={form.spotsTotal} onChange={(e) => update("spotsTotal", e.target.value)} className="input-field" required /></div>
            <div><label className="label-text">Contact Email *</label><input type="email" value={form.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} className="input-field" required /></div>
            <div><label className="label-text">Phone (optional)</label><input value={form.contactPhone} onChange={(e) => update("contactPhone", e.target.value)} className="input-field" /></div>
            <div className="sm:col-span-2">
              <label className="label-text">Description *</label>
              <textarea value={form.description} onChange={(e) => update("description", e.target.value)} className="input-field min-h-[80px]" required />
            </div>
            
            {/* Custom Fields Section */}
            <div className="sm:col-span-2 p-4 rounded-xl border border-white/5 bg-black/20 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">Custom Form Fields</h4>
                  <p className="text-xs text-slate-400">Add questions for volunteers to answer when joining.</p>
                </div>
                <button
                  type="button"
                  onClick={() => update("customFields", [...(form.customFields || []), { id: Date.now().toString(), label: "", type: "text", required: false }])}
                  className="btn-secondary py-1.5 px-3 text-xs"
                >
                  <Plus className="h-3 w-3" /> Add Field
                </button>
              </div>
              
              {form.customFields && form.customFields.map((cf, idx) => (
                <div key={cf.id} className="flex flex-wrap sm:flex-nowrap items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex-1 min-w-[200px]">
                    <input
                      type="text"
                      placeholder="Field Label (e.g. T-Shirt Size)"
                      value={cf.label}
                      onChange={(e) => {
                        const newFields = [...form.customFields];
                        newFields[idx].label = e.target.value;
                        update("customFields", newFields);
                      }}
                      className="input-field text-sm"
                      required
                    />
                  </div>
                  <div className="w-[120px]">
                    <Dropdown
                      value={cf.type}
                      onChange={(val) => {
                        const newFields = [...form.customFields];
                        newFields[idx].type = val as any;
                        update("customFields", newFields);
                      }}
                      options={[
                        { label: "Text", value: "text" },
                        { label: "Number", value: "number" },
                        { label: "Email", value: "email" },
                        { label: "Checkbox", value: "checkbox" },
                      ]}
                      className="text-xs"
                    />
                  </div>
                  <label className="flex items-center gap-2 h-10 px-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cf.required}
                      onChange={(e) => {
                        const newFields = [...form.customFields];
                        newFields[idx].required = e.target.checked;
                        update("customFields", newFields);
                      }}
                      className="rounded border-slate-600 text-indigo-500"
                    />
                    <span className="text-xs text-slate-300">Required</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const newFields = form.customFields.filter((_, i) => i !== idx);
                      update("customFields", newFields);
                    }}
                    className="h-10 w-10 flex items-center justify-center rounded-lg text-rose-400 hover:bg-rose-400/10 transition-colors"
                  >
                    <Plus className="h-4 w-4 rotate-45" />
                  </button>
                </div>
              ))}
            </div>

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
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-teal-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-teal-400 border border-teal-500/20">{v.category}</span>
              <button onClick={() => openEdit(v)} className="text-slate-400 hover:text-indigo-400 text-xs font-medium">Edit Spots</button>
            </div>
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

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setEditModal(null)}>
          <div className="w-full max-w-sm glass-card p-6 m-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-4">Edit Spots</h3>
            <div className="space-y-4">
              <div><label className="label-text">Total Spots</label><input type="number" min="1" value={editForm.spotsTotal} onChange={(e) => setEditForm(p => ({...p, spotsTotal: e.target.value}))} className="input-field" /></div>
              <div><label className="label-text">Spots Filled</label><input type="number" min="0" value={editForm.spotsFilled} onChange={(e) => setEditForm(p => ({...p, spotsFilled: e.target.value}))} className="input-field" /></div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setEditModal(null)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleUpdate} disabled={updating || !editForm.spotsTotal} className="btn-primary flex-1">
                  {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
