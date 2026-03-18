import { NextResponse } from "next/server";
import { getAuthUserId, isPlatformAdmin } from "@/lib/auth";
import { updatePoolState } from "@/lib/db/pools";
import type { PoolState } from "@/lib/pool-state";

const VALID_STATES: PoolState[] = ["pre_lock", "post_lock", "in_progress", "complete"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ poolId: string }> }
) {
  const userId = await getAuthUserId();
  if (!userId || !isPlatformAdmin(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { poolId } = await params;
  const body = await request.json();
  const { state } = body;

  if (!VALID_STATES.includes(state)) {
    return NextResponse.json({ error: "Invalid state" }, { status: 400 });
  }

  const ok = await updatePoolState(poolId, state);
  if (!ok) {
    return NextResponse.json({ error: "Failed to update state" }, { status: 500 });
  }

  return NextResponse.json({ success: true, state });
}
