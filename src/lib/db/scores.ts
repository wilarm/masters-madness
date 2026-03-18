import { createServiceClient } from "@/lib/supabase";

export type ScoreRow = {
  id: string;
  golfer_id: string;
  round: 1 | 2 | 3 | 4;
  score: number | null;
  total: number | null;
  position: string | null;
  is_cut: boolean;
  is_wd: boolean;
  captured_at: string;
};

/** Full leaderboard with golfer name joined */
export type LeaderboardEntry = ScoreRow & {
  golfer_name: string;
  golfer_country: string | null;
  golfer_tier: number | null;
};

export async function getScoresForGolfer(
  golferId: string
): Promise<ScoreRow[]> {
  const db = createServiceClient();
  const { data, error } = await db
    .from("scores")
    .select("*")
    .eq("golfer_id", golferId)
    .order("round", { ascending: true });
  if (error || !data) return [];
  return data as ScoreRow[];
}

/** Returns the latest cumulative total score per golfer */
export async function getCurrentLeaderboard(): Promise<
  Array<{ golfer_id: string; golfer_name: string; total: number | null; position: string | null; is_cut: boolean }>
> {
  const db = createServiceClient();
  // Get max round played per golfer, then join to get total
  const { data, error } = await db
    .from("scores")
    .select("golfer_id, total, position, is_cut, golfers(name)")
    .order("total", { ascending: true, nullsFirst: false });
  if (error || !data) return [];
  return (data as any[]).map((row) => ({
    golfer_id: row.golfer_id,
    golfer_name: row.golfers?.name ?? "Unknown",
    total: row.total,
    position: row.position,
    is_cut: row.is_cut,
  }));
}

export async function upsertScore(
  golferId: string,
  round: 1 | 2 | 3 | 4,
  scoreData: {
    score?: number;
    total?: number;
    position?: string;
    is_cut?: boolean;
    is_wd?: boolean;
  }
): Promise<boolean> {
  const db = createServiceClient();
  const { error } = await db.from("scores").upsert(
    {
      golfer_id: golferId,
      round,
      ...scoreData,
      captured_at: new Date().toISOString(),
    },
    { onConflict: "golfer_id,round" }
  );
  return !error;
}
