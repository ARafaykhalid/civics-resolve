import { notFound } from "next/navigation";
import { getComplaintById, getComments } from "@/actions/complaints";
import ComplaintDetail from "./ComplaintDetail";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ComplaintDetailPage({ params }: Props) {
  const { id } = await params;
  const [result, commentsResult] = await Promise.all([
    getComplaintById(id),
    getComments("complaint", id),
  ]);

  if (!result.success || !result.data) {
    notFound();
  }

  const comments = commentsResult.success ? commentsResult.data || [] : [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <ComplaintDetail complaint={result.data as any} initialComments={comments as any[]} />;
}
