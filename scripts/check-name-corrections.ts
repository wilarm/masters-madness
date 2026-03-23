import * as dotenv from "dotenv"; import * as path from "path";
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
import { createClient } from "@supabase/supabase-js";
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
async function main() {
  const checks = ["Tom McKibbin","Tim McKibbin","Sam Stevens","Samuel Stevens"];
  for (const n of checks) {
    const { data } = await db.from("golfers").select("name,age,appearances,group_tags").eq("name", n).maybeSingle();
    console.log(n, "->", data ? JSON.stringify(data) : "NOT FOUND");
  }
}
main();
