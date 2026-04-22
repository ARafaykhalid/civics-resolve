import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDashboardAnalytics } from "@/actions/complaints";
import { getDonationCampaigns } from "@/actions/donations";
import { getAnnouncements } from "@/actions/community";
import Link from "next/link";
import { BarChart3, Clock, CheckCircle2, TrendingUp, AlertTriangle, Heart, Megaphone, FileText, Plus } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

export default async function DashboardOverview() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const role = (session.user as { role: string }).role;
  const analyticsResult = await getDashboardAnalytics();
  const analytics = analyticsResult.success ? analyticsResult.data : null;

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Welcome, {session.user.name}</h1>
        <p className="text-slate-400 mt-1">Here&apos;s what&apos;s happening in your community</p>
      </div>

      {/* Analytics Cards */}
      {analytics && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {[
            { label: "Total Issues", value: analytics.totalComplaints, icon: BarChart3, color: "text-indigo-400 bg-indigo-500/10" },
            { label: "Pending", value: analytics.pendingComplaints, icon: Clock, color: "text-yellow-400 bg-yellow-500/10" },
            { label: "In Progress", value: analytics.inProgressComplaints, icon: TrendingUp, color: "text-orange-400 bg-orange-500/10" },
            { label: "Resolved", value: analytics.resolvedComplaints, icon: CheckCircle2, color: "text-green-400 bg-green-500/10" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
                </div>
                <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", stat.color)}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category Breakdown */}
      {analytics && analytics.categoryStats.length > 0 && (
        <div className="glass-card p-6 mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">Issues by Category</h2>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {analytics.categoryStats.map((cat) => (
              <div key={cat.category} className="rounded-xl bg-slate-800/50 p-4 text-center">
                <p className="text-2xl font-bold text-white">{cat.count}</p>
                <p className="text-xs text-slate-500 mt-1">{cat.category}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent + Quick Actions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Complaints */}
        {analytics && (
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Recent Issues</h2>
              <Link href={role === "admin" ? "/dashboard/complaints" : "/complaints"} className="text-sm text-indigo-400 hover:text-indigo-300">View All</Link>
            </div>
            <div className="space-y-3">
              {analytics.recentComplaints.map((c) => (
                <Link key={c._id} href={`/complaints/${c._id}`} className="flex items-center justify-between rounded-lg bg-slate-800/50 p-3 hover:bg-slate-800 transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">{c.title}</p>
                    <p className="text-xs text-slate-500">{c.category} • {formatDate(c.createdAt)}</p>
                  </div>
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold ml-3 shrink-0",
                    c.status === "Resolved" ? "bg-green-500/10 text-green-400" :
                    c.status === "In Progress" ? "bg-orange-500/10 text-orange-400" :
                    "bg-yellow-500/10 text-yellow-400"
                  )}>{c.status}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link href="/submit" className="flex items-center gap-3 rounded-xl bg-indigo-500/10 p-4 hover:bg-indigo-500/20 transition-colors">
              <FileText className="h-8 w-8 text-indigo-400" />
              <div><p className="text-sm font-semibold text-white">Report Issue</p><p className="text-xs text-slate-500">Submit a new complaint</p></div>
            </Link>
            <Link href="/donate" className="flex items-center gap-3 rounded-xl bg-rose-500/10 p-4 hover:bg-rose-500/20 transition-colors">
              <Heart className="h-8 w-8 text-rose-400" />
              <div><p className="text-sm font-semibold text-white">Donate</p><p className="text-xs text-slate-500">Support a campaign</p></div>
            </Link>
            {role === "admin" && (
              <>
                <Link href="/dashboard/campaigns" className="flex items-center gap-3 rounded-xl bg-emerald-500/10 p-4 hover:bg-emerald-500/20 transition-colors">
                  <Plus className="h-8 w-8 text-emerald-400" />
                  <div><p className="text-sm font-semibold text-white">New Campaign</p><p className="text-xs text-slate-500">Create donation post</p></div>
                </Link>
                <Link href="/dashboard/announcements" className="flex items-center gap-3 rounded-xl bg-amber-500/10 p-4 hover:bg-amber-500/20 transition-colors">
                  <Megaphone className="h-8 w-8 text-amber-400" />
                  <div><p className="text-sm font-semibold text-white">Announce</p><p className="text-xs text-slate-500">Post an alert</p></div>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
