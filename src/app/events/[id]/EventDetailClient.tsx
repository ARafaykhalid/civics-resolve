"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { joinEvent } from "@/actions/community";
import { addComment, deleteComment } from "@/actions/complaints";
import Link from "next/link";
import {
  ChevronLeft,
  CalendarDays,
  MapPin,
  Users,
  Clock,
  Loader2,
  Send,
  MessageSquare,
  Share2,
  UserPlus,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { formatDate, formatDateTime } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function EventDetailClient({
  event,
  initialComments,
}: {
  event: any;
  initialComments: any[];
}) {
  const { data: session } = useSession();
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(
    session?.user?.id ? event.attendees?.includes(session.user.id) : false,
  );
  const [attendeeCount, setAttendeeCount] = useState(
    event.attendees?.length || 0,
  );
  const [comments, setComments] = useState(initialComments);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const handleJoin = async () => {
    if (!session?.user) return;
    setJoining(true);
    const result = await joinEvent(event._id);
    if (result.success) {
      setJoined(true);
      setAttendeeCount((p: number) => p + 1);
    }
    setJoining(false);
  };

  const handleComment = async () => {
    if (!session?.user || !commentText.trim()) return;
    setCommentLoading(true);
    const result = await addComment({
      targetType: "campaign",
      targetId: event._id,
      content: commentText,
    });
    if (result.success && result.data) {
      setComments((prev) => [
        { ...result.data, userId: session.user?.id },
        ...prev,
      ]);
      setCommentText("");
    }
    setCommentLoading(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    const result = await deleteComment(commentId);
    if (result.success)
      setComments((prev) => prev.filter((c: any) => c._id !== commentId));
  };

  const isPast = new Date(event.date) < new Date();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-fade-in">
      <Link
        href="/events"
        className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors mb-6">
        <ChevronLeft className="h-4 w-4" /> Back to Events
      </Link>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {event.image && (
            <div className="overflow-hidden rounded-2xl border border-white/5">
              <img
                src={event.image}
                alt={event.title}
                className="w-full max-h-[350px] object-cover"
              />
            </div>
          )}

          <div>
            {isPast && (
              <span className="rounded-full bg-slate-700 px-3 py-1 text-xs font-medium text-slate-400 mb-3 inline-block">
                Past Event
              </span>
            )}
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              {event.title}
            </h1>
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                {formatDate(event.date)}
              </span>
              {event.endDate && (
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  Until {formatDate(event.endDate)}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {event.location}
              </span>
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-3">
              About this Event
            </h2>
            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Comments */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-indigo-400" /> Discussion (
              {comments.length})
            </h2>
            <div className="flex gap-3 mb-6">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-1">
                {session?.user?.name?.charAt(0).toUpperCase() || "?"}
              </div>
              <div className="flex-1">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={
                    session?.user ? "Add a comment..." : "Sign in to comment..."
                  }
                  className="input-field min-h-[60px] text-sm"
                  maxLength={1000}
                  disabled={!session?.user}
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleComment}
                    disabled={commentLoading || !commentText.trim()}
                    className="btn-primary text-xs py-1.5 px-3">
                    {commentLoading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}{" "}
                    Post
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
                        <span className="text-sm font-medium text-white">
                          {c.userName}
                        </span>
                        <span className="text-[11px] text-slate-600">
                          {formatDate(c.createdAt)}
                        </span>
                        {(c.userId === session?.user?.id ||
                          (session?.user as any)?.role === "admin") && (
                          <button
                            onClick={() => handleDeleteComment(c._id)}
                            className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all">
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
                No comments yet.
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-3">
              <button
                onClick={handleJoin}
                disabled={joining || joined || isPast}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-all ${
                  joined
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"
                }`}>
                {joining ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : joined ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                {joined ? "Registered" : isPast ? "Event Ended" : "Attend"}
              </button>
              <button
                onClick={() =>
                  navigator.clipboard.writeText(window.location.href)
                }
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors">
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Details
            </h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Organizer</dt>
                <dd className="text-slate-300">{event.organizer}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Attendees</dt>
                <dd className="text-slate-300">
                  {attendeeCount}
                  {event.maxAttendees ? ` / ${event.maxAttendees}` : ""}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Date</dt>
                <dd className="text-slate-300">{formatDateTime(event.date)}</dd>
              </div>
              {event.endDate && (
                <div className="flex justify-between">
                  <dt className="text-slate-500">End Date</dt>
                  <dd className="text-slate-300">
                    {formatDateTime(event.endDate)}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
