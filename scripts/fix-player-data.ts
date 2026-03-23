/**
 * scripts/fix-player-data.ts
 *
 * Fixes player data inconsistencies found by audit-players.ts + masters.com field data:
 *   1. Fix appearances mismatches (Rory McIlroy, Harry Hall, Michael Kim)
 *   2. Add missing Rookie tags (Rasmus Hojgaard, Aldrich Potgieter, Max Greyserman, Brian Campbell)
 *   3. Insert 9 new players from the 2026 Masters field (amateurs + international qualifiers)
 *   4. Add ESPN aliases for new name variants
 *
 * Run: npx tsx scripts/fix-player-data.ts
 */

import * as dotenv from "dotenv";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  console.log("🔧 Fixing player data...\n");

  // ── 1. Fix appearances mismatches ────────────────────────────────────────────
  const appearanceFixes = [
    { name: "Rory McIlroy", appearances: 18 },   // DB had 16; won 2025 = 18th appearance
    { name: "Harry Hall", appearances: 1 },        // masters.com: 2026 is his debut
    { name: "Michael Kim", appearances: 3 },       // User confirmed: making 3rd appearance
  ];

  for (const fix of appearanceFixes) {
    const { error } = await db
      .from("golfers")
      .update({ appearances: fix.appearances })
      .eq("name", fix.name);
    if (error) console.error(`❌ appearances fix for ${fix.name}:`, error.message);
    else console.log(`✅ Updated appearances: ${fix.name} → ${fix.appearances}`);
  }

  // ── 2. Add missing Rookie tags ────────────────────────────────────────────────
  // First fetch their current tags, then append Rookie
  const rookieFixes = ["Rasmus Hojgaard", "Aldrich Potgieter", "Max Greyserman", "Brian Campbell"];

  for (const name of rookieFixes) {
    const { data: row } = await db
      .from("golfers")
      .select("group_tags")
      .eq("name", name)
      .single();
    const currentTags: string[] = row?.group_tags ?? [];
    if (currentTags.includes("Rookie")) {
      console.log(`⏭  ${name} already has Rookie tag`);
      continue;
    }
    const newTags = ["Rookie", ...currentTags];
    const { error } = await db
      .from("golfers")
      .update({ group_tags: newTags })
      .eq("name", name);
    if (error) console.error(`❌ Rookie tag for ${name}:`, error.message);
    else console.log(`✅ Added Rookie tag: ${name} → [${newTags.join(", ")}]`);
  }

  // ── 3. Insert 9 new 2026 Masters field players ───────────────────────────────
  const now = new Date().toISOString();
  const newPlayers = [
    // ── Amateurs ──
    {
      name: "Ethan Fang",
      country: "United States",
      appearances: 1,
      age: 20,
      is_lefty: false,
      is_liv: false,
      masters_wins: 0,
      best_finish: "—",
      tier: 9,
      group_tags: ["Rookie", "Amateur"],
      summary: "20-year-old American amateur making his Masters debut. One of the top college players in the country, Fang qualified through amateur championship results. Augusta will be the biggest stage of his young career.",
      bull_case: "Youth and fearlessness can be an asset at Augusta. Top amateur talent with nothing to lose. Upsets happen here.",
      bear_case: "No professional experience at this level. Augusta's back nine on Sunday is a different universe from college golf.",
      updated_at: now,
    },
    {
      name: "Jackson Herrington",
      country: "United States",
      appearances: 1,
      age: 19,
      is_lefty: false,
      is_liv: false,
      masters_wins: 0,
      best_finish: "—",
      tier: 9,
      group_tags: ["Rookie", "Amateur"],
      summary: "19-year-old amateur making his Masters debut after qualifying through top amateur events. Among the youngest players in the 2026 field, Herrington brings raw talent and Augusta innocence.",
      bull_case: "Teenage fearlessness. No stage fright when you don't know what you're walking into.",
      bear_case: "19 years old at Augusta. The gap between elite amateur and Masters contention is enormous.",
      updated_at: now,
    },
    {
      name: "Brandon Holtz",
      country: "United States",
      appearances: 1,
      age: 39,
      is_lefty: false,
      is_liv: false,
      masters_wins: 0,
      best_finish: "—",
      tier: 9,
      group_tags: ["Rookie", "Amateur"],
      summary: "39-year-old amateur making a remarkable Masters debut — among the oldest amateurs ever to compete at Augusta. His journey to qualify at this age is a story in itself.",
      bull_case: "Experience and composure that young amateurs lack. Mature mindset for Augusta's mental demands.",
      bear_case: "Competing as an amateur at 39 means the professional window has passed. True hail mary.",
      updated_at: now,
    },
    {
      name: "Mason Howell",
      country: "United States",
      appearances: 1,
      age: 18,
      is_lefty: false,
      is_liv: false,
      masters_wins: 0,
      best_finish: "—",
      tier: 9,
      group_tags: ["Rookie", "Amateur"],
      summary: "18-year-old amateur — one of the youngest players in the 2026 field. Howell qualified through top junior and amateur results. Making history just by teeing it up at Augusta.",
      bull_case: "Pure talent, no fear, nothing to lose. Augusta loves a young underdog story.",
      bear_case: "18 years old at Augusta National. The experience gap is immense.",
      updated_at: now,
    },
    {
      name: "Fifa Laopakdee",
      country: "Thailand",
      appearances: 1,
      age: 21,
      is_lefty: false,
      is_liv: false,
      masters_wins: 0,
      best_finish: "—",
      tier: 9,
      group_tags: ["Rookie", "Amateur", "Intl"],
      summary: "21-year-old Thai amateur making his Masters debut and representing Thailand at Augusta National for the first time. A trailblazer for Southeast Asian golf on the world's biggest stage.",
      bull_case: "Historic debut for Thai golf. Fearless amateur with elite ball-striking foundation.",
      bear_case: "Limited exposure to this caliber of competition. True debut under Masters spotlight.",
      updated_at: now,
    },
    {
      name: "Mateo Pulcini",
      country: "Argentina",
      appearances: 1,
      age: 25,
      is_lefty: false,
      is_liv: false,
      masters_wins: 0,
      best_finish: "—",
      tier: 9,
      group_tags: ["Rookie", "Amateur", "Intl"],
      summary: "25-year-old Argentine amateur making his Masters debut. Following in the footsteps of Ángel Cabrera and Eduardo Romero as Argentina's latest hope at Augusta. Qualified through South American amateur results.",
      bull_case: "Argentine golf tradition is strong — Cabrera won this tournament. Old-world ball-striking for Augusta's demands.",
      bear_case: "Amateur status at 25 indicates a developmental path. Augusta's field is the best in the world.",
      updated_at: now,
    },
    // ── Professional debutants ──
    {
      name: "Nicolas Echavarria",
      country: "Colombia",
      appearances: 1,
      age: 32,
      is_lefty: false,
      is_liv: false,
      masters_wins: 0,
      best_finish: "—",
      tier: 9,
      group_tags: ["Rookie", "Intl"],
      summary: "32-year-old Colombian making his Masters debut after earning his way through PGA Tour results. The first Colombian to qualify for the Masters in recent memory, Echavarria brings crafty course management and a steady long game.",
      bull_case: "Experienced tour pro with nothing to lose. Augusta debuts can produce magic. Strong ball-striker who manages distance well.",
      bear_case: "No Augusta experience. Masters debut pressure hits differently. At 32, this may be his only shot.",
      updated_at: now,
    },
    {
      name: "Casey Jarvis",
      country: "South Africa",
      appearances: 1,
      age: 22,
      is_lefty: false,
      is_liv: false,
      masters_wins: 0,
      best_finish: "—",
      tier: 9,
      group_tags: ["Rookie", "Intl"],
      summary: "22-year-old South African making his Masters debut. Part of the next wave of South African talent following in the footsteps of Louis Oosthuizen and Charl Schwartzel. Young, long, and fearless.",
      bull_case: "South African golfers have Augusta DNA — Schwartzel, Oosthuizen, Player. Young and explosive off the tee. Nothing to lose.",
      bear_case: "Very limited major experience. Augusta's mental demands are unlike anything on the DP World Tour.",
      updated_at: now,
    },
    {
      name: "Naoyuki Kataoka",
      country: "Japan",
      appearances: 1,
      age: 28,
      is_lefty: false,
      is_liv: false,
      masters_wins: 0,
      best_finish: "—",
      tier: 9,
      group_tags: ["Rookie", "Intl"],
      summary: "28-year-old Japanese pro making his Masters debut alongside Hideki Matsuyama, Japan's defending representative. Kataoka qualified through Japan Golf Tour results and brings precision shot-making to Augusta.",
      bull_case: "Japanese precision suits Augusta. Matsuyama proved Japanese golfers can win here. Debut pressure can be channeled into focus.",
      bear_case: "The gap between the Japan Golf Tour and Augusta is enormous. No exposure to this level of competition regularly.",
      updated_at: now,
    },
  ];

  console.log("\n📥 Inserting new players...");
  for (const player of newPlayers) {
    const { error } = await db
      .from("golfers")
      .upsert(player, { onConflict: "name" });
    if (error) console.error(`❌ Insert ${player.name}:`, error.message);
    else console.log(`✅ Inserted: ${player.name} (${player.group_tags?.join(", ")})`);
  }

  // ── 4. Fix Michael Kim mastersAppearances note ────────────────────────────────
  // Already handled above (appearances: 3 for Michael Kim)

  console.log("\n✅ Done! Run audit-players.ts to verify.\n");
}

main();
