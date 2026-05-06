"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { submitDonationProof } from "@/actions/donations";
import { addComment, deleteComment } from "@/actions/complaints";
import ImageUpload from "@/components/ImageUpload";
import AuthModal from "@/components/AuthModal";
import {
  ChevronLeft,
  Heart,
  QrCode,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function DonateDetailClient({
  campaign,
  initialComments,
}: {
  campaign: any;
  initialComments: any[];
}) {
  const { data: session } = useSession();
  const [donorName, setDonorName] = useState(session?.user?.name || "");
  const [donorEmail, setDonorEmail] = useState(session?.user?.email || "");
  const [amount, setAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [authModal, setAuthModal] = useState(false);

  // Comments state
  const [comments, setComments] = useState(initialComments || []);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const progress =
    campaign.goalAmount > 0
      ? Math.min(
          Math.round((campaign.raisedAmount / campaign.goalAmount) * 100),
          100,
        )
      : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user) {
      setAuthModal(true);
      return;
    }
    setError("");
    setLoading(true);
    try {
      const result = await submitDonationProof({
        campaignId: campaign._id,
        donorName,
        donorEmail,
        amount: parseFloat(amount),
        transactionId,
        screenshotUrl: screenshots[0] || "",
      });
      if (result.success) setSuccess(true);
      else setError(result.error || "Failed to submit");
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleComment = async () => {
    if (!session?.user) {
      setAuthModal(true);
      return;
    }
    if (!commentText.trim()) return;
    setCommentLoading(true);
    const result = await addComment({
      targetType: "campaign",
      targetId: campaign._id,
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

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
      <Link
        href="/donate"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-6">
        <ChevronLeft className="h-4 w-4" /> Back to Campaigns
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Campaign Info */}
        <div className="space-y-6">
          {campaign.images?.length > 0 && (
            <div className="overflow-hidden rounded-2xl border border-white/5">
              <img
                src={campaign.images[0]}
                alt={campaign.title}
                className="w-full max-h-[300px] object-cover"
              />
            </div>
          )}

          <div>
            <span className="rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-400 border border-rose-500/20">
              {campaign.category}
            </span>
            <h1 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
              {campaign.title}
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Posted on {formatDate(campaign.createdAt)}
            </p>
          </div>

          <div className="glass-card p-6">
            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
              {campaign.description}
            </p>
          </div>

          {/* Progress */}
          <div className="glass-card p-6">
            <div className="flex items-end justify-between mb-3">
              <div>
                <p className="text-2xl font-bold text-emerald-400">
                  ₹{campaign.raisedAmount.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500">
                  raised of ₹{campaign.goalAmount.toLocaleString()} goal
                </p>
              </div>
              <span className="text-lg font-semibold text-slate-400">
                {progress}%
              </span>
            </div>
            <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* QR Code */}
          <div className="glass-card p-6 text-center">
            <h3 className="flex items-center justify-center gap-2 text-lg font-semibold text-white mb-4">
              <QrCode className="h-5 w-5 text-indigo-400" /> Scan to Pay
            </h3>
            <div className="inline-block rounded-2xl bg-white p-4">
              <img
                src={campaign.qrCodeImage}
                alt="Payment QR Code"
                className="w-48 h-48 object-contain"
              />
            </div>
            {campaign.upiId && (
              <p className="mt-3 text-sm text-slate-400">
                UPI ID:{" "}
                <span className="text-indigo-400 font-mono">
                  {campaign.upiId}
                </span>
              </p>
            )}
            <p className="mt-2 text-xs text-slate-500">
              Scan, pay any amount, then submit your transaction proof below.
            </p>
          </div>

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
                      ? "Share your thoughts..."
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
                No comments yet. Be the first to share your thoughts.
              </p>
            )}
          </div>
        </div>

        {/* Donation Form */}
        <div className="space-y-6">
          {success ? (
            <div className="glass-card p-8 text-center">
              <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-400" />
              <h3 className="mt-4 text-xl font-semibold text-white">
                Thank You!
              </h3>
              <p className="mt-2 text-slate-400">
                Your donation proof has been submitted. The admin will verify it
                and update the campaign.
              </p>
              <Link href="/donate" className="btn-primary mt-6">
                Back to Campaigns
              </Link>
            </div>
          ) : (
            <div className="glass-card p-6">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-6">
                <Heart className="h-5 w-5 text-rose-400" /> Submit Donation
                Proof
              </h3>
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}

                <div>
                  <label className="label-text">Your Name *</label>
                  <input
                    type="text"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className="input-field"
                    required
                    minLength={2}
                  />
                </div>
                <div>
                  <label className="label-text">Email (optional)</label>
                  <input
                    type="email"
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label-text">Amount (₹) *</label>
                  <input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="input-field"
                    placeholder="Enter amount paid"
                    required
                  />
                </div>
                <div>
                  <label className="label-text">Transaction ID *</label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="input-field"
                    placeholder="UPI/Bank transaction reference"
                    required
                    minLength={3}
                  />
                </div>
                <div>
                  <label className="label-text">
                    Payment Screenshot (optional)
                  </label>
                  <ImageUpload
                    images={screenshots}
                    onChange={setScreenshots}
                    maxFiles={1}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3">
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {loading ? "Submitting..." : "Submit Proof"}
                </button>
              </form>
            </div>
          )}

          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
              How it works
            </h3>
            <ol className="space-y-3 text-sm text-slate-400">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-400">
                  1
                </span>
                Scan the QR code or use the UPI ID to make a payment
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-400">
                  2
                </span>
                Note your Transaction ID from the payment receipt
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-400">
                  3
                </span>
                Fill the form with your details and attach a screenshot
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs font-bold text-indigo-400">
                  4
                </span>
                Admin verifies your payment and updates the campaign
              </li>
            </ol>
          </div>
        </div>
      </div>
      <AuthModal
        isOpen={authModal}
        onClose={() => setAuthModal(false)}
        message="You need to sign in to submit a donation proof."
      />
    </div>
  );
}
