/**
 * ESPN Unofficial Golf API Adapter
 *
 * Endpoint: https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard?event={eventId}
 * No API key required. Free, unofficial — use at your own risk.
 *
 * ⚠️  VERIFY RESPONSE SHAPE before going live:
 *   curl "https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard?event={eventId}" | jq .
 *
 * To swap to DataGolf or another provider, create a new adapter file implementing
 * the same `fetchTournamentScores(eventId)` signature and update GOLF_ADAPTER in
 * src/lib/golf/index.ts.
 */

import type { GolferScore, TournamentSnapshot } from "./types";

const ESPN_BASE = "https://site.api.espn.com/apis/site/v2/sports/golf/pga/scoreboard";

// Status name strings returned by the ESPN API
const CUT_STATUSES = new Set(["STATUS_CUT", "STATUS_MISSED_CUT"]);
const WD_STATUSES = new Set(["STATUS_WITHDRAWN", "STATUS_WD", "STATUS_DISQUALIFIED", "STATUS_DQ"]);

function parseScore(raw: string | number | null | undefined): number | null {
  if (raw === null || raw === undefined || raw === "") return null;
  const s = String(raw).replace(/\*/g, "").trim();
  if (s === "E" || s === "0") return 0;
  const n = Number(s);
  return isNaN(n) ? null : n;
}

function parseRounds(linescores: unknown[]): (number | null)[] {
  if (!Array.isArray(linescores)) return [null, null, null, null];
  const rounds: (number | null)[] = [null, null, null, null];
  for (const ls of linescores as Record<string, unknown>[]) {
    // ESPN linescores use `period` (1-indexed round) and `displayValue` or `value`
    const period = Number(ls.period ?? ls.period);
    const val = parseScore((ls.displayValue ?? ls.value) as string | number | null);
    if (period >= 1 && period <= 4) rounds[period - 1] = val;
  }
  return rounds;
}

function extractPosition(statistics: unknown[]): string | null {
  if (!Array.isArray(statistics)) return null;
  for (const stat of statistics as Record<string, unknown>[]) {
    if (stat.name === "position" || stat.abbreviation === "POS") {
      return String(stat.displayValue ?? stat.value ?? "").trim() || null;
    }
  }
  return null;
}

function parseCompetitor(comp: Record<string, unknown>, eventId: string): GolferScore | null {
  const athlete = comp.athlete as Record<string, unknown> | undefined;
  const name = (athlete?.displayName as string | undefined)?.trim();
  if (!name) return null;

  const statusObj = comp.status as Record<string, unknown> | undefined;
  const statusType = statusObj?.type as Record<string, unknown> | undefined;
  const statusName = String(statusType?.name ?? statusType?.id ?? "").toUpperCase();
  const period = Number(statusObj?.period ?? 0);

  const isCut = CUT_STATUSES.has(statusName);
  const isWd = WD_STATUSES.has(statusName);

  // `score` on the competitor is the cumulative total-to-par string (e.g. "-12", "E", "+3")
  const rawTotal = (comp.score as string | number | undefined) ?? null;
  const total = parseScore(rawTotal);

  // Today's round score (look in statistics for "today" or derive from linescores)
  const statistics = (comp.statistics as unknown[]) ?? [];
  let today: number | null = null;
  for (const stat of statistics as Record<string, unknown>[]) {
    const n = String(stat.name ?? "").toLowerCase();
    if (n === "today" || n === "roundscore" || n === "round_score") {
      today = parseScore((stat.displayValue ?? stat.value) as string | number | null);
      break;
    }
  }

  // Thru info (e.g. "Thru 14", "F", "F*")
  const thru =
    (statusType?.shortDetail as string | undefined) ??
    (statusType?.detail as string | undefined) ??
    null;

  const linescores = (comp.linescores as unknown[]) ?? [];
  const rounds = parseRounds(linescores);

  // Derive currentRound from linescores length or period
  const playedRounds = rounds.filter((r) => r !== null).length;
  const currentRound = Math.max(period, playedRounds, 1);

  const position = extractPosition(statistics);

  return {
    name,
    total,
    today,
    thru,
    position: isCut ? "CUT" : isWd ? "WD" : position,
    rounds,
    isCut,
    isWd,
    currentRound,
  };
}

/**
 * Fetch scores for a specific event, or the currently-active PGA Tour event.
 * If eventId is omitted, calls the scoreboard without a filter — ESPN returns
 * the current or most-recently-completed event automatically.
 */
export async function fetchTournamentScores(eventId?: string): Promise<TournamentSnapshot | null> {
  const url = eventId
    ? `${ESPN_BASE}?event=${encodeURIComponent(eventId)}`
    : ESPN_BASE;

  let json: Record<string, unknown>;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "MastersMadness/1.0" },
      next: { revalidate: 0 }, // always fresh in cron context
    });
    if (!res.ok) {
      console.error(`[espn] HTTP ${res.status}${eventId ? ` for event ${eventId}` : " (auto-discover)"}`);
      return null;
    }
    json = (await res.json()) as Record<string, unknown>;
  } catch (err) {
    console.error("[espn] fetch error:", err);
    return null;
  }

  // Navigate: json.events[0].competitions[0].competitors
  const events = (json.events as unknown[]) ?? [];
  const event = events[0] as Record<string, unknown> | undefined;
  if (!event) {
    console.error("[espn] No events in response. Full response:", JSON.stringify(json).slice(0, 500));
    return null;
  }

  // Use the event ID from the response (handles auto-discovery case)
  const discoveredEventId = String(event.id ?? eventId ?? "unknown");
  const eventName = (event.name as string | undefined) ?? "PGA Tour Event";
  const competitions = (event.competitions as unknown[]) ?? [];
  const competition = competitions[0] as Record<string, unknown> | undefined;
  if (!competition) return null;

  const competitors = (competition.competitors as unknown[]) ?? [];
  const golfers: GolferScore[] = [];
  for (const c of competitors) {
    const parsed = parseCompetitor(c as Record<string, unknown>, discoveredEventId);
    if (parsed) golfers.push(parsed);
  }

  return {
    eventId: discoveredEventId,
    eventName,
    fetchedAt: new Date().toISOString(),
    golfers,
  };
}
