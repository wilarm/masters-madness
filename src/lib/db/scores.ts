import { createServiceClient } from "@/lib/supabase";

export type ScoreRow = {
  id: string;
  golfer_id: string;
  event_id: string;
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

/** Map from lowercase golfer name → current tournament status */
export type LeaderboardEntry2 = {
  total: number | null;
  position: string | null;
  is_cut: boolean;
  is_wd: boolean;
  rounds: (number | null)[];
};

export async function getScoresForGolfer(
  golferId: string,
  eventId?: string
): Promise<ScoreRow[]> {
  const db = createServiceClient();
  let query = db
    .from("scores")
    .select("*")
    .eq("golfer_id", golferId)
    .order("round", { ascending: true });
  if (eventId) query = (query as any).eq("event_id", eventId);
  const { data, error } = await query;
  if (error || !data) return [];
  return data as ScoreRow[];
}

/**
 * Returns a Map from lowercase golfer name → latest tournament status.
 * Uses the highest round row for each golfer (most current totals).
 */
export async function getLeaderboardMap(
  eventId?: string
): Promise<Map<string, LeaderboardEntry2>> {
  const db = createServiceClient();
  // Fetch all score rows, sorted round DESC so we can take the first per golfer
  let query = db
    .from("scores")
    .select("golfer_id, round, score, total, position, is_cut, is_wd, golfers(name)")
    .order("round", { ascending: false });
  if (eventId) query = (query as any).eq("event_id", eventId);

  const { data, error } = await query;
  if (error || !data) return new Map();

  // We need round scores to build the rounds array — keep all rows then aggregate
  const rowsByGolfer = new Map<string, (typeof data)[0][]>();
  for (const row of data as any[]) {
    const name: string = (row.golfers?.name ?? "").toLowerCase().trim();
    if (!name) continue;
    const arr = rowsByGolfer.get(name) ?? [];
    arr.push(row);
    rowsByGolfer.set(name, arr);
  }

  const map = new Map<string, LeaderboardEntry2>();
  for (const [name, rows] of rowsByGolfer) {
    // rows are sorted round DESC; first row has latest total/position
    const latest = rows[0];
    const rounds: (number | null)[] = [null, null, null, null];
    for (const r of rows) {
      const idx = Number(r.round) - 1;
      if (idx >= 0 && idx < 4) rounds[idx] = r.score ?? null;
    }
    map.set(name, {
      total: latest.total ?? null,
      position: latest.position ?? null,
      is_cut: latest.is_cut ?? false,
      is_wd: latest.is_wd ?? false,
      rounds,
    });
  }

  return map;
}

/** Returns the latest cumulative total score per golfer (legacy, use getLeaderboardMap for new code) */
export async function getCurrentLeaderboard(): Promise<
  Array<{ golfer_id: string; golfer_name: string; total: number | null; position: string | null; is_cut: boolean }>
> {
  const db = createServiceClient();
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
    score?: number | null;
    total?: number | null;
    position?: string | null;
    is_cut?: boolean;
    is_wd?: boolean;
  },
  eventId: string = "default"
): Promise<boolean> {
  const db = createServiceClient();
  const { error } = await db.from("scores").upsert(
    {
      golfer_id: golferId,
      event_id: eventId,
      round,
      ...scoreData,
      captured_at: new Date().toISOString(),
    },
    { onConflict: "golfer_id,event_id,round" }
  );
  if (error) console.error("[db/scores] upsertScore error:", error);
  return !error;
}

export type FullLeaderboardRow = {
  golfer_name: string;
  golfer_country: string | null;
  position: string | null;
  total: number | null;
  rounds: (number | null)[];
  is_cut: boolean;
  is_wd: boolean;
};

/**
 * Returns the full tournament leaderboard sorted by total score (best first).
 * Uses the latest round row per golfer.
 */
export async function getFullLeaderboard(eventId: string): Promise<FullLeaderboardRow[]> {
  const db = createServiceClient();
  const { data, error } = await db
    .from("scores")
    .select("golfer_id, round, score, total, position, is_cut, is_wd, golfers(name, country)")
    .eq("event_id", eventId)
    .order("round", { ascending: false });

  if (error || !data) return [];

  // Aggregate per golfer: latest round for current state, collect round scores
  const byGolfer = new Map<string, { name: string; country: string | null; latest: (typeof data)[0]; rounds: (number | null)[] }>();
  for (const row of data as any[]) {
    const name: string = row.golfers?.name ?? "Unknown";
    const existing = byGolfer.get(name);
    if (!existing) {
      byGolfer.set(name, {
        name,
        country: row.golfers?.country ?? null,
        latest: row,
        rounds: [null, null, null, null],
      });
    }
    const entry = byGolfer.get(name)!;
    const idx = Number(row.round) - 1;
    if (idx >= 0 && idx < 4) entry.rounds[idx] = row.score ?? null;
  }

  const rows: FullLeaderboardRow[] = Array.from(byGolfer.values()).map(({ name, country, latest, rounds }) => ({
    golfer_name: name,
    golfer_country: country,
    position: latest.position ?? null,
    total: latest.total ?? null,
    rounds,
    is_cut: latest.is_cut ?? false,
    is_wd: latest.is_wd ?? false,
  }));

  // Sort: active players by total asc, then CUT, then WD
  rows.sort((a, b) => {
    if (a.is_wd && !b.is_wd) return 1;
    if (!a.is_wd && b.is_wd) return -1;
    if (a.is_cut && !b.is_cut) return 1;
    if (!a.is_cut && b.is_cut) return -1;
    if (a.total === null && b.total === null) return 0;
    if (a.total === null) return 1;
    if (b.total === null) return -1;
    return a.total - b.total;
  });

  return rows;
}

/** Delete all scores for an event (admin: clear between tournaments) */
export async function clearScoresForEvent(eventId: string): Promise<boolean> {
  const db = createServiceClient();
  const { error } = await db.from("scores").delete().eq("event_id", eventId);
  if (error) console.error("[db/scores] clearScoresForEvent error:", error);
  return !error;
}
