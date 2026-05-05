"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { joinVolunteer, leaveVolunteer } from "@/actions/community";
import { addComment, deleteComment } from "@/actions/complaints";
import Link from "next/link";
import {
  ChevronLeft, MapPin, Calendar, Users, Loader2, Send, MessageSquare,
  Share2, HandHelping, Mail, Phone, Trash2, LogOut,
} from "lucide-react";
import { formatDate, formatDateTime, cn } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function VolunteerDetailClient({ opportunity, initialComments }: { opportunity: any; initialComments: any[] }) {
  const { data: session } = useSession();
  const v = opportunity;

  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const hasJoined = session?.user?.id ? v.volunteers?.some((vol: any) => vol.userId === session.user?.id) : false;
  const [enrolled, setEnrolled] = useState(hasJoined);
  const [spots, setSpots] = useState({ filled: v.spotsFilled, total: v.spotsTotal });

  const [comments, setComments] = useState(initialComments);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const isFull = spots.filled >= spots.total;

  const handleJoin = async () => {
    if (!session?.user) return;
    setJoining(true);
    const result = await joinVolunteer(v._id);
    if (result.success) {
      setEnrolled(true);
      setSpots((p) => ({ ...p, filled: p.filled + 1 }));
    }
    setJoining(false);
  };

  const handleLeave = async () => {
    if (!session?.user) return;
    setLeaving(true);
    const result = await leaveVolunteer(v._id);
    if (result.success) {
      setEnrolled(false);
      setSpots((p) => ({ ...p, filled: Math.max(0, p.filled - 1) }));
    }
    setLeaving(false);
  };

  const handleComment = async () => {
    if (!session?.user || !commentText.trim()) return;
    setCommentLoading(true);
    const result = await addComment({ targetType: "campaign", targetId: v._id, content: commentText });
    if (result.success && result.data) {
      setComments((prev) => [{ ...result.data, userId: session.user?.id }, ...prev]);
      setCommentText("");
    }
    setCommentLoading(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    const result = await deleteComment(commentId);
    if (result.success) setComments((prev) => prev.filter((c: any) => c._id !== commentId));
  };

  const progress = Math.min((spots.filled / spots.total) * 100, 100);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
      <Link href="/volunteer" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-6">
        <ChevronLeft className="h-4 w-4" /> Back to Opportunities
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Images */}
          {v.images && v.images.length > 0 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {v.images.map((img: string, i: number) => (
                <div key={i} className="overflow-hidden rounded-2xl border border-white/5 shrink-0">
                  <img src={img} alt={`${v.title} ${i + 1}`} className="h-56 w-80 object-cover" />
                </div>
              ))}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="rounded-full bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-400 border border-teal-500/20">{v.category}</span>
              {!v.isActive && <span className="rounded-full bg-slate-700 px-3 py-1 text-xs font-medium text-slate-400">Closed</span>}
              {isFull && <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-semibold text-red-400">Full</span>}
            </div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">{v.title}</h1>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" />{formatDate(v.date)}</span>
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{v.location}</span>
              <span className="flex items-center gap-1.5"><Users className="h-4 w-4" />{spots.filled}/{spots.total} volunteers</span>
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-3">About this Opportunity</h2>
            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{v.description}</p>
          </div>

          {/* Progress */}
          <div className="glass-card p-6">
            <div className="flex items-end justify-between mb-2">
              <span className="text-sm font-semibold text-teal-400">{spots.filled} joined</span>
              <span className="text-xs text-slate-500">{spots.total} spots total</span>
            </div>
            <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* Comments */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-indigo-400" /> Discussion ({comments.length})
            </h2>
            <div className="flex gap-3 mb-6">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-1">
                {session?.user?.name?.charAt(0).toUpperCase() || "?"}
              </div>
              <div className="flex-1">
                <textarea value={commentText} onChange={(e) => setCommentText(e.target.value)}
                  placeholder={session?.user ? "Add a comment..." : "Sign in to comment..."}
                  className="input-field min-h-[60px] text-sm" maxLength={1000} disabled={!session?.user} />
                <div className="flex justify-end mt-2">
                  <button onClick={handleComment} disabled={commentLoading || !commentText.trim()} className="btn-primary text-xs py-1.5 px-3">
                    {commentLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />} Post
                  </button>
                </div>
              </div>
            </div>
            {comments.length > 0 ? (
              <div className="space-y-4 border-t border-white/5 pt-4">
                {comments.map((c: any) => (
                  <div key={c._id} className="flex gap-3 group">
                    <div className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 shrink-0 mt-0.5">
                      {c.userName?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{c.userName}</span>
                        <span className="text-[11px] text-slate-600">{formatDate(c.createdAt)}</span>
                        {(c.userId === session?.user?.id || (session?.user as any)?.role === "admin") && (
                          <button onClick={() => handleDeleteComment(c._id)} className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-slate-400 mt-0.5 break-words">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-600 text-center py-4">No comments yet.</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="glass-card p-6 space-y-3">
            {enrolled ? (
              <>
                <div className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500/20 py-3 text-sm font-medium text-emerald-400">
                  <HandHelping className="h-4 w-4" /> You&apos;re Enrolled!
                </div>
                <button onClick={handleLeave} disabled={leaving}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-500/10 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors">
                  {leaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                  Unenroll
                </button>
              </>
            ) : (
              <button onClick={handleJoin} disabled={joining || isFull || !v.isActive}
                className="w-full btn-primary py-3 text-sm flex items-center justify-center gap-2">
                {joining ? <Loader2 className="h-4 w-4 animate-spin" /> : <HandHelping className="h-4 w-4" />}
                {isFull ? "Full" : !v.isActive ? "Closed" : "Volunteer Now"}
              </button>
            )}
            <button onClick={() => navigator.clipboard.writeText(window.location.href)}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-800 py-2.5 text-sm text-slate-400 hover:text-white transition-colors">
              <Share2 className="h-4 w-4" /> Share
            </button>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Contact</h3>
            <div className="space-y-2 text-sm">
              {v.contactEmail && (
                <a href={`mailto:${v.contactEmail}`} className="flex items-center gap-2 text-slate-300 hover:text-indigo-400 transition-colors">
                  <Mail className="h-4 w-4" /> {v.contactEmail}
                </a>
              )}
              {v.contactPhone && (
                <a href={`tel:${v.contactPhone}`} className="flex items-center gap-2 text-slate-300 hover:text-indigo-400 transition-colors">
                  <Phone className="h-4 w-4" /> {v.contactPhone}
                </a>
              )}
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Details</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-slate-500">Category</dt><dd className="text-slate-300">{v.category}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Date</dt><dd className="text-slate-300">{formatDateTime(v.date)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Spots</dt><dd className="text-slate-300">{spots.filled}/{spots.total}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-500">Status</dt><dd className={cn("font-medium", v.isActive ? "text-emerald-400" : "text-slate-500")}>{v.isActive ? "Active" : "Closed"}</dd></div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
