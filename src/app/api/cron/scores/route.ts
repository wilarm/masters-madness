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

/**
 * ESPN name → canonical DB name aliases.
 *
 * ESPN sometimes uses different spellings, hyphenation, accents, or
 * initials than what we seeded in the DB. Add entries here any time
 * a player is getting skipped during the tournament. Keys are
 * lowercase-trimmed ESPN names; values are the exact DB name.
 *
 * To diagnose: check the `skipped` count in cron logs and cross-reference
 * with the ESPN payload to find unmatched names.
 */
const ESPN_NAME_ALIASES: Record<string, string> = {
  // Hyphenation variants
  "sungjae im":                    "Sung-Jae Im",
  "sung jae im":                   "Sung-Jae Im",
  "si-woo kim":                    "Si Woo Kim",
  "min-woo lee":                   "Min Woo Lee",
  "jj spaun":                      "J.J. Spaun",
  "j.j spaun":                     "J.J. Spaun",

  // Accent / diacritic variants
  "jose maria olazabal":           "Jose Maria Olazabal",
  "josé maría olazábal":           "Jose Maria Olazabal",
  "joaquín niemann":               "Joaquin Niemann",
  "sebastián muñoz":               "Sebastian Munoz",
  "haotong li":                    "Haotong Li",
  "sami välimäki":                 "Sami Valimaki",

  // First-name / middle-name variants
  "rory mcilroy":                  "Rory McIlroy",   // sometimes "McIlroy" vs "Mcilroy"
  "ludvig åberg":                  "Ludvig Aberg",
  "rasmus højgaard":               "Rasmus Hojgaard",
  "nicolai højgaard":              "Nicolai Hojgaard",
  "rasmus neergaard-petersen":     "Rasmus Neergaard-Petersen",

  // Common abbreviation / display name variants
  "matt fitzpatrick":              "Matt Fitzpatrick",
  "matthew fitzpatrick":           "Matt Fitzpatrick",
  "robert macintyre":              "Robert MacIntyre",
  "bob macintyre":                 "Robert MacIntyre",
  "cam smith":                     "Cameron Smith",
  "cam young":                     "Cameron Young",
  "alex norén":                    "Alex Noren",
  "alex noren":                    "Alex Noren",
  "sepp straka":                   "Sepp Straka",
  "bryson dechambeau":             "Bryson DeChambeau",
  "collin morikawa":               "Collin Morikawa",
  "hideki matsuyama":              "Hideki Matsuyama",
  "christiaan bezuidenhout":       "Christiaan Bezuidenhout",
  "tom mckibbin":                  "Tom McKibbin",
  "kristoffer reitan":             "Kristoffer Reitan",
  "aldrich potgieter":             "Aldrich Potgieter",
  "jayden schaper":                "Jayden Schaper",
  "rasmus neergaard petersen":     "Rasmus Neergaard-Petersen",
  "marco penge":                   "Marco Penge",
  "pierceson coody":               "Pierceson Coody",

  // Sam / Samuel variants
  "samuel stevens":                "Sam Stevens",

  // New 2026 field additions
  "nicolas echavarria":            "Nicolas Echavarria",
  "casey jarvis":                  "Casey Jarvis",
  "naoyuki kataoka":               "Naoyuki Kataoka",
  "ethan fang":                    "Ethan Fang",
  "jackson herrington":            "Jackson Herrington",
  "brandon holtz":                 "Brandon Holtz",
  "mason howell":                  "Mason Howell",
  "fifa laopakdee":                "Fifa Laopakdee",
  "mateo pulcini":                 "Mateo Pulcini",
};

/** Strip diacritics for fuzzy comparison (Å→a, é→e, etc.) */
function normalizeName(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

/** Resolves an ESPN display name to the canonical DB name.
 *  1. Checks the static alias map first (fast, exact).
 *  2. Falls back to fuzzy last-name matching against known DB names
 *     (catches first-name variants like "Matthew" vs "Matt" automatically).
 */
function resolveGolferName(
  espnName: string,
  knownDbNames?: Set<string>
): { resolved: string; method: "exact" | "alias" | "fuzzy" | "unmatched" } {
  // Normalize diacritics so Åberg === Aberg, etc.
  const key = normalizeName(espnName);

  // 1. Static alias map (keys are already normalized in the map above)
  if (ESPN_NAME_ALIASES[key]) {
    return { resolved: ESPN_NAME_ALIASES[key], method: "alias" };
  }

  // 2. Exact match after diacritic normalization
  if (!knownDbNames) {
    return { resolved: espnName, method: "exact" };
  }

  // Check if normalized key matches any DB name when both are normalized
  for (const dbName of knownDbNames) {
    if (normalizeName(dbName) === key) {
      return { resolved: dbName, method: "exact" };
    }
  }

  // 3. Fuzzy: last-name match — only safe when exactly one DB name shares the last name
  const espnLast = key.split(" ").pop() ?? "";
  const fuzzyMatches = [...knownDbNames].filter((dbName) => {
    const dbLast = dbName.split(" ").pop()?.toLowerCase() ?? "";
    return dbLast === espnLast;
  });

  if (fuzzyMatches.length === 1) {
    return { resolved: fuzzyMatches[0], method: "fuzzy" };
  }

  return { resolved: espnName, method: "unmatched" };
}

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

  // 3. Load golfer name → DB id map + build a set of known canonical names for fuzzy matching
  const nameToId = await getGolferNameToIdMap();
  const knownDbNames = new Set(nameToId.keys().map((k) => {
    // nameToId keys are already lowercase; reconstruct proper-case from values isn't possible here,
    // so we store the original-case names separately via a second pass
    return k;
  }));
  // Proper-case names for fuzzy matching (last-name comparison needs original casing)
  const canonicalNames = new Set<string>();
  nameToId.forEach((_, k) => canonicalNames.add(
    k.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
  ));

  // 4. Upsert each golfer's round scores
  let upserted = 0;
  let skipped = 0;
  const errors: string[] = [];
  const aliasResolved: string[] = [];
  const skippedNames: string[] = [];

  for (const golfer of snapshot.golfers) {
    const { resolved: resolvedName, method } = resolveGolferName(golfer.name, canonicalNames);
    if (method === "alias" || method === "fuzzy") {
      aliasResolved.push(`${golfer.name}→${resolvedName} (${method})`);
    }
    const golferId = nameToId.get(resolvedName.toLowerCase().trim());
    if (!golferId) {
      skipped++;
      skippedNames.push(golfer.name);
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
  if (aliasResolved.length > 0) console.log(`[cron/scores] alias-resolved: ${aliasResolved.join(", ")}`);
  if (skippedNames.length > 0) console.log(`[cron/scores] skipped-names (add to alias map if valid): ${skippedNames.slice(0, 20).join(", ")}`);

  return NextResponse.json({
    ok: true,
    event: snapshot.eventName,
    eventId: snapshot.eventId,
    autoDiscovered: !pinnedEventId,
    fetchedAt: snapshot.fetchedAt,
    golfers: snapshot.golfers.length,
    upserted,
    skipped,
    skippedNames: skippedNames.length > 0 ? skippedNames.slice(0, 20) : undefined,
    aliasResolved: aliasResolved.length > 0 ? aliasResolved : undefined,
    errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
  });
}
