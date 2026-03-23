/**
 * scripts/audit-players.ts
 *
 * Audits player data for inconsistencies between:
 *   - DB golfers table (appearances, group_tags, summary)
 *   - Static players.ts (mastersAppearances)
 *
 * Flags:
 *   - Rookie tag missing when appearances == 1 (debut year = 2026)
 *   - Rookie tag set when appearances > 1
 *   - mastersAppearances mismatch between DB and players.ts
 *   - Players in DB but not in players.ts (or vice versa)
 *   - Amateur candidates (no tour wins, first appearance)
 *
 * Run: npx tsx scripts/audit-players.ts
 */

import * as dotenv from "dotenv";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Inline mastersAppearances from players.ts (key = normalized name)
const STATIC_APPEARANCES: Record<string, number> = {
  "scottie scheffler": 5, "rory mcilroy": 18, "bryson dechambeau": 5,
  "jon rahm": 8, "ludvig aberg": 2, "xander schauffele": 8,
  "tommy fleetwood": 8, "collin morikawa": 4, "cameron young": 3,
  "patrick reed": 12, "matt fitzpatrick": 8, "justin rose": 20,
  "chris gotterup": 1, "hideki matsuyama": 13, "viktor hovland": 5,
  "brooks koepka": 10, "justin thomas": 10, "robert macintyre": 3,
  "jordan spieth": 12, "tyrrell hatton": 8, "shane lowry": 8,
  "patrick cantlay": 7, "joaquin niemann": 5, "ben griffin": 1,
  "will zalatoris": 4, "si woo kim": 6, "corey conners": 6,
  "akshay bhatia": 2, "russell henley": 8, "min woo lee": 3,
  "max homa": 4, "jason day": 14, "cameron smith": 8,
  "adam scott": 22, "sepp straka": 4, "sam burns": 5,
  "daniel berger": 6, "sung-jae im": 5, "sahith theegala": 3,
  "marco penge": 1, "wyndham clark": 4, "jacob bridgeman": 1,
  "j.j. spaun": 3, "harris english": 8, "dustin johnson": 12,
  "sergio garcia": 22, "matt mccarty": 1, "alex noren": 8,
  "tony finau": 8, "maverick mcnealy": 2, "ryan gerard": 1,
  "ryan fox": 3, "keegan bradley": 8, "harry hall": 1,
  "aaron rai": 3, "pierceson coody": 1, "john keefer": 1,
  "rasmus neergaard-petersen": 1, "davis thompson": 2, "tom mckibbin": 1,
  "taylor pendrith": 2, "tiger woods": 24, "rasmus hojgaard": 1,
  "nicolai hojgaard": 2, "kurt kitayama": 2, "carlos ortiz": 5,
  "brian harman": 8, "sam stevens": 1, "phil mickelson": 30,
  "michael kim": 2, "andrew novak": 1, "aldrich potgieter": 1,
  "jayden schaper": 1, "nick taylor": 5, "max greyserman": 1,
  "haotong li": 4, "bubba watson": 16, "sami valimaki": 1,
  "davis riley": 3, "kristoffer reitan": 1, "charl schwartzel": 13,
  "brian campbell": 1, "michael brennan": 1, "zach johnson": 20,
  "danny willett": 10, "angel cabrera": 18, "vijay singh": 22,
  "mike weir": 18, "fred couples": 33, "jose maria olazabal": 23,
};

function normalize(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

async function main() {
  const { data: golfers } = await db
    .from("golfers")
    .select("name, appearances, group_tags, summary, odds, odds_rank")
    .order("odds_rank");

  if (!golfers) { console.error("Failed to fetch golfers"); process.exit(1); }

  const issues: { player: string; issue: string; detail: string }[] = [];

  for (const g of golfers) {
    const key = normalize(g.name);
    const tags: string[] = g.group_tags ?? [];
    const dbApps = g.appearances ?? 0;
    const staticApps = STATIC_APPEARANCES[key];

    // 1. Rookie tag logic: appearances == 1 → should have Rookie tag
    //    (convention: appearances counts 2026 debut, so 1 = first ever)
    if (dbApps === 1 && !tags.includes("Rookie")) {
      issues.push({
        player: g.name,
        issue: "MISSING Rookie tag",
        detail: `appearances=${dbApps}, tags=[${tags.join(", ")}]`,
      });
    }
    if (dbApps > 1 && tags.includes("Rookie")) {
      issues.push({
        player: g.name,
        issue: "WRONG Rookie tag",
        detail: `appearances=${dbApps} but tagged Rookie`,
      });
    }

    // 2. Mismatch between DB appearances and players.ts
    if (staticApps !== undefined && staticApps !== dbApps) {
      issues.push({
        player: g.name,
        issue: "APPEARANCES MISMATCH",
        detail: `DB=${dbApps}, players.ts=${staticApps}`,
      });
    }

    // 3. Not in players.ts at all
    if (staticApps === undefined) {
      issues.push({
        player: g.name,
        issue: "MISSING from players.ts",
        detail: `DB has them (appearances=${dbApps}) but no static entry`,
      });
    }

    // 4. Amateur heuristic: appearances==1, no tour wins mentioned, young
    const summaryLower = (g.summary ?? "").toLowerCase();
    const likelyAmateur =
      dbApps === 1 &&
      !tags.includes("LIV") &&
      (summaryLower.includes("amateur") ||
        summaryLower.includes("college") ||
        summaryLower.includes("ncaa"));
    if (likelyAmateur && !tags.includes("Amateur")) {
      issues.push({
        player: g.name,
        issue: "POSSIBLE Amateur tag needed",
        detail: `Summary mentions amateur/college background`,
      });
    }
  }

  // 5. Players in players.ts but not in DB
  const dbNames = new Set(golfers.map((g) => normalize(g.name)));
  for (const [key] of Object.entries(STATIC_APPEARANCES)) {
    if (!dbNames.has(key)) {
      issues.push({
        player: key,
        issue: "MISSING from DB",
        detail: `In players.ts (appearances=${STATIC_APPEARANCES[key]}) but not in DB`,
      });
    }
  }

  // Print report
  if (issues.length === 0) {
    console.log("\n✅ No issues found!");
    return;
  }

  console.log(`\n📋 Player Data Audit — ${issues.length} issues found\n`);
  console.log("─".repeat(80));

  const grouped: Record<string, typeof issues> = {};
  for (const issue of issues) {
    grouped[issue.issue] = grouped[issue.issue] ?? [];
    grouped[issue.issue].push(issue);
  }

  for (const [type, list] of Object.entries(grouped)) {
    console.log(`\n${type} (${list.length})`);
    for (const { player, detail } of list) {
      console.log(`  • ${player.padEnd(35)} ${detail}`);
    }
  }
  console.log("\n" + "─".repeat(80));
}

main();
