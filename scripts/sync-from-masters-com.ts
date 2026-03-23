/**
 * scripts/sync-from-masters-com.ts
 *
 * Syncs all player data from the official masters.com JSON feed:
 *   https://www.masters.com/en_US/cms/feeds/players/2026/players.json
 *
 * For each player in the feed, updates our DB with authoritative data:
 *   - age (exact DOB-based age from masters.com)
 *   - is_lefty (swing === "Left")
 *   - masters_wins (official win count)
 *   - appearances (1 if first_masters=true; kept/flagged otherwise)
 *   - group_tags: ensures Champ, Amateur, Intl, Rookie are accurate
 *
 * Also reports:
 *   - Players in masters.com but not in our DB (need to be added)
 *   - Players in our DB but not in masters.com (withdrawn / not qualified)
 *   - Rookie tag mismatches (first_masters vs appearances)
 *
 * Run: npx tsx scripts/sync-from-masters-com.ts
 * Dry run: npx tsx scripts/sync-from-masters-com.ts --dry-run
 */

import * as dotenv from "dotenv";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DRY_RUN = process.argv.includes("--dry-run");

/** Strip diacritics and lowercase for fuzzy matching.
 *  NFD handles most accents (é→e, ä→a, å→a) but ø/æ/ß are atomic —
 *  explicitly map those before stripping combining chars. */
function norm(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")   // strip combining diacritics
    .replace(/ø/gi, "o")               // ø → o  (Danish/Norwegian)
    .replace(/æ/gi, "ae")              // æ → ae (Danish/Norwegian)
    .replace(/ß/gi, "ss")              // ß → ss (German)
    .replace(/ð/gi, "d")               // ð → d  (Icelandic)
    .replace(/þ/gi, "th")              // þ → th (Icelandic)
    .toLowerCase()
    .trim();
}

// ── Authoritative 2026 Masters field from masters.com JSON ──────────────────
// Fetched 2026-03-23 from:
// https://www.masters.com/en_US/cms/feeds/players/2026/players.json
interface MastersPlayer {
  display_name: string;     // e.g. "Rory McIlroy"
  age: number;
  swing: "Left" | "Right";
  past_champion: boolean;
  masters_wins: number;     // 0 if not a past champ
  amateur: boolean;
  first_masters: boolean;   // true = 2026 is their debut
  international: boolean;
}

const MASTERS_FIELD: MastersPlayer[] = [
  { display_name: "Ludvig Åberg",                age: 26, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: false, international: true  },
  { display_name: "Akshay Bhatia",               age: 24, swing: "Left",  past_champion: false, masters_wins: 0, amateur: false, first_masters: false, international: false },
  { display_name: "Keegan Bradley",              age: 39, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: false, international: false },
  { display_name: "Michael Brennan",             age: 24, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: true,  international: false },
  { display_name: "Jacob Bridgeman",             age: 26, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: true,  international: false },
  { display_name: "Sam Burns",                   age: 29, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: false, international: false },
  { display_name: "Ángel Cabrera",               age: 56, swing: "Right", past_champion: true,  masters_wins: 1, amateur: false, first_masters: false, international: true  },
  { display_name: "Brian Campbell",              age: 33, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: false, international: false },
  { display_name: "Patrick Cantlay",             age: 34, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: false, international: false },
  { display_name: "Wyndham Clark",               age: 32, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: false, international: false },
  { display_name: "Corey Conners",               age: 34, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: false, international: true  },
  { display_name: "Fred Couples",                age: 66, swing: "Right", past_champion: true,  masters_wins: 1, amateur: false, first_masters: false, international: false },
  { display_name: "Jason Day",                   age: 38, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: false, international: true  },
  { display_name: "Bryson DeChambeau",           age: 32, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: false, international: false },
  { display_name: "Nicolas Echavarria",          age: 32, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: false, international: true  },
  { display_name: "Harris English",              age: 36, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: false, international: false },
  { display_name: "Ethan Fang",                  age: 20, swing: "Right", past_champion: false, masters_wins: 0, amateur: true,  first_masters: true,  international: false },
  { display_name: "Matt Fitzpatrick",            age: 31, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: false, international: true  },
  { display_name: "Tommy Fleetwood",             age: 35, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: false, international: true  },
  { display_name: "Ryan Fox",                    age: 39, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: false, international: true  },
  { display_name: "Sergio García",               age: 46, swing: "Right", past_champion: true,  masters_wins: 1, amateur: false, first_masters: false, international: true  },
  { display_name: "Ryan Gerard",                 age: 26, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: true,  international: false },
  { display_name: "Chris Gotterup",              age: 26, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: true,  international: false },
  { display_name: "Max Greyserman",              age: 30, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: false, international: false },
  { display_name: "Ben Griffin",                 age: 29, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: true,  international: false },
  { display_name: "Harry Hall",                  age: 28, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: true,  international: true  },
  { display_name: "Brian Harman",                age: 39, swing: "Left",  past_champion: false, masters_wins: 0, amateur: false, first_masters: false, international: false },
  { display_name: "Tyrrell Hatton",              age: 34, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: false, international: true  },
  { display_name: "Russell Henley",              age: 36, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: false, international: false },
  { display_name: "Jackson Herrington",          age: 19, swing: "Left",  past_champion: false, masters_wins: 0, amateur: true,  first_masters: true,  international: false },
  { display_name: "Rasmus Højgaard",             age: 25, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: false, international: true  },
  { display_name: "Brandon Holtz",               age: 39, swing: "Right", past_champion: false, masters_wins: 0, amateur: true,  first_masters: true,  international: false },
  { display_name: "Max Homa",                    age: 35, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: false, international: false },
  { display_name: "Viktor Hovland",              age: 28, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: false, international: true  },
  { display_name: "Mason Howell",                age: 18, swing: "Right", past_champion: false, masters_wins: 0, amateur: true,  first_masters: true,  international: false },
  { display_name: "Sungjae Im",                  age: 27, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: false, international: true  },
  { display_name: "Casey Jarvis",                age: 22, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: true,  international: true  },
  { display_name: "Dustin Johnson",              age: 41, swing: "Right", past_champion: true,  masters_wins: 1, amateur: false, first_masters: false, international: false },
  { display_name: "Zach Johnson",                age: 50, swing: "Right", past_champion: true,  masters_wins: 1, amateur: false, first_masters: false, international: false },
  { display_name: "Naoyuki Kataoka",             age: 28, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: true,  international: true  },
  { display_name: "John Keefer",                 age: 25, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: true,  international: false },
  { display_name: "Michael Kim",                 age: 32, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: false, international: false },
  { display_name: "Si Woo Kim",                  age: 30, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: false, international: true  },
  { display_name: "Kurt Kitayama",               age: 33, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: false, international: false },
  { display_name: "Brooks Koepka",               age: 35, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: false, international: false },
  { display_name: "Fifa Laopakdee",              age: 21, swing: "Right", past_champion: false, masters_wins: 0, amateur: true,  first_masters: true,  international: true  },
  { display_name: "Min Woo Lee",                 age: 27, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: false, international: true  },
  { display_name: "Haotong Li",                  age: 30, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: false, international: true  },
  { display_name: "Shane Lowry",                 age: 38, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: false, international: true  },
  { display_name: "Robert MacIntyre",            age: 29, swing: "Left",  past_champion: false, masters_wins: 0, amateur: false, first_masters: false, international: true  },
  { display_name: "Hideki Matsuyama",            age: 34, swing: "Right", past_champion: true,  masters_wins: 1, amateur: false, first_masters: false, international: true  },
  { display_name: "Rory McIlroy",                age: 36, swing: "Right", past_champion: true,  masters_wins: 1, amateur: false, first_masters: false, international: true  },
  { display_name: "Tom McKibbin",                age: 23, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: true,  international: true  },
  { display_name: "Maverick McNealy",            age: 30, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: false, international: false },
  { display_name: "Phil Mickelson",              age: 55, swing: "Left",  past_champion: true,  masters_wins: 3, amateur: false, first_masters: false, international: false },
  { display_name: "Collin Morikawa",             age: 29, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: false, international: false },
  { display_name: "Rasmus Neergaard-Petersen",   age: 26, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: true,  international: true  },
  { display_name: "Alex Noren",                  age: 43, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: false, international: true  },
  { display_name: "Andrew Novak",                age: 30, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: true,  international: false },
  { display_name: "José María Olazábal",         age: 60, swing: "Right", past_champion: true,  masters_wins: 2, amateur: false, first_masters: false, international: true  },
  { display_name: "Carlos Ortiz",                age: 34, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: false, international: true  },
  { display_name: "Marco Penge",                 age: 27, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: true,  international: true  },
  { display_name: "Aldrich Potgieter",           age: 21, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: false, international: true  },
  { display_name: "Mateo Pulcini",               age: 25, swing: "Right", past_champion: false, masters_wins: 0, amateur: true,  first_masters: true,  international: true  },
  { display_name: "Jon Rahm",                    age: 31, swing: "Right", past_champion: true,  masters_wins: 1, amateur: false, first_masters: false, international: true  },
  { display_name: "Aaron Rai",                   age: 31, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: false, international: true  },
  { display_name: "Patrick Reed",                age: 35, swing: "Right", past_champion: true,  masters_wins: 1, amateur: false, first_masters: false, international: false },
  { display_name: "Kristoffer Reitan",           age: 28, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: true,  international: true  },
  { display_name: "Davis Riley",                 age: 29, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: false, international: false },
  { display_name: "Justin Rose",                 age: 45, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: false, international: true  },
  { display_name: "Xander Schauffele",           age: 32, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: false, international: false },
  { display_name: "Scottie Scheffler",           age: 29, swing: "Right", past_champion: true,  masters_wins: 2, amateur: false, first_masters: false, international: false },
  { display_name: "Charl Schwartzel",            age: 41, swing: "Right", past_champion: true,  masters_wins: 1, amateur: false, first_masters: false, international: true  },
  { display_name: "Adam Scott",                  age: 45, swing: "Right", past_champion: true,  masters_wins: 1, amateur: false, first_masters: false, international: true  },
  { display_name: "Vijay Singh",                 age: 63, swing: "Right", past_champion: true,  masters_wins: 1, amateur: false, first_masters: false, international: true  },
  { display_name: "Cameron Smith",               age: 32, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: false, international: true  },
  { display_name: "J.J. Spaun",                  age: 35, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: false, international: false },
  { display_name: "Jordan Spieth",               age: 32, swing: "Right", past_champion: true,  masters_wins: 1, amateur: false, first_masters: false, international: false },
  { display_name: "Samuel Stevens",              age: 29, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: true,  international: false },
  { display_name: "Sepp Straka",                 age: 32, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: false, international: true  },
  { display_name: "Nick Taylor",                 age: 37, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: false, international: true  },
  { display_name: "Justin Thomas",               age: 32, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: false, international: false },
  { display_name: "Sami Valimaki",               age: 27, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: true,  international: true  },
  { display_name: "Bubba Watson",                age: 47, swing: "Left",  past_champion: true,  masters_wins: 2, amateur: false, first_masters: false, international: false },
  { display_name: "Mike Weir",                   age: 55, swing: "Left",  past_champion: true,  masters_wins: 1, amateur: false, first_masters: false, international: true  },
  { display_name: "Danny Willett",               age: 38, swing: "Right", past_champion: true,  masters_wins: 1, amateur: false, first_masters: false, international: true  },
  { display_name: "Tiger Woods",                 age: 50, swing: "Right", past_champion: true,  masters_wins: 5, amateur: false, first_masters: false, international: false },
  { display_name: "Cameron Young",               age: 28, swing: "Right", past_champion: false, masters_wins: 0, amateur: false, first_masters: false, international: false },
];

// DB name overrides: masters.com display_name → exact DB name
// (Only needed where they differ after normalization)
const NAME_OVERRIDES: Record<string, string> = {
  "sungjae im":              "Sung-Jae Im",
  "jose maria olazabal":     "Jose Maria Olazabal",
  "sergio garcia":           "Sergio Garcia",
  "angel cabrera":           "Angel Cabrera",
  "samuel stevens":          "Sam Stevens",
};

async function main() {
  console.log(`\n${ DRY_RUN ? "🔍 DRY RUN — " : "" }🏌️  Syncing from masters.com (${MASTERS_FIELD.length} players)\n`);

  // Load all golfers from DB
  const { data: golfers, error } = await db
    .from("golfers")
    .select("id, name, appearances, group_tags, is_lefty, masters_wins, age");
  if (error || !golfers) { console.error("Failed to load golfers:", error); process.exit(1); }

  // Build normalized name → DB row map
  const dbMap = new Map<string, typeof golfers[0]>();
  for (const g of golfers) dbMap.set(norm(g.name), g);

  const mastersNames = new Set(MASTERS_FIELD.map(p => {
    const key = norm(p.display_name);
    return NAME_OVERRIDES[key] ? norm(NAME_OVERRIDES[key]) : key;
  }));

  // Report players in DB but NOT in masters.com field
  const notInField: string[] = [];
  for (const g of golfers) {
    if (!mastersNames.has(norm(g.name))) notInField.push(g.name);
  }

  let updated = 0, skipped = 0;
  const changes: string[] = [];
  const warnings: string[] = [];

  for (const mp of MASTERS_FIELD) {
    const rawKey = norm(mp.display_name);
    const dbKey  = NAME_OVERRIDES[rawKey] ? norm(NAME_OVERRIDES[rawKey]) : rawKey;
    const dbName = NAME_OVERRIDES[rawKey] ?? undefined;

    const row = dbMap.get(dbKey);
    if (!row) {
      warnings.push(`⚠️  NOT IN DB: ${mp.display_name} — needs to be added`);
      continue;
    }

    const currentTags: string[] = row.group_tags ?? [];

    // ── Compute correct tags from masters.com ──────────────────────────
    const shouldHave = new Set<string>();

    if (mp.past_champion)  shouldHave.add("Champ");
    if (mp.amateur)        shouldHave.add("Amateur");
    if (mp.international)  shouldHave.add("Intl");
    if (mp.first_masters)  shouldHave.add("Rookie");
    if (row.is_lefty || mp.swing === "Left") shouldHave.add("Lefty");

    // Preserve non-validated tags (LIV, 35+, Fan Fav, Euro Tour)
    const PRESERVE_TAGS = new Set(["LIV", "35+", "Fan Fav", "Euro Tour", "Lefty"]);
    for (const t of currentTags) {
      if (PRESERVE_TAGS.has(t)) shouldHave.add(t);
    }

    // Build final sorted tag list (consistent order)
    const TAG_ORDER = ["Champ", "LIV", "Lefty", "Amateur", "Rookie", "35+", "Fan Fav", "Euro Tour", "Intl"];
    const newTags = TAG_ORDER.filter(t => shouldHave.has(t));

    // ── Compute correct appearances ────────────────────────────────────
    // first_masters=true → appearances MUST be 1 (2026 debut)
    // first_masters=false → appearances must be ≥ 2 (played before)
    // Don't decrease appearances for returning players — only fix if wrong
    const currentApps = row.appearances ?? 0;
    let newApps = currentApps;
    if (mp.first_masters && currentApps !== 1) {
      newApps = 1;
      changes.push(`  appearances: ${row.name}: ${currentApps} → 1 (first_masters=true)`);
    } else if (!mp.first_masters && currentApps <= 1) {
      // They've played before — set to 2 minimum (we don't know exact count)
      newApps = 2;
      changes.push(`  appearances: ${row.name}: ${currentApps} → 2 (first_masters=false, not a debut)`);
    }

    // ── Compute is_lefty ──────────────────────────────────────────────
    const newLefty = mp.swing === "Left";

    // ── Build update payload ──────────────────────────────────────────
    const updates: Record<string, unknown> = {};

    if (row.age !== mp.age)          updates.age = mp.age;
    if (row.is_lefty !== newLefty)   updates.is_lefty = newLefty;
    if (row.masters_wins !== mp.masters_wins) updates.masters_wins = mp.masters_wins;
    if (newApps !== currentApps)     updates.appearances = newApps;

    // Tags: compare sorted arrays
    const tagChanged = JSON.stringify(newTags) !== JSON.stringify(currentTags.slice().sort((a, b) => TAG_ORDER.indexOf(a) - TAG_ORDER.indexOf(b)));
    if (tagChanged)                  updates.group_tags = newTags;

    // Use override name for update targeting if needed
    const targetName = dbName ?? row.name;

    if (Object.keys(updates).length === 0) {
      skipped++;
      continue;
    }

    // Log what's changing
    const diffs: string[] = [];
    if (updates.age !== undefined)          diffs.push(`age: ${row.age} → ${updates.age}`);
    if (updates.is_lefty !== undefined)     diffs.push(`is_lefty: ${row.is_lefty} → ${updates.is_lefty}`);
    if (updates.masters_wins !== undefined) diffs.push(`masters_wins: ${row.masters_wins} → ${updates.masters_wins}`);
    if (updates.appearances !== undefined)  diffs.push(`appearances: ${currentApps} → ${updates.appearances}`);
    if (updates.group_tags !== undefined)   diffs.push(`tags: [${currentTags.join(",")}] → [${(updates.group_tags as string[]).join(",")}]`);

    const label = `${DRY_RUN ? "  WOULD UPDATE" : "  ✅"} ${row.name}: ${diffs.join(" | ")}`;
    changes.push(label);

    if (!DRY_RUN) {
      const { error: updateErr } = await db
        .from("golfers")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("name", row.name);
      if (updateErr) {
        console.error(`  ❌ ${row.name}: ${updateErr.message}`);
      } else {
        updated++;
      }
    } else {
      updated++;
    }
  }

  // ── Print report ────────────────────────────────────────────────────────
  if (changes.length > 0) {
    console.log(`\n📝 Changes applied (${changes.length}):`);
    for (const c of changes) console.log(c);
  }

  if (warnings.length > 0) {
    console.log(`\n⚠️  Warnings (${warnings.length}):`);
    for (const w of warnings) console.log(w);
  }

  if (notInField.length > 0) {
    console.log(`\n🚫 In DB but NOT in 2026 Masters field (${notInField.length}):`);
    for (const n of notInField) console.log(`  • ${n}`);
    console.log("  (These players may have withdrawn or failed to qualify)");
  }

  console.log(`\n${ DRY_RUN ? "DRY RUN — " : "" }✅ Done: ${updated} updated, ${skipped} already correct\n`);
}

main();
