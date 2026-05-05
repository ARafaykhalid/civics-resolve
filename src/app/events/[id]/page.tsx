import { notFound } from "next/navigation";
import { getEventById } from "@/actions/community";
import { getComments } from "@/actions/complaints";
import EventDetailClient from "./EventDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  const [result, commentsResult] = await Promise.all([
    getEventById(id),
    getComments("campaign", id), // reuse "campaign" type for events
  ]);

  if (!result.success || !result.data) notFound();

  const comments = commentsResult.success ? commentsResult.data || [] : [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <EventDetailClient event={result.data as any} initialComments={comments as any[]} />;
}
