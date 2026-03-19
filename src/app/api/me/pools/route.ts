import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { getPoolsForUser } from "@/lib/db/pools";

export async function GET() {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ pools: [] }, { status: 401 });
  }
  const pools = await getPoolsForUser(userId);
  // Return lightweight stubs (id, slug, name, role) — navbar doesn't need full pool objects
  const stubs = pools.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    role: p.myRole,
  }));
  return NextResponse.json({ pools: stubs });
}
