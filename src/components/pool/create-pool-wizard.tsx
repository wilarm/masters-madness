"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { PLAYERS, type PlayerData } from "@/data/players";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type PayoutTemplate = "winner-take-all" | "top-3" | "top-5" | "custom";

type CustomGroup = {
  name: string;
  description: string;
  emoji: string;
};

type PoolConfig = {
  name: string;
  description: string;
  isPublic: boolean;
  // Odds-based tiers
  numTiers: number;
  playersPerTier: number;
  includeWriteIn: boolean;
  // Bonus custom groups (added alongside odds tiers)
  customGroups: CustomGroup[];
  // Manual overrides: playerName → target groupKey (e.g., "tier-1", "bonus-Past Champions", "write-in")
  groupOverrides: Record<string, string>;
  picksPerGroup: number; // how many golfers a participant picks from each group (1–3)
  picksCount: number;
  applyCutRule: boolean;
  entryFee: number;
  maxEntries: number;
  payoutTemplate: PayoutTemplate;
  customPayouts: { place: number; percentage: number }[];
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STEPS = [
  "Pool Basics",
  "Tier Configuration",
  "Scoring Rules",
  "Entry & Payouts",
  "Review & Create",
] as const;

const PAYOUT_PRESETS: Record<
  Exclude<PayoutTemplate, "custom">,
  { place: number; percentage: number }[]
> = {
  "winner-take-all": [{ place: 1, percentage: 100 }],
  "top-3": [
    { place: 1, percentage: 65 },
    { place: 2, percentage: 25 },
    { place: 3, percentage: 10 },
  ],
  "top-5": [
    { place: 1, percentage: 45 },
    { place: 2, percentage: 25 },
    { place: 3, percentage: 15 },
    { place: 4, percentage: 10 },
    { place: 5, percentage: 5 },
  ],
};

/** Pre-built bonus group templates — commissioner picks from these */
const GROUP_TEMPLATES: CustomGroup[] = [
  { name: "International", description: "Non-US players only", emoji: "🌍" },
  { name: "Left-Handed", description: "Southpaw golfers", emoji: "🤚" },
  { name: "Past Champions", description: "Previous Masters winners", emoji: "🏆" },
  { name: "Amateurs", description: "Amateur golfers in the field", emoji: "🎓" },
  { name: "35+ Year Olds", description: "Veterans aged 35 and over", emoji: "👴" },
  { name: "First-Timers", description: "Making their Masters debut", emoji: "⭐" },
  { name: "Fan Favorites", description: "The crowd pleasers", emoji: "🎉" },
  { name: "European Tour", description: "DP World Tour players", emoji: "🇪🇺" },
  { name: "LIV Tour", description: "LIV Golf players", emoji: "💰" },
];

const TOTAL_FIELD_SIZE = 90; // approximate Masters field size

const DEFAULT_CONFIG: PoolConfig = {
  name: "",
  description: "",
  isPublic: true,
  numTiers: 9,
  playersPerTier: 4,
  includeWriteIn: true,
  customGroups: [],
  groupOverrides: {},
  picksPerGroup: 1,
  picksCount: 4,
  applyCutRule: true,
  entryFee: 100,
  maxEntries: 2,
  payoutTemplate: "top-3",
  customPayouts: [
    { place: 1, percentage: 65 },
    { place: 2, percentage: 25 },
    { place: 3, percentage: 10 },
  ],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getPayouts(config: PoolConfig) {
  if (config.payoutTemplate === "custom") return config.customPayouts;
  return PAYOUT_PRESETS[config.payoutTemplate];
}

function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** Total pick groups = odds tiers + (write-in ? 1 : 0) + custom groups */
function getTotalGroups(config: PoolConfig): number {
  return config.numTiers + (config.includeWriteIn ? 1 : 0) + config.customGroups.length;
}

/** How many players land in the write-in catch-all tier */
function getWriteInCount(config: PoolConfig): number {
  const filled = config.numTiers * config.playersPerTier;
  return Math.max(0, TOTAL_FIELD_SIZE - filled);
}

// Known categorizations (from player data + manual knowledge)
const LEFT_HANDED_PLAYERS = ["Phil Mickelson", "Robert MacIntyre", "Bubba Watson"];
const OVER_35_PLAYERS = ["Phil Mickelson", "Adam Scott", "Dustin Johnson", "Jordan Spieth", "Tommy Fleetwood", "Keegan Bradley", "Justin Thomas", "Tony Finau", "Shane Lowry", "Brooks Koepka", "Hideki Matsuyama"];
const FAN_FAVORITE_PLAYERS = ["Phil Mickelson", "Jordan Spieth", "Rory McIlroy", "Bryson DeChambeau", "Tom Kim", "Tiger Woods"];
const LIV_TOUR_PLAYERS = ["Brooks Koepka", "Cameron Smith", "Dustin Johnson", "Phil Mickelson", "Joaquín Niemann", "Jon Rahm", "Bryson DeChambeau", "Tyrrell Hatton", "Sergio Garcia", "Patrick Reed"];

/** Auto-assign players to a bonus group by name */
function getAutoGroupPlayers(groupName: string): string[] {
  switch (groupName) {
    case "International":
      return PLAYERS.filter((p) => p.country !== "🇺🇸").map((p) => p.name);
    case "Past Champions":
      return PLAYERS.filter((p) => p.bestMastersFinish.includes("Won")).map((p) => p.name);
    case "Left-Handed":
      return PLAYERS.filter((p) => LEFT_HANDED_PLAYERS.includes(p.name)).map((p) => p.name);
    case "Amateurs":
      return []; // No amateurs in current data
    case "35+ Year Olds":
      return PLAYERS.filter((p) => OVER_35_PLAYERS.includes(p.name)).map((p) => p.name);
    case "First-Timers":
      return PLAYERS.filter((p) => p.mastersAppearances <= 2).map((p) => p.name);
    case "Fan Favorites":
      return PLAYERS.filter((p) => FAN_FAVORITE_PLAYERS.includes(p.name)).map((p) => p.name);
    case "European Tour":
      return PLAYERS.filter((p) =>
        ["🇬🇧", "🇮🇪", "🇳🇴", "🇸🇪", "🏴󠁧󠁢󠁳󠁣󠁴󠁿", "🇪🇸", "🇦🇹"].includes(p.country)
      ).map((p) => p.name);
    case "LIV Tour":
      return PLAYERS.filter((p) => LIV_TOUR_PLAYERS.includes(p.name)).map((p) => p.name);
    default:
      return [];
  }
}

type GroupAssignment = {
  key: string;
  label: string;
  emoji?: string;
  description?: string;
  type: "tier" | "write-in" | "bonus";
  players: PlayerData[];
};

/** Compute full player assignments across all groups.
 *  Guarantees no player ever appears in more than one group:
 *  - Manual overrides take highest priority
 *  - Bonus groups claim their auto-assigned players first (in order added)
 *  - Remaining players fill odds-based tiers in rank order
 *  - Write-in catches everyone left over
 */
function computeAssignments(config: PoolConfig): GroupAssignment[] {
  const overrides = config.groupOverrides;

  // ── Step 1: Build bonus group membership ──────────────────────────────────
  // Process groups in order — first group wins when a player qualifies for multiple.
  const bonusGroupMembers: Record<string, Set<string>> = {};
  const claimedByBonus = new Set<string>(); // all players locked into any bonus group

  for (const group of config.customGroups) {
    const key = `bonus-${group.name}`;
    const members = new Set<string>();

    // Players explicitly overridden TO this group always get included
    for (const [name, target] of Object.entries(overrides)) {
      if (target === key) {
        members.add(name);
        claimedByBonus.add(name);
      }
    }

    // Auto-assign players not yet claimed by an earlier bonus group
    for (const name of getAutoGroupPlayers(group.name)) {
      if (claimedByBonus.has(name)) continue;             // earlier group already claimed
      if (overrides[name] && overrides[name] !== key) continue; // manually moved elsewhere
      members.add(name);
      claimedByBonus.add(name);
    }

    bonusGroupMembers[group.name] = members;
  }

  // ── Step 2: Build sorted tier candidate pool ───────────────────────────────
  const tierCandidates = PLAYERS
    .filter((p) => {
      if (overrides[p.name]?.startsWith("tier-")) return true;  // manually sent to a tier
      if (overrides[p.name] === "write-in") return false;        // manually sent to write-in
      if (claimedByBonus.has(p.name)) return false;              // belongs to a bonus group
      return true;
    })
    .sort((a, b) => a.currentRank - b.currentRank);

  // ── Step 3: Assign odds-based tiers ───────────────────────────────────────
  const assignedToTiers = new Set<string>();
  const groups: GroupAssignment[] = [];

  for (let i = 0; i < config.numTiers; i++) {
    const tierKey = `tier-${i + 1}`;
    const tierPlayerList: PlayerData[] = [];
    const placedInTier = new Set<string>();

    // Players explicitly overridden to this tier go first
    for (const [name, target] of Object.entries(overrides)) {
      if (target === tierKey) {
        const player = PLAYERS.find((p) => p.name === name);
        if (player && !placedInTier.has(name)) {
          tierPlayerList.push(player);
          placedInTier.add(name);
          assignedToTiers.add(name);
        }
      }
    }

    // Fill remaining slots from ordered candidates
    for (const candidate of tierCandidates) {
      if (tierPlayerList.length >= config.playersPerTier) break;
      if (assignedToTiers.has(candidate.name)) continue;
      // Skip if this player's tier override points to a different tier
      if (overrides[candidate.name]?.startsWith("tier-") && overrides[candidate.name] !== tierKey) continue;
      tierPlayerList.push(candidate);
      placedInTier.add(candidate.name);
      assignedToTiers.add(candidate.name);
    }

    groups.push({ key: tierKey, label: `Tier ${i + 1}`, type: "tier", players: tierPlayerList });
  }

  // ── Step 4: Add bonus groups ───────────────────────────────────────────────
  for (const group of config.customGroups) {
    const members = bonusGroupMembers[group.name] || new Set();
    groups.push({
      key: `bonus-${group.name}`,
      label: group.name,
      emoji: group.emoji,
      description: group.description,
      type: "bonus",
      players: PLAYERS.filter((p) => members.has(p.name)).sort((a, b) => a.currentRank - b.currentRank),
    });
  }

  // ── Step 5: Write-in catch-all ────────────────────────────────────────────
  if (config.includeWriteIn) {
    const assignedNames = new Set(groups.flatMap((g) => g.players.map((p) => p.name)));
    const writeInPlayers = [
      ...PLAYERS.filter((p) => overrides[p.name] === "write-in" && !assignedNames.has(p.name)),
      ...PLAYERS.filter((p) => !assignedNames.has(p.name) && overrides[p.name] !== "write-in"),
    ].sort((a, b) => a.currentRank - b.currentRank);
    groups.push({ key: "write-in", label: "Write-In", type: "write-in", players: writeInPlayers });
  }

  return groups;
}

// ---------------------------------------------------------------------------
// Step Components
// ---------------------------------------------------------------------------

function StepPoolBasics({
  config,
  onChange,
}: {
  config: PoolConfig;
  onChange: (c: Partial<PoolConfig>) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="pool-name">
          Pool Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="pool-name"
          placeholder="e.g. The Green Jacket Invitational"
          value={config.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="h-10"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="pool-desc">Description (optional)</Label>
        <textarea
          id="pool-desc"
          placeholder="Tell your friends what this pool is about..."
          value={config.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={3}
          className="w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-2 text-base transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-sm dark:bg-input/30"
        />
      </div>

      <div className="space-y-2">
        <Label>Pool Visibility</Label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            role="switch"
            aria-checked={config.isPublic}
            onClick={() => onChange({ isPublic: !config.isPublic })}
            className={`
              relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent
              transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-ring focus-visible:ring-offset-2
              ${config.isPublic ? "bg-[#025928]" : "bg-muted"}
            `}
          >
            <span
              className={`
                pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0
                transition-transform duration-200 ease-in-out
                ${config.isPublic ? "translate-x-5" : "translate-x-0"}
              `}
            />
          </button>
          <span className="text-sm font-medium">
            {config.isPublic ? "Public" : "Private"}
          </span>
          <span className="text-xs text-muted-foreground">
            {config.isPublic
              ? "Anyone with the link can join"
              : "Invite-only access"}
          </span>
        </div>
      </div>
    </div>
  );
}

function StepTierConfig({
  config,
  onChange,
}: {
  config: PoolConfig;
  onChange: (c: Partial<PoolConfig>) => void;
}) {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [movingPlayer, setMovingPlayer] = useState<string | null>(null);

  const totalGroups = getTotalGroups(config);

  const assignments = useMemo(
    () => computeAssignments(config),
    [config]
  );

  function addGroup(template: CustomGroup) {
    if (config.customGroups.some((g) => g.name === template.name)) return;
    onChange({ customGroups: [...config.customGroups, { ...template }] });
  }

  function removeGroup(index: number) {
    const removed = config.customGroups[index];
    // Clear any overrides that reference this group
    const nextOverrides = { ...config.groupOverrides };
    for (const [name, target] of Object.entries(nextOverrides)) {
      if (target === `bonus-${removed.name}`) delete nextOverrides[name];
    }
    onChange({
      customGroups: config.customGroups.filter((_, i) => i !== index),
      groupOverrides: nextOverrides,
    });
  }

  function updateGroup(index: number, field: keyof CustomGroup, value: string) {
    const next = [...config.customGroups];
    next[index] = { ...next[index], [field]: value };
    onChange({ customGroups: next });
  }

  function movePlayer(playerName: string, targetGroupKey: string) {
    onChange({
      groupOverrides: { ...config.groupOverrides, [playerName]: targetGroupKey },
    });
    setMovingPlayer(null);
  }

  function clearOverride(playerName: string) {
    const next = { ...config.groupOverrides };
    delete next[playerName];
    onChange({ groupOverrides: next });
    setMovingPlayer(null);
  }

  const availableTemplates = GROUP_TEMPLATES.filter(
    (t) => !config.customGroups.some((g) => g.name === t.name)
  );

  return (
    <div className="space-y-5">
      {/* Odds-Based Tier Sliders */}
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Number of Tiers</Label>
            <Badge className="bg-[#025928] text-white">{config.numTiers} tiers</Badge>
          </div>
          <Slider
            min={3}
            max={12}
            step={1}
            value={[config.numTiers]}
            onValueChange={(val) => {
              const v = Array.isArray(val) ? val[0] : val;
              onChange({ numTiers: v });
            }}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>3 tiers</span>
            <span>12 tiers</span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Players Per Tier</Label>
            <Badge className="bg-[#025928] text-white">{config.playersPerTier} each</Badge>
          </div>
          <Slider
            min={2}
            max={8}
            step={1}
            value={[config.playersPerTier]}
            onValueChange={(val) => {
              const v = Array.isArray(val) ? val[0] : val;
              onChange({ playersPerTier: v });
            }}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>2 players</span>
            <span>8 players</span>
          </div>
        </div>
      </div>

      <Separator />

      {/* Bonus Groups — above write-in */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label>Bonus Groups</Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Add fun bonus picks alongside odds tiers (optional)
            </p>
          </div>
          {config.customGroups.length > 0 && (
            <Badge className="bg-[#025928] text-white">{config.customGroups.length} added</Badge>
          )}
        </div>

        {/* Added groups — compact cards */}
        {config.customGroups.length > 0 && (
          <div className="space-y-2">
            {config.customGroups.map((group, i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg border border-[#025928]/20 bg-[#025928]/5 p-2.5">
                <span className="text-lg flex-shrink-0">{group.emoji}</span>
                <div className="flex-1 min-w-0">
                  <Input
                    value={group.name}
                    onChange={(e) => updateGroup(i, "name", e.target.value)}
                    className="h-7 text-sm font-medium border-none bg-transparent px-0 focus-visible:ring-0 focus-visible:border-none"
                  />
                  <Input
                    value={group.description}
                    onChange={(e) => updateGroup(i, "description", e.target.value)}
                    placeholder="Description..."
                    className="h-6 text-xs text-muted-foreground border-none bg-transparent px-0 focus-visible:ring-0 focus-visible:border-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeGroup(i)}
                  className="text-xs text-red-500 hover:text-red-700 p-1 flex-shrink-0"
                  aria-label={`Remove ${group.name}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Template pills */}
        {availableTemplates.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {availableTemplates.map((template) => {
              const count = getAutoGroupPlayers(template.name).length;
              return (
                <button
                  key={template.name}
                  type="button"
                  onClick={() => addGroup(template)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-[#025928]/40 hover:bg-[#025928]/5 hover:text-[#025928]"
                >
                  <span>{template.emoji}</span>
                  {template.name}
                  {count > 0 && <span className="text-[10px] opacity-60">({count})</span>}
                  <span className="text-[10px] opacity-50">+</span>
                </button>
              );
            })}
          </div>
        )}

        {config.customGroups.some((g) => !g.name.trim()) && (
          <p className="text-sm text-red-500">All bonus groups must have a name.</p>
        )}
      </div>

      <Separator />

      {/* Write-In Toggle */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Write-In Tier</Label>
          <p className="text-xs text-muted-foreground">
            Catch-all tier for remaining players not in top tiers
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={config.includeWriteIn}
          onClick={() => onChange({ includeWriteIn: !config.includeWriteIn })}
          className={`
            relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent
            transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-ring focus-visible:ring-offset-2
            ${config.includeWriteIn ? "bg-[#025928]" : "bg-muted"}
          `}
        >
          <span
            className={`
              pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0
              transition-transform duration-200 ease-in-out
              ${config.includeWriteIn ? "translate-x-5" : "translate-x-0"}
            `}
          />
        </button>
      </div>

      <Separator />

      {/* Group Visual — all groups with player counts */}
      <div className="space-y-2">
        <Label>Group Preview</Label>
        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 md:grid-cols-5">
          {assignments.map((group) => {
            const isExpanded = expandedGroup === group.key;
            return (
              <button
                key={group.key}
                type="button"
                onClick={() => setExpandedGroup(isExpanded ? null : group.key)}
                className={`
                  flex flex-col items-center gap-0.5 rounded-lg border p-2 transition-colors cursor-pointer text-center
                  ${group.type === "write-in"
                    ? "border-dashed border-amber-400 bg-amber-50 hover:bg-amber-100"
                    : group.type === "bonus"
                    ? "border-purple-300 bg-purple-50 hover:bg-purple-100"
                    : isExpanded
                    ? "border-[#025928] bg-[#025928]/10"
                    : "border-border hover:bg-muted/50"
                  }
                `}
              >
                {group.emoji && <span className="text-sm">{group.emoji}</span>}
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground leading-tight">
                  {group.label}
                </span>
                <span className={`text-lg font-bold ${
                  group.type === "write-in" ? "text-amber-600" : group.type === "bonus" ? "text-purple-600" : "text-[#025928]"
                }`}>
                  {group.players.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Expanded Player Preview */}
      {expandedGroup && (() => {
        const group = assignments.find((g) => g.key === expandedGroup);
        if (!group) return null;
        return (
          <div className="rounded-lg border border-border bg-white p-3 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                {group.emoji && <span>{group.emoji}</span>}
                {group.label}
                <span className="text-xs font-normal text-muted-foreground">({group.players.length} players)</span>
              </h4>
              <button
                type="button"
                onClick={() => setExpandedGroup(null)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            {group.players.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No players in this group yet</p>
            ) : (
              <div className="space-y-1 max-h-[200px] overflow-y-auto">
                {group.players.map((player) => {
                  const hasOverride = config.groupOverrides[player.name] !== undefined;
                  return (
                    <div key={player.name} className="flex items-center justify-between text-sm py-1 px-1.5 rounded hover:bg-muted/50 group">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm">{player.country}</span>
                        <span className="font-medium text-foreground truncate">{player.name}</span>
                        {hasOverride && (
                          <span className="text-[9px] px-1 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">moved</span>
                        )}
                      </div>
                      <span className="font-mono text-xs text-muted-foreground flex-shrink-0">{player.odds}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}

      {/* Advanced Setup */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm font-medium text-[#025928] hover:underline cursor-pointer flex items-center gap-1"
        >
          {showAdvanced ? "▾ Hide" : "▸ Show"} Advanced Setup
        </button>

        {showAdvanced && (
          <div className="rounded-lg border border-border p-3 space-y-3 bg-muted/30">
            <p className="text-xs text-muted-foreground">
              Click a player to move them to a different group. This is useful if you want to keep a player like Scottie Scheffler in Tier 1 instead of a &ldquo;Past Champions&rdquo; bonus group.
            </p>

            {assignments.map((group) => (
              <div key={group.key} className="space-y-1">
                <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                  {group.emoji && <span>{group.emoji}</span>}
                  {group.label} ({group.players.length})
                </h5>
                <div className="flex flex-wrap gap-1">
                  {group.players.map((player) => {
                    const hasOverride = config.groupOverrides[player.name] !== undefined;
                    const isMoving = movingPlayer === player.name;
                    return (
                      <div key={player.name} className="relative">
                        <button
                          type="button"
                          onClick={() => setMovingPlayer(isMoving ? null : player.name)}
                          className={`
                            inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-colors cursor-pointer
                            ${isMoving
                              ? "bg-[#025928] text-white ring-2 ring-[#025928]/30"
                              : hasOverride
                              ? "bg-amber-100 text-amber-800 hover:bg-amber-200 border border-amber-300"
                              : "bg-white border border-border text-foreground hover:border-[#025928]/40"
                            }
                          `}
                        >
                          <span>{player.country}</span>
                          {player.name.split(" ").pop()}
                          <span className="opacity-50">{player.odds}</span>
                        </button>

                        {/* Move-to dropdown */}
                        {isMoving && (
                          <div className="absolute top-full left-0 mt-1 z-50 w-48 rounded-lg border border-border bg-white shadow-lg py-1">
                            <div className="px-2 py-1 text-[10px] font-semibold text-muted-foreground uppercase">
                              Move {player.name.split(" ").pop()} to:
                            </div>
                            {assignments.filter((g) => g.key !== group.key).map((target) => (
                              <button
                                key={target.key}
                                type="button"
                                onClick={() => movePlayer(player.name, target.key)}
                                className="w-full text-left px-2 py-1.5 text-xs hover:bg-muted flex items-center gap-1.5 cursor-pointer"
                              >
                                {target.emoji && <span>{target.emoji}</span>}
                                {target.label}
                                <span className="text-muted-foreground ml-auto">({target.players.length})</span>
                              </button>
                            ))}
                            {hasOverride && (
                              <>
                                <div className="border-t border-border my-1" />
                                <button
                                  type="button"
                                  onClick={() => clearOverride(player.name)}
                                  className="w-full text-left px-2 py-1.5 text-xs text-amber-700 hover:bg-amber-50 cursor-pointer"
                                >
                                  ↩ Reset to default
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {group.players.length === 0 && (
                    <span className="text-[11px] text-muted-foreground italic px-2 py-1">Empty</span>
                  )}
                </div>
              </div>
            ))}

            {Object.keys(config.groupOverrides).length > 0 && (
              <button
                type="button"
                onClick={() => onChange({ groupOverrides: {} })}
                className="text-xs text-red-500 hover:text-red-700 cursor-pointer"
              >
                Reset all overrides ({Object.keys(config.groupOverrides).length} changes)
              </button>
            )}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="rounded-lg border border-[#025928]/20 bg-[#025928]/5 p-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-[#025928]">Total picks per entry</span>
          <span className="font-bold text-[#025928]">
            {config.picksPerGroup > 1
              ? `${totalGroups} groups × ${config.picksPerGroup} picks = ${totalGroups * config.picksPerGroup} golfers`
              : `${totalGroups} golfers`}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {config.numTiers} odds tier{config.numTiers !== 1 ? "s" : ""}
          {config.includeWriteIn ? " + 1 write-in tier" : ""}
          {config.customGroups.length > 0 ? ` + ${config.customGroups.length} bonus group${config.customGroups.length !== 1 ? "s" : ""}` : ""}
          {config.picksPerGroup > 1 ? ` · ${config.picksPerGroup} picks per group` : ""}
        </p>
      </div>
    </div>
  );
}

function StepScoringRules({
  config,
  onChange,
}: {
  config: PoolConfig;
  onChange: (c: Partial<PoolConfig>) => void;
}) {
  const totalGroups = getTotalGroups(config);
  const totalPicks = totalGroups * config.picksPerGroup;

  // Clamp picksCount if total picks changed
  const clampedPicks = Math.min(config.picksCount, totalPicks);
  if (clampedPicks !== config.picksCount) {
    onChange({ picksCount: clampedPicks });
  }

  return (
    <div className="space-y-6">
      {/* Picks per group */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <Label>Picks Per Group</Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              How many golfers each participant selects from each tier/group
            </p>
          </div>
          <Badge className="bg-[#025928] text-white">{config.picksPerGroup} per group</Badge>
        </div>
        <Slider
          min={1}
          max={3}
          step={1}
          value={[config.picksPerGroup]}
          onValueChange={(val) => {
            const v = Array.isArray(val) ? val[0] : val;
            onChange({ picksPerGroup: v });
          }}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1 pick (default)</span>
          <span>3 picks</span>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Picks That Count Toward Score</Label>
          <Badge className="bg-[#025928] text-white">
            Best {clampedPicks} of {totalPicks}
          </Badge>
        </div>
        <Slider
          min={1}
          max={totalPicks}
          step={1}
          value={[clampedPicks]}
          onValueChange={(val) => {
            const v = Array.isArray(val) ? val[0] : val;
            onChange({ picksCount: v });
          }}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1 pick counts</span>
          <span>All {totalPicks} count</span>
        </div>
        <p className="text-sm text-muted-foreground">
          Each entry picks <strong>{config.picksPerGroup}</strong> golfer{config.picksPerGroup !== 1 ? "s" : ""} per tier/group ({totalPicks} total). The best{" "}
          <strong>{clampedPicks}</strong> scores count toward the final score.
        </p>
      </div>

      <Separator />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Cut Score Rule</Label>
            <p className="text-xs text-muted-foreground">
              Apply a penalty score for golfers who miss the cut, withdraw, or
              are disqualified.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={config.applyCutRule}
            onClick={() => onChange({ applyCutRule: !config.applyCutRule })}
            className={`
              relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent
              transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2
              focus-visible:ring-ring focus-visible:ring-offset-2
              ${config.applyCutRule ? "bg-[#025928]" : "bg-muted"}
            `}
          >
            <span
              className={`
                pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0
                transition-transform duration-200 ease-in-out
                ${config.applyCutRule ? "translate-x-5" : "translate-x-0"}
              `}
            />
          </button>
        </div>
        {config.applyCutRule && (
          <div className="rounded-lg border border-border bg-muted/50 p-3 text-sm text-muted-foreground">
            Players who miss the cut will receive a score equal to the cut line +
            10 strokes. This prevents &ldquo;free&rdquo; drops from missed cuts.
          </div>
        )}
      </div>
    </div>
  );
}

function StepEntryPayouts({
  config,
  onChange,
}: {
  config: PoolConfig;
  onChange: (c: Partial<PoolConfig>) => void;
}) {
  const payouts = getPayouts(config);
  const expectedEntries = 20; // reasonable default for preview
  const totalPool = config.entryFee * expectedEntries;

  function handleTemplateChange(template: PayoutTemplate) {
    if (template === "custom") {
      onChange({
        payoutTemplate: template,
        customPayouts: [...(PAYOUT_PRESETS["top-3"] ?? [])],
      });
    } else {
      onChange({ payoutTemplate: template });
    }
  }

  function updateCustomPayout(index: number, percentage: number) {
    const next = [...config.customPayouts];
    next[index] = { ...next[index], percentage };
    onChange({ customPayouts: next });
  }

  function addCustomPayout() {
    const nextPlace =
      config.customPayouts.length > 0
        ? config.customPayouts[config.customPayouts.length - 1].place + 1
        : 1;
    onChange({
      customPayouts: [
        ...config.customPayouts,
        { place: nextPlace, percentage: 0 },
      ],
    });
  }

  function removeCustomPayout(index: number) {
    onChange({
      customPayouts: config.customPayouts.filter((_, i) => i !== index),
    });
  }

  const customTotal = config.customPayouts.reduce(
    (s, p) => s + p.percentage,
    0
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="entry-fee">Entry Fee ($)</Label>
          <Input
            id="entry-fee"
            type="number"
            min={0}
            value={config.entryFee}
            onChange={(e) =>
              onChange({ entryFee: Math.max(0, Number(e.target.value)) })
            }
            className="h-10"
          />
        </div>

        <div className="space-y-2">
          <Label>Max Entries Per Person</Label>
          <Select
            value={String(config.maxEntries)}
            onValueChange={(val) => onChange({ maxEntries: Number(val) })}
          >
            <SelectTrigger className="h-10 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n} {n === 1 ? "entry" : "entries"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <Label>Payout Template</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(
            [
              ["winner-take-all", "Winner Take All"],
              ["top-3", "Top 3"],
              ["top-5", "Top 5"],
              ["custom", "Custom"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleTemplateChange(key)}
              className={`
                rounded-lg border px-3 py-2 text-sm font-medium transition-colors
                ${
                  config.payoutTemplate === key
                    ? "border-[#025928] bg-[#025928]/10 text-[#025928]"
                    : "border-border hover:border-[#025928]/40 hover:bg-muted"
                }
              `}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {config.payoutTemplate === "custom" && (
        <div className="space-y-3">
          <div className="space-y-2">
            {config.customPayouts.map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-12 text-sm font-medium text-muted-foreground">
                  {ordinal(p.place)}
                </span>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={p.percentage}
                  onChange={(e) =>
                    updateCustomPayout(i, Math.max(0, Number(e.target.value)))
                  }
                  className="h-8 w-20"
                />
                <span className="text-sm text-muted-foreground">%</span>
                {config.customPayouts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeCustomPayout(i)}
                    className="ml-auto text-xs text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={addCustomPayout}>
            + Add Place
          </Button>
          {customTotal !== 100 && (
            <p className="text-sm text-red-500">
              Percentages must total 100% (currently {customTotal}%)
            </p>
          )}
        </div>
      )}

      <Separator />

      <div className="space-y-2">
        <Label>Payout Preview (based on {expectedEntries} entries)</Label>
        <Card className="shadow-[0_4px_6px_rgba(0,0,0,0.07)]">
          <CardContent className="pt-0">
            <div className="text-xs text-muted-foreground mb-2">
              Total Pool: ${totalPool.toLocaleString()}
            </div>
            <div className="space-y-1">
              {payouts.map((p) => (
                <div
                  key={p.place}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="font-medium">{ordinal(p.place)} Place</span>
                  <span className="font-semibold text-[#025928]">
                    ${((totalPool * p.percentage) / 100).toLocaleString()} (
                    {p.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StepReview({ config }: { config: PoolConfig }) {
  const payouts = getPayouts(config);

  return (
    <div className="space-y-4">
      <Card className="shadow-[0_4px_6px_rgba(0,0,0,0.07)]">
        <CardHeader>
          <CardTitle className="font-[Playfair_Display,Georgia,serif] text-lg">
            Pool Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Name</dt>
              <dd className="font-medium">{config.name}</dd>
            </div>
            {config.description && (
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground shrink-0">Description</dt>
                <dd className="font-medium text-right">{config.description}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Visibility</dt>
              <dd className="font-medium">
                {config.isPublic ? "Public" : "Private"}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card className="shadow-[0_4px_6px_rgba(0,0,0,0.07)]">
        <CardHeader>
          <CardTitle className="font-[Playfair_Display,Georgia,serif] text-lg">
            Tiers & Scoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Odds-Based Tiers</dt>
              <dd className="font-medium">
                {config.numTiers} tiers × {config.playersPerTier} players
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Write-In Tier</dt>
              <dd className="font-medium">
                {config.includeWriteIn
                  ? `Yes (${getWriteInCount(config)} players)`
                  : "No"}
              </dd>
            </div>
            {config.customGroups.length > 0 && (
              <div className="pt-1">
                <dt className="text-muted-foreground mb-1">Bonus Groups</dt>
                <dd className="flex flex-wrap gap-1.5">
                  {config.customGroups.map((g, i) => (
                    <span key={i} className="inline-flex items-center gap-1 rounded-full bg-[#025928]/10 px-2.5 py-0.5 text-xs font-medium text-[#025928]">
                      {g.emoji} {g.name}
                    </span>
                  ))}
                </dd>
              </div>
            )}
            {config.picksPerGroup > 1 && (
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Picks Per Group</dt>
                <dd className="font-medium">{config.picksPerGroup} per group</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Total Picks Per Entry</dt>
              <dd className="font-medium">{getTotalGroups(config) * config.picksPerGroup} golfers</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Scoring</dt>
              <dd className="font-medium">
                Best {config.picksCount} of {getTotalGroups(config) * config.picksPerGroup} count
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Cut Rule</dt>
              <dd className="font-medium">
                {config.applyCutRule ? "Applied" : "Not applied"}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card className="shadow-[0_4px_6px_rgba(0,0,0,0.07)]">
        <CardHeader>
          <CardTitle className="font-[Playfair_Display,Georgia,serif] text-lg">
            Entry & Payouts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Entry Fee</dt>
              <dd className="font-medium">${config.entryFee}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Max Entries / Person</dt>
              <dd className="font-medium">{config.maxEntries}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Payout Structure</dt>
              <dd className="font-medium capitalize">
                {config.payoutTemplate.replace(/-/g, " ")}
              </dd>
            </div>
          </dl>
          <Separator className="my-3" />
          <div className="space-y-1">
            {payouts.map((p) => (
              <div
                key={p.place}
                className="flex items-center justify-between text-sm"
              >
                <span>{ordinal(p.place)} Place</span>
                <span className="font-semibold text-[#025928]">
                  {p.percentage}%
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validateStep(step: number, config: PoolConfig): string | null {
  switch (step) {
    case 0:
      if (!config.name.trim()) return "Pool name is required.";
      return null;
    case 1:
      if (config.customGroups.some((g) => !g.name.trim())) return "All bonus groups must have a name.";
      return null;
    case 2:
      return null; // scoring rules are always valid within slider bounds
    case 3:
      if (config.entryFee < 0) return "Entry fee cannot be negative.";
      if (config.payoutTemplate === "custom") {
        const total = config.customPayouts.reduce(
          (s, p) => s + p.percentage,
          0
        );
        if (total !== 100) return "Custom payout percentages must total 100%.";
      }
      return null;
    case 4:
      return null;
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Main Wizard
// ---------------------------------------------------------------------------

export function CreatePoolWizard() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState<PoolConfig>(DEFAULT_CONFIG);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [slideDir, setSlideDir] = useState<"left" | "right">("left");

  // Restore config saved before sign-up redirect
  useEffect(() => {
    const saved = sessionStorage.getItem("pool-wizard-config");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as { config: PoolConfig; step: number };
        setConfig(parsed.config);
        setStep(parsed.step ?? 4);
        sessionStorage.removeItem("pool-wizard-config");
      } catch {
        // ignore malformed data
      }
    }
  }, []);

  function updateConfig(partial: Partial<PoolConfig>) {
    setConfig((prev) => ({ ...prev, ...partial }));
    setError(null);
  }

  function goTo(nextStep: number) {
    const dir = nextStep > step ? "left" : "right";
    setSlideDir(dir);
    setTransitioning(true);
    setTimeout(() => {
      setStep(nextStep);
      setTransitioning(false);
    }, 200);
  }

  function handleNext() {
    const err = validateStep(step, config);
    if (err) {
      setError(err);
      return;
    }
    if (step < STEPS.length - 1) {
      goTo(step + 1);
    }
  }

  function handleBack() {
    if (step > 0) {
      goTo(step - 1);
    }
  }

  async function handleCreate() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/pools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to create pool");
      }
      const { slug } = await res.json();
      router.push(`/pool/${slug}?created=true`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  function handleSignUpToCreate() {
    sessionStorage.setItem(
      "pool-wizard-config",
      JSON.stringify({ config, step: 4 })
    );
    router.push(`/sign-up?redirect_url=${encodeURIComponent("/pool/create")}`);
  }

  const stepContent = (() => {
    switch (step) {
      case 0:
        return <StepPoolBasics config={config} onChange={updateConfig} />;
      case 1:
        return <StepTierConfig config={config} onChange={updateConfig} />;
      case 2:
        return <StepScoringRules config={config} onChange={updateConfig} />;
      case 3:
        return <StepEntryPayouts config={config} onChange={updateConfig} />;
      case 4:
        return <StepReview config={config} />;
      default:
        return null;
    }
  })();

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      {/* ---- Progress Bar ---- */}
      <div className="space-y-2">
        {/* Step labels */}
        <div className="flex justify-between">
          {STEPS.map((label, i) => (
            <span
              key={label}
              className={`text-[10px] font-medium uppercase tracking-wider sm:text-xs ${
                i <= step ? "text-[#025928]" : "text-muted-foreground"
              }`}
            >
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{i + 1}</span>
            </span>
          ))}
        </div>
        {/* Bar */}
        <div className="h-3 w-full overflow-hidden rounded-full bg-stone-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#025928] to-[#03802f] transition-all duration-500 ease-out"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* ---- Step Title ---- */}
      <h2 className="font-[Playfair_Display,Georgia,serif] text-2xl font-semibold tracking-tight">
        {STEPS[step]}
      </h2>

      {/* ---- Step Content with CSS transition ---- */}
      {/* overflow-visible so z-50 dropdowns (Advanced Setup) aren't clipped */}
      <div className="relative min-h-[240px] sm:min-h-[320px] overflow-visible">
        <div
          className={`transition-all duration-200 ease-in-out overflow-visible ${
            transitioning
              ? slideDir === "left"
                ? "translate-x-[-8px] opacity-0"
                : "translate-x-[8px] opacity-0"
              : "translate-x-0 opacity-100"
          }`}
        >
          {stepContent}
        </div>
      </div>

      {/* ---- Error ---- */}
      {error && (
        <p className="text-sm font-medium text-red-500" role="alert">
          {error}
        </p>
      )}

      {/* ---- Navigation ---- */}
      {/* Sticky on mobile so buttons are always reachable above the keyboard */}
      <div className="sticky bottom-0 -mx-4 sm:mx-0 bg-bg/95 backdrop-blur-sm border-t border-border sm:border-0 sm:bg-transparent sm:backdrop-blur-none px-4 sm:px-0 py-3 sm:py-0 sm:pt-2 flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={step === 0}
          className="min-w-[80px]"
        >
          Back
        </Button>

        <div className="flex items-center gap-2">
          {/* Step indicator pill on mobile */}
          <span className="sm:hidden text-xs text-muted font-medium">
            {step + 1} / {STEPS.length}
          </span>

          {step < STEPS.length - 1 ? (
            <Button
              className="bg-[#025928] text-white hover:bg-[#013D1B] min-w-[80px]"
              onClick={handleNext}
            >
              Next
            </Button>
          ) : isLoaded && !isSignedIn ? (
            <Button
              className="bg-[#025928] text-white hover:bg-[#013D1B] min-w-[160px]"
              onClick={handleSignUpToCreate}
            >
              Create Account to Launch
            </Button>
          ) : (
            <Button
              className="bg-[#025928] text-white hover:bg-[#013D1B] min-w-[120px]"
              onClick={handleCreate}
              disabled={submitting}
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Creating…
                </span>
              ) : (
                "Create Pool"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
