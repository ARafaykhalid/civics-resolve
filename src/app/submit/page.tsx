"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createComplaint } from "@/actions/complaints";
import ImageUpload from "@/components/ImageUpload";
import { Send, MapPin, Loader2, AlertCircle, EyeOff } from "lucide-react";

const categories = ["Road", "Water", "Electricity", "Garbage", "Safety", "Other"];

export default function SubmitPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "", description: "", category: "", address: "",
    lat: "", lng: "", images: [] as string[], isAnonymous: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await createComplaint({
        title: form.title, description: form.description, category: form.category,
        location: { address: form.address, lat: form.lat ? parseFloat(form.lat) : undefined, lng: form.lng ? parseFloat(form.lng) : undefined },
        images: form.images, isAnonymous: form.isAnonymous,
      });
      if (result.success && result.data) {
        router.push(`/complaints/${result.data.id}?submitted=true`);
      } else {
        setError(result.error || "Failed to submit");
      }
    } catch { setError("Something went wrong"); }
    finally { setLoading(false); }
  };

  const update = (field: string, value: string | boolean | string[]) => setForm((p) => ({ ...p, [field]: value }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Report an Issue</h1>
        <p className="mt-2 text-slate-400">Help your community by reporting civic issues to the relevant authorities.</p>
      </div>
      <div className="glass-card p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}

          <div>
            <label htmlFor="title" className="label-text">Issue Title *</label>
            <input id="title" type="text" value={form.title} onChange={(e) => update("title", e.target.value)} className="input-field" placeholder="e.g., Large pothole on Main Street" required minLength={5} maxLength={100} />
          </div>

          <div>
            <label htmlFor="category" className="label-text">Category *</label>
            <select id="category" value={form.category} onChange={(e) => update("category", e.target.value)} className="select-field" required>
              <option value="">Select a category</option>
              {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div>
            <label htmlFor="description" className="label-text">Description *</label>
            <textarea id="description" value={form.description} onChange={(e) => update("description", e.target.value)} className="input-field min-h-[120px] resize-y" placeholder="Describe the issue in detail..." required minLength={20} maxLength={2000} />
            <p className="mt-1 text-xs text-slate-600">{form.description.length}/2000</p>
          </div>

          <div>
            <label className="label-text flex items-center gap-1.5"><MapPin className="h-4 w-4" /> Location *</label>
            <input type="text" value={form.address} onChange={(e) => update("address", e.target.value)} className="input-field" placeholder="Street address or landmark" required minLength={5} />
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div><label className="text-xs text-slate-500">Latitude (optional)</label><input type="number" step="any" value={form.lat} onChange={(e) => update("lat", e.target.value)} className="input-field" placeholder="e.g., 28.6139" /></div>
              <div><label className="text-xs text-slate-500">Longitude (optional)</label><input type="number" step="any" value={form.lng} onChange={(e) => update("lng", e.target.value)} className="input-field" placeholder="e.g., 77.2090" /></div>
            </div>
          </div>

          <div>
            <label className="label-text">Photos (optional)</label>
            <ImageUpload images={form.images} onChange={(imgs) => update("images", imgs)} maxFiles={5} />
          </div>

          <label className="flex items-center gap-3 rounded-xl bg-slate-800/50 p-4 cursor-pointer border border-white/5 hover:border-white/10 transition-colors">
            <input type="checkbox" checked={form.isAnonymous} onChange={(e) => update("isAnonymous", e.target.checked)} className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500" />
            <div className="flex items-center gap-2">
              <EyeOff className="h-4 w-4 text-slate-400" />
              <div><p className="text-sm font-medium text-slate-300">Submit Anonymously</p><p className="text-xs text-slate-500">Your identity will not be shown publicly</p></div>
            </div>
          </label>

          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-base">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
            {loading ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      </div>
    </div>
  );
}
