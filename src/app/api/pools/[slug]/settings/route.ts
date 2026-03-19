import { NextResponse } from "next/server";
import { getPoolBySlug, updatePoolSettings } from "@/lib/db/pools";
import { getAuthUserId, isPoolCommissioner } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const userId = await getAuthUserId();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  const pool = await getPoolBySlug(slug);
  if (!pool)
    return NextResponse.json({ error: "Pool not found" }, { status: 404 });

  const isCommish = await isPoolCommissioner(userId, pool.id);
  if (!isCommish)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const { name, entryFee, prizePool, venmoLink, heroSubtitle } = body;

  // Merge new settings into existing config
  // Falsy string values are excluded so they fall back to auto-calculated defaults
  const newConfig: Record<string, unknown> = {
    ...(pool.config as Record<string, unknown>),
    ...(entryFee !== undefined && { entryFee: Number(entryFee) }),
    ...(prizePool !== undefined && prizePool
      ? { prizePool: String(prizePool) }
      : prizePool === "" && { prizePool: undefined }),
    ...(venmoLink !== undefined && { venmoLink: String(venmoLink) }),
    ...(heroSubtitle !== undefined && heroSubtitle
      ? { heroSubtitle: String(heroSubtitle) }
      : heroSubtitle === "" && { heroSubtitle: undefined }),
  };

  const updates: { name?: string; config: Record<string, unknown> } = {
    config: newConfig,
  };
  if (name && typeof name === "string") updates.name = name.trim();

  const ok = await updatePoolSettings(pool.id, updates);
  if (!ok)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });

  return NextResponse.json({ ok: true });
}
