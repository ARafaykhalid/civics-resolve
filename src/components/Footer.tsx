"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Shield, Globe, ExternalLink, Heart } from "lucide-react";

export default function Footer() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (pathname?.startsWith("/dashboard")) return null;

  return (
    <footer className="border-t border-white/5 bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                CivicResolve
              </span>
            </Link>
            <p className="mt-3 text-sm text-slate-500 max-w-md">
              Empowering communities to report, track, and resolve local issues together.
              Transparent. Accountable. Community-driven.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Platform</h3>
            <ul className="mt-3 space-y-2">
              <li><Link href="/complaints" className="text-sm text-slate-500 transition-colors hover:text-indigo-400">Browse Issues</Link></li>
              <li><Link href="/submit" className="text-sm text-slate-500 transition-colors hover:text-indigo-400">Report Issue</Link></li>
              <li><Link href="/donate" className="text-sm text-slate-500 transition-colors hover:text-indigo-400">Donate</Link></li>
              <li><Link href="/volunteer" className="text-sm text-slate-500 transition-colors hover:text-indigo-400">Volunteer</Link></li>
              <li><Link href="/events" className="text-sm text-slate-500 transition-colors hover:text-indigo-400">Events</Link></li>
              {/* Show Sign In/Sign Up only when NOT logged in */}
              {!session?.user && (
                <>
                  <li><Link href="/login" className="text-sm text-slate-500 transition-colors hover:text-indigo-400">Sign In</Link></li>
                  <li><Link href="/register" className="text-sm text-slate-500 transition-colors hover:text-indigo-400">Create Account</Link></li>
                </>
              )}
              {/* Show Dashboard when logged in */}
              {session?.user && (
                <li><Link href="/dashboard" className="text-sm text-slate-500 transition-colors hover:text-indigo-400">Dashboard</Link></li>
              )}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Categories</h3>
            <ul className="mt-3 space-y-2">
              {["Road", "Water", "Electricity", "Garbage", "Safety"].map((cat) => (
                <li key={cat}>
                  <Link href={`/complaints?category=${cat}`} className="text-sm text-slate-500 transition-colors hover:text-indigo-400">{cat} Issues</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-8 sm:flex-row">
          <p className="text-xs text-slate-600">© {new Date().getFullYear()} CivicResolve. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-xs text-slate-600">
              Made with <Heart className="h-3 w-3 text-red-500" /> for communities
            </span>
            <a href="#" className="text-slate-600 hover:text-slate-400 transition-colors"><Globe className="h-4 w-4" /></a>
            <a href="#" className="text-slate-600 hover:text-slate-400 transition-colors"><ExternalLink className="h-4 w-4" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
