import { FileX, Search, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  icon?: "search" | "file" | "warning";
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

const icons = {
  search: Search,
  file: FileX,
  warning: AlertTriangle,
};

export default function EmptyState({ icon = "file", title, description, actionLabel, actionHref }: EmptyStateProps) {
  const Icon = icons[icon];
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/30 px-8 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800">
        <Icon className="h-8 w-8 text-slate-500" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-300">{title}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-slate-500">{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="mt-6 rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-600">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
