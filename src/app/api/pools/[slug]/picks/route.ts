import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getPoolBySlug, isPoolMember } from "@/lib/db/pools";
import { upsertPicks, getPicksByUser } from "@/lib/db/picks";
import { getPoolState } from "@/lib/pool-state";
import { getAuthUserId, isPlatformAdmin, isPoolCommissioner } from "@/lib/auth";
import { sendPickConfirmation } from "@/lib/email";

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

  const picks = await getPicksByUser(pool.id, userId);
  return NextResponse.json({ picks });
}

export async function POST(
  request: Request,
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

  const isMember = await isPoolMember(pool.id, userId);
  if (!isMember) {
    return NextResponse.json({ error: "Not a pool member" }, { status: 403 });
  }

  const state = getPoolState();
  const isAdmin = isPlatformAdmin(userId);
  const isCommissioner = await isPoolCommissioner(userId, pool.id);
  const canOverride = isAdmin || isCommissioner;

  if (state !== "pre_lock" && !canOverride) {
    return NextResponse.json({ error: "Picks are locked" }, { status: 403 });
  }

  const body = await request.json();
  const { golfer_picks, entry_num = 1, override_note } = body;

  if (!golfer_picks || typeof golfer_picks !== "object") {
    return NextResponse.json({ error: "Invalid picks payload" }, { status: 400 });
  }

  const success = await upsertPicks({
    pool_id: pool.id,
    user_id: userId,
    entry_num,
    golfer_picks,
    entered_by: canOverride && state !== "pre_lock" ? userId : undefined,
    override_note: canOverride && override_note ? override_note : undefined,
  });

  if (!success) {
    return NextResponse.json({ error: "Failed to save picks" }, { status: 500 });
  }

  // Send confirmation email (non-blocking — don't fail the request if email fails)
  try {
    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress;
    const displayName =
      [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
      user?.emailAddresses[0]?.emailAddress ||
      "there";
    if (email) {
      await sendPickConfirmation({
        to: email,
        displayName,
        poolName: pool.name,
        poolSlug: pool.slug,
        picks: golfer_picks as Record<string, string>,
      });
    }
  } catch {
    // Email failure is non-fatal
  }

  return NextResponse.json({ success: true });
}
