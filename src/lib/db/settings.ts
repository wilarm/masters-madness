import { createServiceClient } from "@/lib/supabase";

export type PayoutRow = {
  place: string;
  amount: string;
  highlight: boolean;
};

export type RulesContent = {
  communityMessage: string;
  communityMessageTitle: string;
  deadline: string;
  entryFee: string;
  maxEntries: string;
  paymentInfo: string;
  payouts: PayoutRow[];
  payoutNote: string;
  shareUrl: string;
};

export const DEFAULT_RULES: RulesContent = {
  communityMessage:
    "This pool is about friendly competition and bringing people together around the Masters. Good luck to everyone — may your golfers make the cut!",
  communityMessageTitle: "Welcome to Masters Madness 2026",
  deadline: "~5am MT, Thursday, April 9th, 2026",
  entryFee: "$100 per team (max 2 entries per person)",
  maxEntries: "2 teams per participant",
  paymentInfo: "Venmo or contact pool admin for arrangements",
  payouts: [
    { place: "1st", amount: "$1,000", highlight: true },
    { place: "2nd", amount: "$400", highlight: false },
    { place: "3rd", amount: "$100", highlight: false },
  ],
  payoutNote:
    "Total prize pool: $1,500. Tiebreakers are in place to ensure fairness and competition.",
  shareUrl: "mastersmadness.com",
};

export async function getRulesContent(): Promise<RulesContent> {
  const db = createServiceClient();
  const { data } = await db
    .from("settings")
    .select("value")
    .eq("key", "rules")
    .single();

  if (!data) return DEFAULT_RULES;
  return { ...DEFAULT_RULES, ...(data.value as Partial<RulesContent>) };
}

export async function updateRulesContent(
  content: Partial<RulesContent>
): Promise<boolean> {
  const db = createServiceClient();

  // Merge with existing content
  const current = await getRulesContent();
  const merged = { ...current, ...content };

  const { error } = await db
    .from("settings")
    .upsert({ key: "rules", value: merged as unknown as Record<string, unknown> });

  return !error;
}

// ─── Current Event ────────────────────────────────────────────────────────────

export type CurrentEvent = {
  /** External event ID (e.g. ESPN event ID) */
  eventId: string;
  /** Human-readable event name */
  eventName: string;
  /** ISO timestamp of when this was last updated by the cron */
  updatedAt: string;
};

/**
 * Returns the currently-active tournament event stored by the cron job.
 * Returns null if no event has been persisted yet.
 */
export async function getCurrentEvent(): Promise<CurrentEvent | null> {
  const db = createServiceClient();
  const { data } = await db
    .from("settings")
    .select("value")
    .eq("key", "current_event")
    .single();
  if (!data?.value) return null;
  return data.value as CurrentEvent;
}

/** Persists the currently-active tournament (called by cron on each successful fetch) */
export async function setCurrentEvent(event: CurrentEvent): Promise<boolean> {
  const db = createServiceClient();
  const { error } = await db
    .from("settings")
    .upsert({ key: "current_event", value: event as unknown as Record<string, unknown> });
  return !error;
}
