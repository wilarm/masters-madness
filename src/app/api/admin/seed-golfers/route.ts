/**
 * POST /api/admin/seed-golfers
 *
 * Seeds (or refreshes) the `golfers` table from the local players.ts dataset.
 * Admin-only. Safe to re-run — upserts on golfer name.
 *
 * Also accepts an optional clear-scores param:
 *   POST /api/admin/seed-golfers?clearScores=true&eventId=401353228
 *   → clears all scores for the given event before seeding
 */

import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId, isPlatformAdmin } from "@/lib/auth";
import { upsertGolfers } from "@/lib/db/golfers";
import { clearScoresForEvent } from "@/lib/db/scores";
import { PLAYERS } from "@/data/players";

export async function POST(req: NextRequest) {
  const userId = await getAuthUserId();
  if (!userId || !isPlatformAdmin(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const clearScores = searchParams.get("clearScores") === "true";
  const eventId = searchParams.get("eventId") ?? undefined;

  // Optionally clear scores for the event
  if (clearScores && eventId) {
    const cleared = await clearScoresForEvent(eventId);
    if (!cleared) {
      return NextResponse.json({ error: "Failed to clear scores" }, { status: 500 });
    }
  }

  // Map players.ts data → DB rows
  const golferRows = PLAYERS.map((p) => ({
    name: p.name,
    country: p.country ?? null,
    world_rank: p.worldRank ?? null,
    odds: p.odds ?? null,
    odds_rank: p.currentRank ?? null,
    tier: p.tier ?? null,
    appearances: p.mastersAppearances ?? 0,
    best_finish: p.bestMastersFinish ?? null,
  }));

  const { inserted, error } = await upsertGolfers(golferRows);
  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    inserted,
    total: golferRows.length,
    ...(clearScores && eventId ? { clearedScoresFor: eventId } : {}),
  });
}
