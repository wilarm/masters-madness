import { getPoolState } from "@/lib/pool-state";
import { AnalyticsShell } from "@/components/analytics/analytics-shell";
import { auth } from "@clerk/nextjs/server";

export default async function AnalyticsPage() {
  const poolState = getPoolState();
  // TODO: check commissioner role from DB — for now any signed-in user gets the preview toggle
  const { userId } = await auth();
  const isCommissioner = !!userId;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <AnalyticsShell
        poolState={poolState}
        isCommissioner={isCommissioner}
        showDemoToggle={!userId}
        defaultDemo={!userId}
      />
    </div>
  );
}
