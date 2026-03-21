/**
 * Pool scoring logic.
 *
 * Picks are stored as { "tier-1": "Scottie Scheffler", "tier-2": "Rory McIlroy", ... }
 * For each entry, we:
 *   1. Collect all picked golfer names
 *   2. Look up each golfer's current tournament total from the leaderboard map
 *   3. Take the best `numScoring` totals (lowest = best in golf)
 *   4. Sum them → entry score
 *
 * CUT / WD golfers keep their total at time of cut (no further improvement).
 * Pre-tournament: all totals are null → entry score is null (displayed as "E" / "--")
 */

import { getPicksByPool } from "@/lib/db/picks";
import { getLeaderboardMap } from "@/lib/db/scores";
import type { PoolMember } from "@/lib/db/pools";

export type GolferPickScore = {
  name: string;
  total: number | null;
  isCut: boolean;
  isWd: boolean;
  isCounting: boolean; // true = one of the numScoring best scores
};

export type EntryScore = {
  entryNum: 1 | 2;
  totalScore: number | null; // null = tournament not started
  golferScores: GolferPickScore[];
};

export type PoolStanding = {
  rank: number;
  userId: string;
  displayName: string;
  customTag: string | null;
  /** Best score across all entries (null = no scores yet) */
  score: number | null;
  /** Position movement (placeholder — requires prior snapshot to compute) */
  movement: number;
  entries: EntryScore[];
};

/**
 * Calculate score for a single set of picks against a leaderboard.
 * @param golferPicks  - Map of tierKey → golfer name
 * @param leaderboard  - Map of lowercase name → score data (from getLeaderboardMap)
 * @param numScoring   - Number of best golfers that count (e.g. 4 out of 9)
 */
export function scoreEntry(
  golferPicks: Record<string, string>,
  leaderboard: Map<string, { total: number | null; is_cut: boolean; is_wd: boolean }>,
  numScoring: number
): Omit<EntryScore, "entryNum"> {
  const names = Object.values(golferPicks).filter(Boolean);
  const tournamentStarted = leaderboard.size > 0;

  const golferScores: GolferPickScore[] = names.map((name) => {
    const lb = leaderboard.get(name.toLowerCase().trim());
    return {
      name,
      total: lb?.total ?? null,
      isCut: lb?.is_cut ?? false,
      isWd: lb?.is_wd ?? false,
      isCounting: false, // filled in below
    };
  });

  if (!tournamentStarted) {
    return { totalScore: null, golferScores };
  }

  // Sort by total ascending (best scores first); nulls last
  const sorted = [...golferScores]
    .map((g, i) => ({ g, i }))
    .filter(({ g }) => g.total !== null)
    .sort((a, b) => (a.g.total ?? 0) - (b.g.total ?? 0));

  const countingIndices = new Set(sorted.slice(0, numScoring).map(({ i }) => i));
  for (let i = 0; i < golferScores.length; i++) {
    golferScores[i].isCounting = countingIndices.has(i);
  }

  const totalScore =
    sorted.length > 0
      ? sorted.slice(0, numScoring).reduce((sum, { g }) => sum + (g.total ?? 0), 0)
      : null;

  return { totalScore, golferScores };
}

/**
 * Calculate pool standings for all members.
 * Returns participants sorted by score (best first), with ranks assigned.
 */
export async function getPoolStandings(
  poolId: string,
  members: PoolMember[],
  numScoring: number,
  eventId?: string
): Promise<PoolStanding[]> {
  const [picks, leaderboard] = await Promise.all([
    getPicksByPool(poolId),
    getLeaderboardMap(eventId),
  ]);

  // Group picks by userId
  const picksByUser = new Map<string, typeof picks>();
  for (const p of picks) {
    const arr = picksByUser.get(p.user_id) ?? [];
    arr.push(p);
    picksByUser.set(p.user_id, arr);
  }

  const standings: PoolStanding[] = members.map((m) => {
    const userPicks = picksByUser.get(m.user_id) ?? [];

    const entries: EntryScore[] = userPicks.map((pick) => {
      const { totalScore, golferScores } = scoreEntry(
        pick.golfer_picks,
        leaderboard,
        numScoring
      );
      return { entryNum: pick.entry_num, totalScore, golferScores };
    });

    // Best score across entries (lower = better)
    const bestScore = entries.reduce<number | null>((best, e) => {
      if (e.totalScore === null) return best;
      if (best === null) return e.totalScore;
      return e.totalScore < best ? e.totalScore : best;
    }, null);

    return {
      rank: 0,
      userId: m.user_id,
      displayName: m.display_name ?? "Member",
      customTag: m.custom_tag ?? null,
      score: bestScore,
      movement: 0,
      entries,
    };
  });

  // Sort: scored entries first (lowest score = best), then no-picks last
  standings.sort((a, b) => {
    if (a.score === null && b.score === null) return 0;
    if (a.score === null) return 1;
    if (b.score === null) return -1;
    return a.score - b.score;
  });

  // Assign ranks (tied scores get the same rank)
  let rank = 1;
  for (let i = 0; i < standings.length; i++) {
    if (i > 0 && standings[i].score !== standings[i - 1].score) rank = i + 1;
    standings[i].rank = rank;
  }

  return standings;
}
