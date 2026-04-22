import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getComplaints } from "@/actions/complaints";
import AssignedIssues from "./AssignedIssues";

export default async function AssignedPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = (session.user as { role: string }).role;
  if (!["ngo", "authority"].includes(role)) redirect("/dashboard");

  const result = await getComplaints({ assignedTo: session.user.id, limit: 50 });
  return <AssignedIssues complaints={result.success ? result.data?.data || [] : []} />;
}
