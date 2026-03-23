import { createServiceClient } from "@/lib/supabase";

export type GolferRow = {
  id: string;
  name: string;
  country: string | null;
  world_rank: number | null;
  odds: string | null;
  odds_rank: number | null;
  prev_odds: string | null;
  prev_odds_rank: number | null;
  tier: number | null;
  masters_wins: number;
  best_finish: string | null;
  appearances: number;
  age: number | null;
  is_lefty: boolean;
  is_liv: boolean;
  // AI-enriched fields (populated by scripts/enrich-golfers.ts)
  summary: string | null;
  bull_case: string | null;
  bear_case: string | null;
  recent_form: string | null;
  group_tags: string[] | null;
  updated_at: string;
};

/** Positive = moved up (trending up), negative = moved down, 0 = no change */
export function oddsMovement(g: GolferRow): number {
  if (g.prev_odds_rank == null || g.odds_rank == null) return 0;
  return g.prev_odds_rank - g.odds_rank;
}

export async function getAllGolfers(): Promise<GolferRow[]> {
  const db = createServiceClient();
  const { data, error } = await db
    .from("golfers")
    .select("*")
    .order("odds_rank", { ascending: true, nullsFirst: false });
  if (error || !data) return [];
  return data as GolferRow[];
}

export async function getGolfersByTier(tier: number): Promise<GolferRow[]> {
  const db = createServiceClient();
  const { data, error } = await db
    .from("golfers")
    .select("*")
    .eq("tier", tier)
    .order("odds_rank", { ascending: true });
  if (error || !data) return [];
  return data as GolferRow[];
}

export async function getGolferByName(
  name: string
): Promise<GolferRow | null> {
  const db = createServiceClient();
  const { data, error } = await db
    .from("golfers")
    .select("*")
    .ilike("name", name)
    .single();
  if (error || !data) return null;
  return data as GolferRow;
}

export type UpsertGolferInput = {
  name: string;
  country?: string | null;
  world_rank?: number | null;
  odds?: string | null;
  odds_rank?: number | null;
  tier?: number | null;
  masters_wins?: number;
  best_finish?: string | null;
  appearances?: number;
  age?: number | null;
  is_lefty?: boolean;
  is_liv?: boolean;
};

/** Bulk upsert golfers by name (idempotent — safe to run multiple times) */
export async function upsertGolfers(
  golfers: UpsertGolferInput[]
): Promise<{ inserted: number; error: string | null }> {
  if (golfers.length === 0) return { inserted: 0, error: null };
  const db = createServiceClient();
  const now = new Date().toISOString();
  const rows = golfers.map((g) => ({
    ...g,
    masters_wins: g.masters_wins ?? 0,
    appearances: g.appearances ?? 0,
    is_lefty: g.is_lefty ?? false,
    is_liv: g.is_liv ?? false,
    updated_at: now,
  }));
  const { error, count } = await db
    .from("golfers")
    .upsert(rows, { onConflict: "name", count: "exact" });
  if (error) {
    console.error("[db/golfers] upsertGolfers error:", error);
    return { inserted: 0, error: error.message };
  }
  return { inserted: count ?? golfers.length, error: null };
}

export type OddsUpdateInput = {
  name: string;
  odds: string;
  odds_rank: number;
  tier: number;
};

/**
 * Updates odds for a list of golfers, automatically snapshotting the current
 * odds → prev_odds / prev_odds_rank before overwriting. Uses a DB function so
 * the snapshot and update happen atomically. Run this each time a new odds
 * sheet comes in — trends on the research page always compare against the
 * previous snapshot.
 */
export async function updateGolferOdds(
  updates: OddsUpdateInput[]
): Promise<{ updated: number; error: string | null }> {
  if (updates.length === 0) return { updated: 0, error: null };
  const db = createServiceClient();

  let updated = 0;
  const errors: string[] = [];

  for (const u of updates) {
    const { error } = await db.rpc("update_golfer_odds", {
      p_name:      u.name,
      p_odds:      u.odds,
      p_odds_rank: u.odds_rank,
      p_tier:      u.tier,
    });
    if (error) errors.push(`${u.name}: ${error.message}`);
    else updated++;
  }

  if (errors.length > 0) return { updated, error: errors.slice(0, 5).join("; ") };
  return { updated, error: null };
}

/** Returns a map of lowercase golfer name → golfer id for fast score lookups */
export async function getGolferNameToIdMap(): Promise<Map<string, string>> {
  const db = createServiceClient();
  const { data, error } = await db.from("golfers").select("id, name");
  if (error || !data) return new Map();
  const map = new Map<string, string>();
  for (const row of data as { id: string; name: string }[]) {
    map.set(row.name.toLowerCase().trim(), row.id);
  }
  return map;
}
