import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/auth";
import { getPoolsForUser } from "@/lib/db/pools";

export async function GET() {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ pools: [] }, { status: 401 });
  }
  const pools = await getPoolsForUser(userId);
  return NextResponse.json({ pools });
}
