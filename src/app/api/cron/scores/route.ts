/**
 * GET /api/cron/scores
 *
 * Fetches live golf scores from the ESPN scoreboard API and upserts them into Supabase.
 * Called by Vercel Cron every 10 minutes (vercel.json).
 *
 * Event discovery (no manual config needed):
 *   - GOLF_EVENT_ID env var → use this specific event (useful for testing or overriding)
 *   - Not set               → auto-discovers the current PGA Tour event from ESPN's
 *                             scoreboard endpoint; switches to new events automatically
 *                             each Thursday when a new tournament starts
 *
 * Optional env vars:
 *   CRON_SECRET   — shared secret; Vercel sets as Authorization header
 *   GOLF_EVENT_ID — override to pin to a specific ESPN event ID
 */

import { NextRequest, NextResponse } from "next/server";
import { fetchTournamentScores } from "@/lib/golf";
import { getGolferNameToIdMap } from "@/lib/db/golfers";
import { upsertScore } from "@/lib/db/scores";
import { setCurrentEvent } from "@/lib/db/settings";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  // Verify cron secret (Vercel sets this via vercel.json Authorization header)
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Use pinned event ID if set, otherwise auto-discover from ESPN
  const pinnedEventId = process.env.GOLF_EVENT_ID || undefined;

  // 1. Fetch live scores (auto-discovers current event if no ID given)
  const snapshot = await fetchTournamentScores(pinnedEventId);
  if (!snapshot) {
    return NextResponse.json({ error: "Failed to fetch golf scores from ESPN" }, { status: 502 });
  }

  // 2. Persist the current event to settings so other pages can read it
  await setCurrentEvent({
    eventId: snapshot.eventId,
    eventName: snapshot.eventName,
    updatedAt: snapshot.fetchedAt,
  });

  // 3. Load golfer name → DB id map
  const nameToId = await getGolferNameToIdMap();

  // 4. Upsert each golfer's round scores
  let upserted = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const golfer of snapshot.golfers) {
    const golferId = nameToId.get(golfer.name.toLowerCase().trim());
    if (!golferId) {
      skipped++;
      continue;
    }

    for (let i = 0; i < golfer.rounds.length; i++) {
      const roundScore = golfer.rounds[i];
      if (roundScore === null) continue;

      const round = (i + 1) as 1 | 2 | 3 | 4;
      const ok = await upsertScore(
        golferId,
        round,
        {
          score: roundScore,
          total: golfer.total,
          position: golfer.position,
          is_cut: golfer.isCut,
          is_wd: golfer.isWd,
        },
        snapshot.eventId
      );

      if (ok) upserted++;
      else errors.push(`${golfer.name} R${round}`);
    }
  }

  console.log(
    `[cron/scores] event="${snapshot.eventName}" (${snapshot.eventId}) golfers=${snapshot.golfers.length} upserted=${upserted} skipped=${skipped} errors=${errors.length}`
  );

  return NextResponse.json({
    ok: true,
    event: snapshot.eventName,
    eventId: snapshot.eventId,
    autoDiscovered: !pinnedEventId,
    fetchedAt: snapshot.fetchedAt,
    golfers: snapshot.golfers.length,
    upserted,
    skipped,
    errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
  });
}
