"use client";

import Link from "next/link";
import { Search, Home, AlertCircle, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

export default function NotFound() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 sm:px-6 sm:py-24 md:grid-cols-2 lg:px-8">
      <div className="max-w-max mx-auto text-center">
        <div className="flex justify-center mb-6">
          <div className="h-24 w-24 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
            <AlertCircle className="h-12 w-12 text-indigo-400" />
          </div>
        </div>
        <main className="sm:flex sm:items-center sm:justify-center gap-6">
          <p className="text-6xl font-extrabold text-indigo-500 tracking-tight sm:text-7xl">
            404
          </p>
          <div className="sm:border-l sm:border-white/10 sm:pl-6">
            <h1 className="text-3xl font-bold text-white tracking-tight sm:text-4xl">
              Page not found
            </h1>
            <p className="mt-2 text-base text-slate-400">
              Please check the URL in the address bar and try again.
            </p>
          </div>
        </main>
        <div className="mt-10 flex space-x-3 sm:border-l sm:border-transparent sm:pl-6 justify-center">
          <Link
            href="/"
            className="btn-primary flex items-center gap-2"
          >
            <Home className="h-4 w-4" /> Go back home
          </Link>
          <Link
            href="/complaints"
            className="btn-secondary flex items-center gap-2"
          >
            Browse issues <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
