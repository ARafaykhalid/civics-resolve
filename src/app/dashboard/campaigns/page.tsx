import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDonationCampaigns } from "@/actions/donations";
import CampaignsManagement from "./CampaignsManagement";

export default async function CampaignsPage() {
  const session = await auth();
  if (!session?.user || (session.user as { role: string }).role !== "admin") redirect("/dashboard");

  const result = await getDonationCampaigns(true);
  return <CampaignsManagement campaigns={result.success ? result.data || [] : []} />;
}
