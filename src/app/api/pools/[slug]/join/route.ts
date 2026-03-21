import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getPoolBySlug, isPoolMember, addPoolMember } from "@/lib/db/pools";
import { getAuthUserId } from "@/lib/auth";
import { sendPoolJoined } from "@/lib/email";

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

  // Send welcome email (non-blocking)
  try {
    const email = user?.emailAddresses[0]?.emailAddress;
    const config = pool.config as Record<string, unknown>;
    if (email) {
      await sendPoolJoined({
        to: email,
        displayName: displayName ?? "there",
        poolName: pool.name,
        poolSlug: pool.slug,
        entryFee: typeof config.entryFee === "number" ? config.entryFee : null,
        venmoLink: typeof config.venmoLink === "string" ? config.venmoLink : null,
      });
    }
  } catch {
    // Email failure is non-fatal
  }

  return NextResponse.json({ success: true });
}
