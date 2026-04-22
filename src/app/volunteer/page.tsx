import { getVolunteerOpportunities } from "@/actions/community";
import Link from "next/link";
import { HandHelping, MapPin, Calendar, Users, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function VolunteerPage() {
  const result = await getVolunteerOpportunities();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const opportunities = (result.success ? result.data || [] : []) as any[];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Volunteer Opportunities</h1>
        <p className="mt-2 text-slate-400">Give your time to make a difference. Join community service drives.</p>
      </div>

      {opportunities.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <HandHelping className="mx-auto h-12 w-12 text-slate-600" />
          <h3 className="mt-4 text-lg font-semibold text-slate-300">No opportunities available</h3>
          <p className="mt-1 text-sm text-slate-500">Check back later for volunteer opportunities.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {opportunities.map((v) => {
            const spotsLeft = v.spotsTotal - v.spotsFilled;
            return (
              <div key={v._id} className="glass-card p-6 transition-all duration-300 hover:border-indigo-500/30 hover:-translate-y-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="rounded-full bg-teal-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-teal-400 border border-teal-500/20">{v.category}</span>
                  {spotsLeft <= 3 && spotsLeft > 0 && <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-400">{spotsLeft} spots left!</span>}
                  {spotsLeft <= 0 && <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-red-400">Full</span>}
                </div>
                <h3 className="text-lg font-semibold text-white">{v.title}</h3>
                <p className="mt-2 text-sm text-slate-400 line-clamp-3">{v.description}</p>
                <div className="mt-4 space-y-2 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{v.location}</div>
                  <div className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{formatDate(v.date)}</div>
                  <div className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />{v.spotsFilled}/{v.spotsTotal} volunteers joined</div>
                </div>
                <div className="mt-4 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-400" style={{ width: `${Math.min((v.spotsFilled / v.spotsTotal) * 100, 100)}%` }} />
                </div>
                <Link href={`mailto:${v.contactEmail}?subject=Volunteering for: ${v.title}`} className="btn-primary w-full mt-4 text-sm py-2.5">
                  <HandHelping className="h-4 w-4" /> Volunteer Now
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
