import { PLAYERS, type PlayerData } from "./players";

export type GolferStatus = "counting" | "bench" | "cut";

export interface GolferPick {
  /** Golfer name (matches PlayerData.name) */
  golferName: string;
  /** Tier 1–9 */
  tier: number;
  /** Round scores (null = not yet played) */
  rounds: [number | null, number | null, number | null, number | null];
  /** Total tournament score relative to par */
  totalScore: number | null;
  /** Current tournament position (e.g. "T5", "1", "MC") */
  position: string | null;
  /** Whether this golfer is counting, on the bench, or cut */
  status: GolferStatus;
}

export interface ParticipantPicks {
  /** Participant name (matches standings) */
  name: string;
  /** 9 picks, one per tier */
  picks: GolferPick[];
  /** Pool total score (best 4 of 9 counting) */
  poolScore: number;
  /** Projected finish position */
  projectedFinish: number;
  /** Top-3 probability (0–100) */
  top3Chance: number;
  /** Top-10 probability (0–100) */
  top10Chance: number;
}

// Helper: find a player by name
function findPlayer(name: string): PlayerData | undefined {
  return PLAYERS.find((p) => p.name === name);
}

// Helper: build a pick
function pick(
  golferName: string,
  rounds: [number | null, number | null, number | null, number | null],
  totalScore: number | null,
  position: string | null,
  status: GolferStatus
): GolferPick {
  const player = findPlayer(golferName);
  return {
    golferName,
    tier: player?.tier ?? 0,
    rounds,
    totalScore,
    position,
    status,
  };
}

/**
 * Mock picks for all 15 participants.
 * Simulates mid-tournament (after Round 2) state.
 * Best 4 of 9 count toward pool score.
 */
export const MOCK_PARTICIPANT_PICKS: ParticipantPicks[] = [
  {
    name: "Ryan McKenzie",
    picks: [
      pick("Scottie Scheffler", [-5, -3, null, null], -8, "T2", "counting"),
      pick("Ludvig Åberg", [-4, -4, null, null], -8, "T2", "counting"),
      pick("Hideki Matsuyama", [-3, -2, null, null], -5, "T8", "counting"),
      pick("Patrick Cantlay", [-2, -1, null, null], -3, "T15", "bench"),
      pick("Shane Lowry", [-1, 1, null, null], 0, "T30", "bench"),
      pick("Russell Henley", [-2, -2, null, null], -4, "T10", "counting"),
      pick("Keegan Bradley", [1, -1, null, null], 0, "T30", "bench"),
      pick("Tom Kim", [-1, 2, null, null], 1, "T40", "bench"),
      pick("Adam Scott", [3, 5, null, null], null, "MC", "cut"),
    ],
    poolScore: -25,
    projectedFinish: 1,
    top3Chance: 45,
    top10Chance: 82,
  },
  {
    name: "Wes Upchurch",
    picks: [
      pick("Xander Schauffele", [-4, -3, null, null], -7, "T4", "counting"),
      pick("Collin Morikawa", [-3, -3, null, null], -6, "T6", "counting"),
      pick("Tommy Fleetwood", [-2, -3, null, null], -5, "T8", "counting"),
      pick("Sahith Theegala", [-1, -2, null, null], -3, "T15", "bench"),
      pick("Wyndham Clark", [-2, 0, null, null], -2, "T20", "bench"),
      pick("Cameron Smith", [-3, -1, null, null], -4, "T10", "counting"),
      pick("Bryson DeChambeau", [0, -2, null, null], -2, "T20", "bench"),
      pick("Corey Conners", [-1, 0, null, null], -1, "T25", "bench"),
      pick("Jordan Spieth", [4, 6, null, null], null, "MC", "cut"),
    ],
    poolScore: -22,
    projectedFinish: 2,
    top3Chance: 38,
    top10Chance: 75,
  },
  {
    name: "Mike Walton",
    picks: [
      pick("Rory McIlroy", [-3, -4, null, null], -7, "T4", "counting"),
      pick("Jon Rahm", [-4, -2, null, null], -6, "T6", "counting"),
      pick("Viktor Hovland", [-2, -1, null, null], -3, "T15", "bench"),
      pick("Tony Finau", [-3, -1, null, null], -4, "T10", "counting"),
      pick("Sungjae Im", [-1, -2, null, null], -3, "T15", "bench"),
      pick("Justin Thomas", [-2, -3, null, null], -5, "T8", "counting"),
      pick("Joaquín Niemann", [0, -1, null, null], -1, "T25", "bench"),
      pick("Cameron Young", [1, -2, null, null], -1, "T25", "bench"),
      pick("Dustin Johnson", [5, 4, null, null], null, "MC", "cut"),
    ],
    poolScore: -22,
    projectedFinish: 3,
    top3Chance: 32,
    top10Chance: 70,
  },
  {
    name: "Drake Fages",
    picks: [
      pick("Scottie Scheffler", [-5, -3, null, null], -8, "T2", "counting"),
      pick("Collin Morikawa", [-3, -3, null, null], -6, "T6", "counting"),
      pick("Brooks Koepka", [-1, -2, null, null], -3, "T15", "bench"),
      pick("Patrick Cantlay", [-2, -1, null, null], -3, "T15", "bench"),
      pick("Min Woo Lee", [-2, -3, null, null], -5, "T8", "counting"),
      pick("Robert MacIntyre", [-1, -1, null, null], -2, "T20", "bench"),
      pick("Tyrrell Hatton", [-3, 0, null, null], -3, "T15", "counting"),
      pick("Sepp Straka", [0, -1, null, null], -1, "T25", "bench"),
      pick("Phil Mickelson", [6, 5, null, null], null, "MC", "cut"),
    ],
    poolScore: -22,
    projectedFinish: 4,
    top3Chance: 25,
    top10Chance: 65,
  },
  {
    name: "Will Armstrong",
    picks: [
      pick("Rory McIlroy", [-3, -4, null, null], -7, "T4", "counting"),
      pick("Ludvig Åberg", [-4, -4, null, null], -8, "T2", "counting"),
      pick("Hideki Matsuyama", [-3, -2, null, null], -5, "T8", "counting"),
      pick("Sahith Theegala", [-1, -2, null, null], -3, "T15", "bench"),
      pick("Shane Lowry", [-1, 1, null, null], 0, "T30", "bench"),
      pick("Cameron Smith", [-3, -1, null, null], -4, "T10", "counting"),
      pick("Keegan Bradley", [1, -1, null, null], 0, "T30", "bench"),
      pick("Tom Kim", [-1, 2, null, null], 1, "T40", "bench"),
      pick("Jordan Spieth", [4, 6, null, null], null, "MC", "cut"),
    ],
    poolScore: -24,
    projectedFinish: 2,
    top3Chance: 35,
    top10Chance: 72,
  },
  {
    name: "Jake Patterson",
    picks: [
      pick("Xander Schauffele", [-4, -3, null, null], -7, "T4", "counting"),
      pick("Jon Rahm", [-4, -2, null, null], -6, "T6", "counting"),
      pick("Tommy Fleetwood", [-2, -3, null, null], -5, "T8", "counting"),
      pick("Tony Finau", [-3, -1, null, null], -4, "T10", "bench"),
      pick("Wyndham Clark", [-2, 0, null, null], -2, "T20", "bench"),
      pick("Russell Henley", [-2, -2, null, null], -4, "T10", "counting"),
      pick("Bryson DeChambeau", [0, -2, null, null], -2, "T20", "bench"),
      pick("Corey Conners", [-1, 0, null, null], -1, "T25", "bench"),
      pick("Adam Scott", [3, 5, null, null], null, "MC", "cut"),
    ],
    poolScore: -22,
    projectedFinish: 5,
    top3Chance: 20,
    top10Chance: 60,
  },
  {
    name: "Chris Martinez",
    picks: [
      pick("Scottie Scheffler", [-5, -3, null, null], -8, "T2", "counting"),
      pick("Collin Morikawa", [-3, -3, null, null], -6, "T6", "counting"),
      pick("Viktor Hovland", [-2, -1, null, null], -3, "T15", "bench"),
      pick("Sahith Theegala", [-1, -2, null, null], -3, "T15", "bench"),
      pick("Sungjae Im", [-1, -2, null, null], -3, "T15", "bench"),
      pick("Justin Thomas", [-2, -3, null, null], -5, "T8", "counting"),
      pick("Joaquín Niemann", [0, -1, null, null], -1, "T25", "bench"),
      pick("Sepp Straka", [0, -1, null, null], -1, "T25", "bench"),
      pick("Dustin Johnson", [5, 4, null, null], null, "MC", "cut"),
    ],
    poolScore: -19,
    projectedFinish: 7,
    top3Chance: 12,
    top10Chance: 48,
  },
  {
    name: "Tyler Brooks",
    picks: [
      pick("Rory McIlroy", [-3, -4, null, null], -7, "T4", "counting"),
      pick("Jon Rahm", [-4, -2, null, null], -6, "T6", "counting"),
      pick("Brooks Koepka", [-1, -2, null, null], -3, "T15", "bench"),
      pick("Patrick Cantlay", [-2, -1, null, null], -3, "T15", "bench"),
      pick("Shane Lowry", [-1, 1, null, null], 0, "T30", "bench"),
      pick("Robert MacIntyre", [-1, -1, null, null], -2, "T20", "bench"),
      pick("Tyrrell Hatton", [-3, 0, null, null], -3, "T15", "counting"),
      pick("Cameron Young", [1, -2, null, null], -1, "T25", "bench"),
      pick("Phil Mickelson", [6, 5, null, null], null, "MC", "cut"),
    ],
    poolScore: -16,
    projectedFinish: 8,
    top3Chance: 8,
    top10Chance: 40,
  },
  {
    name: "Alex Chen",
    picks: [
      pick("Xander Schauffele", [-4, -3, null, null], -7, "T4", "counting"),
      pick("Ludvig Åberg", [-4, -4, null, null], -8, "T2", "counting"),
      pick("Hideki Matsuyama", [-3, -2, null, null], -5, "T8", "counting"),
      pick("Tony Finau", [-3, -1, null, null], -4, "T10", "bench"),
      pick("Min Woo Lee", [-2, -3, null, null], -5, "T8", "counting"),
      pick("Cameron Smith", [-3, -1, null, null], -4, "T10", "bench"),
      pick("Keegan Bradley", [1, -1, null, null], 0, "T30", "bench"),
      pick("Corey Conners", [-1, 0, null, null], -1, "T25", "bench"),
      pick("Jordan Spieth", [4, 6, null, null], null, "MC", "cut"),
    ],
    poolScore: -25,
    projectedFinish: 1,
    top3Chance: 42,
    top10Chance: 80,
  },
  {
    name: "Sam Rivera",
    picks: [
      pick("Rory McIlroy", [-3, -4, null, null], -7, "T4", "counting"),
      pick("Collin Morikawa", [-3, -3, null, null], -6, "T6", "counting"),
      pick("Tommy Fleetwood", [-2, -3, null, null], -5, "T8", "bench"),
      pick("Sahith Theegala", [-1, -2, null, null], -3, "T15", "bench"),
      pick("Wyndham Clark", [-2, 0, null, null], -2, "T20", "bench"),
      pick("Justin Thomas", [-2, -3, null, null], -5, "T8", "counting"),
      pick("Bryson DeChambeau", [0, -2, null, null], -2, "T20", "bench"),
      pick("Tom Kim", [-1, 2, null, null], 1, "T40", "bench"),
      pick("Adam Scott", [3, 5, null, null], null, "MC", "cut"),
    ],
    poolScore: -18,
    projectedFinish: 9,
    top3Chance: 6,
    top10Chance: 35,
  },
  {
    name: "Jordan Lee",
    picks: [
      pick("Scottie Scheffler", [-5, -3, null, null], -8, "T2", "counting"),
      pick("Jon Rahm", [-4, -2, null, null], -6, "T6", "counting"),
      pick("Viktor Hovland", [-2, -1, null, null], -3, "T15", "bench"),
      pick("Patrick Cantlay", [-2, -1, null, null], -3, "T15", "bench"),
      pick("Sungjae Im", [-1, -2, null, null], -3, "T15", "bench"),
      pick("Russell Henley", [-2, -2, null, null], -4, "T10", "counting"),
      pick("Joaquín Niemann", [0, -1, null, null], -1, "T25", "bench"),
      pick("Sepp Straka", [0, -1, null, null], -1, "T25", "bench"),
      pick("Dustin Johnson", [5, 4, null, null], null, "MC", "cut"),
    ],
    poolScore: -18,
    projectedFinish: 10,
    top3Chance: 5,
    top10Chance: 30,
  },
  {
    name: "Casey Williams",
    picks: [
      pick("Xander Schauffele", [-4, -3, null, null], -7, "T4", "counting"),
      pick("Ludvig Åberg", [-4, -4, null, null], -8, "T2", "counting"),
      pick("Brooks Koepka", [-1, -2, null, null], -3, "T15", "bench"),
      pick("Tony Finau", [-3, -1, null, null], -4, "T10", "bench"),
      pick("Shane Lowry", [-1, 1, null, null], 0, "T30", "bench"),
      pick("Robert MacIntyre", [-1, -1, null, null], -2, "T20", "bench"),
      pick("Tyrrell Hatton", [-3, 0, null, null], -3, "T15", "counting"),
      pick("Cameron Young", [1, -2, null, null], -1, "T25", "bench"),
      pick("Phil Mickelson", [6, 5, null, null], null, "MC", "cut"),
    ],
    poolScore: -18,
    projectedFinish: 11,
    top3Chance: 4,
    top10Chance: 25,
  },
  {
    name: "Morgan Taylor",
    picks: [
      pick("Rory McIlroy", [-3, -4, null, null], -7, "T4", "counting"),
      pick("Collin Morikawa", [-3, -3, null, null], -6, "T6", "counting"),
      pick("Hideki Matsuyama", [-3, -2, null, null], -5, "T8", "counting"),
      pick("Sahith Theegala", [-1, -2, null, null], -3, "T15", "bench"),
      pick("Min Woo Lee", [-2, -3, null, null], -5, "T8", "counting"),
      pick("Cameron Smith", [-3, -1, null, null], -4, "T10", "bench"),
      pick("Keegan Bradley", [1, -1, null, null], 0, "T30", "bench"),
      pick("Corey Conners", [-1, 0, null, null], -1, "T25", "bench"),
      pick("Jordan Spieth", [4, 6, null, null], null, "MC", "cut"),
    ],
    poolScore: -23,
    projectedFinish: 3,
    top3Chance: 28,
    top10Chance: 68,
  },
  {
    name: "Riley Anderson",
    picks: [
      pick("Scottie Scheffler", [-5, -3, null, null], -8, "T2", "counting"),
      pick("Jon Rahm", [-4, -2, null, null], -6, "T6", "counting"),
      pick("Tommy Fleetwood", [-2, -3, null, null], -5, "T8", "counting"),
      pick("Patrick Cantlay", [-2, -1, null, null], -3, "T15", "bench"),
      pick("Wyndham Clark", [-2, 0, null, null], -2, "T20", "bench"),
      pick("Justin Thomas", [-2, -3, null, null], -5, "T8", "counting"),
      pick("Bryson DeChambeau", [0, -2, null, null], -2, "T20", "bench"),
      pick("Tom Kim", [-1, 2, null, null], 1, "T40", "bench"),
      pick("Adam Scott", [3, 5, null, null], null, "MC", "cut"),
    ],
    poolScore: -24,
    projectedFinish: 2,
    top3Chance: 30,
    top10Chance: 65,
  },
  {
    name: "Quinn Davis",
    picks: [
      pick("Xander Schauffele", [-4, -3, null, null], -7, "T4", "counting"),
      pick("Collin Morikawa", [-3, -3, null, null], -6, "T6", "counting"),
      pick("Viktor Hovland", [-2, -1, null, null], -3, "T15", "bench"),
      pick("Tony Finau", [-3, -1, null, null], -4, "T10", "bench"),
      pick("Sungjae Im", [-1, -2, null, null], -3, "T15", "bench"),
      pick("Russell Henley", [-2, -2, null, null], -4, "T10", "counting"),
      pick("Joaquín Niemann", [0, -1, null, null], -1, "T25", "bench"),
      pick("Sepp Straka", [0, -1, null, null], -1, "T25", "bench"),
      pick("Phil Mickelson", [6, 5, null, null], null, "MC", "cut"),
    ],
    poolScore: -17,
    projectedFinish: 12,
    top3Chance: 3,
    top10Chance: 20,
  },
];

/** Look up a participant's picks by name */
export function getParticipantPicks(
  name: string
): ParticipantPicks | undefined {
  return MOCK_PARTICIPANT_PICKS.find((p) => p.name === name);
}

/** Get the top N counting golfers for a participant */
export function getCountingGolfers(
  picks: GolferPick[],
  n: number = 4
): GolferPick[] {
  return picks.filter((p) => p.status === "counting").slice(0, n);
}
