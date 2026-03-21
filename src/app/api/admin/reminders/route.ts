import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { getAuthUserId, isPlatformAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import { sendDeadlineReminder } from "@/lib/email";

/**
 * POST /api/admin/reminders
 * Sends a deadline reminder to all members of a pool who have NOT yet submitted picks.
 * Body: { poolId: string }
 * Admin only.
 */
export async function POST(request: Request) {
  const userId = await getAuthUserId();
  if (!userId || !isPlatformAdmin(userId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { poolId } = body as { poolId: string };
  if (!poolId) {
    return NextResponse.json({ error: "poolId is required" }, { status: 400 });
  }

  const db = createServiceClient();

  // Fetch pool
  const { data: pool } = await db
    .from("pools")
    .select("id, slug, name")
    .eq("id", poolId)
    .single();
  if (!pool) {
    return NextResponse.json({ error: "Pool not found" }, { status: 404 });
  }

  // Fetch members without picks
  const { data: members } = await db
    .from("pool_members")
    .select("user_id, display_name")
    .eq("pool_id", poolId);

  if (!members || members.length === 0) {
    return NextResponse.json({ sent: 0, skipped: 0 });
  }

  const { data: picks } = await db
    .from("picks")
    .select("user_id")
    .eq("pool_id", poolId);

  const usersWithPicks = new Set((picks ?? []).map((p: { user_id: string }) => p.user_id));
  const membersWithoutPicks = members.filter(
    (m: { user_id: string; display_name: string | null }) => !usersWithPicks.has(m.user_id)
  );

  if (membersWithoutPicks.length === 0) {
    return NextResponse.json({ sent: 0, skipped: members.length });
  }

  // Resolve emails
  const clerk = await clerkClient();
  const userList = await clerk.users.getUserList({
    userId: membersWithoutPicks.map((m: { user_id: string }) => m.user_id),
    limit: 200,
  });

  const emailMap = new Map(
    userList.data.map((u) => [u.id, u.emailAddresses[0]?.emailAddress])
  );
  const displayNameMap = new Map(
    membersWithoutPicks.map((m: { user_id: string; display_name: string | null }) => [
      m.user_id,
      m.display_name,
    ])
  );

  const results = await Promise.allSettled(
    membersWithoutPicks.map((m: { user_id: string; display_name: string | null }) => {
      const email = emailMap.get(m.user_id);
      if (!email) return Promise.resolve();
      return sendDeadlineReminder({
        to: email,
        displayName: displayNameMap.get(m.user_id) ?? "there",
        poolName: pool.name,
        poolSlug: pool.slug,
      });
    })
  );

  const failed = results.filter((r) => r.status === "rejected").length;
  return NextResponse.json({
    sent: membersWithoutPicks.length - failed,
    skipped: usersWithPicks.size,
    failed,
  });
}
