export type PoolState = "pre_lock" | "post_lock" | "in_progress" | "complete";

// Tournament dates
const PICKS_DEADLINE = new Date("2026-04-09T11:00:00Z"); // Apr 9, 5am MT
const TOURNAMENT_START = new Date("2026-04-09T13:00:00Z"); // First tee time
const TOURNAMENT_END = new Date("2026-04-12T23:59:00Z");   // Final round ends

export function getPoolState(now: Date = new Date()): PoolState {
  if (now < PICKS_DEADLINE) return "pre_lock";
  if (now < TOURNAMENT_START) return "post_lock"; // locked but not started
  if (now <= TOURNAMENT_END) return "in_progress";
  return "complete";
}

export function poolStateLabel(state: PoolState): string {
  switch (state) {
    case "pre_lock":    return "Picks Open";
    case "post_lock":   return "Picks Locked";
    case "in_progress": return "Live";
    case "complete":    return "Final";
  }
}

export function poolStateDotColor(state: PoolState): string {
  switch (state) {
    case "pre_lock":    return "bg-amber-400";
    case "post_lock":   return "bg-blue-400";
    case "in_progress": return "bg-emerald-400";
    case "complete":    return "bg-muted";
  }
}

/** Whether picks (golfer selections) should be publicly visible */
export function picksVisible(state: PoolState, isDemo = false): boolean {
  return isDemo || state === "post_lock" || state === "in_progress" || state === "complete";
}

/** Whether analytics are unlocked */
export function analyticsUnlocked(state: PoolState, isDemo = false): boolean {
  return isDemo || state === "in_progress" || state === "complete";
}
