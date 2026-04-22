export function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-white/[0.06] bg-slate-900/50 overflow-hidden">
      <div className="h-48 bg-slate-800" />
      <div className="p-5 space-y-3">
        <div className="flex gap-2">
          <div className="h-5 w-16 rounded-full bg-slate-800" />
          <div className="h-5 w-14 rounded-full bg-slate-800" />
        </div>
        <div className="h-5 w-3/4 rounded bg-slate-800" />
        <div className="h-4 w-full rounded bg-slate-800" />
        <div className="h-4 w-2/3 rounded bg-slate-800" />
        <div className="flex justify-between pt-3 border-t border-white/5">
          <div className="h-4 w-12 rounded bg-slate-800" />
          <div className="h-4 w-20 rounded bg-slate-800" />
        </div>
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 w-2/3 rounded bg-slate-800" />
      <div className="flex gap-2">
        <div className="h-6 w-20 rounded-full bg-slate-800" />
        <div className="h-6 w-16 rounded-full bg-slate-800" />
      </div>
      <div className="h-64 rounded-2xl bg-slate-800" />
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-slate-800" />
        <div className="h-4 w-5/6 rounded bg-slate-800" />
        <div className="h-4 w-4/6 rounded bg-slate-800" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl bg-slate-800/50 p-4">
          <div className="h-4 w-4 rounded bg-slate-700" />
          <div className="h-4 flex-1 rounded bg-slate-700" />
          <div className="h-4 w-20 rounded bg-slate-700" />
          <div className="h-4 w-16 rounded bg-slate-700" />
        </div>
      ))}
    </div>
  );
}
