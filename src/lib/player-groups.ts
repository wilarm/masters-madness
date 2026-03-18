/**
 * Player group categorization logic — shared between the pool creation wizard
 * and the Research / My Picks display pages.
 *
 * Returns the bonus group tags a player belongs to based on their data.
 * Used to show small badges next to player names.
 */

import { type PlayerData } from "@/data/players";

export type GroupTag = {
  name: string;
  emoji: string;
  /** Tailwind color classes for the badge */
  color: string;
};

// Manually-maintained categorization lists
const LEFT_HANDED_PLAYERS = new Set(["Phil Mickelson", "Robert MacIntyre", "Bubba Watson"]);

const OVER_35_PLAYERS = new Set([
  "Phil Mickelson", "Adam Scott", "Dustin Johnson", "Jordan Spieth",
  "Tommy Fleetwood", "Keegan Bradley", "Justin Thomas", "Tony Finau",
  "Shane Lowry", "Brooks Koepka", "Hideki Matsuyama",
]);

const FAN_FAVORITE_PLAYERS = new Set([
  "Phil Mickelson", "Jordan Spieth", "Rory McIlroy", "Bryson DeChambeau",
  "Tom Kim", "Tiger Woods",
]);

const LIV_TOUR_PLAYERS = new Set([
  "Brooks Koepka", "Cameron Smith", "Dustin Johnson", "Phil Mickelson",
  "Joaquín Niemann", "Jon Rahm", "Bryson DeChambeau", "Tyrrell Hatton",
  "Sergio Garcia", "Patrick Reed",
]);

const EUROPEAN_COUNTRIES = new Set(["🇬🇧", "🇮🇪", "🇳🇴", "🇸🇪", "🏴󠁧󠁢󠁳󠁣󠁴󠁿", "🇪🇸", "🇦🇹"]);

/**
 * Returns the group tags for a given player based on their data.
 * Tags are ordered by priority — a player in LIV won't also appear
 * as International to avoid redundancy (unless both are relevant).
 */
export function getPlayerGroupTags(player: PlayerData): GroupTag[] {
  const tags: GroupTag[] = [];

  if (player.bestMastersFinish.toLowerCase().includes("won")) {
    tags.push({ name: "Champ", emoji: "🏆", color: "bg-amber-100 text-amber-800" });
  }

  if (LIV_TOUR_PLAYERS.has(player.name)) {
    tags.push({ name: "LIV", emoji: "💰", color: "bg-rose-100 text-rose-700" });
  }

  if (LEFT_HANDED_PLAYERS.has(player.name)) {
    tags.push({ name: "Lefty", emoji: "🤚", color: "bg-sky-100 text-sky-700" });
  }

  if (player.mastersAppearances <= 2) {
    tags.push({ name: "Rookie", emoji: "⭐", color: "bg-purple-100 text-purple-700" });
  }

  if (OVER_35_PLAYERS.has(player.name)) {
    tags.push({ name: "35+", emoji: "👴", color: "bg-stone-100 text-stone-700" });
  }

  if (FAN_FAVORITE_PLAYERS.has(player.name)) {
    tags.push({ name: "Fan Fav", emoji: "🎉", color: "bg-pink-100 text-pink-700" });
  }

  if (EUROPEAN_COUNTRIES.has(player.country) && !LIV_TOUR_PLAYERS.has(player.name)) {
    tags.push({ name: "Euro Tour", emoji: "🇪🇺", color: "bg-blue-100 text-blue-700" });
  }

  if (player.country !== "🇺🇸" && tags.length === 0) {
    tags.push({ name: "Intl", emoji: "🌍", color: "bg-teal-100 text-teal-700" });
  }

  return tags;
}
