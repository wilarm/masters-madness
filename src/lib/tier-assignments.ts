/**
 * Dynamic tier assignment utility.
 *
 * Players are ranked by oddsNum (ascending) then currentRank.
 * Tiers are built by slicing the sorted list based on playersPerTier.
 *
 * - Demo / logged-out: DEMO_NUM_TIERS × DEMO_PLAYERS_PER_TIER (9 × 5 = top 45 players)
 * - Real pool: numTiers × playersPerTier from pool.config
 */

import { PLAYERS, type PlayerData } from "@/data/players";

export const DEMO_NUM_TIERS = 9;
export const DEMO_PLAYERS_PER_TIER = 5;

/** All players sorted by odds ranking (ascending oddsNum, then currentRank as tiebreaker) */
export const PLAYERS_BY_ODDS: PlayerData[] = [...PLAYERS].sort((a, b) => {
  if (a.oddsNum !== b.oddsNum) return a.oddsNum - b.oddsNum;
  return a.currentRank - b.currentRank;
});

/**
 * Returns the players assigned to a given tier number, given the pool's tier config.
 * Tier numbers are 1-indexed.
 */
export function getTierPlayers(
  tierNum: number,
  playersPerTier: number
): PlayerData[] {
  const start = (tierNum - 1) * playersPerTier;
  const end = start + playersPerTier;
  return PLAYERS_BY_ODDS.slice(start, end);
}

/**
 * Returns a map of tierNum → PlayerData[] for the full set of configured tiers.
 * Any players beyond numTiers × playersPerTier are excluded (they belong to
 * pools with more tiers or larger groups).
 */
export function buildTierMap(
  numTiers: number,
  playersPerTier: number
): Map<number, PlayerData[]> {
  const map = new Map<number, PlayerData[]>();
  for (let i = 1; i <= numTiers; i++) {
    map.set(i, getTierPlayers(i, playersPerTier));
  }
  return map;
}
