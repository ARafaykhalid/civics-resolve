"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  Heart,
  Megaphone,
  HandHelping,
  CalendarDays,
  Shield,
  ClipboardCheck,
  ChevronLeft,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

const adminLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/complaints", label: "Complaints", icon: FileText },
  { href: "/dashboard/users", label: "Users", icon: Users },
  { href: "/dashboard/campaigns", label: "Donation Campaigns", icon: Heart },
  {
    href: "/dashboard/donations",
    label: "Verify Donations",
    icon: ClipboardCheck,
  },
  { href: "/dashboard/announcements", label: "Announcements", icon: Megaphone },
  { href: "/dashboard/volunteers", label: "Volunteers", icon: HandHelping },
  { href: "/dashboard/events", label: "Events", icon: CalendarDays },
  { href: "/dashboard/comments", label: "Comments", icon: MessageSquare },
];

const authorityLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  {
    href: "/dashboard/assigned",
    label: "Assigned Issues",
    icon: ClipboardCheck,
  },
  { href: "/dashboard/volunteers", label: "Volunteers", icon: HandHelping },
  { href: "/dashboard/events", label: "Events", icon: CalendarDays },
  { href: "/dashboard/comments", label: "Comments", icon: MessageSquare },
];

const userLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/my-complaints", label: "My Reports", icon: FileText },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (!session?.user) {
    redirect("/login");
  }

  const role = (session.user as { role?: string })?.role || "user";

  let links = userLinks;
  if (role === "admin") links = adminLinks;
  else if (role === "ngo" || role === "authority") links = authorityLinks;

  return (
    <div className="flex h-full min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="hidden min-h-[90vh] md:flex w-64 shrink-0 flex-col border-r border-white/5 bg-slate-900/50">
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                {session.user.name}
              </p>
              <p className="text-[11px] font-medium text-indigo-400 uppercase">
                {role}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  isActive
                    ? "bg-indigo-500/15 text-indigo-400"
                    : "text-slate-400 hover:bg-white/5 hover:text-white",
                )}>
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/5">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500 hover:text-white hover:bg-white/5 transition-colors">
            <ChevronLeft className="h-4 w-4" /> Back to Site
          </Link>
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-white/5 bg-slate-900/95 backdrop-blur-xl">
        <div className="flex overflow-x-auto scrollbar-hide">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1 py-2.5 text-[10px] font-medium min-w-[60px]",
                  isActive ? "text-indigo-400" : "text-slate-500",
                )}>
                <Icon className="h-4 w-4" />
                {link.label.split(" ")[0]}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 min-w-0 w-full overflow-y-auto pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
}
