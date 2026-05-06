import { Suspense } from "react";
import { getComplaints } from "@/actions/complaints";
import ComplaintCard from "@/components/ComplaintCard";
import EmptyState from "@/components/EmptyState";
import { CardSkeleton } from "@/components/Skeletons";
import FilterBar from "./FilterBar";

interface Props {
  searchParams: Promise<{
    status?: string;
    category?: string;
    sort?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function ComplaintsPage({ searchParams }: Props) {
  const params = await searchParams;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Civic Issues</h1>
        <p className="mt-2 text-slate-400">Browse and support community-reported issues</p>
      </div>

      <FilterBar
        currentStatus={params.status}
        currentCategory={params.category}
        currentSort={params.sort}
        currentSearch={params.search}
      />

      <Suspense fallback={<LoadingGrid />}>
        <ComplaintGrid
          status={params.status}
          category={params.category}
          sort={params.sort}
          search={params.search}
          page={params.page}
        />
      </Suspense>
    </div>
  );
}

async function ComplaintGrid({
  status, category, sort, search, page,
}: {
  status?: string; category?: string; sort?: string; search?: string; page?: string;
}) {
  const result = await getComplaints({
    status: status as never,
    category: category as never,
    sort: (sort as "latest" | "oldest" | "most-upvoted") || "latest",
    search,
    page: page ? parseInt(page) : 1,
    limit: 12,
  });

  const complaints = result.success ? result.data?.data || [] : [];
  const totalPages = result.success ? result.data?.totalPages || 1 : 1;
  const currentPage = page ? parseInt(page) : 1;

  if (complaints.length === 0) {
    return (
      <EmptyState
        icon="search"
        title="No issues found"
        description="Try adjusting your filters or be the first to report an issue."
        actionLabel="Report an Issue"
        actionHref="/submit"
      />
    );
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {complaints.map((complaint: Record<string, unknown>) => (
          <ComplaintCard
            key={complaint._id as string}
            complaint={complaint as never}
            variant={complaint.status === "Pending Verification" ? "pending" : "default"}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/complaints?${new URLSearchParams({
                ...(status ? { status } : {}),
                ...(category ? { category } : {}),
                ...(sort ? { sort } : {}),
                ...(search ? { search } : {}),
                page: p.toString(),
              }).toString()}`}
              className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                p === currentPage
                  ? "bg-indigo-500 text-white"
                  : "bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {p}
            </a>
          ))}
        </div>
      )}
    </>
  );
}

function LoadingGrid() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
