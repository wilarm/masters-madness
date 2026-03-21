import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
import { getPoolBySlug, getPoolMembers } from "@/lib/db/pools";
import { getAuthUserId, isPoolCommissioner, isPlatformAdmin } from "@/lib/auth";
import { sendAnnouncement } from "@/lib/email";

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

  const isCommish = await isPoolCommissioner(userId, pool.id);
  const isAdmin = isPlatformAdmin(userId);
  if (!isCommish && !isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { subject, message } = body as { subject: string; message: string };

  if (!subject?.trim() || !message?.trim()) {
    return NextResponse.json({ error: "Subject and message are required" }, { status: 400 });
  }

  // Fetch all pool member user IDs
  const members = await getPoolMembers(pool.id);
  if (members.length === 0) {
    return NextResponse.json({ sent: 0, failed: 0 });
  }

  // Resolve emails from Clerk
  const clerk = await clerkClient();
  const userList = await clerk.users.getUserList({
    userId: members.map((m) => m.user_id),
    limit: 200,
  });

  // Get commissioner display name
  const commissionerMember = members.find((m) => m.user_id === userId);
  const commissionerUser = userList.data.find((u) => u.id === userId);
  const commissionerName =
    commissionerMember?.display_name ||
    [commissionerUser?.firstName, commissionerUser?.lastName].filter(Boolean).join(" ") ||
    "The Commissioner";

  // Collect valid emails
  const emails = userList.data
    .map((u) => u.emailAddresses[0]?.emailAddress)
    .filter((e): e is string => !!e);

  const result = await sendAnnouncement({
    to: emails,
    poolName: pool.name,
    poolSlug: pool.slug,
    subject: subject.trim(),
    message: message.trim(),
    commissionerName,
  });

  return NextResponse.json(result ?? { sent: emails.length, failed: 0 });
}
