import { notFound } from "next/navigation";
import { getVolunteerById } from "@/actions/community";
import { getComments } from "@/actions/complaints";
import VolunteerDetailClient from "./VolunteerDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function VolunteerDetailPage({ params }: Props) {
  const { id } = await params;
  const [result, commentsResult] = await Promise.all([
    getVolunteerById(id),
    getComments("campaign", id),
  ]);

  if (!result.success || !result.data) notFound();

  const comments = commentsResult.success ? commentsResult.data || [] : [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <VolunteerDetailClient opportunity={result.data as any} initialComments={comments as any[]} />;
}
