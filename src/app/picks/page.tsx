import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getPoolsForUser } from "@/lib/db/pools";
import { Suspense } from "react";
import { PicksContent } from "@/components/picks/picks-content";

export default async function PicksPage({
  searchParams,
}: {
  searchParams: Promise<{ pool?: string }>;
}) {
  const { pool: poolSlug } = await searchParams;
  const { userId } = await auth();

  // Redirect signed-in users without pool param to their pool
  if (userId && !poolSlug) {
    const userPools = await getPoolsForUser(userId);
    if (userPools.length > 0) {
      redirect(`/picks?pool=${userPools[0].slug}`);
    }
  }

  return (
    <Suspense>
      <PicksContent />
    </Suspense>
  );
}
