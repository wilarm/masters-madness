/**
 * scripts/enrich-golfers.ts
 *
 * One-time script that calls GPT-4o with web search for every golfer in the DB
 * and populates: summary, bull_case, bear_case, recent_form, group_tags
 *
 * Uses OpenAI's web_search_preview tool so data reflects current 2025-2026
 * season results, not just training data.
 *
 * Run with:
 *   npx tsx scripts/enrich-golfers.ts
 *
 * Safe to re-run — skips golfers that already have a summary.
 * To force re-enrich all: npx tsx scripts/enrich-golfers.ts --force
 *
 * Env vars needed (from .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   OPENAI_API_KEY
 */

import * as dotenv from "dotenv";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const FORCE = process.argv.includes("--force");

// Available group tags used in the app
const GROUP_TAGS = ["Champ", "LIV", "Lefty", "Rookie", "35+", "Fan Fav", "Euro Tour", "Intl"] as const;

interface GolferEnrichment {
  summary: string;
  bull_case: string;
  bear_case: string;
  recent_form: string;
  group_tags: string[];
}

async function enrichGolfer(name: string, odds: string, tier: number): Promise<GolferEnrichment> {
  const prompt = `Search the web for current information about professional golfer ${name} ahead of the 2026 Masters Tournament at Augusta National (April 9-12, 2026).

Using current web search results, return a JSON object with exactly these fields:

{
  "summary": "2-3 sentence scouting overview covering their Masters history, current 2025-2026 season form, and why they are/aren't a threat at Augusta. Be specific with real stats and results.",
  "bull_case": "1-2 sentences on why this player could win or outperform their ${odds} odds at the 2026 Masters.",
  "bear_case": "1-2 sentences on why this player might underperform or miss the cut.",
  "recent_form": "Their last 5 PGA Tour / LIV / DP World Tour results from the 2025-2026 season as a comma-separated string, most recent first (e.g. '1st, T4, MC, T12, 2nd'). Use real tournament results from your search.",
  "group_tags": ["array of applicable tags — only use tags from this exact list: Champ (past Masters champion), LIV (currently plays on LIV Golf), Lefty (left-handed golfer), Rookie (first Masters appearance in 2026), 35+ (age 35 or older as of April 9, 2026), Fan Fav (widely popular fan favorite), Euro Tour (primarily DP World Tour / European Tour player), Intl (non-American player — any non-US nationality)"]
}

Player context: Current odds ${odds}, Tier ${tier} of 9 in a Masters fantasy pool (Tier 1 = elite favorites).

Return valid JSON only, no markdown fences.`;

  // Use the Responses API which supports web_search_preview
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await (openai as any).responses.create({
    model: "gpt-4o",
    tools: [{ type: "web_search_preview" }],
    input: prompt,
  });

  // Extract text output from the response
  const content: string =
    response.output
      ?.filter((b: { type: string }) => b.type === "message")
      ?.flatMap((b: { content: { type: string; text: string }[] }) =>
        b.content?.filter((c) => c.type === "output_text").map((c) => c.text)
      )
      ?.join("") ?? "{}";

  // Strip markdown fences if present
  const jsonStr = content.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

  let parsed: Record<string, unknown> = {};
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    // Try to extract JSON from the content
    const match = jsonStr.match(/\{[\s\S]*\}/);
    if (match) {
      try { parsed = JSON.parse(match[0]); } catch { /* fall through */ }
    }
  }

  // Validate group_tags are from allowed list
  const validTags = ((parsed.group_tags as string[]) ?? []).filter((t: string) =>
    (GROUP_TAGS as readonly string[]).includes(t)
  );

  return {
    summary:     (parsed.summary as string)     ?? "",
    bull_case:   (parsed.bull_case as string)   ?? "",
    bear_case:   (parsed.bear_case as string)   ?? "",
    recent_form: (parsed.recent_form as string) ?? "",
    group_tags:  validTags,
  };
}

async function main() {
  console.log("Fetching golfers from DB...");
  const { data: golfers, error } = await supabase
    .from("golfers")
    .select("id, name, odds, tier, summary")
    .order("odds_rank", { ascending: true });

  if (error || !golfers) {
    console.error("Failed to fetch golfers:", error);
    process.exit(1);
  }

  const toEnrich = FORCE
    ? golfers
    : golfers.filter((g) => !g.summary);

  console.log(`Found ${golfers.length} golfers. ${toEnrich.length} need enrichment${FORCE ? " (--force)" : ""}.\n`);

  if (toEnrich.length === 0) {
    console.log("All golfers already enriched. Run with --force to re-enrich.");
    return;
  }

  let enriched = 0;
  let failed = 0;

  for (const golfer of toEnrich) {
    process.stdout.write(`  ⛳ ${golfer.name} (${golfer.odds ?? "N/L"})... `);

    try {
      const enrichment = await enrichGolfer(
        golfer.name,
        golfer.odds ?? "N/L",
        golfer.tier ?? 9
      );

      const { error: updateError } = await supabase
        .from("golfers")
        .update({
          summary:     enrichment.summary,
          bull_case:   enrichment.bull_case,
          bear_case:   enrichment.bear_case,
          recent_form: enrichment.recent_form,
          group_tags:  enrichment.group_tags,
        })
        .eq("id", golfer.id);

      if (updateError) {
        console.log(`❌ DB error: ${updateError.message}`);
        failed++;
      } else {
        const tags = enrichment.group_tags.length > 0
          ? enrichment.group_tags.join(", ")
          : "no tags";
        console.log(`✅  [${tags}]`);
        enriched++;
      }

      // ~2 req/s — well within OpenAI rate limits
      await new Promise((r) => setTimeout(r, 500));
    } catch (err) {
      console.log(`❌ Error: ${err}`);
      failed++;
      // Don't stop — keep going through the field
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  console.log(`\n✅ Done!  enriched=${enriched}  failed=${failed}`);
}

main();
