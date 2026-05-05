"use client";

import { useState } from "react";
import {
  createVolunteerOpportunity,
  updateVolunteerOpportunity,
  deleteVolunteerOpportunity,
} from "@/actions/community";
import ImageUpload from "@/components/ImageUpload";
import Dropdown from "@/components/Dropdown";
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
  Mail,
  Phone,
} from "lucide-react";

const categories = [
  "Cleanup",
  "Teaching",
  "Healthcare",
  "Disaster Relief",
  "Tree Plantation",
  "Other",
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function VolunteersManagement({
  opportunities,
}: {
  opportunities: any[];
}) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<{
    title: string;
    description: string;
    category: string;
    location: string;
    date: string;
    spotsTotal: string;
    contactEmail: string;
    contactPhone: string;
    images: string[];
    customFields: {
      id: string;
      label: string;
      type: "text" | "number" | "email" | "textarea" | "checkbox";
      required: boolean;
    }[];
  }>({
    title: "",
    description: "",
    category: "",
    location: "",
    date: "",
    spotsTotal: "10",
    contactEmail: "",
    contactPhone: "",
    images: [],
    customFields: [],
  });

  const update = (k: keyof typeof form, v: any) =>
    setForm((p) => ({ ...p, [k]: v }));

  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Edit modal state
  const [editModal, setEditModal] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    date: "",
    spotsTotal: "",
    spotsFilled: "",
    contactEmail: "",
    contactPhone: "",
    images: [] as string[],
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await createVolunteerOpportunity({
      ...form,
      spotsTotal: parseInt(form.spotsTotal),
    });
    if (result.success) {
      setLoading(false);
      setShowForm(false);
      window.location.reload();
    } else {
      setError(result.error || "Failed to create opportunity");
      setLoading(false);
    }
  };

  const openEdit = (v: any) => {
    const dateStr = v.date ? new Date(v.date).toISOString().slice(0, 16) : "";
    setEditForm({
      title: v.title || "",
      description: v.description || "",
      category: v.category || "",
      location: v.location || "",
      date: dateStr,
      spotsTotal: v.spotsTotal?.toString() || "10",
      spotsFilled: v.spotsFilled?.toString() || "0",
      contactEmail: v.contactEmail || "",
      contactPhone: v.contactPhone || "",
      images: v.images || [],
    });
    setEditModal(v);
    setEditError("");
  };

  const handleEdit = async () => {
    if (!editModal) return;
    setEditLoading(true);
    setEditError("");
    const result = await updateVolunteerOpportunity(editModal._id, {
      title: editForm.title,
      description: editForm.description,
      category: editForm.category,
      location: editForm.location,
      date: editForm.date,
      spotsTotal: parseInt(editForm.spotsTotal),
      spotsFilled: parseInt(editForm.spotsFilled),
      contactEmail: editForm.contactEmail,
      contactPhone: editForm.contactPhone,
      images: editForm.images,
    });
    if (result.success) {
      setEditModal(null);
      setEditLoading(false);
      window.location.reload();
    } else {
      setEditError(result.error || "Failed to update");
      setEditLoading(false);
    }
  };

  const executeDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(confirmDelete);
    await deleteVolunteerOpportunity(confirmDelete);
    setDeleting(null);
    setConfirmDelete(null);
    window.location.reload();
  };

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">
          Volunteer Opportunities
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary text-sm">
          <Plus className="h-4 w-4" /> New
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
            <div className="z-20 relative">
              <label className="label-text">Category *</label>
              <Dropdown
                value={form.category}
                onChange={(val) => update("category", val)}
                options={[
                  { label: "Select...", value: "" },
                  ...categories.map((c) => ({ label: c, value: c })),
                ]}
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
              <label className="label-text">Date *</label>
              <input
                type="datetime-local"
                value={form.date}
                onChange={(e) => update("date", e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label-text">Total Spots *</label>
              <input
                type="number"
                min="1"
                value={form.spotsTotal}
                onChange={(e) => update("spotsTotal", e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label-text">Contact Email *</label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => update("contactEmail", e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label-text">Phone (optional)</label>
              <input
                value={form.contactPhone}
                onChange={(e) => update("contactPhone", e.target.value)}
                className="input-field"
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

            {/* Custom Fields Section */}
            <div className="sm:col-span-2 p-4 rounded-xl border border-white/5 bg-black/20 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    Custom Form Fields
                  </h4>
                  <p className="text-xs text-slate-400">
                    Add questions for volunteers to answer when joining.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    update("customFields", [
                      ...(form.customFields || []),
                      {
                        id: Date.now().toString(),
                        label: "",
                        type: "text",
                        required: false,
                      },
                    ])
                  }
                  className="btn-secondary py-1.5 px-3 text-xs">
                  <Plus className="h-3 w-3" /> Add Field
                </button>
              </div>

              {form.customFields &&
                form.customFields.map((cf, idx) => (
                  <div
                    key={cf.id}
                    className="flex flex-wrap sm:flex-nowrap items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10">
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
                        const newFields = form.customFields.filter(
                          (_, i) => i !== idx,
                        );
                        update("customFields", newFields);
                      }}
                      className="h-10 w-10 flex items-center justify-center rounded-lg text-rose-400 hover:bg-rose-400/10 transition-colors">
                      <Plus className="h-4 w-4 rotate-45" />
                    </button>
                  </div>
                ))}
            </div>

            <div className="sm:col-span-2">
              <label className="label-text">Images</label>
              <ImageUpload
                images={form.images}
                onChange={(imgs) => update("images", imgs)}
                maxFiles={3}
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
                  "Create"
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {opportunities.map((v) => (
          <div key={v._id} className="glass-card p-5 group">
            {/* Images */}
            {v.images && v.images.length > 0 && (
              <div className="flex gap-2 mb-3 overflow-x-auto">
                {v.images.map((img: string, i: number) => (
                  <img
                    key={i}
                    src={img}
                    alt={`${v.title} ${i + 1}`}
                    className="h-24 w-32 object-cover rounded-lg shrink-0 border border-white/5"
                  />
                ))}
              </div>
            )}
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-teal-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-teal-400 border border-teal-500/20">
                  {v.category}
                </span>
                {!v.isActive && (
                  <span className="rounded-full bg-red-500/10 text-red-400 text-[10px] font-semibold px-2 py-0.5 border border-red-500/20">
                    Inactive
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => openEdit(v)}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-indigo-500/10 hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all"
                  title="Edit">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => setConfirmDelete(v._id)}
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-red-500/10 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                  title="Delete">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <h3 className="text-base font-semibold text-white mt-2">
              {v.title}
            </h3>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
              {v.description}
            </p>
            <div className="mt-3 space-y-1 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {v.location}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(v.date)}
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {v.spotsFilled}/{v.spotsTotal} joined
              </div>
              {v.contactEmail && (
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {v.contactEmail}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {opportunities.length === 0 && (
        <div className="glass-card p-12 text-center text-slate-500">
          No opportunities created yet.
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
              <h3 className="text-lg font-semibold text-white">
                Edit Volunteer Opportunity
              </h3>
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
              <div className="z-20 relative">
                <label className="label-text">Category</label>
                <Dropdown
                  value={editForm.category}
                  onChange={(val) =>
                    setEditForm((p) => ({ ...p, category: val }))
                  }
                  options={categories.map((c) => ({ label: c, value: c }))}
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
                <label className="label-text">Date</label>
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
                <label className="label-text">Total Spots</label>
                <input
                  type="number"
                  min="1"
                  value={editForm.spotsTotal}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, spotsTotal: e.target.value }))
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="label-text">Spots Filled</label>
                <input
                  type="number"
                  min="0"
                  value={editForm.spotsFilled}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, spotsFilled: e.target.value }))
                  }
                  className="input-field"
                />
              </div>
              <div>
                <label className="label-text">Contact Email</label>
                <input
                  type="email"
                  value={editForm.contactEmail}
                  onChange={(e) =>
                    setEditForm((p) => ({
                      ...p,
                      contactEmail: e.target.value,
                    }))
                  }
                  className="input-field"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label-text">Contact Phone</label>
                <input
                  value={editForm.contactPhone}
                  onChange={(e) =>
                    setEditForm((p) => ({
                      ...p,
                      contactPhone: e.target.value,
                    }))
                  }
                  className="input-field"
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
              <div className="sm:col-span-2">
                <label className="label-text">Images</label>
                <ImageUpload
                  images={editForm.images}
                  onChange={(imgs) =>
                    setEditForm((p) => ({ ...p, images: imgs }))
                  }
                  maxFiles={3}
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
        title="Delete Volunteer Opportunity"
        message="Are you sure you want to delete this opportunity? All volunteer sign-ups will be lost."
        loading={!!deleting && deleting === confirmDelete}
      />
    </div>
  );
}
