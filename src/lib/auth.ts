import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase";

export type PoolRole = "commissioner" | "player" | "co_player" | "viewer";

/**
 * Returns the authenticated Clerk userId, falling back to DEV_USER_ID on
 * localhost when production Clerk keys can't issue session cookies.
 * The fallback is ONLY active when NODE_ENV === "development".
 */
export async function getAuthUserId(): Promise<string | null> {
  const { userId } = await auth();
  if (userId) return userId;
  if (process.env.NODE_ENV === "development" && process.env.DEV_USER_ID) {
    return process.env.DEV_USER_ID;
  }
  return null;
}

/**
 * Returns true if the userId belongs to a platform admin.
 * Platform admins are listed in ADMIN_USER_IDS env var (comma-separated Clerk user IDs).
 * Used to gate the admin.mastersmadness.com subdomain and admin/* routes.
 */
export function isPlatformAdmin(userId: string): boolean {
  const ids = (process.env.ADMIN_USER_IDS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return ids.includes(userId);
}

/**
 * Returns the user's role in a specific pool, or null if not a member.
 * Gracefully returns null if Supabase is not configured (placeholder keys).
 */
export async function getUserPoolRole(
  userId: string,
  poolId: string
): Promise<PoolRole | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  if (supabaseUrl.includes("placeholder")) return null;

  try {
    const db = createServiceClient();
    const { data } = await db
      .from("pool_members")
      .select("role")
      .eq("pool_id", poolId)
      .eq("user_id", userId)
      .single();
    return (data?.role as PoolRole) ?? null;
  } catch {
    return null;
  }
}

/**
 * Returns true if the user is the commissioner for the given pool.
 * Falls back to false if Supabase is not yet connected.
 */
export async function isPoolCommissioner(
  userId: string,
  poolId: string
): Promise<boolean> {
  const role = await getUserPoolRole(userId, poolId);
  return role === "commissioner";
}

/**
 * Server helper: redirects to /sign-in if not authenticated.
 * In development, falls back to DEV_USER_ID so local testing works without Clerk.
 * Returns the userId on success.
 */
export async function requireAuth(): Promise<string> {
  const userId = await getAuthUserId();
  if (!userId) redirect("/sign-in");
  return userId;
}

/**
 * Server helper: redirects to / if not a platform admin.
 * Returns the userId on success.
 */
export async function requirePlatformAdmin(): Promise<string> {
  const userId = await getAuthUserId();
  if (!userId || !isPlatformAdmin(userId)) redirect("/");
  return userId;
}
