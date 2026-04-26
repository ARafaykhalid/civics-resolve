import { getVolunteerOpportunities } from "@/actions/community";
import VolunteerListClient from "./VolunteerListClient";

export default async function VolunteerPage() {
  const result = await getVolunteerOpportunities();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const opportunities = (result.success ? result.data || [] : []) as any[];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Volunteer Opportunities</h1>
        <p className="mt-2 text-slate-400">Give your time to make a difference. Join community service drives.</p>
      </div>

      <VolunteerListClient opportunities={opportunities} />
    </div>
  );
}
