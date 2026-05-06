"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { HandHelping, MapPin, Calendar, Users, Loader2, ExternalLink } from "lucide-react";
import { joinVolunteer } from "@/actions/community";
import { formatDate } from "@/lib/utils";
import AuthModal from "@/components/AuthModal";
import Link from "next/link";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function VolunteerListClient({ opportunities }: { opportunities: any[] }) {
  const { data: session } = useSession();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [authModal, setAuthModal] = useState(false);
  const [selectedOpp, setSelectedOpp] = useState<any>(null);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleJoinClick = (opp: any) => {
    if (!session?.user) {
      setAuthModal(true);
      return;
    }
    setError("");
    setSuccess("");
    if (opp.customFields && opp.customFields.length > 0) {
      setSelectedOpp(opp);
      setResponses({});
    } else {
      executeJoin(opp._id, {});
    }
  };

  const executeJoin = async (id: string, formResponses: Record<string, any>) => {
    setLoadingId(id);
    setError("");
    const result = await joinVolunteer(id, formResponses);
    if (result.success) {
      setSuccess("Successfully joined!");
      setTimeout(() => setSuccess(""), 3000);
      setSelectedOpp(null);
    } else {
      setError(result.error || "Failed to join");
    }
    setLoadingId(null);
  };

  if (opportunities.length === 0) {
    return (
      <div className="glass-card p-16 text-center">
        <HandHelping className="mx-auto h-12 w-12 text-slate-600" />
        <h3 className="mt-4 text-lg font-semibold text-slate-300">No opportunities available</h3>
        <p className="mt-1 text-sm text-slate-500">Check back later for volunteer opportunities.</p>
      </div>
    );
  }

  return (
    <>
      {error && <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
      {success && <div className="mb-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">{success}</div>}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {opportunities.map((v) => {
          const spotsLeft = v.spotsTotal - v.spotsFilled;
          const isFull = spotsLeft <= 0;
          const hasJoined = session?.user?.id && v.volunteers?.some((vol: any) => 
            vol === session.user.id || vol.userId === session.user.id
          );

          return (
            <div key={v._id} className="glass-card overflow-hidden transition-all duration-300 hover:border-indigo-500/30 hover:-translate-y-1">
              {v.images && v.images.length > 0 && (
                <div className="h-36 overflow-hidden">
                  <img src={v.images[0]} alt={v.title} className="h-full w-full object-cover" />
                </div>
              )}
              <div className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="rounded-full bg-teal-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-teal-400 border border-teal-500/20">{v.category}</span>
                {spotsLeft <= 3 && spotsLeft > 0 && <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-400">{spotsLeft} spots left!</span>}
                {isFull && <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-red-400">Full</span>}
                {!v.isActive && <span className="rounded-full bg-slate-700 px-2 py-0.5 text-[10px] font-medium text-slate-400">Past</span>}
              </div>
              <h3 className="text-lg font-semibold text-white">{v.title}</h3>
              <p className="mt-2 text-sm text-slate-400 line-clamp-3">{v.description}</p>
              <div className="mt-4 space-y-2 text-xs text-slate-500">
                <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{v.location}</div>
                <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{formatDate(v.date)}</div>
                <div className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{v.spotsFilled}/{v.spotsTotal} volunteers joined</div>
              </div>
              <div className="mt-4 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400" style={{ width: `${Math.min((v.spotsFilled / v.spotsTotal) * 100, 100)}%` }} />
              </div>
              
              <button 
                onClick={() => handleJoinClick(v)} 
                disabled={isFull || hasJoined || loadingId === v._id || !v.isActive}
                className="btn-primary w-full mt-4 text-sm py-2.5 flex items-center justify-center gap-2"
              >
                {loadingId === v._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <HandHelping className="h-4 w-4" />}
                {hasJoined ? "You've Joined" : isFull ? "Full" : !v.isActive ? "Closed" : "Volunteer Now"}
              </button>
              <Link href={`/volunteer/${v._id}`} className="flex items-center justify-center gap-1.5 w-full mt-2 text-xs text-slate-400 hover:text-indigo-400 transition-colors py-1.5">
                <ExternalLink className="h-3 w-3" /> View Details
              </Link>
              </div>
            </div>
          );
        })}
      </div>
      
      {selectedOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md glass-card p-6">
            <h3 className="text-xl font-bold text-white mb-2">Join {selectedOpp.title}</h3>
            <p className="text-sm text-slate-400 mb-6">Please provide the following information to complete your registration.</p>
            
            <form onSubmit={(e) => { e.preventDefault(); executeJoin(selectedOpp._id, responses); }} className="space-y-4">
              {selectedOpp.customFields.map((field: any) => (
                <div key={field.id}>
                  <label className="label-text">{field.label} {field.required && "*"}</label>
                  {field.type === "textarea" ? (
                    <textarea
                      required={field.required}
                      value={responses[field.id] || ""}
                      onChange={(e) => setResponses({ ...responses, [field.id]: e.target.value })}
                      className="input-field min-h-[80px]"
                    />
                  ) : field.type === "checkbox" ? (
                    <label className="flex items-center gap-2 mt-2 cursor-pointer">
                      <input
                        type="checkbox"
                        required={field.required}
                        checked={responses[field.id] || false}
                        onChange={(e) => setResponses({ ...responses, [field.id]: e.target.checked })}
                        className="rounded border-slate-600 text-indigo-500"
                      />
                      <span className="text-sm text-slate-300">Yes, I confirm</span>
                    </label>
                  ) : (
                    <input
                      type={field.type}
                      required={field.required}
                      value={responses[field.id] || ""}
                      onChange={(e) => setResponses({ ...responses, [field.id]: e.target.value })}
                      className="input-field"
                    />
                  )}
                </div>
              ))}
              
              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setSelectedOpp(null)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={loadingId === selectedOpp._id} className="btn-primary flex-1">
                  {loadingId === selectedOpp._id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AuthModal isOpen={authModal} onClose={() => setAuthModal(false)} message="You need to sign in to volunteer for this opportunity." />
    </>
  );
}
