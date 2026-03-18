import { createServiceClient } from "@/lib/supabase";

export type Pick = {
  id: string;
  pool_id: string;
  user_id: string;
  entry_num: 1 | 2;
  /** Map of groupKey → golfer name, e.g. { "tier-1": "Scottie Scheffler", ... } */
  golfer_picks: Record<string, string>;
  submitted_at: string | null;
  locked: boolean;
  entered_by: string | null;
  override_note: string | null;
  updated_at: string;
};

export async function getPicksByPool(poolId: string): Promise<Pick[]> {
  const db = createServiceClient();
  const { data, error } = await db
    .from("picks")
    .select("*")
    .eq("pool_id", poolId)
    .order("submitted_at", { ascending: true });
  if (error || !data) return [];
  return data as Pick[];
}

export async function getPicksByUser(
  poolId: string,
  userId: string
): Promise<Pick[]> {
  const db = createServiceClient();
  const { data, error } = await db
    .from("picks")
    .select("*")
    .eq("pool_id", poolId)
    .eq("user_id", userId)
    .order("entry_num", { ascending: true });
  if (error || !data) return [];
  return data as Pick[];
}

export type UpsertPicksInput = {
  pool_id: string;
  user_id: string;
  entry_num: 1 | 2;
  golfer_picks: Record<string, string>;
  /** Admin override — if provided, picks are saved even after lock */
  entered_by?: string;
  override_note?: string;
};

export async function upsertPicks(input: UpsertPicksInput): Promise<boolean> {
  const db = createServiceClient();
  const now = new Date().toISOString();
  const { error } = await db.from("picks").upsert(
    {
      pool_id: input.pool_id,
      user_id: input.user_id,
      entry_num: input.entry_num,
      golfer_picks: input.golfer_picks,
      submitted_at: now,
      entered_by: input.entered_by ?? null,
      override_note: input.override_note ?? null,
      updated_at: now,
    },
    { onConflict: "pool_id,user_id,entry_num" }
  );
  if (error) {
    console.error("[db/picks] upsertPicks error:", error);
    return false;
  }
  return true;
}

export async function lockPicksForPool(poolId: string): Promise<boolean> {
  const db = createServiceClient();
  const { error } = await db
    .from("picks")
    .update({ locked: true })
    .eq("pool_id", poolId);
  return !error;
}

export async function deletePickEntry(
  poolId: string,
  userId: string,
  entryNum: 1 | 2
): Promise<boolean> {
  const db = createServiceClient();
  const { error } = await db
    .from("picks")
    .delete()
    .eq("pool_id", poolId)
    .eq("user_id", userId)
    .eq("entry_num", entryNum);
  return !error;
}
