/**
 * API-agnostic types for live golf scoring data.
 * Adapters (espn, datagolf, etc.) must return these shapes.
 */

export type GolferScore = {
  /** Golfer's full name exactly as stored in the `golfers` table */
  name: string;
  /** Current cumulative score to par (e.g. -12 = 12 under) */
  total: number | null;
  /** Today's round score to par (null if not yet started) */
  today: number | null;
  /** Hole or round progress, e.g. "F", "Thru 14", "F*" */
  thru: string | null;
  /** Current leaderboard position string, e.g. "T1", "CUT", "WD" */
  position: string | null;
  /** Strokes per round — index 0 = round 1, index 3 = round 4 */
  rounds: (number | null)[];
  /** True if player missed the cut */
  isCut: boolean;
  /** True if player withdrew */
  isWd: boolean;
  /** Current round number (1–4, or the round they cut/WD'd in) */
  currentRound: number;
};

export type TournamentSnapshot = {
  /** External event ID (e.g. ESPN event ID or DataGolf slug) */
  eventId: string;
  /** Human-readable event name */
  eventName: string;
  /** ISO timestamp of when this data was fetched */
  fetchedAt: string;
  /** All golfer scores in the tournament */
  golfers: GolferScore[];
};
