"use client";

import Link from "next/link";
import {
  ThumbsUp,
  MapPin,
  Clock,
  Route,
  Droplets,
  Zap,
  Trash2,
  ShieldAlert,
  CircleHelp,
} from "lucide-react";
import {
  cn,
  getStatusColor,
  getPriorityColor,
  formatDate,
  truncate,
} from "@/lib/utils";

interface ComplaintCardProps {
  complaint: {
    _id: string;
    issueId?: number;
    title: string;
    description: string;
    category: string;
    location: { address: string };
    images: string[];
    status: string;
    priority: string;
    upvotes: number;
    isAnonymous: boolean;
    createdBy?: { name: string } | null;
    createdAt: string;
  };
  variant?: "default" | "pending";
}

const categoryIcons: Record<string, typeof Route> = {
  Road: Route,
  Water: Droplets,
  Electricity: Zap,
  Garbage: Trash2,
  Safety: ShieldAlert,
  Other: CircleHelp,
};

const categoryGradients: Record<string, string> = {
  Road: "from-amber-500 to-orange-600",
  Water: "from-cyan-500 to-blue-600",
  Electricity: "from-yellow-400 to-amber-600",
  Garbage: "from-green-500 to-emerald-600",
  Safety: "from-red-500 to-rose-600",
  Other: "from-slate-400 to-slate-600",
};

export default function ComplaintCard({
  complaint,
  variant = "default",
}: ComplaintCardProps) {
  const CategoryIcon = categoryIcons[complaint.category] || CircleHelp;
  const gradient =
    categoryGradients[complaint.category] || categoryGradients.Other;
  const slug = complaint.issueId ? complaint.issueId.toString() : complaint._id;
  const isPending =
    variant === "pending" || complaint.status === "Pending Verification";

  return (
    <Link href={`/complaints/${slug}`} className="group block">
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-1",
          variant === "pending"
            ? "border-red-500/20 bg-red-950/30 hover:border-red-500/40 hover:shadow-red-500/10"
            : "border-white/[0.06] bg-slate-900/50 hover:border-indigo-500/30 hover:shadow-indigo-500/10",
        )}>
        {/* Pending/Draft badge */}
        {variant === "pending" && (
          <div className="absolute top-3 right-3 z-10 rounded-full bg-red-500/90 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-lg">
            PENDING REVIEW
          </div>
        )}

        {complaint.images.length > 0 ? (
          <div className="relative h-48 overflow-hidden">
            <img
              src={complaint.images[0]}
              alt={complaint.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
            <div className="absolute bottom-3 left-3 flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r px-3 py-1 text-xs font-semibold text-white shadow-lg",
                  gradient,
                )}>
                <CategoryIcon className="h-3.5 w-3.5" />
                {complaint.category}
              </span>
              {complaint.issueId && (
                <span className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-mono text-slate-300">
                  #{complaint.issueId}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "flex h-28 items-center justify-center bg-gradient-to-br opacity-20",
              gradient,
            )}>
            <CategoryIcon className="h-12 w-12 text-white" />
          </div>
        )}

        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <span
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                getStatusColor(complaint.status),
              )}>
              {complaint.status}
            </span>
            <span
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                getPriorityColor(complaint.priority),
              )}>
              {complaint.priority}
            </span>
            {complaint.issueId && !complaint.images.length && (
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-400">
                #{complaint.issueId}
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-white line-clamp-2 group-hover:text-indigo-400 transition-colors">
            {complaint.title}
          </h3>
          <p className="mt-2 text-sm text-slate-400 line-clamp-2">
            {truncate(complaint.description, 120)}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {truncate(complaint.location.address, 30)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDate(complaint.createdAt)}
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
            <span className="flex items-center gap-1.5 text-sm text-slate-400">
              <ThumbsUp className="h-4 w-4" />
              {complaint.upvotes}
            </span>
            <span className="text-xs text-slate-600">
              {complaint.isAnonymous
                ? "Anonymous"
                : complaint.createdBy?.name || "Unknown"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
