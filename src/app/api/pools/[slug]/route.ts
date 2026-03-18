import { NextResponse } from "next/server";
import { getPoolBySlug } from "@/lib/db/pools";
import { getAuthUserId } from "@/lib/auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await params;
  const pool = await getPoolBySlug(slug);
  if (!pool) {
    return NextResponse.json({ error: "Pool not found" }, { status: 404 });
  }

  // Return only the config fields the picks UI needs
  const config = pool.config as Record<string, unknown>;
  return NextResponse.json({
    slug: pool.slug,
    name: pool.name,
    state: pool.state,
    numTiers: (config.numTiers as number) ?? 9,
    playersPerTier: (config.playersPerTier as number) ?? 5,
  });
}
