import { getPoolState } from "@/lib/pool-state";
import { AnalyticsShell } from "@/components/analytics/analytics-shell";
import { auth } from "@clerk/nextjs/server";
import { getPoolsForUser } from "@/lib/db/pools";
import { redirect } from "next/navigation";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ pool?: string }>;
}) {
  const poolState = getPoolState();
  const { userId } = await auth();
  const { pool: poolSlug } = await searchParams;

  // Auth-aware redirect: signed-in users without a pool param get sent to their pool
  if (userId && !poolSlug) {
    const userPools = await getPoolsForUser(userId);
    if (userPools.length > 0) {
      redirect(`/analytics?pool=${userPools[0].slug}`);
    }
  }

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
