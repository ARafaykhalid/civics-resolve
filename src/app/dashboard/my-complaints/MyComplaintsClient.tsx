"use client";

import { useState } from "react";
import Link from "next/link";
import { editComplaint } from "@/actions/complaints";
import ImageUpload from "@/components/ImageUpload";
import Dropdown from "@/components/Dropdown";
import { cn, getStatusColor, getPriorityColor, formatDate } from "@/lib/utils";
import {
  FileText,
  Pencil,
  ExternalLink,
  Loader2,
  X,
  MapPin,
  Calendar,
} from "lucide-react";

const categories = ["Road", "Water", "Electricity", "Garbage", "Safety", "Other"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function MyComplaintsClient({ complaints }: { complaints: any[] }) {
  // Edit modal state
  const [editModal, setEditModal] = useState<any>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    category: "",
    address: "",
    images: [] as string[],
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  const openEdit = (c: any) => {
    setEditForm({
      title: c.title || "",
      description: c.description || "",
      category: c.category || "",
      address: c.location?.address || "",
      images: c.images || [],
    });
    setEditModal(c);
    setEditError("");
  };

  const handleEdit = async () => {
    if (!editModal) return;
    setEditLoading(true);
    setEditError("");
    const result = await editComplaint({
      complaintId: editModal._id,
      title: editForm.title,
      description: editForm.description,
      category: editForm.category,
      location: {
        address: editForm.address,
        lat: editModal.location?.lat,
        lng: editModal.location?.lng,
      },
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

  const canEdit = (c: any) => ["Pending Verification", "Verified"].includes(c.status);

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-white mb-6">My Reports</h1>

      {complaints.length > 0 ? (
        <div className="space-y-4">
          {complaints.map((c: any) => (
            <div
              key={c._id}
              className="glass-card p-5 group hover:bg-white/[0.02] transition-colors">
              <div className="flex items-start gap-4">
                {/* Thumbnail */}
                {c.images && c.images.length > 0 ? (
                  <img
                    src={c.images[0]}
                    alt={c.title}
                    className="h-20 w-24 object-cover rounded-lg shrink-0 border border-white/5"
                  />
                ) : (
                  <div className="h-20 w-24 rounded-lg bg-slate-800/50 border border-white/5 flex items-center justify-center shrink-0">
                    <FileText className="h-6 w-6 text-slate-600" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span
                      className={cn(
                        "rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                        getStatusColor(c.status),
                      )}>
                      {c.status}
                    </span>
                    <span
                      className={cn(
                        "rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                        getPriorityColor(c.priority),
                      )}>
                      {c.priority}
                    </span>
                    <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-[11px] font-medium text-slate-400">
                      {c.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-white truncate">
                    {c.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                    {c.description}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-slate-600">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {c.location?.address}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(c.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {canEdit(c) && (
                    <button
                      onClick={() => openEdit(c)}
                      className="rounded-lg p-2 text-slate-500 hover:bg-indigo-500/10 hover:text-indigo-400 transition-colors"
                      title="Edit">
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                  <Link
                    href={`/complaints/${c._id}`}
                    className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-white transition-colors"
                    title="View">
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="glass-card p-16 text-center">
          <FileText className="mx-auto h-12 w-12 text-slate-600" />
          <h3 className="mt-4 text-lg font-semibold text-slate-300">
            No reports yet
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Submit your first issue report to get started.
          </p>
          <Link href="/submit" className="btn-primary mt-6 inline-flex">
            Submit a Report
          </Link>
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
                Edit Complaint
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

            <div className="space-y-4">
              <div>
                <label className="label-text">Title</label>
                <input
                  value={editForm.title}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, title: e.target.value }))
                  }
                  className="input-field"
                  minLength={5}
                  maxLength={100}
                />
              </div>

              <div className="relative z-20">
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
                <label className="label-text">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm((p) => ({
                      ...p,
                      description: e.target.value,
                    }))
                  }
                  className="input-field min-h-[120px]"
                  minLength={20}
                  maxLength={2000}
                />
                <p className="mt-1 text-xs text-slate-500 text-right">
                  {editForm.description.length}/2000
                </p>
              </div>

              <div>
                <label className="label-text flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" /> Location
                </label>
                <input
                  value={editForm.address}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, address: e.target.value }))
                  }
                  className="input-field"
                  minLength={5}
                />
              </div>

              <div>
                <label className="label-text">Images</label>
                <ImageUpload
                  images={editForm.images}
                  onChange={(imgs) =>
                    setEditForm((p) => ({ ...p, images: imgs }))
                  }
                  maxFiles={5}
                />
              </div>

              <div className="flex gap-3 pt-2">
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
    </div>
  );
}
