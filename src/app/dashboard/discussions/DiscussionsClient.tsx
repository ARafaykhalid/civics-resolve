"use client";

import { useState } from "react";
import { MessageSquare, Star, Trash2, ExternalLink, Filter } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { deleteComment } from "@/actions/complaints";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function DiscussionsClient({ initialComments, initialFeedback, currentUser }: { initialComments: any[]; initialFeedback: any[]; currentUser: any }) {
  const [activeTab, setActiveTab] = useState<"comments" | "feedback">("comments");
  const [comments, setComments] = useState(initialComments);

  const isAdmin = currentUser.role === "admin";

  const handleDeleteComment = async (id: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    const res = await deleteComment(id);
    if (res.success) {
      setComments((prev) => prev.filter((c) => c._id !== id));
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Discussions & Feedback</h1>
        <p className="mt-2 text-slate-400">Manage community comments and resolution feedback</p>
      </div>

      <div className="flex space-x-1 rounded-xl bg-slate-900/50 p-1 mb-6 border border-white/5 w-max">
        <button
          onClick={() => setActiveTab("comments")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            activeTab === "comments" ? "bg-indigo-500 text-white shadow-lg" : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}>
          <MessageSquare className="h-4 w-4" /> Comments ({comments.length})
        </button>
        <button
          onClick={() => setActiveTab("feedback")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
            activeTab === "feedback" ? "bg-amber-500 text-white shadow-lg" : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}>
          <Star className="h-4 w-4" /> Feedback ({initialFeedback.length})
        </button>
      </div>

      {activeTab === "comments" && (
        <div className="glass-card overflow-hidden">
          {comments.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No comments found.</div>
          ) : (
            <div className="divide-y divide-white/5">
              {comments.map((comment) => (
                <div key={comment._id} className="p-5 flex gap-4 group hover:bg-white/[0.02] transition-colors">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shrink-0">
                    {comment.userName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{comment.userName}</span>
                        <span className="text-xs text-slate-500">{formatDate(comment.createdAt)}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400 uppercase tracking-wider">
                          {comment.targetType}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/${{ campaign: "donate", complaint: "complaints", event: "events", volunteer: "volunteer" }[comment.targetType as string] || "complaints"}/${comment.targetId}`}
                          className="text-slate-500 hover:text-indigo-400 transition-colors"
                          title="View Context">
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteComment(comment._id)}
                            className="text-slate-500 hover:text-red-400 transition-colors"
                            title="Delete Comment">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-slate-300 break-words">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "feedback" && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {initialFeedback.length === 0 ? (
            <div className="col-span-full glass-card p-8 text-center text-slate-400">No feedback submitted yet.</div>
          ) : (
            initialFeedback.map((fb) => (
              <div key={fb._id} className="glass-card p-5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Star className="h-16 w-16" />
                </div>
                <div className="flex items-center gap-1 mb-3 relative z-10">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${star <= fb.feedback.rating ? "text-amber-400 fill-amber-400" : "text-slate-700"}`}
                    />
                  ))}
                  <span className="ml-2 text-sm font-medium text-slate-300">{fb.feedback.rating}/5</span>
                </div>
                {fb.feedback.comment && (
                  <p className="text-sm text-slate-300 italic mb-4 relative z-10">&ldquo;{fb.feedback.comment}&rdquo;</p>
                )}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
                  <Link href={`/complaints/${fb.issueId || fb._id}`} className="text-sm text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1.5">
                    View Issue #{fb.issueId} <ExternalLink className="h-3 w-3" />
                  </Link>
                  <span className="text-xs text-slate-500">{formatDate(fb.feedback.createdAt)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
