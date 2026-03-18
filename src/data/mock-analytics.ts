// Mock analytics data — derived from pool entries, will be replaced by Supabase queries

export interface GolferOwnership {
  name: string;
  tier: number;
  ownership: number; // 0–100
  pickedBy: number;  // count out of 15
  projectedScore: number; // relative to par, negative = under
  isContrarianPick: boolean; // < 20% ownership
  country: string;
}

export interface ParticipantRisk {
  name: string;
  avgOwnership: number; // avg ownership % of their picks
  projectedScore: number;
  risk: "safe" | "balanced" | "bold";
}

export interface TierBreakdown {
  tier: number;
  label: string;
  topPick: string;
  topPickOwnership: number;
  concentration: number; // 0–100, how concentrated picks are in 1 golfer
}

// 15-entry pool — who picked what, as ownership %
export const GOLFER_OWNERSHIP: GolferOwnership[] = [
  { name: "Scottie Scheffler", tier: 1, ownership: 100, pickedBy: 15, projectedScore: -18, isContrarianPick: false, country: "🇺🇸" },
  { name: "Rory McIlroy",      tier: 2, ownership: 87,  pickedBy: 13, projectedScore: -14, isContrarianPick: false, country: "🇬🇧" },
  { name: "Jon Rahm",          tier: 2, ownership: 13,  pickedBy: 2,  projectedScore: -10, isContrarianPick: true,  country: "🇪🇸" },
  { name: "Tommy Fleetwood",   tier: 3, ownership: 60,  pickedBy: 9,  projectedScore: -8,  isContrarianPick: false, country: "🇬🇧" },
  { name: "Xander Schauffele", tier: 3, ownership: 40,  pickedBy: 6,  projectedScore: -7,  isContrarianPick: false, country: "🇺🇸" },
  { name: "Collin Morikawa",   tier: 4, ownership: 67,  pickedBy: 10, projectedScore: -6,  isContrarianPick: false, country: "🇺🇸" },
  { name: "Viktor Hovland",    tier: 4, ownership: 33,  pickedBy: 5,  projectedScore: -5,  isContrarianPick: false, country: "🇳🇴" },
  { name: "Cameron Young",     tier: 5, ownership: 53,  pickedBy: 8,  projectedScore: -9,  isContrarianPick: false, country: "🇺🇸" },
  { name: "Max Homa",          tier: 5, ownership: 47,  pickedBy: 7,  projectedScore: -4,  isContrarianPick: false, country: "🇺🇸" },
  { name: "Brian Harman",      tier: 6, ownership: 27,  pickedBy: 4,  projectedScore: -3,  isContrarianPick: false, country: "🇺🇸" },
  { name: "Rickie Fowler",     tier: 6, ownership: 47,  pickedBy: 7,  projectedScore: -5,  isContrarianPick: false, country: "🇺🇸" },
  { name: "Sepp Straka",       tier: 7, ownership: 13,  pickedBy: 2,  projectedScore: -2,  isContrarianPick: true,  country: "🇦🇹" },
  { name: "Shane Lowry",       tier: 7, ownership: 53,  pickedBy: 8,  projectedScore: -4,  isContrarianPick: false, country: "🇮🇪" },
  { name: "Corey Conners",     tier: 8, ownership: 33,  pickedBy: 5,  projectedScore: -1,  isContrarianPick: false, country: "🇨🇦" },
  { name: "Cameron Young",     tier: 8, ownership: 47,  pickedBy: 7,  projectedScore: -2,  isContrarianPick: false, country: "🇺🇸" },
  { name: "Nicolai Højgaard",  tier: 9, ownership: 20,  pickedBy: 3,  projectedScore: 0,   isContrarianPick: false, country: "🇩🇰" },
  { name: "Mackenzie Hughes",  tier: 9, ownership: 7,   pickedBy: 1,  projectedScore: 1,   isContrarianPick: true,  country: "🇨🇦" },
  { name: "Lucas Herbert",     tier: 9, ownership: 7,   pickedBy: 1,  projectedScore: 0,   isContrarianPick: true,  country: "🇦🇺" },
];

// Deduplicated, top golfers for ownership chart
export const OWNERSHIP_CHART_DATA: GolferOwnership[] = [
  { name: "Scheffler",    tier: 1, ownership: 100, pickedBy: 15, projectedScore: -18, isContrarianPick: false, country: "🇺🇸" },
  { name: "McIlroy",      tier: 2, ownership: 87,  pickedBy: 13, projectedScore: -14, isContrarianPick: false, country: "🇬🇧" },
  { name: "Morikawa",     tier: 4, ownership: 67,  pickedBy: 10, projectedScore: -6,  isContrarianPick: false, country: "🇺🇸" },
  { name: "Fleetwood",    tier: 3, ownership: 60,  pickedBy: 9,  projectedScore: -8,  isContrarianPick: false, country: "🇬🇧" },
  { name: "C. Young",     tier: 5, ownership: 53,  pickedBy: 8,  projectedScore: -9,  isContrarianPick: false, country: "🇺🇸" },
  { name: "Lowry",        tier: 7, ownership: 53,  pickedBy: 8,  projectedScore: -4,  isContrarianPick: false, country: "🇮🇪" },
  { name: "Homa",         tier: 5, ownership: 47,  pickedBy: 7,  projectedScore: -4,  isContrarianPick: false, country: "🇺🇸" },
  { name: "Fowler",       tier: 6, ownership: 47,  pickedBy: 7,  projectedScore: -5,  isContrarianPick: false, country: "🇺🇸" },
  { name: "Conners",      tier: 8, ownership: 33,  pickedBy: 5,  projectedScore: -1,  isContrarianPick: false, country: "🇨🇦" },
  { name: "Hovland",      tier: 4, ownership: 33,  pickedBy: 5,  projectedScore: -5,  isContrarianPick: false, country: "🇳🇴" },
  { name: "Harman",       tier: 6, ownership: 27,  pickedBy: 4,  projectedScore: -3,  isContrarianPick: false, country: "🇺🇸" },
  { name: "Højgaard",     tier: 9, ownership: 20,  pickedBy: 3,  projectedScore: 0,   isContrarianPick: false, country: "🇩🇰" },
  { name: "Straka",       tier: 7, ownership: 13,  pickedBy: 2,  projectedScore: -2,  isContrarianPick: true,  country: "🇦🇹" },
  { name: "Rahm",         tier: 2, ownership: 13,  pickedBy: 2,  projectedScore: -10, isContrarianPick: true,  country: "🇪🇸" },
  { name: "M. Hughes",    tier: 9, ownership: 7,   pickedBy: 1,  projectedScore: 1,   isContrarianPick: true,  country: "🇨🇦" },
  { name: "L. Herbert",   tier: 9, ownership: 7,   pickedBy: 1,  projectedScore: 0,   isContrarianPick: true,  country: "🇦🇺" },
];

// Per-participant risk profile (avg ownership + projected score)
export const PARTICIPANT_RISK: ParticipantRisk[] = [
  { name: "Ryan M.",   avgOwnership: 68, projectedScore: -12, risk: "safe" },
  { name: "Wes U.",    avgOwnership: 55, projectedScore: -10, risk: "balanced" },
  { name: "Mike W.",   avgOwnership: 71, projectedScore: -9,  risk: "safe" },
  { name: "Drake F.",  avgOwnership: 42, projectedScore: -7,  risk: "balanced" },
  { name: "Will A.",   avgOwnership: 38, projectedScore: -6,  risk: "bold" },
  { name: "Jake P.",   avgOwnership: 61, projectedScore: -5,  risk: "safe" },
  { name: "Chris M.",  avgOwnership: 29, projectedScore: -4,  risk: "bold" },
  { name: "Tyler B.",  avgOwnership: 74, projectedScore: -3,  risk: "safe" },
  { name: "Alex C.",   avgOwnership: 48, projectedScore: -2,  risk: "balanced" },
  { name: "Sam R.",    avgOwnership: 33, projectedScore: -1,  risk: "bold" },
  { name: "Jordan L.", avgOwnership: 65, projectedScore: 0,   risk: "safe" },
  { name: "Casey W.",  avgOwnership: 52, projectedScore: 1,   risk: "balanced" },
  { name: "Morgan T.", avgOwnership: 44, projectedScore: 2,   risk: "balanced" },
  { name: "Riley A.",  avgOwnership: 27, projectedScore: 3,   risk: "bold" },
  { name: "Quinn D.",  avgOwnership: 58, projectedScore: 5,   risk: "safe" },
];

// Tier breakdown — concentration of picks within each tier
export const TIER_BREAKDOWN = [
  { tier: 1, label: "Tier 1",  topPick: "Scottie Scheffler", topPickOwnership: 100, concentration: 100 },
  { tier: 2, label: "Tier 2",  topPick: "Rory McIlroy",      topPickOwnership: 87,  concentration: 87  },
  { tier: 3, label: "Tier 3",  topPick: "Tommy Fleetwood",   topPickOwnership: 60,  concentration: 67  },
  { tier: 4, label: "Tier 4",  topPick: "Collin Morikawa",   topPickOwnership: 67,  concentration: 73  },
  { tier: 5, label: "Tier 5",  topPick: "Cameron Young",     topPickOwnership: 53,  concentration: 53  },
  { tier: 6, label: "Tier 6",  topPick: "Rickie Fowler",     topPickOwnership: 47,  concentration: 58  },
  { tier: 7, label: "Tier 7",  topPick: "Shane Lowry",       topPickOwnership: 53,  concentration: 62  },
  { tier: 8, label: "Tier 8",  topPick: "Corey Conners",     topPickOwnership: 33,  concentration: 45  },
  { tier: 9, label: "Tier 9",  topPick: "Nicolai Højgaard",  topPickOwnership: 20,  concentration: 31  },
];

// Contrarian / "bold" picks — picked by ≤ 2 people
export const CONTRARIAN_PICKS = OWNERSHIP_CHART_DATA.filter(g => g.pickedBy <= 2);

// Consensus picks — picked by ≥ 10 people (boring / consensus)
export const CONSENSUS_PICKS = OWNERSHIP_CHART_DATA.filter(g => g.pickedBy >= 10);
