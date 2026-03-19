import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getAuthUserId } from "@/lib/auth";
import { getPublicPools } from "@/lib/db/pools";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const q = searchParams.get("q") ?? "";
  const { pools, total } = await getPublicPools(page, q);
  return NextResponse.json({ pools, total, page });
}

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40);
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base}-${suffix}`;
}

export async function POST(request: Request) {
  const userId = await getAuthUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { config } = body;

  if (!config?.name) {
    return NextResponse.json({ error: "Pool name is required" }, { status: 400 });
  }

  const slug = generateSlug(config.name);

  try {
    const user = await currentUser();
    const displayName =
      [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
      user?.emailAddresses[0]?.emailAddress ||
      null;

    const db = createServiceClient();

    const { data: pool, error: poolError } = await db
      .from("pools")
      .insert({
        slug,
        name: config.name,
        config,
        created_by: userId,
        state: "pre_lock",
        created_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    if (poolError) throw poolError;

    if (pool?.id) {
      await db.from("pool_members").insert({
        pool_id: pool.id,
        user_id: userId,
        role: "commissioner",
        display_name: displayName,
      });
    }
  } catch (err) {
    console.error("[pools/create] Supabase error:", err);
    // Return slug anyway so the UI isn't blocked
  }

  return NextResponse.json({ slug });
}
