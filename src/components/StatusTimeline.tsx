"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { editTimelineEntry, deleteTimelineEntry } from "@/actions/complaints";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Pencil,
  Trash2,
  X,
  Save,
  Loader2,
  XCircle,
} from "lucide-react";
import { cn, formatDateTime, getStatusColor } from "@/lib/utils";
import type { TimelineEntry } from "@/types";

interface StatusTimelineProps {
  timeline: TimelineEntry[];
  complaintId?: string;
}

const statusIcons: Record<string, typeof CheckCircle2> = {
  "Pending Verification": Clock,
  Verified: AlertCircle,
  "Under Progress": ArrowRight,
  Resolved: CheckCircle2,
  Rejected: XCircle,
};

export default function StatusTimeline({
  timeline,
  complaintId,
}: StatusTimelineProps) {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "admin";

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editComment, setEditComment] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [localTimeline, setLocalTimeline] = useState(timeline);

  if (!localTimeline || localTimeline.length === 0) {
    return <p className="text-sm text-slate-500">No updates yet.</p>;
  }

  const handleEdit = (entry: TimelineEntry) => {
    setEditingId(entry._id || null);
    setEditComment(entry.comment);
    setEditStatus(entry.status);
  };

  const handleSave = async (entryId: string) => {
    if (!complaintId) return;
    setSaving(true);
    const result = await editTimelineEntry({
      complaintId,
      timelineId: entryId,
      comment: editComment,
      status: editStatus,
    });
    if (result.success) {
      setLocalTimeline((prev) =>
        prev.map((t) =>
          t._id === entryId
            ? { ...t, comment: editComment, status: editStatus as any }
            : t,
        ),
      );
      setEditingId(null);
    }
    setSaving(false);
  };

  const handleDelete = async (entryId: string) => {
    if (!complaintId || !confirm("Delete this timeline entry?")) return;
    setDeletingId(entryId);
    const result = await deleteTimelineEntry({
      complaintId,
      timelineId: entryId,
    });
    if (result.success) {
      setLocalTimeline((prev) => prev.filter((t) => t._id !== entryId));
    }
    setDeletingId(null);
  };

  return (
    <div className="relative space-y-0">
      {/* Vertical line */}
      <div className="absolute left-[18px] top-3 bottom-3 w-px bg-gradient-to-b from-indigo-500/50 via-slate-700 to-transparent" />
      {localTimeline.map((entry, index) => {
        const Icon = statusIcons[entry.status] || Clock;
        const isLatest = index === localTimeline.length - 1;
        const isEditing = editingId === entry._id;
        return (
          <div
            key={entry._id || index}
            className="relative flex gap-4 pb-6 last:pb-0 group">
            <div
              className={cn(
                "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                isLatest
                  ? "border-indigo-500 bg-indigo-500/20"
                  : "border-slate-700 bg-slate-800",
              )}>
              <Icon
                className={cn(
                  "h-4 w-4",
                  isLatest ? "text-indigo-400" : "text-slate-500",
                )}
              />
            </div>
            <div className="min-w-0 flex-1 pt-1">
              {isEditing ? (
                <div className="space-y-2">
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="input-field text-xs py-1">
                    <option value="Pending Verification">
                      Pending Verification
                    </option>
                    <option value="Verified">Verified</option>
                    <option value="Under Progress">Under Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                  <textarea
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    className="input-field text-sm min-h-[60px]"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSave(entry._id!)}
                      disabled={saving}
                      className="btn-primary text-xs py-1 px-3">
                      {saving ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Save className="h-3 w-3" />
                      )}{" "}
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="btn-secondary text-xs py-1 px-3">
                      <X className="h-3 w-3" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span
                      className={cn(
                        "rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                        getStatusColor(entry.status),
                      )}>
                      {entry.status}
                    </span>
                    <span className="text-xs text-slate-500">
                      {formatDateTime(entry.createdAt)}
                    </span>
                    {isAdmin && complaintId && (
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all">
                        <button
                          onClick={() => handleEdit(entry)}
                          className="text-slate-600 hover:text-indigo-400 transition-colors"
                          title="Edit">
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(entry._id!)}
                          disabled={deletingId === entry._id}
                          className="text-slate-600 hover:text-red-400 transition-colors"
                          title="Delete">
                          {deletingId === entry._id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Trash2 className="h-3 w-3" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-slate-300">{entry.comment}</p>
                  {entry.updatedByName && (
                    <p className="mt-0.5 text-xs text-slate-600">
                      by {entry.updatedByName}
                    </p>
                  )}
                  {entry.images && entry.images.length > 0 && (
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {entry.images.map((img, i) => (
                        <img
                          key={i}
                          src={img}
                          alt="Proof"
                          className="h-16 w-16 rounded-lg object-cover border border-white/5"
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
