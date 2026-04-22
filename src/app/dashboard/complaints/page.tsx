import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getComplaints, getAuthorities } from "@/actions/complaints";
import ComplaintsManagement from "./ComplaintsManagement";

export default async function DashboardComplaintsPage() {
  const session = await auth();
  if (!session?.user || (session.user as { role: string }).role !== "admin") redirect("/dashboard");

  const [complaintsResult, authoritiesResult] = await Promise.all([
    getComplaints({ limit: 100 }),
    getAuthorities(),
  ]);

  return (
    <ComplaintsManagement
      complaints={complaintsResult.success ? complaintsResult.data?.data || [] : []}
      authorities={authoritiesResult.success ? authoritiesResult.data || [] : []}
    />
  );
}
