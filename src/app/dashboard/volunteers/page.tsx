import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getVolunteerOpportunities } from "@/actions/community";
import VolunteersManagement from "./VolunteersManagement";

export default async function VolunteersDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = (session.user as { role: string }).role;
  if (!["admin", "ngo"].includes(role)) redirect("/dashboard");
  const result = await getVolunteerOpportunities(false);
  return <VolunteersManagement opportunities={result.success ? result.data || [] : []} />;
}
