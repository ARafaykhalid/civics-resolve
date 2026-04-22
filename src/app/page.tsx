import Link from "next/link";
import { getComplaints, getDashboardAnalytics } from "@/actions/complaints";
import { getAnnouncements } from "@/actions/community";
import ComplaintCard from "@/components/ComplaintCard";
import {
  Shield, ArrowRight, FileText, CheckCircle2, Users, TrendingUp,
  Heart, HandHelping, CalendarDays, AlertTriangle, Info, Bell, Megaphone,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default async function HomePage() {
  const [complaintsResult, analyticsResult, announcementsResult] = await Promise.all([
    getComplaints({ limit: 6, sort: "latest" }),
    getDashboardAnalytics(),
    getAnnouncements(),
  ]);

  const complaints = complaintsResult.success ? complaintsResult.data?.data || [] : [];
  const analytics = analyticsResult.success ? analyticsResult.data : null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const announcements = (announcementsResult.success ? announcementsResult.data || [] : []) as any[];

  const alertStyles: Record<string, string> = {
    emergency: "border-red-500/30 bg-red-500/10 text-red-400",
    warning: "border-amber-500/30 bg-amber-500/10 text-amber-400",
    info: "border-blue-500/30 bg-blue-500/10 text-blue-400",
    update: "border-green-500/30 bg-green-500/10 text-green-400",
  };
  const alertIcons: Record<string, typeof AlertTriangle> = { emergency: AlertTriangle, warning: Bell, info: Info, update: Megaphone };

  return (
    <div className="animate-fade-in">
      {/* Announcements Bar */}
      {announcements.filter((a) => a.isPinned).length > 0 && (
        <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8 space-y-2">
          {announcements.filter((a) => a.isPinned).map((a) => {
            const Icon = alertIcons[a.type] || Info;
            return (
              <div key={a._id} className={cn("flex items-center gap-3 rounded-xl border p-3 text-sm", alertStyles[a.type])}>
                <Icon className="h-4 w-4 shrink-0" /><span className="font-semibold">{a.title}:</span><span className="opacity-80">{a.content}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-slate-900" />
        <div className="absolute top-20 left-1/4 h-96 w-96 rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute bottom-10 right-1/4 h-72 w-72 rounded-full bg-purple-500/10 blur-[100px]" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
              <Shield className="h-4 w-4" /> Community-Powered Civic Action
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Report. Track.{" "}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Resolve.</span>
            </h1>
            <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto">
              Empower your community by reporting civic issues, tracking their resolution, volunteering for causes, and supporting campaigns through transparent donations.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href="/submit" className="btn-primary text-base px-8 py-3.5 shadow-xl shadow-indigo-500/25">
                Report an Issue <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/complaints" className="btn-secondary text-base px-8 py-3.5">
                Browse Issues
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      {analytics && (
        <section className="relative -mt-8 z-10">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: "Issues Reported", value: analytics.totalComplaints, icon: FileText, gradient: "from-indigo-500 to-purple-600" },
                { label: "Issues Resolved", value: analytics.resolvedComplaints, icon: CheckCircle2, gradient: "from-green-500 to-emerald-600" },
                { label: "In Progress", value: analytics.inProgressComplaints, icon: TrendingUp, gradient: "from-orange-500 to-amber-600" },
                { label: "Community Impact", value: `${analytics.totalComplaints > 0 ? Math.round((analytics.resolvedComplaints / analytics.totalComplaints) * 100) : 0}%`, icon: Users, gradient: "from-pink-500 to-rose-600" },
              ].map((stat) => (
                <div key={stat.label} className="glass-card p-5 text-center">
                  <div className={cn("mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br", stat.gradient)}>
                    <stat.icon className="h-5 w-5 text-white" />
                  </div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Grid */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white">How You Can Contribute</h2>
          <p className="mt-2 text-slate-400">Multiple ways to make a difference in your community</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Report Issues", desc: "Flag civic problems — potholes, water leaks, safety hazards, and more", icon: FileText, href: "/submit", color: "from-indigo-500 to-blue-600" },
            { title: "Donate to Causes", desc: "Support community campaigns via secure QR code payments", icon: Heart, href: "/donate", color: "from-rose-500 to-pink-600" },
            { title: "Volunteer", desc: "Join cleanup drives, teaching programs, and disaster relief efforts", icon: HandHelping, href: "/volunteer", color: "from-teal-500 to-emerald-600" },
            { title: "Attend Events", desc: "Participate in community meetups, awareness campaigns, and drives", icon: CalendarDays, href: "/events", color: "from-purple-500 to-violet-600" },
          ].map((feature) => (
            <Link key={feature.title} href={feature.href} className="group glass-card p-6 transition-all duration-300 hover:border-indigo-500/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10">
              <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br mb-4", feature.color)}>
                <feature.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors">{feature.title}</h3>
              <p className="mt-2 text-sm text-slate-400">{feature.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Complaints */}
      {complaints.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white">Recent Issues</h2>
            <Link href="/complaints" className="flex items-center gap-1 text-sm font-medium text-indigo-400 hover:text-indigo-300">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {complaints.map((c: any) => (
              <ComplaintCard key={c._id} complaint={c} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
