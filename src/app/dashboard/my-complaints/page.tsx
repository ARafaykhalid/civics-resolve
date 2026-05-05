import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getComplaints } from "@/actions/complaints";
import MyComplaintsClient from "./MyComplaintsClient";

export default async function MyComplaintsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const result = await getComplaints({ limit: 100 });
  const userReports =
    result.data?.data.filter(
      (c) => c.createdBy?._id === session.user?.id,
    ) || [];

  return <MyComplaintsClient complaints={userReports} />;
}
