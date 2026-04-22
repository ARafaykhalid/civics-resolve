import { notFound } from "next/navigation";
import { getDonationCampaignById } from "@/actions/donations";
import DonateDetailClient from "./DonateDetailClient";

interface Props { params: Promise<{ id: string }> }

export default async function DonateDetailPage({ params }: Props) {
  const { id } = await params;
  const result = await getDonationCampaignById(id);
  if (!result.success || !result.data) notFound();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <DonateDetailClient campaign={result.data as any} />;
}
