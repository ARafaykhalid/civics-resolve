import { notFound } from "next/navigation";
import { getDonationCampaignById } from "@/actions/donations";
import { getComments } from "@/actions/complaints";
import DonateDetailClient from "./DonateDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function DonateDetailPage({ params }: Props) {
  const { id } = await params;
  const [result, commentsResult] = await Promise.all([
    getDonationCampaignById(id),
    getComments("campaign", id),
  ]);
  if (!result.success || !result.data) notFound();
  const comments = commentsResult.success ? commentsResult.data || [] : [];
   
  return (
    <DonateDetailClient
      campaign={result.data as any}
      initialComments={comments as any[]}
    />
  );
}
