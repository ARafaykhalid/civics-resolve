import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAllCommentsForDashboard, getAllFeedbackForDashboard } from "@/actions/complaints";
import DiscussionsClient from "./DiscussionsClient";

export const metadata = {
  title: "Discussions & Feedback | CivicResolve",
};

export default async function DiscussionsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = (session.user as any).role;
  if (!["admin", "ngo", "authority"].includes(role)) redirect("/dashboard");

  const [commentsResult, feedbackResult] = await Promise.all([
    getAllCommentsForDashboard(),
    getAllFeedbackForDashboard()
  ]);

  const comments = commentsResult.success ? commentsResult.data || [] : [];
  const feedback = feedbackResult.success ? feedbackResult.data || [] : [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <DiscussionsClient initialComments={comments as any[]} initialFeedback={feedback as any[]} currentUser={session.user as any} />;
}
