import * as dotenv from "dotenv";
import * as path from "path";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// All names currently in players.ts
const staticNames = [
  "Scottie Scheffler","Rory McIlroy","Bryson DeChambeau","Jon Rahm","Ludvig Aberg",
  "Xander Schauffele","Tommy Fleetwood","Collin Morikawa","Cameron Young","Patrick Reed",
  "Matt Fitzpatrick","Justin Rose","Chris Gotterup","Hideki Matsuyama","Viktor Hovland",
  "Brooks Koepka","Justin Thomas","Robert MacIntyre","Jordan Spieth","Tyrrell Hatton",
  "Shane Lowry","Patrick Cantlay","Joaquin Niemann","Ben Griffin","Will Zalatoris",
  "Si Woo Kim","Corey Conners","Akshay Bhatia","Russell Henley","Min Woo Lee",
  "Max Homa","Jason Day","Cameron Smith","Adam Scott","Sepp Straka","Sam Burns",
  "Daniel Berger","Sung-Jae Im","Sahith Theegala","Marco Penge","Wyndham Clark",
  "Jacob Bridgeman","J.J. Spaun","Harris English","Dustin Johnson","Sergio Garcia",
  "Matt McCarty","Alex Noren","Tony Finau","Maverick McNealy","Ryan Gerard",
  "Ryan Fox","Keegan Bradley","Harry Hall","Aaron Rai","Pierceson Coody","John Keefer",
  "Rasmus Neergaard-Petersen","Davis Thompson","Tom McKibbin","Taylor Pendrith",
  "Tiger Woods","Rasmus Hojgaard","Nicolai Hojgaard","Kurt Kitayama","Carlos Ortiz",
  "Brian Harman","Sam Stevens","Phil Mickelson","Michael Kim","Andrew Novak",
  "Aldrich Potgieter","Jayden Schaper","Nick Taylor","Max Greyserman","Haotong Li",
  "Bubba Watson","Sami Valimaki","Davis Riley","Kristoffer Reitan","Charl Schwartzel",
  "Brian Campbell","Michael Brennan","Zach Johnson","Danny Willett","Angel Cabrera",
  "Vijay Singh","Mike Weir","Fred Couples","Jose Maria Olazabal",
];

async function main() {
  const { data } = await db.from("golfers").select("name, summary");
  const dbRows = data ?? [];
  const dbNameMap = new Map(dbRows.map((g: { name: string; summary: string | null }) => [g.name.toLowerCase().trim(), g.name]));
  const staticLower = new Set(staticNames.map((n) => n.toLowerCase().trim()));

  console.log("\n=== players.ts names NOT found in DB ===");
  const missing = staticNames.filter((n) => !dbNameMap.has(n.toLowerCase().trim()));
  if (missing.length === 0) console.log("  ✅ All 90 match!");
  else missing.forEach((n) => console.log("  ❌", n));

  console.log("\n=== DB names NOT found in players.ts ===");
  const dbOnly = dbRows.filter((g: { name: string }) => !staticLower.has(g.name.toLowerCase().trim()));
  if (dbOnly.length === 0) console.log("  ✅ All match!");
  else dbOnly.forEach((g: { name: string }) => console.log("  ⚠️ ", g.name));

  console.log(`\nSummary: ${staticNames.length} in players.ts | ${dbRows.length} in DB | ${missing.length} mismatches`);
}

main();
