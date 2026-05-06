"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  toggleUpvoteComplaint,
  addComment,
  deleteComment,
  submitFeedback,
} from "@/actions/complaints";
import StatusTimeline from "@/components/StatusTimeline";
import ShareModal from "@/components/ShareModal";
import {
  ThumbsUp,
  MapPin,
  Calendar,
  User,
  Building2,
  ChevronLeft,
  Share2,
  Loader2,
  AlertCircle,
  MessageSquare,
  Send,
  Star,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import {
  cn,
  getStatusColor,
  getPriorityColor,
  formatDate,
  formatDateTime,
} from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ComplaintDetail({
  complaint,
  initialComments,
}: {
  complaint: any;
  initialComments: any[];
}) {
  const { data: session } = useSession();
  const [upvotes, setUpvotes] = useState(complaint.upvotes);

  // Initialize hasVoted by checking if current user's ID is in upvotedBy array
  const initialHasVoted = session?.user?.id
    ? complaint.upvotedBy?.includes(session.user.id)
    : false;
  const [hasVoted, setHasVoted] = useState(initialHasVoted);

  const [voting, setVoting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [authModal, setAuthModal] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Comments state
  const [comments, setComments] = useState(initialComments || []);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  // Feedback state
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackHover, setFeedbackHover] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(
    !!complaint.feedback?.rating,
  );
  const [feedbackError, setFeedbackError] = useState("");

  const isCreator = session?.user?.id === complaint.createdBy?._id;
  const isResolved = complaint.status === "Resolved";

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

  const handleComment = async () => {
    if (!session?.user) {
      setAuthModal(true);
      return;
    }
    if (!commentText.trim()) return;
    setCommentLoading(true);
    const result = await addComment({
      targetType: "complaint",
      targetId: complaint._id,
      content: commentText,
    });
    if (result.success && result.data) {
      setComments((prev) => [result.data, ...prev]);
      setCommentText("");
    }
    setCommentLoading(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    const result = await deleteComment(commentId);
    if (result.success) {
      setComments((prev) => prev.filter((c: any) => c._id !== commentId));
    }
  };

  const handleFeedback = async () => {
    if (feedbackRating === 0) {
      setFeedbackError("Please select a rating");
      return;
    }
    setFeedbackError("");
    setFeedbackLoading(true);
    const result = await submitFeedback({
      complaintId: complaint._id,
      rating: feedbackRating,
      comment: feedbackComment,
    });
    if (result.success) {
      setFeedbackSubmitted(true);
    } else {
      setFeedbackError(result.error || "Failed to submit feedback");
    }
    setFeedbackLoading(false);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
      <Link
        href="/complaints"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-6">
        <ChevronLeft className="h-4 w-4" /> Back to Issues
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-semibold",
                  getStatusColor(complaint.status),
                )}>
                {complaint.status}
              </span>
              <span
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-semibold",
                  getPriorityColor(complaint.priority),
                )}>
                {complaint.priority} Priority
              </span>
              <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-slate-400">
                {complaint.category}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              {complaint.title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {complaint.location.address}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formatDate(complaint.createdAt)}
              </span>
              <span className="flex items-center gap-1.5">
                <User className="h-4 w-4" />
                {complaint.isAnonymous
                  ? "Anonymous"
                  : complaint.createdBy?.name || "Unknown"}
              </span>
            </div>
          </div>

          {/* Images */}
          {complaint.images?.length > 0 && (
            <div className="space-y-3">
              <div className="overflow-hidden rounded-2xl border border-white/5">
                <img
                  src={selectedImage || complaint.images[0]}
                  alt={complaint.title}
                  className="w-full max-h-[400px] object-cover"
                />
              </div>
              {complaint.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {complaint.images.map((img: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImage(img)}
                      className={cn(
                        "h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                        (selectedImage || complaint.images[0]) === img
                          ? "border-indigo-500"
                          : "border-white/5 hover:border-white/20",
                      )}>
                      <img
                        src={img}
                        alt={`Photo ${i + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-3">
              Description
            </h2>
            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
              {complaint.description}
            </p>
          </div>

          {/* Timeline */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Status Timeline
            </h2>
            <StatusTimeline timeline={complaint.timeline} complaintId={complaint._id} />
          </div>

          {/* Feedback Section — Creator Only */}
          {isResolved && (
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-400" /> Resolution Feedback
              </h2>

              {complaint.feedback?.rating || feedbackSubmitted ? (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "h-5 w-5",
                          star <=
                            (complaint.feedback?.rating || feedbackRating)
                            ? "text-amber-400 fill-amber-400"
                            : "text-slate-600",
                        )}
                      />
                    ))}
                    <span className="ml-2 text-sm text-slate-400">
                      {complaint.feedback?.rating || feedbackRating}/5
                    </span>
                  </div>
                  {(complaint.feedback?.comment || feedbackComment) && (
                    <p className="text-sm text-slate-300 mt-1">
                      &ldquo;
                      {complaint.feedback?.comment || feedbackComment}
                      &rdquo;
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-2">
                    — Feedback from the reporter
                  </p>
                </div>
              ) : isCreator ? (
                <div className="space-y-4">
                  <p className="text-sm text-slate-400">
                    How satisfied are you with the resolution?
                  </p>
                  {feedbackError && (
                    <p className="text-sm text-red-400">{feedbackError}</p>
                  )}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackRating(star)}
                        onMouseEnter={() => setFeedbackHover(star)}
                        onMouseLeave={() => setFeedbackHover(0)}>
                        <Star
                          className={cn(
                            "h-7 w-7 transition-all cursor-pointer",
                            star <= (feedbackHover || feedbackRating)
                              ? "text-amber-400 fill-amber-400 scale-110"
                              : "text-slate-600 hover:text-slate-400",
                          )}
                        />
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder="Share your thoughts on the resolution (optional)..."
                    className="input-field min-h-[80px]"
                    maxLength={500}
                  />
                  <button
                    onClick={handleFeedback}
                    disabled={feedbackLoading}
                    className="btn-primary text-sm">
                    {feedbackLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Submit Feedback"
                    )}
                  </button>
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">
                  No feedback submitted yet.
                </p>
              )}
            </div>
          )}

          {/* Comments Section */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-indigo-400" />
              Discussion ({comments.length})
            </h2>

            {/* Comment Input */}
            <div className="flex gap-3 mb-6">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-1">
                {session?.user?.name?.charAt(0).toUpperCase() || "?"}
              </div>
              <div className="flex-1">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={
                    session?.user
                      ? "Add a comment..."
                      : "Sign in to comment..."
                  }
                  className="input-field min-h-[60px] text-sm"
                  maxLength={1000}
                  disabled={!session?.user}
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-slate-600">
                    {commentText.length}/1000
                  </span>
                  <button
                    onClick={handleComment}
                    disabled={commentLoading || !commentText.trim()}
                    className="btn-primary text-xs py-1.5 px-3">
                    {commentLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                    Post
                  </button>
                </div>
              </div>
            </div>

            {/* Comments List */}
            {comments.length > 0 ? (
              <div className="space-y-4 border-t border-white/5 pt-4">
                {comments.map((c: any) => (
                  <div key={c._id} className="flex gap-3 group">
                    <div className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 shrink-0 mt-0.5">
                      {c.userName?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">
                          {c.userName}
                        </span>
                        <span className="text-[11px] text-slate-600">
                          {formatDate(c.createdAt)}
                        </span>
                        {(c.userId === session?.user?.id || (session?.user as any)?.role === "admin") && (
                          <button
                            onClick={() => handleDeleteComment(c._id)}
                            className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all"
                            title="Delete comment">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-slate-400 mt-0.5 break-words">
                        {c.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-600 text-center py-4">
                No comments yet. Be the first to discuss this issue.
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleUpvote}
                disabled={hasVoted || voting}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-all",
                  hasVoted
                    ? "bg-indigo-500/20 text-indigo-400"
                    : "bg-slate-800 text-slate-300 hover:bg-indigo-500/10 hover:text-indigo-400",
                )}>
                {voting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ThumbsUp className="h-4 w-4" />
                )}
                {upvotes} Upvotes
              </button>
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          {complaint.assignedTo && (
            <div className="glass-card p-6">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Assigned To
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10">
                  <Building2 className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    {complaint.assignedTo.name}
                  </p>
                  {complaint.assignedTo.organization && (
                    <p className="text-xs text-slate-500">
                      {complaint.assignedTo.organization}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Details
            </h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">ID</dt>
                <dd className="text-slate-300 font-mono text-xs">
                  {complaint._id.slice(-8)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Created</dt>
                <dd className="text-slate-300">
                  {formatDateTime(complaint.createdAt)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Updated</dt>
                <dd className="text-slate-300">
                  {formatDateTime(complaint.updatedAt)}
                </dd>
              </div>
              {complaint.location?.lat && complaint.location?.lng && (
                <div className="flex justify-between">
                  <dt className="text-slate-500">Coords</dt>
                  <dd className="text-slate-300 text-xs">
                    {complaint.location.lat.toFixed(4)},{" "}
                    {complaint.location.lng.toFixed(4)}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>

      {authModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => setAuthModal(false)}>
          <div
            className="w-full max-w-sm glass-card p-6 m-4 text-center"
            onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10 mb-4">
              <AlertCircle className="h-6 w-6 text-indigo-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Authentication Required
            </h3>
            <p className="text-sm text-slate-400 mb-6">
              You need to sign in to interact with this issue.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setAuthModal(false)}
                className="btn-secondary flex-1">
                Cancel
              </button>
              <Link href="/login" className="btn-primary flex-1">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      )}
      <ShareModal 
        isOpen={isShareModalOpen} 
        onClose={() => setIsShareModalOpen(false)} 
        url={typeof window !== "undefined" ? window.location.href : ""} 
        title={complaint.title} 
      />
    </div>
  );
}
