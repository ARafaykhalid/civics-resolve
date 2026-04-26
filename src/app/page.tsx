import { getComplaints, getDashboardAnalytics } from "@/actions/complaints";
import { getAnnouncements } from "@/actions/community";
import HomeClient from "@/components/HomeClient";

export default async function HomePage() {
  const [complaintsResult, analyticsResult, announcementsResult] = await Promise.all([
    getComplaints({ limit: 9, sort: "latest" }),
    getDashboardAnalytics(),
    getAnnouncements(),
  ]);

  const complaints = complaintsResult.success ? complaintsResult.data?.data || [] : [];
  const analytics = analyticsResult.success ? analyticsResult.data : null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const announcements = (announcementsResult.success ? announcementsResult.data || [] : []) as any[];

  return (
    <HomeClient 
      complaints={complaints}
      analytics={analytics}
      announcements={announcements}
    />
  );
}
