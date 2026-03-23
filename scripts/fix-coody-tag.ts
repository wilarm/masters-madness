import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
import { createClient } from "@supabase/supabase-js";

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  const { data } = await db.from("golfers").select("group_tags").eq("name", "Pierceson Coody").single();
  const tags = (data?.group_tags ?? []).filter((t: string) => t !== "Rookie");
  const { error } = await db.from("golfers").update({ group_tags: tags }).eq("name", "Pierceson Coody");
  console.log(error ? "❌ " + error.message : `✅ Pierceson Coody → [${tags.join(", ")}]`);
}
main();
