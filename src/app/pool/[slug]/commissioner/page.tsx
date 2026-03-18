import { notFound, redirect } from "next/navigation";
import { requireAuth, isPoolCommissioner } from "@/lib/auth";
import { getPoolBySlug, getPoolMembers } from "@/lib/db/pools";
import { getPicksByPool } from "@/lib/db/picks";
import { CommissionerDashboard } from "@/components/pool/commissioner-dashboard";

export default async function CommissionerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const userId = await requireAuth();

  const pool = await getPoolBySlug(slug);
  if (!pool) notFound();

  const isCommish = await isPoolCommissioner(userId, pool.id);
  if (!isCommish) redirect(`/pool/${slug}`);

  const [members, picks] = await Promise.all([
    getPoolMembers(pool.id),
    getPicksByPool(pool.id),
  ]);

  return (
    <div className="min-h-screen bg-bg">
      <CommissionerDashboard
        pool={pool}
        members={members}
        picks={picks}
        currentUserId={userId}
      />
    </div>
  );
}
