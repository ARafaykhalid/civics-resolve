import CommentsManagement from "./CommentsManagement";
import { getAllCommentsForDashboard, getAllFeedbackForDashboard } from "@/actions/complaints";

export default async function DashboardCommentsPage() {
  const [commentsResult, feedbackResult] = await Promise.all([
    getAllCommentsForDashboard(),
    getAllFeedbackForDashboard(),
  ]);

  const comments = commentsResult.success ? commentsResult.data || [] : [];
  const feedback = feedbackResult.success ? feedbackResult.data || [] : [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <CommentsManagement comments={comments as any[]} feedback={feedback as any[]} />;
}
