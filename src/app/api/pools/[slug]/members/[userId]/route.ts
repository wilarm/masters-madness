import { NextResponse } from "next/server";
import { getPoolBySlug, updateMember, removeMember } from "@/lib/db/pools";
import { getAuthUserId, isPoolCommissioner } from "@/lib/auth";

type Params = { params: Promise<{ slug: string; userId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const authUserId = await getAuthUserId();
  if (!authUserId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug, userId: targetUserId } = await params;
  const pool = await getPoolBySlug(slug);
  if (!pool)
    return NextResponse.json({ error: "Pool not found" }, { status: 404 });

  const isCommish = await isPoolCommissioner(authUserId, pool.id);
  if (!isCommish)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json();
  const allowed = ["paid", "role", "custom_tag", "display_name"] as const;
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0)
    return NextResponse.json({ error: "No valid fields" }, { status: 400 });

  const ok = await updateMember(pool.id, targetUserId, updates);
  if (!ok)
    return NextResponse.json({ error: "Failed to update member" }, { status: 500 });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Params) {
  const authUserId = await getAuthUserId();
  if (!authUserId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug, userId: targetUserId } = await params;

  const pool = await getPoolBySlug(slug);
  if (!pool)
    return NextResponse.json({ error: "Pool not found" }, { status: 404 });

  const isSelf = targetUserId === authUserId;

  if (isSelf) {
    // Members may leave their own pool — but commissioners cannot leave (they must delete or transfer)
    const isCommish = await isPoolCommissioner(authUserId, pool.id);
    if (isCommish)
      return NextResponse.json(
        { error: "Commissioners cannot leave their own pool. Delete the pool or transfer ownership instead." },
        { status: 400 }
      );
  } else {
    // Removing someone else requires commissioner role
    const isCommish = await isPoolCommissioner(authUserId, pool.id);
    if (!isCommish)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ok = await removeMember(pool.id, targetUserId);
  if (!ok)
    return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });

  return NextResponse.json({ ok: true });
}
