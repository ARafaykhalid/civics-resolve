import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDonationCampaigns, getCampaignTransactions } from "@/actions/donations";
import DonationsVerification from "./DonationsVerification";

export default async function DonationsVerifyPage() {
  const session = await auth();
  if (!session?.user || (session.user as { role: string }).role !== "admin") redirect("/dashboard");

  const campaignsResult = await getDonationCampaigns(true);
  const campaigns = campaignsResult.success ? campaignsResult.data || [] : [];

  // Fetch transactions for all campaigns
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allTransactions: any[] = [];
  for (const campaign of campaigns) {
    const txResult = await getCampaignTransactions(campaign._id);
    if (txResult.success && txResult.data) allTransactions.push(...txResult.data);
  }

  // Sort by most recent first
  allTransactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return <DonationsVerification transactions={allTransactions} campaigns={campaigns} />;
}
