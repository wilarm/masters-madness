/**
 * Golf data adapter entrypoint.
 *
 * Set GOLF_ADAPTER env var to switch data sources:
 *   "espn"     (default) — ESPN unofficial scoreboard API, no key required
 *   "datagolf" — DataGolf API (requires DATAGOLF_API_KEY, supports all PGA events)
 *
 * Each adapter must export:
 *   fetchTournamentScores(eventId: string): Promise<TournamentSnapshot | null>
 */

export { fetchTournamentScores } from "./espn-adapter";
export type { GolferScore, TournamentSnapshot } from "./types";
