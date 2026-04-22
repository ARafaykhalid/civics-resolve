"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { useState, useCallback } from "react";

interface FilterBarProps {
  currentStatus?: string;
  currentCategory?: string;
  currentSort?: string;
  currentSearch?: string;
}

const statuses = ["Pending", "Verified", "In Progress", "Resolved"];
const categories = ["Road", "Water", "Electricity", "Garbage", "Safety", "Other"];
const sortOptions = [
  { value: "latest", label: "Latest" },
  { value: "oldest", label: "Oldest" },
  { value: "most-upvoted", label: "Most Upvoted" },
];

export default function FilterBar({ currentStatus, currentCategory, currentSort, currentSearch }: FilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(currentSearch || "");

  const updateFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/complaints?${params.toString()}`);
  }, [router, searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilter("search", search);
  };

  return (
    <div className="mb-8 space-y-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="relative">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search issues..."
          className="input-field pl-11 pr-4"
        />
      </form>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <SlidersHorizontal className="h-4 w-4 text-slate-500" />

        <select
          value={currentStatus || ""}
          onChange={(e) => updateFilter("status", e.target.value)}
          className="select-field w-auto text-sm py-2"
        >
          <option value="">All Status</option>
          {statuses.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          value={currentCategory || ""}
          onChange={(e) => updateFilter("category", e.target.value)}
          className="select-field w-auto text-sm py-2"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <select
          value={currentSort || "latest"}
          onChange={(e) => updateFilter("sort", e.target.value)}
          className="select-field w-auto text-sm py-2"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>

        {(currentStatus || currentCategory || currentSearch) && (
          <button
            onClick={() => router.push("/complaints")}
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
