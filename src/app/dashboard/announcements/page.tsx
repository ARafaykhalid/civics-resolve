import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getAnnouncements } from "@/actions/community";
import AnnouncementsManagement from "./AnnouncementsManagement";

export default async function AnnouncementsPage() {
  const session = await auth();
  if (!session?.user || (session.user as { role: string }).role !== "admin") redirect("/dashboard");
  const result = await getAnnouncements(false);
  return <AnnouncementsManagement announcements={result.success ? result.data || [] : []} />;
}
