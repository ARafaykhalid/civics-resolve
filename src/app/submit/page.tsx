"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { createComplaint } from "@/actions/complaints";
import ImageUpload from "@/components/ImageUpload";
import AuthModal from "@/components/AuthModal";
import Dropdown from "@/components/Dropdown";
import { Send, MapPin, Loader2, AlertCircle, EyeOff, Camera, Map, Shield, HelpCircle } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const categories = ["Road", "Water", "Electricity", "Garbage", "Safety", "Other"];
const categoryOptions = categories.map((cat) => ({ label: cat, value: cat }));

export default function SubmitPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const container = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [authModal, setAuthModal] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", category: "", address: "",
    lat: "", lng: "", images: [] as string[], isAnonymous: false,
  });

  useGSAP(() => {
    const tl = gsap.timeline();
    tl.fromTo(".split-left", { x: -50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: "power3.out" })
      .fromTo(".split-right", { x: 50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, "-=0.6")
      .fromTo(".form-element", { y: 20, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.05, duration: 0.5, ease: "power2.out" }, "-=0.4");
  }, { scope: container });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      setAuthModal(true);
      return;
    }
    
    if (!form.category) {
      setError("Please select a category.");
      return;
    }

    setError("");
    setLoading(true);
    try {
      const result = await createComplaint({
        title: form.title, description: form.description, category: form.category,
        location: { address: form.address, lat: form.lat ? parseFloat(form.lat) : undefined, lng: form.lng ? parseFloat(form.lng) : undefined },
        images: form.images, isAnonymous: form.isAnonymous,
      });
      if (result.success && result.data) {
        gsap.to(container.current, { opacity: 0, scale: 0.95, duration: 0.5, onComplete: () => {
          router.push(`/complaints/${result.data.id}?submitted=true`);
        }});
      } else {
        setError(result.error || "Failed to submit");
        setLoading(false);
      }
    } catch { 
      setError("Something went wrong"); 
      setLoading(false);
    }
  };

  const update = (field: string, value: string | boolean | string[]) => setForm((p) => ({ ...p, [field]: value }));

  return (
    <div ref={container} className="min-h-[calc(100vh-4rem)] flex relative overflow-hidden bg-slate-950">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none z-0" />
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none z-0" />

      <div className="max-w-7xl mx-auto w-full flex flex-col lg:flex-row relative z-10">
        {/* Left Side: Information & Branding */}
        <div className="split-left lg:w-5/12 p-8 lg:p-16 flex flex-col justify-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-400 ring-1 ring-inset ring-indigo-500/20 mb-8 self-start w-max">
            <Shield className="h-4 w-4" /> Civic Duty
          </div>
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">
            See something?<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Report it.</span>
          </h1>
          <p className="text-lg text-slate-400 mb-12">Your voice matters. By reporting civic issues, you initiate the first step towards a better, safer, and cleaner community. Authorities and volunteers are standing by.</p>
          
          <div className="space-y-8">
            {[
              { icon: Camera, title: "Provide Evidence", desc: "Clear photos help authorities understand the severity of the issue immediately." },
              { icon: Map, title: "Pinpoint Location", desc: "Accurate addresses and coordinates ensure quick dispatch of repair teams." },
              { icon: HelpCircle, title: "Be Descriptive", desc: "The more details you provide, the faster we can verify and resolve the problem." }
            ].map((item, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center shrink-0 shadow-lg">
                  <item.icon className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-1">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: The Form */}
        <div className="split-right lg:w-7/12 p-4 lg:p-12 flex items-center justify-center">
          <div className="w-full max-w-2xl glass-card p-6 sm:p-10 rounded-3xl shadow-2xl border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] -translate-y-1/2 translate-x-1/2" />
            
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              {error && <div className="form-element flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400 font-medium"><AlertCircle className="h-5 w-5 shrink-0" />{error}</div>}

              <div className="form-element">
                <label htmlFor="title" className="label-text">Issue Title *</label>
                <input id="title" type="text" value={form.title} onChange={(e) => update("title", e.target.value)} className="input-field bg-slate-950/50" placeholder="e.g., Large pothole on Main Street" required minLength={5} maxLength={100} />
              </div>

              <div className="form-element">
                <label htmlFor="category" className="label-text">Category *</label>
                <Dropdown
                  id="category"
                  value={form.category}
                  onChange={(val) => update("category", val)}
                  options={categoryOptions}
                  placeholder="Select a category"
                />
              </div>

              <div className="form-element">
                <label htmlFor="description" className="label-text">Description *</label>
                <textarea id="description" value={form.description} onChange={(e) => update("description", e.target.value)} className="input-field bg-slate-950/50 min-h-[120px] resize-y" placeholder="Describe the issue in detail. What is it? When did you notice it?" required minLength={20} maxLength={2000} />
                <p className="mt-1.5 text-xs text-slate-500 font-medium flex justify-end">{form.description.length}/2000</p>
              </div>

              <div className="form-element">
                <label className="label-text flex items-center gap-1.5"><MapPin className="h-4 w-4" /> Location Details *</label>
                <input type="text" value={form.address} onChange={(e) => update("address", e.target.value)} className="input-field bg-slate-950/50" placeholder="Street address or landmark" required minLength={5} />
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div><input type="number" step="any" value={form.lat} onChange={(e) => update("lat", e.target.value)} className="input-field bg-slate-950/50 text-sm py-2" placeholder="Latitude (optional)" /></div>
                  <div><input type="number" step="any" value={form.lng} onChange={(e) => update("lng", e.target.value)} className="input-field bg-slate-950/50 text-sm py-2" placeholder="Longitude (optional)" /></div>
                </div>
              </div>

              <div className="form-element">
                <label className="label-text flex justify-between items-end">
                  <span>Photographic Evidence</span>
                  <span className="text-xs text-slate-500 font-normal">Max 5 images</span>
                </label>
                <ImageUpload images={form.images} onChange={(imgs) => update("images", imgs)} maxFiles={5} />
              </div>

              <div className="form-element pt-2">
                <label className="flex items-start gap-3 rounded-xl bg-slate-900/50 p-4 cursor-pointer border border-white/5 hover:border-white/10 transition-colors group">
                  <div className="mt-0.5">
                    <input type="checkbox" checked={form.isAnonymous} onChange={(e) => update("isAnonymous", e.target.checked)} className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-slate-900" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <EyeOff className="h-4 w-4 text-slate-400 group-hover:text-indigo-400 transition-colors" />
                      <p className="text-sm font-bold text-slate-200">Submit Anonymously</p>
                    </div>
                    <p className="text-xs text-slate-400">Your personal details will be hidden from the public timeline, though authorities can still follow up internally.</p>
                  </div>
                </label>
              </div>

              <div className="form-element pt-4">
                <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-lg font-bold shadow-indigo-500/30">
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Send className="h-6 w-6" />}
                  {loading ? "Submitting Report..." : "Submit Report Now"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <AuthModal isOpen={authModal} onClose={() => setAuthModal(false)} message="You need to sign in to submit a report and track its progress." />
    </div>
  );
}
