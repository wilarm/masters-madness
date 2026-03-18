import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getPoolBySlug, isPoolMember, addPoolMember } from "@/lib/db/pools";
import { getAuthUserId } from "@/lib/auth";

export async function POST(
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

  // Already a member — idempotent, just return success
  const alreadyMember = await isPoolMember(pool.id, userId);
  if (alreadyMember) {
    return NextResponse.json({ success: true, alreadyMember: true });
  }

  const user = await currentUser();
  const displayName =
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.emailAddresses[0]?.emailAddress ||
    null;

  const ok = await addPoolMember(pool.id, userId, "player", displayName ?? undefined);
  if (!ok) {
    return NextResponse.json({ error: "Failed to join pool" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
