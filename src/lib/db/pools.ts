import { createServiceClient } from "@/lib/supabase";
import type { PoolState } from "@/lib/pool-state";
import type { PoolRole } from "@/lib/auth";

const PAGE_SIZE = 10;

export type PoolMember = {
  id: string;
  pool_id: string;
  user_id: string;
  role: PoolRole;
  display_name: string | null;
  custom_tag: string | null;
  paid: boolean;
  joined_at: string;
};

export type Pool = {
  id: string;
  slug: string;
  name: string;
  config: Record<string, unknown>;
  created_by: string;
  state: PoolState;
  created_at: string;
  updated_at: string;
};

/** Pool with the current user's role attached */
export type PoolWithRole = Pool & { myRole: PoolRole };

/** Pool with embedded member count */
export type PoolWithCount = Pool & { memberCount: number };

export async function getPoolBySlug(slug: string): Promise<Pool | null> {
  const db = createServiceClient();
  const { data, error } = await db
    .from("pools")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error || !data) return null;
  return data as Pool;
}

export async function getPoolsByUser(userId: string): Promise<Pool[]> {
  const db = createServiceClient();
  const { data, error } = await db
    .from("pools")
    .select("*")
    .eq("created_by", userId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as Pool[];
}

/** Returns all pools a user belongs to, with their role in each pool. */
export async function getPoolsForUser(userId: string): Promise<PoolWithRole[]> {
  const db = createServiceClient();
  const { data, error } = await db
    .from("pool_members")
    .select("role, pools(*)")
    .eq("user_id", userId)
    .order("joined_at", { ascending: false });
  if (error || !data) return [];
  return (data as unknown as { role: PoolRole; pools: Pool }[])
    .map((row) => ({ ...row.pools, myRole: row.role }))
    .filter((p): p is PoolWithRole => !!p.id);
}

/** Returns paginated list of all pools (for discovery/join page). */
export async function getPublicPools(
  page: number = 1,
  search: string = ""
): Promise<{ pools: PoolWithCount[]; total: number }> {
  const db = createServiceClient();
  const offset = (page - 1) * PAGE_SIZE;

  let query = db
    .from("pools")
    .select("*, pool_members(count)", { count: "exact" });

  if (search.trim()) {
    query = query.ilike("name", `%${search.trim()}%`);
  }

  const { data, count, error } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (error || !data) return { pools: [], total: 0 };

  type PoolRow = Pool & { pool_members: Array<{ count: number }> };
  const pools: PoolWithCount[] = (data as unknown as PoolRow[]).map((row) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    config: row.config,
    created_by: row.created_by,
    state: row.state,
    created_at: row.created_at,
    updated_at: row.updated_at,
    memberCount: Array.isArray(row.pool_members)
      ? (row.pool_members[0]?.count ?? 0)
      : 0,
  }));

  return { pools, total: count ?? 0 };
}

export type CreatePoolInput = {
  slug: string;
  name: string;
  config: Record<string, unknown>;
  created_by: string;
};

export async function createPool(input: CreatePoolInput): Promise<Pool | null> {
  const db = createServiceClient();
  const { data, error } = await db
    .from("pools")
    .insert({ ...input, state: "pre_lock" })
    .select()
    .single();
  if (error || !data) {
    console.error("[db/pools] createPool error:", error);
    return null;
  }
  return data as Pool;
}

export async function updatePoolState(
  poolId: string,
  state: PoolState
): Promise<boolean> {
  const db = createServiceClient();
  const { error } = await db
    .from("pools")
    .update({ state })
    .eq("id", poolId);
  return !error;
}

export async function isPoolMember(
  poolId: string,
  userId: string
): Promise<boolean> {
  const db = createServiceClient();
  const { count } = await db
    .from("pool_members")
    .select("id", { count: "exact", head: true })
    .eq("pool_id", poolId)
    .eq("user_id", userId);
  return (count ?? 0) > 0;
}

export async function addPoolMember(
  poolId: string,
  userId: string,
  role: "commissioner" | "player" | "co_player" | "viewer" = "player",
  displayName?: string
): Promise<boolean> {
  const db = createServiceClient();
  const { error } = await db.from("pool_members").upsert(
    { pool_id: poolId, user_id: userId, role, display_name: displayName ?? null },
    { onConflict: "pool_id,user_id" }
  );
  return !error;
}

export async function getPoolMembers(poolId: string): Promise<PoolMember[]> {
  const db = createServiceClient();
  const { data, error } = await db
    .from("pool_members")
    .select("*")
    .eq("pool_id", poolId)
    .order("joined_at", { ascending: true });
  if (error || !data) return [];
  return data as PoolMember[];
}

export async function updateMemberDisplayName(
  poolId: string,
  userId: string,
  displayName: string
): Promise<boolean> {
  const db = createServiceClient();
  const { error } = await db
    .from("pool_members")
    .update({ display_name: displayName })
    .eq("pool_id", poolId)
    .eq("user_id", userId);
  return !error;
}

export async function updateMember(
  poolId: string,
  userId: string,
  updates: Partial<{
    paid: boolean;
    role: PoolRole;
    custom_tag: string | null;
    display_name: string | null;
  }>
): Promise<boolean> {
  const db = createServiceClient();
  const { error } = await db
    .from("pool_members")
    .update(updates)
    .eq("pool_id", poolId)
    .eq("user_id", userId);
  return !error;
}

export async function removeMember(
  poolId: string,
  userId: string
): Promise<boolean> {
  const db = createServiceClient();
  const { error } = await db
    .from("pool_members")
    .delete()
    .eq("pool_id", poolId)
    .eq("user_id", userId);
  return !error;
}

export async function updatePoolSettings(
  poolId: string,
  updates: { name?: string; config?: Record<string, unknown> }
): Promise<boolean> {
  const db = createServiceClient();
  const { error } = await db.from("pools").update(updates).eq("id", poolId);
  return !error;
}
