"use client";

import { useState } from "react";
import { assignComplaint, updateComplaintStatus, deleteComplaint } from "@/actions/complaints";
import { cn, getStatusColor, getPriorityColor, formatDate } from "@/lib/utils";
import { Trash2, UserPlus, RefreshCw, Loader2, Search, Filter, ExternalLink } from "lucide-react";
import Link from "next/link";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ComplaintsManagement({ complaints, authorities }: { complaints: any[]; authorities: any[] }) {
  const [filter, setFilter] = useState({ status: "", category: "", search: "" });
  const [loading, setLoading] = useState<string | null>(null);
  const [modal, setModal] = useState<{ type: "assign" | "status"; id: string } | null>(null);
  const [selectedAuthority, setSelectedAuthority] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("Medium");
  const [newStatus, setNewStatus] = useState("");
  const [statusComment, setStatusComment] = useState("");

  const filtered = complaints.filter((c) => {
    const matchStatus = !filter.status || c.status === filter.status;
    const matchCategory = !filter.category || c.category === filter.category;
    const matchSearch = !filter.search || c.title.toLowerCase().includes(filter.search.toLowerCase());
    return matchStatus && matchCategory && matchSearch;
  });

  const handleAssign = async (id: string) => {
    if (!selectedAuthority) return;
    setLoading(id);
    await assignComplaint({ complaintId: id, authorityId: selectedAuthority, priority: selectedPriority });
    setModal(null); setLoading(null); window.location.reload();
  };

  const handleStatus = async (id: string) => {
    if (!newStatus || !statusComment) return;
    setLoading(id);
    await updateComplaintStatus({ complaintId: id, status: newStatus, comment: statusComment });
    setModal(null); setLoading(null); window.location.reload();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this complaint?")) return;
    setLoading(id);
    await deleteComplaint(id);
    setLoading(null); window.location.reload();
  };

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-white mb-6">Manage Complaints</h1>

      {/* Filters */}
      <div className="glass-card p-4 mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <Filter className="h-4 w-4 text-slate-500" />
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input type="text" placeholder="Search..." value={filter.search} onChange={(e) => setFilter((p) => ({ ...p, search: e.target.value }))} className="input-field pl-9 py-2" />
          </div>
          <select value={filter.status} onChange={(e) => setFilter((p) => ({ ...p, status: e.target.value }))} className="select-field w-auto text-sm py-2">
            <option value="">All Status</option>
            {["Pending", "Verified", "In Progress", "Resolved"].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filter.category} onChange={(e) => setFilter((p) => ({ ...p, category: e.target.value }))} className="select-field w-auto text-sm py-2">
            <option value="">All Categories</option>
            {["Road", "Water", "Electricity", "Garbage", "Safety", "Other"].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                {["Title", "Category", "Status", "Priority", "Date", "Actions"].map((h) => (
                  <th key={h} className={`px-4 py-3 text-xs font-semibold text-slate-500 uppercase ${h === "Actions" ? "text-right" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((c) => (
                <tr key={c._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3"><Link href={`/complaints/${c._id}`} className="text-white hover:text-indigo-400 font-medium">{c.title.slice(0, 50)}</Link></td>
                  <td className="px-4 py-3 text-slate-400">{c.category}</td>
                  <td className="px-4 py-3"><span className={cn("rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", getStatusColor(c.status))}>{c.status}</span></td>
                  <td className="px-4 py-3"><span className={cn("rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", getPriorityColor(c.priority))}>{c.priority}</span></td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{formatDate(c.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => { setModal({ type: "assign", id: c._id }); setSelectedAuthority(""); }} className="rounded-lg p-1.5 text-slate-500 hover:bg-indigo-500/10 hover:text-indigo-400" title="Assign"><UserPlus className="h-4 w-4" /></button>
                      <button onClick={() => { setModal({ type: "status", id: c._id }); setNewStatus(""); setStatusComment(""); }} className="rounded-lg p-1.5 text-slate-500 hover:bg-blue-500/10 hover:text-blue-400" title="Status"><RefreshCw className="h-4 w-4" /></button>
                      <Link href={`/complaints/${c._id}`} className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-white"><ExternalLink className="h-4 w-4" /></Link>
                      <button onClick={() => handleDelete(c._id)} disabled={loading === c._id} className="rounded-lg p-1.5 text-slate-500 hover:bg-red-500/10 hover:text-red-400">
                        {loading === c._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="p-12 text-center text-slate-500">No complaints found.</div>}
      </div>

      {/* Modals */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setModal(null)}>
          <div className="w-full max-w-md glass-card p-6 m-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-4">{modal.type === "assign" ? "Assign Authority" : "Update Status"}</h3>
            <div className="space-y-4">
              {modal.type === "assign" ? (
                <>
                  <div><label className="label-text">Authority / NGO</label><select value={selectedAuthority} onChange={(e) => setSelectedAuthority(e.target.value)} className="select-field"><option value="">Select...</option>{authorities.map((a) => <option key={a._id} value={a._id}>{a.name} ({a.type})</option>)}</select></div>
                  <div><label className="label-text">Priority</label><select value={selectedPriority} onChange={(e) => setSelectedPriority(e.target.value)} className="select-field"><option value="Low">Low</option><option value="Medium">Medium</option><option value="High">High</option></select></div>
                </>
              ) : (
                <>
                  <div><label className="label-text">New Status</label><select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="select-field"><option value="">Select...</option>{["Pending", "Verified", "In Progress", "Resolved"].map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
                  <div><label className="label-text">Comment</label><textarea value={statusComment} onChange={(e) => setStatusComment(e.target.value)} className="input-field min-h-[80px]" placeholder="Note..." /></div>
                </>
              )}
              <div className="flex gap-3">
                <button onClick={() => setModal(null)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={() => modal.type === "assign" ? handleAssign(modal.id) : handleStatus(modal.id)} disabled={loading === modal.id} className="btn-primary flex-1">
                  {loading === modal.id ? <Loader2 className="h-4 w-4 animate-spin" /> : modal.type === "assign" ? "Assign" : "Update"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
