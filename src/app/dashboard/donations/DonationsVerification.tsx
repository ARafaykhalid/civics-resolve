"use client";

import { useState } from "react";
import { verifyDonationTransaction } from "@/actions/donations";
import { formatDate, cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Loader2, Image as ImageIcon } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function DonationsVerification({ transactions, campaigns }: { transactions: any[]; campaigns: any[] }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState("pending");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const campaignMap = Object.fromEntries(campaigns.map((c) => [c._id, c.title]));

  const filtered = transactions.filter((t) => filter === "all" || t.status === filter);

  const handleVerify = async (id: string, action: "verified" | "rejected") => {
    setLoading(id);
    await verifyDonationTransaction(id, action);
    setLoading(null);
    window.location.reload();
  };

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    verified: "bg-green-500/10 text-green-400 border-green-500/20",
    rejected: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-white mb-6">Verify Donations</h1>

      <div className="glass-card p-4 mb-6">
        <div className="flex gap-2">
          {["pending", "verified", "rejected", "all"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={cn("rounded-lg px-4 py-2 text-sm font-medium transition-all", filter === f ? "bg-indigo-500/15 text-indigo-400" : "text-slate-400 hover:bg-white/5 hover:text-white")}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map((t) => (
          <div key={t._id} className="glass-card p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn("rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", statusColors[t.status])}>{t.status}</span>
                  <span className="text-xs text-slate-500">{formatDate(t.createdAt)}</span>
                </div>
                <p className="text-sm font-medium text-white">{t.donorName} donated ₹{t.amount.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">Campaign: {campaignMap[t.campaignId] || "Unknown"}</p>
                <p className="text-xs text-slate-500">Txn ID: <span className="font-mono text-indigo-400">{t.transactionId}</span></p>
                {t.donorEmail && <p className="text-xs text-slate-500">Email: {t.donorEmail}</p>}
              </div>
              <div className="flex items-center gap-2">
                {t.screenshotUrl && (
                  <button onClick={() => setPreviewImage(t.screenshotUrl)} className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white" title="View Screenshot">
                    <ImageIcon className="h-4 w-4" />
                  </button>
                )}
                {t.status === "pending" && (
                  <>
                    <button onClick={() => handleVerify(t._id, "verified")} disabled={loading === t._id} className="rounded-lg bg-green-500/10 px-3 py-2 text-sm font-medium text-green-400 hover:bg-green-500/20 flex items-center gap-1.5">
                      {loading === t._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Verify
                    </button>
                    <button onClick={() => handleVerify(t._id, "rejected")} disabled={loading === t._id} className="rounded-lg bg-red-500/10 px-3 py-2 text-sm font-medium text-red-400 hover:bg-red-500/20 flex items-center gap-1.5">
                      <XCircle className="h-4 w-4" /> Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="glass-card p-12 text-center text-slate-500">No {filter} donations found.</div>}
      </div>

      {/* Screenshot Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={() => setPreviewImage(null)}>
          <div className="max-w-lg m-4" onClick={(e) => e.stopPropagation()}>
            <img src={previewImage} alt="Payment screenshot" className="w-full rounded-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}
