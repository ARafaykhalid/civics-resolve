"use client";

import { CheckCircle2, Clock, AlertCircle, ArrowRight } from "lucide-react";
import { cn, formatDateTime, getStatusColor } from "@/lib/utils";
import type { TimelineEntry } from "@/types";

interface StatusTimelineProps {
  timeline: TimelineEntry[];
}

const statusIcons: Record<string, typeof CheckCircle2> = {
  Pending: Clock,
  Verified: AlertCircle,
  "In Progress": ArrowRight,
  Resolved: CheckCircle2,
};

export default function StatusTimeline({ timeline }: StatusTimelineProps) {
  if (!timeline || timeline.length === 0) {
    return <p className="text-sm text-slate-500">No updates yet.</p>;
  }

  return (
    <div className="relative space-y-0">
      {/* Vertical line */}
      <div className="absolute left-[18px] top-3 bottom-3 w-px bg-gradient-to-b from-indigo-500/50 via-slate-700 to-transparent" />
      {timeline.map((entry, index) => {
        const Icon = statusIcons[entry.status] || Clock;
        const isLatest = index === timeline.length - 1;
        return (
          <div key={entry._id || index} className="relative flex gap-4 pb-6 last:pb-0">
            <div className={cn("relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all", isLatest ? "border-indigo-500 bg-indigo-500/20" : "border-slate-700 bg-slate-800")}>
              <Icon className={cn("h-4 w-4", isLatest ? "text-indigo-400" : "text-slate-500")} />
            </div>
            <div className="min-w-0 flex-1 pt-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className={cn("rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", getStatusColor(entry.status))}>{entry.status}</span>
                <span className="text-xs text-slate-500">{formatDateTime(entry.createdAt)}</span>
              </div>
              <p className="text-sm text-slate-300">{entry.comment}</p>
              {entry.updatedByName && (
                <p className="mt-0.5 text-xs text-slate-600">by {entry.updatedByName}</p>
              )}
              {entry.images && entry.images.length > 0 && (
                <div className="mt-2 flex gap-2 flex-wrap">
                  {entry.images.map((img, i) => (
                    <img key={i} src={img} alt="Proof" className="h-16 w-16 rounded-lg object-cover border border-white/5" />
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
