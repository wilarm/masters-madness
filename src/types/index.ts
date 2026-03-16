// ─── User & Auth ─────────────────────────────────────────────
export type UserRole = "admin" | "player" | "co-player" | "viewer";

export interface UserProfile {
  id: string;
  clerkId: string;
  email: string;
  name: string;
  initials: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: string;
}

// ─── Pool ────────────────────────────────────────────────────
export interface Pool {
  id: string;
  name: string;
  slug: string;
  entryFee: number;
  maxEntriesPerUser: number;
  deadline: string; // ISO date
  payoutStructure: PayoutTier[];
  rules: string;
  createdBy: string; // userId
  createdAt: string;
}

export interface PayoutTier {
  place: number;
  amount: number;
  label: string; // "1st Place", "2nd Place", etc.
}

export interface PoolMember {
  id: string;
  poolId: string;
  userId: string;
  role: UserRole;
  isPaid: boolean;
  joinedAt: string;
}

// ─── Picks & Entries ─────────────────────────────────────────
export interface Entry {
  id: string;
  poolId: string;
  userId: string;
  entryNumber: number; // 1 or 2 (max 2 per user)
  picks: Pick[];
  totalScore: number | null;
  rank: number | null;
  lockedAt: string | null;
  createdAt: string;
}

export interface Pick {
  id: string;
  entryId: string;
  groupNumber: number; // 1-9
  golferId: string;
  golferScore: number | null;
  isCountingScore: boolean; // true for best 4 of 9
}

// ─── Golfers ─────────────────────────────────────────────────
export interface Golfer {
  id: string;
  name: string;
  photoUrl?: string;
  country: string;
  worldRanking: number;
  currentOdds: string; // e.g., "+1200"
  baselineOdds: string;
  tier: number; // 1-9 (group number)
  trend: number; // positive = climbing, negative = sinking
  bio: string;
  analysis: string; // why they may/may not contend
  augustaHistory: AugustaResult[];
  recentForm: TournamentResult[];
}

export interface AugustaResult {
  year: number;
  position: string;
  score: string;
}

export interface TournamentResult {
  tournament: string;
  date: string;
  position: string;
  score: string;
}

// ─── Live Scores ─────────────────────────────────────────────
export interface LiveScore {
  golferId: string;
  golferName: string;
  position: string; // "T3", "1", "CUT"
  totalScore: number;
  today: number;
  thru: string; // "F", "12", etc.
  round1: number | null;
  round2: number | null;
  round3: number | null;
  round4: number | null;
  status: "active" | "cut" | "withdrawn" | "disqualified";
}

// ─── Analytics ───────────────────────────────────────────────
export interface RiskProfile {
  entryId: string;
  userName: string;
  userInitials: string;
  userAvatar?: string;
  riskScore: number; // 0-100 (0 = safest, 100 = riskiest)
  upsideScore: number; // 0-100 (ceiling potential)
  picks: {
    golferName: string;
    tier: number;
    odds: string;
  }[];
}

// ─── Odds Tracking ───────────────────────────────────────────
export interface OddsSnapshot {
  id: string;
  golferId: string;
  odds: string;
  rank: number;
  capturedAt: string;
  weekLabel: string; // "Week 1", "Week 2", etc.
}
