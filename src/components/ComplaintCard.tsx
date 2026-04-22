"use client";

import Link from "next/link";
import { ThumbsUp, MapPin, Clock, Route, Droplets, Zap, Trash2, ShieldAlert, CircleHelp } from "lucide-react";
import { cn, getStatusColor, getPriorityColor, formatDate, truncate } from "@/lib/utils";

interface ComplaintCardProps {
  complaint: {
    _id: string; title: string; description: string; category: string;
    location: { address: string }; images: string[]; status: string;
    priority: string; upvotes: number; isAnonymous: boolean;
    createdBy?: { name: string } | null; createdAt: string;
  };
}

const categoryIcons: Record<string, typeof Route> = {
  Road: Route, Water: Droplets, Electricity: Zap, Garbage: Trash2, Safety: ShieldAlert, Other: CircleHelp,
};

const categoryGradients: Record<string, string> = {
  Road: "from-amber-500 to-orange-600", Water: "from-cyan-500 to-blue-600",
  Electricity: "from-yellow-400 to-amber-600", Garbage: "from-green-500 to-emerald-600",
  Safety: "from-red-500 to-rose-600", Other: "from-slate-400 to-slate-600",
};

export default function ComplaintCard({ complaint }: ComplaintCardProps) {
  const CategoryIcon = categoryIcons[complaint.category] || CircleHelp;
  const gradient = categoryGradients[complaint.category] || categoryGradients.Other;

  return (
    <Link href={`/complaints/${complaint._id}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-slate-900/50 backdrop-blur-sm transition-all duration-300 hover:border-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1">
        {complaint.images.length > 0 ? (
          <div className="relative h-48 overflow-hidden">
            <img src={complaint.images[0]} alt={complaint.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
            <div className="absolute bottom-3 left-3">
              <span className={cn("inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r px-3 py-1 text-xs font-semibold text-white shadow-lg", gradient)}>
                <CategoryIcon className="h-3.5 w-3.5" />{complaint.category}
              </span>
            </div>
          </div>
        ) : (
          <div className={cn("flex h-28 items-center justify-center bg-gradient-to-br opacity-20", gradient)}>
            <CategoryIcon className="h-12 w-12 text-white" />
          </div>
        )}

        <div className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className={cn("rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", getStatusColor(complaint.status))}>{complaint.status}</span>
            <span className={cn("rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", getPriorityColor(complaint.priority))}>{complaint.priority}</span>
          </div>
          <h3 className="text-lg font-semibold text-white line-clamp-2 group-hover:text-indigo-400 transition-colors">{complaint.title}</h3>
          <p className="mt-2 text-sm text-slate-400 line-clamp-2">{truncate(complaint.description, 120)}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{truncate(complaint.location.address, 30)}</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{formatDate(complaint.createdAt)}</span>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
            <span className="flex items-center gap-1.5 text-sm text-slate-400"><ThumbsUp className="h-4 w-4" />{complaint.upvotes}</span>
            <span className="text-xs text-slate-600">{complaint.isAnonymous ? "Anonymous" : complaint.createdBy?.name || "Unknown"}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
