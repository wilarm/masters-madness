import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
import { createClient } from "@supabase/supabase-js";

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const { data } = await db
    .from("golfers")
    .select("name, appearances, group_tags, tier, odds_rank")
    .order("name");

  const names = new Set(data?.map((g: any) => g.name.toLowerCase().trim()));

  const newPlayers = [
    "Ethan Fang", "Jackson Herrington", "Brandon Holtz", "Mason Howell",
    "Fifa Laopakdee", "Mateo Pulcini", "Nicolas Echavarria", "Casey Jarvis", "Naoyuki Kataoka"
  ];
  console.log("\n=== Missing from DB ===");
  for (const p of newPlayers) {
    console.log(p, "->", names.has(p.toLowerCase()) ? "IN DB" : "MISSING FROM DB");
  }

  const checks = ["Harry Hall","Pierceson Coody","Rory McIlroy","Davis Thompson","Jayden Schaper","Michael Kim","Sam Stevens","Samuel Stevens"];
  console.log("\n=== Key player checks ===");
  for (const c of checks) {
    const g = data?.find((x: any) => x.name.toLowerCase() === c.toLowerCase());
    console.log(c, "->", g ? JSON.stringify({ appearances: g.appearances, tags: g.group_tags, tier: g.tier }) : "NOT FOUND");
  }
}

main();
