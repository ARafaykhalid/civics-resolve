import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getEvents } from "@/actions/community";
import EventsManagement from "./EventsManagement";

export default async function EventsDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = (session.user as { role: string }).role;
  if (!["admin", "ngo", "authority"].includes(role)) redirect("/dashboard");
  const result = await getEvents(false);
  return <EventsManagement events={result.success ? result.data || [] : []} />;
}
