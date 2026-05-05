"use client";

import { useState } from "react";
import { deleteComment } from "@/actions/complaints";
import { MessageSquare, Star, Trash2, ExternalLink, AlertCircle } from "lucide-react";
import Link from "next/link";
import { formatDate, cn } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function CommentsManagement({ comments, feedback }: { comments: any[]; feedback: any[] }) {
  const [tab, setTab] = useState<"comments" | "feedback">("comments");
  const [commentList, setCommentList] = useState(comments);

  const handleDelete = async (commentId: string) => {
    if (!confirm("Delete this comment?")) return;
    const result = await deleteComment(commentId);
    if (result.success) {
      setCommentList((prev) => prev.filter((c) => c._id !== commentId));
    }
  };

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Comments & Feedback</h1>
        <p className="text-sm text-slate-400 mt-1">Manage user comments and review resolution feedback.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl bg-slate-800/50 p-1 mb-6 w-fit">
        <button
          onClick={() => setTab("comments")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
            tab === "comments" ? "bg-indigo-500/20 text-indigo-400" : "text-slate-400 hover:text-white"
          )}>
          <MessageSquare className="h-4 w-4" /> Comments ({commentList.length})
        </button>
        <button
          onClick={() => setTab("feedback")}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all",
            tab === "feedback" ? "bg-amber-500/20 text-amber-400" : "text-slate-400 hover:text-white"
          )}>
          <Star className="h-4 w-4" /> Feedback ({feedback.length})
        </button>
      </div>

      {tab === "comments" && (
        <div className="space-y-3">
          {commentList.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <MessageSquare className="mx-auto h-10 w-10 text-slate-600" />
              <h3 className="mt-3 text-lg font-semibold text-slate-300">No comments yet</h3>
            </div>
          ) : (
            commentList.map((c) => (
              <div key={c._id} className="glass-card p-4 flex items-start gap-4 group hover:border-white/10 transition-colors">
                <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
                  {c.userName?.charAt(0).toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-white">{c.userName}</span>
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      c.targetType === "complaint"
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                    )}>
                      {c.targetType === "complaint" ? "Issue" : "Campaign"}
                    </span>
                    <span className="text-[11px] text-slate-600">{formatDate(c.createdAt)}</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-1 break-words">{c.content}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={c.targetType === "complaint" ? `/complaints/${c.targetId}` : `/donate/${c.targetId}`}
                    className="text-slate-600 hover:text-indigo-400 transition-colors"
                    title="View">
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(c._id)}
                    className="text-slate-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    title="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "feedback" && (
        <div className="space-y-3">
          {feedback.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Star className="mx-auto h-10 w-10 text-slate-600" />
              <h3 className="mt-3 text-lg font-semibold text-slate-300">No feedback yet</h3>
              <p className="text-sm text-slate-500 mt-1">Feedback will appear here when users rate resolved complaints.</p>
            </div>
          ) : (
            feedback.map((f) => (
              <div key={f._id} className="glass-card p-4 hover:border-white/10 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Link href={`/complaints/${f.issueId || f._id}`} className="text-sm font-medium text-white hover:text-indigo-400 transition-colors">
                      {f.issueId ? `#${f.issueId} — ` : ""}{f.title}
                    </Link>
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      f.status === "Resolved"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-slate-700 text-slate-400"
                    )}>{f.status}</span>
                  </div>
                  <span className="text-[11px] text-slate-600">{formatDate(f.feedback.createdAt)}</span>
                </div>
                <div className="flex items-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "h-4 w-4",
                        star <= f.feedback.rating ? "text-amber-400 fill-amber-400" : "text-slate-700"
                      )}
                    />
                  ))}
                  <span className="ml-1 text-xs text-slate-500">{f.feedback.rating}/5</span>
                </div>
                {f.feedback.comment && (
                  <p className="text-sm text-slate-400 italic">&ldquo;{f.feedback.comment}&rdquo;</p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
