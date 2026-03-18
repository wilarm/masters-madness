import { createServiceClient } from "@/lib/supabase";
import type { PoolState } from "@/lib/pool-state";

export type AdminPool = {
  id: string;
  slug: string;
  name: string;
  state: PoolState;
  created_by: string;
  created_at: string;
  config: Record<string, unknown>;
  member_count: number;
  pick_count: number;
};

export type SystemStats = {
  total_pools: number;
  total_members: number;
  total_picks: number;
  pools_by_state: Record<PoolState, number>;
};

export async function getAllPoolsWithStats(): Promise<AdminPool[]> {
  const db = createServiceClient();

  const { data: pools, error } = await db
    .from("pools")
    .select("id, slug, name, state, created_by, created_at, config")
    .order("created_at", { ascending: false });

  if (error || !pools) return [];

  // Fetch member and pick counts for each pool in parallel
  const enriched = await Promise.all(
    pools.map(async (pool) => {
      const [{ count: memberCount }, { count: pickCount }] = await Promise.all([
        db
          .from("pool_members")
          .select("id", { count: "exact", head: true })
          .eq("pool_id", pool.id),
        db
          .from("picks")
          .select("id", { count: "exact", head: true })
          .eq("pool_id", pool.id),
      ]);
      return {
        ...pool,
        config: (pool.config ?? {}) as Record<string, unknown>,
        member_count: memberCount ?? 0,
        pick_count: pickCount ?? 0,
      } as AdminPool;
    })
  );

  return enriched;
}

export async function getSystemStats(): Promise<SystemStats> {
  const db = createServiceClient();

  const [
    { count: totalPools },
    { count: totalMembers },
    { count: totalPicks },
    { data: poolStates },
  ] = await Promise.all([
    db.from("pools").select("id", { count: "exact", head: true }),
    db.from("pool_members").select("id", { count: "exact", head: true }),
    db.from("picks").select("id", { count: "exact", head: true }),
    db.from("pools").select("state"),
  ]);

  const byState: Record<string, number> = {
    pre_lock: 0,
    post_lock: 0,
    in_progress: 0,
    complete: 0,
  };
  for (const row of poolStates ?? []) {
    const s = row.state as string;
    if (s in byState) byState[s]++;
  }

  return {
    total_pools: totalPools ?? 0,
    total_members: totalMembers ?? 0,
    total_picks: totalPicks ?? 0,
    pools_by_state: byState as Record<PoolState, number>,
  };
}
