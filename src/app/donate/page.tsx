import { getDonationCampaigns } from "@/actions/donations";
import { getAnnouncements } from "@/actions/community";
import Link from "next/link";
import { Heart, Target, AlertTriangle, Info, Bell, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function DonatePage() {
  const [campaignsResult, announcementsResult] = await Promise.all([
    getDonationCampaigns(),
    getAnnouncements(),
  ]);

  const campaigns = campaignsResult.success ? campaignsResult.data || [] : [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const announcements = (announcementsResult.success ? announcementsResult.data || [] : []) as any[];

  const alertStyles: Record<string, string> = {
    emergency: "border-red-500/30 bg-red-500/10 text-red-400",
    warning: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    info: "border-blue-500/30 bg-blue-500/10 text-blue-400",
    update: "border-green-500/30 bg-green-500/10 text-green-400",
  };

  const alertIcons: Record<string, typeof AlertTriangle> = {
    emergency: AlertTriangle, warning: Bell, info: Info, update: Megaphone,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 animate-fade-in">
      {/* Announcements Banner */}
      {announcements.length > 0 && (
        <div className="mb-8 space-y-3">
          {announcements.slice(0, 3).map((a) => {
            const Icon = alertIcons[a.type] || Info;
            return (
              <div key={a._id} className={cn("flex items-start gap-3 rounded-xl border p-4", alertStyles[a.type] || alertStyles.info)}>
                <Icon className="h-5 w-5 shrink-0 mt-0.5" />
                <div><p className="font-semibold">{a.title}</p><p className="text-sm opacity-80 mt-0.5">{a.content}</p></div>
                {a.isPinned && <span className="ml-auto shrink-0 text-[10px] font-bold uppercase tracking-wider opacity-60">Pinned</span>}
              </div>
            );
          })}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Support a Cause</h1>
        <p className="mt-2 text-slate-400">Donate to community campaigns. Scan the QR code, pay, and submit your transaction proof.</p>
      </div>

      {campaigns.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <Heart className="mx-auto h-12 w-12 text-slate-600" />
          <h3 className="mt-4 text-lg font-semibold text-slate-300">No active campaigns</h3>
          <p className="mt-1 text-sm text-slate-500">Check back later for donation opportunities.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {campaigns.map((c: any) => {
            const progress = c.goalAmount > 0 ? Math.min(Math.round((c.raisedAmount / c.goalAmount) * 100), 100) : 0;
            return (
              <Link key={c._id} href={`/donate/${c._id}`} className="group block">
                <div className="glass-card overflow-hidden transition-all duration-300 hover:border-indigo-500/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10">
                  {c.images?.length > 0 ? (
                    <div className="relative h-48 overflow-hidden">
                      <img src={c.images[0]} alt={c.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                    </div>
                  ) : (
                    <div className="flex h-32 items-center justify-center bg-gradient-to-br from-rose-500/20 to-pink-500/20">
                      <Heart className="h-12 w-12 text-rose-400/50" />
                    </div>
                  )}
                  <div className="p-5">
                    <span className="rounded-full bg-rose-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-rose-400 border border-rose-500/20">{c.category}</span>
                    <h3 className="mt-3 text-lg font-semibold text-white line-clamp-2 group-hover:text-indigo-400 transition-colors">{c.title}</h3>
                    <p className="mt-2 text-sm text-slate-400 line-clamp-2">{c.description}</p>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 text-emerald-400"><Target className="h-3.5 w-3.5" />₹{c.raisedAmount.toLocaleString()} raised</span>
                        <span className="text-slate-500">₹{c.goalAmount.toLocaleString()} goal</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-700" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
