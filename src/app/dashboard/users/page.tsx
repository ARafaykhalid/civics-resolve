import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAllUsers } from "@/actions/complaints";
import UsersManagement from "./UsersManagement";

export default async function DashboardUsersPage() {
  const session = await auth();
  if (!session?.user || (session.user as { role: string }).role !== "admin") redirect("/dashboard");

  const result = await getAllUsers();
  return <UsersManagement users={result.success ? result.data || [] : []} />;
}
