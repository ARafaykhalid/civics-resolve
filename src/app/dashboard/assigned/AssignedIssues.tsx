"use client";

import { useState } from "react";
import Link from "next/link";
import { updateComplaintStatus } from "@/actions/complaints";
import ImageUpload from "@/components/ImageUpload";
import Dropdown from "@/components/Dropdown";
import { cn, getStatusColor, getPriorityColor, formatDate } from "@/lib/utils";
import { RefreshCw, Loader2, ExternalLink, AlertTriangle } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function AssignedIssues({ complaints }: { complaints: any[] }) {
  const [modal, setModal] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [comment, setComment] = useState("");
  const [proofImages, setProofImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleUpdate = async (complaintId: string) => {
    if (!newStatus || !comment) {
      setError("Please provide both a new status and a progress note");
      return;
    }
    setError("");
    setLoading(true);
    const result = await updateComplaintStatus({ complaintId, status: newStatus, comment, images: proofImages });
    if (result.success) {
      setModal(null); 
      setLoading(false);
      window.location.reload();
    } else {
      setError(result.error || "Failed to update status");
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-white mb-6">Assigned Issues</h1>

      <div className="glass-card overflow-hidden">
        <div className="divide-y divide-white/5">
          {complaints.length === 0 ? (
            <div className="p-12 text-center"><AlertTriangle className="mx-auto h-10 w-10 text-slate-600 mb-3" /><p className="text-slate-400">No issues assigned.</p></div>
          ) : (
            complaints.map((c) => (
              <div key={c._id} className="flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-semibold", getStatusColor(c.status))}>{c.status}</span>
                    <span className={cn("rounded-full border px-2 py-0.5 text-[11px] font-semibold", getPriorityColor(c.priority))}>{c.priority}</span>
                    <span className="text-xs text-slate-600">{c.category}</span>
                  </div>
                  <p className="text-sm font-medium text-white truncate">{c.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{formatDate(c.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button onClick={() => { setModal(c._id); setNewStatus(""); setComment(""); setProofImages([]); }} className="rounded-lg p-2 text-slate-400 hover:bg-indigo-500/10 hover:text-indigo-400"><RefreshCw className="h-4 w-4" /></button>
                  <Link href={`/complaints/${c._id}`} className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"><ExternalLink className="h-4 w-4" /></Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setModal(null)}>
          <div className="w-full max-w-lg glass-card p-6 m-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-4">Update Status</h3>
            {error && <div className="mb-4 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">{error}</div>}
            <div className="space-y-4">
              <div className="z-20 relative">
                <label className="label-text">New Status</label>
                <Dropdown
                  value={newStatus}
                  onChange={setNewStatus}
                  options={[
                    { label: "Select...", value: "" },
                    { label: "Verified", value: "Verified" },
                    { label: "Under Progress", value: "Under Progress" },
                    { label: "Resolved", value: "Resolved" },
                  ]}
                />
              </div>
              <div><label className="label-text">Progress Notes</label><textarea value={comment} onChange={(e) => setComment(e.target.value)} className="input-field min-h-[100px]" placeholder="Describe progress..." /></div>
              <div><label className="label-text">Proof (optional)</label><ImageUpload images={proofImages} onChange={setProofImages} maxFiles={3} /></div>
              <div className="flex gap-3"><button onClick={() => setModal(null)} className="btn-secondary flex-1">Cancel</button><button onClick={() => handleUpdate(modal)} disabled={loading} className="btn-primary flex-1">{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update"}</button></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
