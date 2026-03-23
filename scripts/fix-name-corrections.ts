/**
 * Fix name errors in the DB discovered during masters.com sync:
 *   - "Tim McKibbin" → "Tom McKibbin" (wrong first name)
 *   - "Samuel Stevens" → "Sam Stevens" (match masters.com display name in our DB)
 *
 * Run: npx tsx scripts/fix-name-corrections.ts
 */
import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
import { createClient } from "@supabase/supabase-js";

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const renames: Array<{ from: string; to: string; notes: string }> = [
    { from: "Tim McKibbin",   to: "Tom McKibbin", notes: "Wrong first name — it's Tom, from Northern Ireland" },
  ];
  // Note: "Samuel Stevens" is already stored as "Sam Stevens" in the DB (correct).
  // The players.ts entry was wrong — fixed in the static file directly.

  for (const r of renames) {
    // Check if wrong name exists
    const { data: wrong } = await db.from("golfers").select("id, name").eq("name", r.from).single();
    if (!wrong) {
      console.log(`⏭  "${r.from}" not found in DB (may already be correct)`);
      continue;
    }
    // Check if correct name already exists (avoid duplicate)
    const { data: existing } = await db.from("golfers").select("id").eq("name", r.to).maybeSingle();
    if (existing) {
      console.log(`⚠️  "${r.to}" already exists in DB — deleting duplicate "${r.from}"`);
      await db.from("golfers").delete().eq("name", r.from);
      continue;
    }
    const { error } = await db.from("golfers").update({ name: r.to }).eq("name", r.from);
    if (error) console.error(`❌ Rename "${r.from}" → "${r.to}": ${error.message}`);
    else console.log(`✅ Renamed: "${r.from}" → "${r.to}" (${r.notes})`);
  }

  console.log("\n✅ Done");
}
main();
