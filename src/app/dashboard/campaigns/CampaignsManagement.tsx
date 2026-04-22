"use client";

import { useState } from "react";
import { createDonationCampaign, toggleCampaignStatus } from "@/actions/donations";
import ImageUpload from "@/components/ImageUpload";
import { formatDate, cn } from "@/lib/utils";
import { Plus, Loader2, ToggleLeft, ToggleRight, Heart, Target } from "lucide-react";

const categories = ["Infrastructure", "Education", "Healthcare", "Environment", "Disaster Relief", "Charity", "Other"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function CampaignsManagement({ campaigns }: { campaigns: any[] }) {
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "", description: "", category: "", images: [] as string[],
    qrCodeImage: "", upiId: "", goalAmount: "",
  });
  const [qrImages, setQrImages] = useState<string[]>([]);

  const update = (k: string, v: string | string[]) => setForm((p) => ({ ...p, [k]: v }));

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await createDonationCampaign({
      ...form, qrCodeImage: qrImages[0] || "", goalAmount: parseFloat(form.goalAmount),
    });
    setLoading(false); setShowCreate(false);
    window.location.reload();
  };

  const handleToggle = async (id: string) => {
    setToggling(id);
    await toggleCampaignStatus(id);
    setToggling(null);
    window.location.reload();
  };

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Donation Campaigns</h1>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary text-sm">
          <Plus className="h-4 w-4" /> New Campaign
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="glass-card p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Create Campaign</h3>
          <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><label className="label-text">Title *</label><input value={form.title} onChange={(e) => update("title", e.target.value)} className="input-field" required minLength={5} /></div>
            <div><label className="label-text">Category *</label><select value={form.category} onChange={(e) => update("category", e.target.value)} className="select-field" required><option value="">Select...</option>{categories.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
            <div><label className="label-text">Goal Amount (₹) *</label><input type="number" min="1" value={form.goalAmount} onChange={(e) => update("goalAmount", e.target.value)} className="input-field" required /></div>
            <div className="sm:col-span-2"><label className="label-text">Description *</label><textarea value={form.description} onChange={(e) => update("description", e.target.value)} className="input-field min-h-[100px]" required minLength={20} /></div>
            <div><label className="label-text">UPI ID (optional)</label><input value={form.upiId} onChange={(e) => update("upiId", e.target.value)} className="input-field" placeholder="name@upi" /></div>
            <div><label className="label-text">Campaign Images</label><ImageUpload images={form.images} onChange={(imgs) => update("images", imgs)} maxFiles={3} /></div>
            <div className="sm:col-span-2">
              <label className="label-text text-rose-400">QR Code Image * (Upload your payment QR)</label>
              <ImageUpload images={qrImages} onChange={setQrImages} maxFiles={1} />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
              <button type="submit" disabled={loading || !qrImages.length} className="btn-primary flex-1">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Campaign"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Campaigns List */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {campaigns.map((c) => {
          const progress = c.goalAmount > 0 ? Math.min(Math.round((c.raisedAmount / c.goalAmount) * 100), 100) : 0;
          return (
            <div key={c._id} className={cn("glass-card p-5 transition-all", !c.isActive && "opacity-50")}>
              <div className="flex items-center justify-between mb-3">
                <span className="rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-rose-400 border border-rose-500/20">{c.category}</span>
                <button onClick={() => handleToggle(c._id)} disabled={toggling === c._id} className="text-slate-400 hover:text-white" title={c.isActive ? "Deactivate" : "Activate"}>
                  {toggling === c._id ? <Loader2 className="h-5 w-5 animate-spin" /> : c.isActive ? <ToggleRight className="h-5 w-5 text-green-400" /> : <ToggleLeft className="h-5 w-5" />}
                </button>
              </div>
              <h3 className="text-base font-semibold text-white">{c.title}</h3>
              <p className="mt-1 text-xs text-slate-500">{formatDate(c.createdAt)}</p>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-emerald-400">₹{c.raisedAmount.toLocaleString()}</span>
                <span className="text-slate-500">₹{c.goalAmount.toLocaleString()}</span>
              </div>
              <div className="mt-1.5 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400" style={{ width: `${progress}%` }} />
              </div>
            </div>
          );
        })}
      </div>
      {campaigns.length === 0 && <div className="glass-card p-12 text-center text-slate-500">No campaigns yet.</div>}
    </div>
  );
}
