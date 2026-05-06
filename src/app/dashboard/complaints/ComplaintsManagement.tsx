"use client";

import { useState } from "react";
import {
  assignComplaint,
  updateComplaintStatus,
  deleteComplaint,
  editComplaint,
} from "@/actions/complaints";
import ConfirmModal from "@/components/ConfirmModal";
import Dropdown from "@/components/Dropdown";
import ImageUpload from "@/components/ImageUpload";
import { cn, getStatusColor, getPriorityColor, formatDate } from "@/lib/utils";
import {
  Trash2,
  UserPlus,
  RefreshCw,
  Loader2,
  Search,
  Filter,
  ExternalLink,
  Pencil,
  X,
  MapPin,
} from "lucide-react";
import Link from "next/link";

const categories = ["Road", "Water", "Electricity", "Garbage", "Safety", "Other"];

export default function ComplaintsManagement({
  complaints,
  authorities,
}: {
  complaints: any[];
  authorities: any[];
}) {
  const [filter, setFilter] = useState({
    status: "",
    category: "",
    search: "",
  });
  const [loading, setLoading] = useState<string | null>(null);
  const [modal, setModal] = useState<{
    type: "assign" | "status";
    id: string;
  } | null>(null);
  const [selectedAuthority, setSelectedAuthority] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("Medium");
  const [newStatus, setNewStatus] = useState("");
  const [statusComment, setStatusComment] = useState("");
  const [statusImages, setStatusImages] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
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

  const filtered = complaints.filter((c) => {
    const matchStatus = !filter.status || c.status === filter.status;
    const matchCategory = !filter.category || c.category === filter.category;
    const matchSearch =
      !filter.search ||
      c.title.toLowerCase().includes(filter.search.toLowerCase());
    return matchStatus && matchCategory && matchSearch;
  });

  const handleAssign = async (id: string) => {
    if (!selectedAuthority) {
      setActionError("Please select an authority");
      return;
    }
    setActionError("");
    setLoading(id);
    const result = await assignComplaint({
      complaintId: id,
      authorityId: selectedAuthority,
      priority: selectedPriority,
    });
    if (result.success) {
      setModal(null);
      setLoading(null);
      window.location.reload();
    } else {
      setActionError(result.error || "Failed to assign");
      setLoading(null);
    }
  };

  const handleStatus = async (id: string) => {
    if (!newStatus || !statusComment) {
      setActionError("Please provide both a new status and a comment");
      return;
    }
    setActionError("");
    setLoading(id);
    const result = await updateComplaintStatus({
      complaintId: id,
      status: newStatus,
      comment: statusComment,
      images: statusImages,
    });
    if (result.success) {
      setModal(null);
      setLoading(null);
      window.location.reload();
    } else {
      setActionError(result.error || "Failed to update status");
      setLoading(null);
    }
  };

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

  const executeDelete = async () => {
    if (!confirmDelete) return;
    setLoading(confirmDelete);
    await deleteComplaint(confirmDelete);
    setLoading(null);
    setConfirmDelete(null);
    window.location.reload();
  };

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-white mb-6">Manage Complaints</h1>

      {/* Status Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
        {["", "Pending Verification", "Verified", "Under Progress", "Resolved", "Rejected"].map((s) => {
          const label = s || "All Complaints";
          return (
            <button
              key={label}
              onClick={() => setFilter((p) => ({ ...p, status: s }))}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium transition-all whitespace-nowrap",
                filter.status === s
                  ? "bg-indigo-500/15 text-indigo-400 shadow-sm ring-1 ring-indigo-500/20"
                  : "text-slate-400 hover:bg-white/5 hover:text-white",
              )}>
              {label}
            </button>
          );
        })}
      </div>

      {/* Search & Category Filters */}
      <div className="p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="h-4 w-4 text-slate-500" />
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search complaints..."
              value={filter.search}
              onChange={(e) =>
                setFilter((p) => ({ ...p, search: e.target.value }))
              }
              className="input-field pl-9 py-2"
            />
          </div>
          <div className="w-[160px]">
            <Dropdown
              value={filter.category}
              onChange={(val) => setFilter((p) => ({ ...p, category: val }))}
              options={[
                "",
                "Road",
                "Water",
                "Electricity",
                "Garbage",
                "Safety",
                "Other",
              ].map((c) => ({ label: c || "All Categories", value: c }))}
              placeholder="All Categories"
              className="text-sm"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {[
                  "Title",
                  "Category",
                  "Status",
                  "Priority",
                  "Assigned To",
                  "Date",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className={`px-4 py-3 text-xs font-semibold text-slate-500 uppercase ${h === "Actions" ? "text-right" : "text-left"}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((c) => (
                <tr
                  key={c._id}
                  className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/complaints/${c._id}`}
                      className="text-white hover:text-indigo-400 font-medium">
                      {c.title.slice(0, 50)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{c.category}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                        getStatusColor(c.status),
                      )}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                        getPriorityColor(c.priority),
                      )}>
                      {c.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {c.assignedTo ? (
                      <span className="text-xs text-indigo-400 font-medium">
                        {c.assignedTo.name || "Assigned"}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-600">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {formatDate(c.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEdit(c)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-indigo-500/10 hover:text-indigo-400"
                        title="Edit">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setModal({ type: "assign", id: c._id });
                          setSelectedAuthority("");
                          setActionError("");
                        }}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-indigo-500/10 hover:text-indigo-400"
                        title="Assign">
                        <UserPlus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setModal({ type: "status", id: c._id });
                          setNewStatus("");
                          setStatusComment("");
                          setStatusImages([]);
                          setActionError("");
                        }}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-blue-500/10 hover:text-blue-400"
                        title="Status">
                        <RefreshCw className="h-4 w-4" />
                      </button>
                      <Link
                        href={`/complaints/${c._id}`}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-white">
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => setConfirmDelete(c._id)}
                        disabled={loading === c._id}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-red-500/10 hover:text-red-400">
                        {loading === c._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-12 text-center text-slate-500">
            No complaints found.
          </div>
        )}
      </div>

      {/* Modals */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setModal(null)}>
          <div
            className="w-full max-w-lg glass-card p-6 m-4 max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-4">
              {modal.type === "assign" ? "Assign Authority" : "Update Status"}
            </h3>
            {actionError && (
              <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                {actionError}
              </div>
            )}
            <div className="space-y-4">
              {modal.type === "assign" ? (
                <>
                  <div className="z-20 relative">
                    <label className="label-text">Authority / NGO</label>
                    <Dropdown
                      value={selectedAuthority}
                      onChange={setSelectedAuthority}
                      options={[
                        { label: "Select...", value: "" },
                        ...authorities.map((a) => ({
                          label: `${a.name} (${a.type})`,
                          value: a._id,
                        })),
                      ]}
                    />
                  </div>
                  <div className="z-10 relative">
                    <label className="label-text">Priority</label>
                    <Dropdown
                      value={selectedPriority}
                      onChange={setSelectedPriority}
                      options={["Low", "Medium", "High"].map((p) => ({
                        label: p,
                        value: p,
                      }))}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="z-20 relative">
                    <label className="label-text">New Status</label>
                    <Dropdown
                      value={newStatus}
                      onChange={setNewStatus}
                      options={[
                        { label: "Select...", value: "" },
                        ...[
                          "Pending Verification",
                          "Verified",
                          "Under Progress",
                          "Resolved",
                          "Rejected",
                        ].map((s) => ({ label: s, value: s })),
                      ]}
                    />
                  </div>
                  <div>
                    <label className="label-text">Comment</label>
                    <textarea
                      value={statusComment}
                      onChange={(e) => setStatusComment(e.target.value)}
                      className="input-field min-h-[80px]"
                      placeholder="Note..."
                    />
                  </div>
                  <div>
                    <label className="label-text">
                      Proof Images (optional)
                    </label>
                    <ImageUpload
                      images={statusImages}
                      onChange={setStatusImages}
                      maxFiles={3}
                    />
                  </div>
                </>
              )}
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => setModal(null)}
                  className="btn-secondary flex-1">
                  Cancel
                </button>
                <button
                  onClick={() =>
                    modal.type === "assign"
                      ? handleAssign(modal.id)
                      : handleStatus(modal.id)
                  }
                  disabled={loading === modal.id}
                  className="btn-primary flex-1">
                  {loading === modal.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : modal.type === "assign" ? (
                    "Assign"
                  ) : (
                    "Update"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setEditModal(null)}>
          <div
            className="w-full max-w-xl glass-card p-6 m-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-white">Edit Complaint</h3>
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

      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={executeDelete}
        title="Delete Complaint"
        message="Are you sure you want to delete this complaint? This will permanently remove it from the system."
        loading={!!loading && loading === confirmDelete}
      />
    </div>
  );
}
