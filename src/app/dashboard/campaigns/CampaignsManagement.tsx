"use client";

import { useState } from "react";
import { createDonationCampaign, toggleCampaignStatus } from "@/actions/donations";
import ImageUpload from "@/components/ImageUpload";
import Dropdown from "@/components/Dropdown";
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

  const [error, setError] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await createDonationCampaign({
      ...form, qrCodeImage: qrImages[0] || "", goalAmount: parseFloat(form.goalAmount),
    });
    if (result.success) {
      setLoading(false); setShowCreate(false);
      window.location.reload();
    } else {
      setError(result.error || "Failed to create campaign");
      setLoading(false);
    }
  };

  const handleToggle = async (id: string) => {
    setToggling(id);
    await toggleCampaignStatus(id);
    setToggling(null);
    window.location.reload();
  };

  const [editModal, setEditModal] = useState<any>(null);
  const [editForm, setEditForm] = useState({ goalAmount: "", raisedAmount: "" });
  const [updating, setUpdating] = useState(false);

  const openEdit = (campaign: any) => {
    setEditForm({ goalAmount: campaign.goalAmount.toString(), raisedAmount: campaign.raisedAmount.toString() });
    setEditModal(campaign);
  };

  const handleUpdate = async () => {
    if (!editModal) return;
    setUpdating(true);
    const { updateDonationCampaign } = await import("@/actions/donations");
    await updateDonationCampaign(editModal._id, { 
      goalAmount: parseFloat(editForm.goalAmount), 
      raisedAmount: parseFloat(editForm.raisedAmount) 
    });
    setUpdating(false);
    setEditModal(null);
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
            {error && <div className="sm:col-span-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">{error}</div>}
            <div className="sm:col-span-2"><label className="label-text">Title *</label><input value={form.title} onChange={(e) => update("title", e.target.value)} className="input-field" required minLength={5} /></div>
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
                <div className="flex items-center gap-2">
                  <button onClick={() => openEdit(c)} className="text-slate-400 hover:text-indigo-400 text-xs font-medium">Edit Goal</button>
                  <button onClick={() => handleToggle(c._id)} disabled={toggling === c._id} className="text-slate-400 hover:text-white" title={c.isActive ? "Deactivate" : "Activate"}>
                    {toggling === c._id ? <Loader2 className="h-5 w-5 animate-spin" /> : c.isActive ? <ToggleRight className="h-5 w-5 text-green-400" /> : <ToggleLeft className="h-5 w-5" />}
                  </button>
                </div>
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

      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setEditModal(null)}>
          <div className="w-full max-w-sm glass-card p-6 m-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-4">Edit Campaign Progress</h3>
            <div className="space-y-4">
              <div><label className="label-text">Goal Amount (₹)</label><input type="number" min="1" value={editForm.goalAmount} onChange={(e) => setEditForm(p => ({...p, goalAmount: e.target.value}))} className="input-field" /></div>
              <div><label className="label-text">Raised Amount (₹)</label><input type="number" min="0" value={editForm.raisedAmount} onChange={(e) => setEditForm(p => ({...p, raisedAmount: e.target.value}))} className="input-field" /></div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setEditModal(null)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={handleUpdate} disabled={updating || !editForm.goalAmount} className="btn-primary flex-1">
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
