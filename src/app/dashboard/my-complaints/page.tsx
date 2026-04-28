import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getComplaints } from "@/actions/complaints";
import ComplaintCard from "@/components/ComplaintCard";
import { FileText } from "lucide-react";

export default async function MyComplaintsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const result = await getComplaints({ limit: 50 });
  const userReports = result.data?.data.filter(
    (c) => c.createdBy._id == session.user?.id,
  );

  return (
    <div className="p-6 lg:p-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-white mb-6">My Reports</h1>

      {result.success && result.data && result.data.data.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {userReports?.map((c: any) => (
            <ComplaintCard key={c._id} complaint={c} />
          ))}
        </div>
      ) : (
        <div className="glass-card p-16 text-center">
          <FileText className="mx-auto h-12 w-12 text-slate-600" />
          <h3 className="mt-4 text-lg font-semibold text-slate-300">
            No reports yet
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Submit your first issue report to get started.
          </p>
        </div>
      )}
    </div>
  );
}
