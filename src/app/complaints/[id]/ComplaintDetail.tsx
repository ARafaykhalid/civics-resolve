"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { toggleUpvoteComplaint } from "@/actions/complaints";
import StatusTimeline from "@/components/StatusTimeline";
import { ThumbsUp, MapPin, Calendar, User, Building2, ChevronLeft, Share2, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { cn, getStatusColor, getPriorityColor, formatDate, formatDateTime } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ComplaintDetail({ complaint }: { complaint: any }) {
  const { data: session } = useSession();
  const [upvotes, setUpvotes] = useState(complaint.upvotes);
  
  // Initialize hasVoted by checking if current user's ID is in upvotedBy array
  const initialHasVoted = session?.user?.id ? complaint.upvotedBy?.includes(session.user.id) : false;
  const [hasVoted, setHasVoted] = useState(initialHasVoted);
  
  const [voting, setVoting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [authModal, setAuthModal] = useState(false);

  const handleUpvote = async () => {
    if (!session?.user) {
      setAuthModal(true);
      return;
    }
    if (voting) return;
    setVoting(true);
    const result = await toggleUpvoteComplaint(complaint._id);
    if (result.success && result.data) {
      setUpvotes(result.data.upvotes);
      setHasVoted(result.data.hasVoted);
    }
    setVoting(false);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
      <Link href="/complaints" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-6">
        <ChevronLeft className="h-4 w-4" /> Back to Issues
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className={cn("rounded-full border px-3 py-1 text-xs font-semibold", getStatusColor(complaint.status))}>{complaint.status}</span>
              <span className={cn("rounded-full border px-3 py-1 text-xs font-semibold", getPriorityColor(complaint.priority))}>{complaint.priority} Priority</span>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-400">{complaint.category}</span>
            </div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">{complaint.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{complaint.location.address}</span>
              <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{formatDate(complaint.createdAt)}</span>
              <span className="flex items-center gap-1.5"><User className="h-4 w-4" />{complaint.isAnonymous ? "Anonymous" : complaint.createdBy?.name || "Unknown"}</span>
            </div>
          </div>

          {/* Images */}
          {complaint.images?.length > 0 && (
            <div className="space-y-3">
              <div className="overflow-hidden rounded-2xl border border-white/5">
                <img src={selectedImage || complaint.images[0]} alt={complaint.title} className="w-full max-h-[400px] object-cover" />
              </div>
              {complaint.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {complaint.images.map((img: string, i: number) => (
                    <button key={i} onClick={() => setSelectedImage(img)}
                      className={cn("h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                        (selectedImage || complaint.images[0]) === img ? "border-indigo-500" : "border-white/5 hover:border-white/20"
                      )}>
                      <img src={img} alt={`Photo ${i + 1}`} className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-3">Description</h2>
            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{complaint.description}</p>
          </div>

          {/* Timeline */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Status Timeline</h2>
            <StatusTimeline timeline={complaint.timeline} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <button onClick={handleUpvote} disabled={hasVoted || voting}
                className={cn("flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-all",
                  hasVoted ? "bg-indigo-500/20 text-indigo-400" : "bg-slate-800 text-slate-300 hover:bg-indigo-500/10 hover:text-indigo-400"
                )}>
                {voting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsUp className="h-4 w-4" />}
                {upvotes} Upvotes
              </button>
              <button onClick={() => navigator.clipboard.writeText(window.location.href)}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {complaint.assignedTo && (
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Assigned To</h3>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10">
                  <Building2 className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{complaint.assignedTo.name}</p>
                  {complaint.assignedTo.organization && <p className="text-xs text-slate-500">{complaint.assignedTo.organization}</p>}
                </div>
              </div>
            </div>
          )}

          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Details</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">ID</dt><dd className="text-slate-300 font-mono text-xs">{complaint._id.slice(-8)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Created</dt><dd className="text-slate-300">{formatDateTime(complaint.createdAt)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Updated</dt><dd className="text-slate-300">{formatDateTime(complaint.updatedAt)}</dd></div>
              {complaint.location?.lat && complaint.location?.lng && (
                <div className="flex justify-between"><dt className="text-slate-500">Coords</dt><dd className="text-slate-300 text-xs">{complaint.location.lat.toFixed(4)}, {complaint.location.lng.toFixed(4)}</dd></div>
              )}
            </dl>
          </div>
        </div>
      </div>

      {authModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setAuthModal(false)}>
          <div className="w-full max-w-sm glass-card p-6 m-4 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10 mb-4">
              <AlertCircle className="h-6 w-6 text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Authentication Required</h3>
            <p className="text-sm text-slate-400 mb-6">You need to sign in to upvote issues or submit reports.</p>
            <div className="flex gap-3">
              <button onClick={() => setAuthModal(false)} className="btn-secondary flex-1">Cancel</button>
              <Link href="/login" className="btn-primary flex-1">Sign In</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
