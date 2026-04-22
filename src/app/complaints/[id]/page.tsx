import { notFound } from "next/navigation";
import { getComplaintById } from "@/actions/complaints";
import ComplaintDetail from "./ComplaintDetail";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ComplaintDetailPage({ params }: Props) {
  const { id } = await params;
  const result = await getComplaintById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <ComplaintDetail complaint={result.data as any} />;
}
