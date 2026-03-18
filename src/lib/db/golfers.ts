import { createServiceClient } from "@/lib/supabase";

export type GolferRow = {
  id: string;
  name: string;
  country: string | null;
  world_rank: number | null;
  odds: string | null;
  odds_rank: number | null;
  tier: number | null;
  masters_wins: number;
  best_finish: string | null;
  appearances: number;
  age: number | null;
  is_lefty: boolean;
  is_liv: boolean;
  updated_at: string;
};

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
