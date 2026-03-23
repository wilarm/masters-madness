"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { PLAYERS, getTierColor, getTierLabel, type PlayerData } from "@/data/players";
import { cn } from "@/lib/utils";
import { useWatchlist } from "@/lib/watchlist";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import type { GolferRow } from "@/lib/db/golfers";

// Tags config for rendering (maps DB string → emoji + color)
const TAG_CONFIG: Record<string, { emoji: string; color: string }> = {
  "Champ":     { emoji: "🏆", color: "bg-amber-100 text-amber-800" },
  "LIV":       { emoji: "💰", color: "bg-rose-100 text-rose-700" },
  "Lefty":     { emoji: "🤚", color: "bg-sky-100 text-sky-700" },
  "Rookie":    { emoji: "⭐", color: "bg-purple-100 text-purple-700" },
  "35+":       { emoji: "👴", color: "bg-stone-100 text-stone-700" },
  "Fan Fav":   { emoji: "🎉", color: "bg-pink-100 text-pink-700" },
  "Euro Tour": { emoji: "🇪🇺", color: "bg-blue-100 text-blue-700" },
  "Intl":      { emoji: "🌍", color: "bg-teal-100 text-teal-700" },
};
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Star,
  Eye,
} from "lucide-react";

type SortField = "currentRank" | "name" | "tier" | "odds" | "worldRank" | "trend";
type SortDir = "asc" | "desc";
type FilterMode = "tiers" | "groups";

const GROUP_FILTER_OPTIONS: { name: string; emoji: string; color: string }[] = [
  { name: "Champ",    emoji: "🏆", color: "bg-amber-100 text-amber-800" },
  { name: "LIV",     emoji: "💰", color: "bg-rose-100 text-rose-700" },
  { name: "Lefty",   emoji: "🤚", color: "bg-sky-100 text-sky-700" },
  { name: "Rookie",  emoji: "⭐", color: "bg-purple-100 text-purple-700" },
  { name: "35+",     emoji: "👴", color: "bg-stone-100 text-stone-700" },
  { name: "Fan Fav", emoji: "🎉", color: "bg-pink-100 text-pink-700" },
  { name: "Euro Tour",emoji: "🇪🇺", color: "bg-blue-100 text-blue-700" },
  { name: "Intl",    emoji: "🌍", color: "bg-teal-100 text-teal-700" },
];

// Merged player type: static fields + DB enrichment
type MergedPlayer = PlayerData & {
  dbOdds: string;
  dbOddsRank: number;
  dbTier: number;
  dbTrend: number;
  dbSummary: string;
  dbBullCase: string;
  dbBearCase: string;
  dbRecentForm: string;
  dbGroupTags: { name: string; emoji: string; color: string }[];
};

export function PlayerTable({
  initialPlayer,
  dbGolfers = [],
}: {
  initialPlayer?: string;
  dbGolfers?: GolferRow[];
}) {
  const [search, setSearch] = useState(initialPlayer ?? "");
  const [tierFilter, setTierFilter] = useState<number | null>(null);
  const [groupFilter, setGroupFilter] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<FilterMode>("tiers");
  const [showWatchlistOnly, setShowWatchlistOnly] = useState(false);
  const [sortField, setSortField] = useState<SortField>("currentRank");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(initialPlayer ?? null);
  const [hoveredPlayer, setHoveredPlayer] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(!!initialPlayer);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { watchlist, toggle: toggleWatchlist, isWatchlisted } = useWatchlist();

  const INITIAL_VISIBLE = 15;

  // Build a name → GolferRow map for O(1) lookups
  const dbMap = useMemo(() => {
    const m = new Map<string, GolferRow>();
    for (const g of dbGolfers) m.set(g.name.toLowerCase().trim(), g);
    return m;
  }, [dbGolfers]);

  // Merge static PlayerData with live DB enrichment
  const mergedPlayers = useMemo((): MergedPlayer[] =>
    PLAYERS.map((p): MergedPlayer => {
      const db = dbMap.get(p.name.toLowerCase().trim());
      const dbTrend = db
        ? (db.prev_odds_rank != null && db.odds_rank != null
            ? db.prev_odds_rank - db.odds_rank
            : 0)
        : 0;
      const rawTags: { name: string; emoji: string; color: string }[] = db?.group_tags
        ? db.group_tags
            .map((t) => ({ name: t, ...(TAG_CONFIG[t] ?? { emoji: "", color: "bg-bg-muted text-muted" }) }))
            .filter((t) => t.emoji)
        : [];
      return {
        ...p,
        // Override with live DB values when available
        odds:         db?.odds      ?? p.odds,
        oddsNum:      db?.odds_rank ?? p.oddsNum,
        currentRank:  db?.odds_rank ?? p.currentRank,
        tier:         db?.tier      ?? p.tier,
        dbOdds:       db?.odds      ?? p.odds,
        dbOddsRank:   db?.odds_rank ?? p.currentRank,
        dbTier:       db?.tier      ?? p.tier,
        dbTrend,
        dbSummary:    db?.summary    ?? p.summary    ?? "",
        dbBullCase:   db?.bull_case  ?? p.bullCase   ?? "",
        dbBearCase:   db?.bear_case  ?? p.bearCase   ?? "",
        dbRecentForm: db?.recent_form ?? p.recentForm ?? "",
        dbGroupTags:  rawTags,
      };
    }),
  [dbMap]);

  const filteredPlayers = mergedPlayers.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesTier = filterMode === "groups" || tierFilter === null || p.dbTier === tierFilter;
    const matchesGroup = filterMode === "tiers" || groupFilter === null ||
      p.dbGroupTags.some((t) => t.name === groupFilter);
    const matchesWatchlist = !showWatchlistOnly || isWatchlisted(p.name);
    return matchesSearch && matchesTier && matchesGroup && matchesWatchlist;
  }).sort((a, b) => {
    let aVal: number | string;
    let bVal: number | string;

    switch (sortField) {
      case "currentRank": aVal = a.dbOddsRank;  bVal = b.dbOddsRank;  break;
      case "name":        aVal = a.name;         bVal = b.name;         break;
      case "tier":        aVal = a.dbTier;       bVal = b.dbTier;       break;
      case "odds":        aVal = a.dbOddsRank;   bVal = b.dbOddsRank;   break;
      case "worldRank":   aVal = a.worldRank;    bVal = b.worldRank;    break;
      case "trend":       aVal = a.dbTrend;      bVal = b.dbTrend;      break;
      default:            aVal = a.dbOddsRank;   bVal = b.dbOddsRank;
    }

    if (typeof aVal === "string" && typeof bVal === "string") {
      return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortDir === "asc"
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number);
  });

  const visiblePlayers = expanded
    ? filteredPlayers
    : filteredPlayers.slice(0, INITIAL_VISIBLE);
  const hasMore = filteredPlayers.length > INITIAL_VISIBLE;

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir(field === "name" ? "asc" : "asc");
    }
  }

  function handleMouseEnter(name: string) {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => setHoveredPlayer(name), 300);
  }

  function handleMouseLeave() {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setHoveredPlayer(null);
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex flex-col gap-3">
        {/* Row 1: search + watchlist */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              type="text"
              placeholder="Search players..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-border bg-white pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-masters-green focus:outline-none focus:ring-2 focus:ring-masters-green/20"
            />
          </div>
          <button
            onClick={() => setShowWatchlistOnly(!showWatchlistOnly)}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer flex-shrink-0",
              showWatchlistOnly
                ? "bg-masters-gold text-white"
                : "bg-bg-muted text-muted hover:text-foreground"
            )}
          >
            <Star className={cn("h-3 w-3", showWatchlistOnly && "fill-current")} />
            <span className="hidden sm:inline">Watchlist</span>
            {watchlist.size > 0 && (
              <span className={cn(
                "inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[10px] font-bold",
                showWatchlistOnly ? "bg-white/25 text-white" : "bg-masters-gold/15 text-masters-gold"
              )}>
                {watchlist.size}
              </span>
            )}
          </button>
        </div>

        {/* Row 2: filter mode toggle + pills */}
        <div className="flex items-start gap-2">
          <Filter className="h-4 w-4 text-muted mt-1.5 flex-shrink-0" />
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            {/* Mode toggle */}
            <div className="inline-flex rounded-lg border border-border overflow-hidden self-start">
              <button
                onClick={() => { setFilterMode("tiers"); setGroupFilter(null); }}
                className={cn(
                  "px-3 py-1 text-xs font-medium transition-colors cursor-pointer",
                  filterMode === "tiers"
                    ? "bg-masters-green text-white"
                    : "bg-bg-muted text-muted hover:text-foreground"
                )}
              >
                Tiers
              </button>
              <button
                onClick={() => { setFilterMode("groups"); setTierFilter(null); }}
                className={cn(
                  "px-3 py-1 text-xs font-medium transition-colors cursor-pointer border-l border-border",
                  filterMode === "groups"
                    ? "bg-masters-green text-white"
                    : "bg-bg-muted text-muted hover:text-foreground"
                )}
              >
                Groups
              </button>
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap gap-1.5">
              {filterMode === "tiers" ? (
                <>
                  <button
                    onClick={() => setTierFilter(null)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer",
                      tierFilter === null
                        ? "bg-masters-green text-white"
                        : "bg-bg-muted text-muted hover:text-foreground"
                    )}
                  >
                    All
                  </button>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((tier) => (
                    <button
                      key={tier}
                      onClick={() => setTierFilter(tierFilter === tier ? null : tier)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer",
                        tierFilter === tier
                          ? getTierColor(tier)
                          : "bg-bg-muted text-muted hover:text-foreground"
                      )}
                    >
                      T{tier}
                    </button>
                  ))}
                </>
              ) : (
                <>
                  <button
                    onClick={() => setGroupFilter(null)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer",
                      groupFilter === null
                        ? "bg-masters-green text-white"
                        : "bg-bg-muted text-muted hover:text-foreground"
                    )}
                  >
                    All
                  </button>
                  {GROUP_FILTER_OPTIONS.map((g) => (
                    <button
                      key={g.name}
                      onClick={() => setGroupFilter(groupFilter === g.name ? null : g.name)}
                      className={cn(
                        "inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer",
                        groupFilter === g.name
                          ? g.color + " ring-1 ring-current/30"
                          : "bg-bg-muted text-muted hover:text-foreground"
                      )}
                    >
                      {g.emoji} {g.name}
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <TooltipProvider delay={300}>
      <div className="rounded-xl border border-border overflow-x-auto">
        <table className="w-full min-w-[560px]">
          <thead>
            <tr className="bg-masters-green">
              {[
                { field: "currentRank" as SortField, label: "#",      className: "w-12", tooltip: "Rank by Masters odds" },
                { field: "name"        as SortField, label: "PLAYER", className: "",     tooltip: "Golfer name and country" },
                { field: "odds"        as SortField, label: "ODDS",   className: "w-20", tooltip: "Odds to win the 2026 Masters" },
                { field: "trend"       as SortField, label: "TREND",  className: "w-20", tooltip: "Odds movement since Dec 31, 2025 — spots gained or lost since the season baseline" },
                { field: "tier"        as SortField, label: "TIER",   className: "w-24", tooltip: "Draft tier (T1 = favorites, T9 = longshots). You pick one golfer from each tier." },
                { field: "worldRank"   as SortField, label: "OWGR",   className: "w-16", tooltip: "Official World Golf Ranking — global performance ranking across all tours" },
              ].map(({ field, label, className: colClass, tooltip }) => (
                <th
                  key={field}
                  onClick={() => toggleSort(field)}
                  className={cn(
                    "text-left py-3 px-3 text-xs font-semibold text-white uppercase tracking-wider cursor-pointer hover:bg-white/10 transition-colors select-none",
                    colClass
                  )}
                >
                  <Tooltip>
                    <TooltipTrigger render={<div className="inline-flex items-center gap-1" />}>
                      {label}
                      {sortField === field && (
                        <span className="text-masters-gold">
                          {sortDir === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="max-w-[200px] text-center normal-case tracking-normal font-normal">
                      {tooltip}
                    </TooltipContent>
                  </Tooltip>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visiblePlayers.map((player, idx) => {
              const isExpanded = expandedPlayer === player.name;
              const isHovered = hoveredPlayer === player.name;

              return (
                <PlayerRow
                  key={player.name}
                  player={player}
                  trend={player.dbTrend}
                  isExpanded={isExpanded}
                  isHovered={isHovered}
                  index={idx}
                  isWatchlisted={isWatchlisted(player.name)}
                  onToggleWatchlist={() => toggleWatchlist(player.name)}
                  onToggleExpand={() =>
                    setExpandedPlayer(isExpanded ? null : player.name)
                  }
                  onMouseEnter={() => handleMouseEnter(player.name)}
                  onMouseLeave={handleMouseLeave}
                />
              );
            })}
          </tbody>
        </table>

        {/* Expand/Collapse */}
        {hasMore && !search && tierFilter === null && !showWatchlistOnly && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex w-full items-center justify-center gap-2 border-t border-border bg-bg-muted/30 py-2.5 text-sm font-medium text-masters-green transition-colors hover:bg-masters-green-light cursor-pointer"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Show full field ({filteredPlayers.length - INITIAL_VISIBLE} more)
              </>
            )}
          </button>
        )}
      </div>
      </TooltipProvider>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
        <span className="font-medium">Tiers:</span>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((tier) => (
          <span key={tier} className="flex items-center gap-1">
            <span
              className={cn(
                "inline-block w-3 h-3 rounded-full",
                getTierColor(tier)
              )}
            />
            {getTierLabel(tier)}
          </span>
        ))}
      </div>
    </div>
  );
}

function PlayerRow({
  player,
  trend,
  isExpanded,
  isHovered,
  index,
  isWatchlisted,
  onToggleWatchlist,
  onToggleExpand,
  onMouseEnter,
  onMouseLeave,
}: {
  player: MergedPlayer;
  trend: number;
  isExpanded: boolean;
  isHovered: boolean;
  index: number;
  isWatchlisted: boolean;
  onToggleWatchlist: () => void;
  onToggleExpand: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) {
  const nameRef = useRef<HTMLTableCellElement>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (isHovered && !isExpanded && nameRef.current) {
      const rect = nameRef.current.getBoundingClientRect();
      setTooltipPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
      });
    } else {
      setTooltipPos(null);
    }
  }, [isHovered, isExpanded]);

  return (
    <>
      <tr
        onClick={onToggleExpand}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={cn(
          "border-b border-border/50 cursor-pointer transition-all duration-150",
          isExpanded
            ? "bg-masters-green-light"
            : "hover:bg-masters-green-light/50"
        )}
        style={{
          animation: "staggerFadeIn 0.4s var(--ease-out) forwards",
          animationDelay: `${index * 20}ms`,
          opacity: 0,
        }}
      >
        {/* Rank */}
        <td className="py-3 px-3">
          <span className="font-mono font-bold text-foreground">
            {player.dbOddsRank}
          </span>
        </td>

        {/* Player Name */}
        <td ref={nameRef} className="py-3 px-3">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleWatchlist();
              }}
              className={cn(
                "flex-shrink-0 p-0.5 rounded transition-colors cursor-pointer",
                isWatchlisted
                  ? "text-masters-gold"
                  : "text-border hover:text-masters-gold/60"
              )}
              aria-label={isWatchlisted ? "Remove from watchlist" : "Add to watchlist"}
            >
              <Star className={cn("h-4 w-4", isWatchlisted && "fill-current")} />
            </button>
            <span className="text-lg">{player.country}</span>
            <span className="font-medium text-foreground">{player.name}</span>
            <div className="hidden sm:flex items-center gap-1 flex-wrap">
              {player.dbGroupTags.map((tag) => (
                <span
                  key={tag.name}
                  title={tag.name}
                  className={cn("inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold", tag.color)}
                >
                  {tag.emoji} {tag.name}
                </span>
              ))}
            </div>
          </div>
        </td>

        {/* Odds */}
        <td className="py-3 px-3">
          <span className="font-mono text-sm font-semibold text-foreground">
            {player.odds}
          </span>
        </td>

        {/* Trend */}
        <td className="py-3 px-3">
          <TrendIndicator trend={trend} />
        </td>

        {/* Tier */}
        <td className="py-3 px-3">
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold",
              getTierColor(player.tier)
            )}
          >
            T{player.tier}
            <span className="opacity-75 hidden sm:inline">
              {getTierLabel(player.tier)}
            </span>
          </span>
        </td>

        {/* OWGR */}
        <td className="py-3 px-3">
          <span className="font-mono text-sm text-muted">
            #{player.worldRank}
          </span>
        </td>
      </tr>

      {/* Hover Tooltip — rendered via portal to avoid table stacking context */}
      {isHovered && !isExpanded && tooltipPos && typeof document !== "undefined" &&
        createPortal(
          <div
            className="w-80 rounded-xl border border-border p-4 shadow-2xl"
            style={{
              position: "absolute",
              top: tooltipPos.top,
              left: tooltipPos.left,
              zIndex: 9999,
              backgroundColor: "#ffffff",
            }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{player.country}</span>
              <h4 className="font-heading font-bold text-foreground">
                {player.name}
              </h4>
              <span
                className={cn(
                  "ml-auto px-2 py-0.5 rounded-full text-xs font-bold",
                  getTierColor(player.tier)
                )}
              >
                Tier {player.tier}
              </span>
            </div>
            {player.dbGroupTags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {player.dbGroupTags.map((tag) => (
                  <span
                    key={tag.name}
                    className={cn("inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold", tag.color)}
                  >
                    {tag.emoji} {tag.name}
                  </span>
                ))}
              </div>
            )}
            <p className="text-sm text-muted leading-relaxed mb-3">
              {player.dbSummary}
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-bg-muted p-2">
                <span className="text-muted font-medium">Masters Best</span>
                <p className="font-semibold text-foreground">
                  {player.bestMastersFinish}
                </p>
              </div>
              <div className="rounded-lg bg-bg-muted p-2">
                <span className="text-muted font-medium">2025 Result</span>
                <p className="font-semibold text-foreground">
                  {player.masters2025}
                </p>
              </div>
              <div className="rounded-lg bg-bg-muted p-2">
                <span className="text-muted font-medium">Form</span>
                <p className="font-semibold text-foreground text-[11px]">
                  {player.dbRecentForm}
                </p>
              </div>
              <div className="rounded-lg bg-bg-muted p-2">
                <span className="text-muted font-medium">Appearances</span>
                <p className="font-semibold text-foreground">
                  {player.mastersAppearances}
                </p>
              </div>
            </div>
          </div>,
          document.body
        )
      }

      {/* Expanded Detail Row */}
      {isExpanded && (
        <tr className="bg-masters-green-light/50">
          <td colSpan={6} className="px-4 py-5">
            <div className="max-w-3xl mx-auto space-y-4">
              <p className="text-sm text-foreground leading-relaxed">
                {player.dbSummary}
              </p>

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="rounded-lg bg-success/10 border border-success/20 p-3">
                  <h5 className="text-xs font-bold text-success uppercase mb-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> Bull Case
                  </h5>
                  <p className="text-sm text-foreground">{player.dbBullCase}</p>
                </div>
                <div className="rounded-lg bg-danger/10 border border-danger/20 p-3">
                  <h5 className="text-xs font-bold text-danger uppercase mb-1 flex items-center gap-1">
                    <TrendingDown className="h-3 w-3" /> Bear Case
                  </h5>
                  <p className="text-sm text-foreground">{player.dbBearCase}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatBlock label="Masters Appearances" value={String(player.mastersAppearances)} />
                <StatBlock label="Best Masters Finish" value={player.bestMastersFinish} />
                <StatBlock label="2025 Masters" value={player.masters2025} />
                <StatBlock label="Recent Form" value={player.dbRecentForm} small />
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function TrendIndicator({ trend }: { trend: number }) {
  if (trend > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-success text-sm font-bold">
        <TrendingUp className="h-3.5 w-3.5" />
        <span>+{trend}</span>
      </span>
    );
  }
  if (trend < 0) {
    return (
      <span className="inline-flex items-center gap-1 text-danger text-sm font-bold">
        <TrendingDown className="h-3.5 w-3.5" />
        <span>{trend}</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-muted text-sm">
      <Minus className="h-3.5 w-3.5" />
    </span>
  );
}

function StatBlock({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="rounded-lg bg-white border border-border p-2.5">
      <span className="text-[11px] text-muted font-semibold uppercase tracking-wider">{label}</span>
      <p className={cn("font-semibold text-foreground mt-0.5", small ? "text-xs" : "text-sm")}>
        {value}
      </p>
    </div>
  );
}
