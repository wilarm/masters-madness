"use client";

import { useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { PLAYERS, getTierColor, getTierLabel, calculateTrend, type PlayerData } from "@/data/players";
import { useWatchlist } from "@/lib/watchlist";
import { getPlayerGroupTags } from "@/lib/player-groups";
import { cn } from "@/lib/utils";
import {
  ClipboardList,
  Lock,
  Check,
  ChevronRight,
  ChevronLeft,
  Star,
  TrendingUp,
  TrendingDown,
  Search,
  X,
  Eye,
  AlertCircle,
  Trophy,
  Save,
} from "lucide-react";

const NUM_TIERS = 9;

export default function PicksPage() {
  return (
    <Suspense>
      <PicksContent />
    </Suspense>
  );
}

function PicksContent() {
  const searchParams = useSearchParams();
  const poolSlug = searchParams.get("pool");

  const [currentTier, setCurrentTier] = useState(1);
  const [picks, setPicks] = useState<Record<number, string>>({});
  const [search, setSearch] = useState("");
  const [showWatchlistOnly, setShowWatchlistOnly] = useState(false);
  const [expandedPlayer, setExpandedPlayer] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { toggle: toggleWatchlist, isWatchlisted, watchlist } = useWatchlist();

  const tierPlayers = useMemo(() => {
    return PLAYERS.filter((p) => p.tier === currentTier)
      .filter((p) => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchesWatchlist = !showWatchlistOnly || isWatchlisted(p.name);
        return matchesSearch && matchesWatchlist;
      })
      .sort((a, b) => a.currentRank - b.currentRank);
  }, [currentTier, search, showWatchlistOnly, isWatchlisted]);

  const totalPicks = Object.keys(picks).length;
  const isComplete = totalPicks === NUM_TIERS;
  const currentPick = picks[currentTier] || null;

  function selectPlayer(name: string) {
    setPicks((prev) => {
      if (prev[currentTier] === name) {
        const next = { ...prev };
        delete next[currentTier];
        return next;
      }
      return { ...prev, [currentTier]: name };
    });
  }

  async function handleSubmit() {
    if (!isComplete) return;
    setSaveError(null);

    // Convert numeric tier keys to string tier keys for storage
    const golfer_picks: Record<string, string> = {};
    for (const [tier, name] of Object.entries(picks)) {
      golfer_picks[`tier-${tier}`] = name;
    }

    if (poolSlug) {
      try {
        const res = await fetch(`/api/pools/${poolSlug}/picks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ golfer_picks, entry_num: 1 }),
        });
        if (!res.ok) {
          const data = await res.json();
          setSaveError(data.error ?? "Failed to save picks");
          return;
        }
      } catch {
        setSaveError("Something went wrong saving your picks");
        return;
      }
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Card className="text-center py-16">
          <div className="flex flex-col items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <Check className="h-8 w-8 text-success" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-foreground">
              Picks Submitted!
            </h2>
            <p className="text-muted max-w-md">
              Your lineup has been locked in. You can update your picks until the deadline.
            </p>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg">
              {Object.entries(picks)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([tier, name]) => {
                  const player = PLAYERS.find((p) => p.name === name);
                  return (
                    <div key={tier} className="flex items-center gap-2 rounded-lg border border-border p-3">
                      <span className={cn("flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-bold", getTierColor(Number(tier)))}>
                        T{tier}
                      </span>
                      <span className="text-sm font-medium text-foreground truncate">
                        {player?.country} {name}
                      </span>
                    </div>
                  );
                })}
            </div>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-4 text-sm text-masters-green font-medium hover:underline cursor-pointer"
            >
              Edit Picks
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-3xl font-bold text-foreground">
          My Picks
        </h1>
        <p className="text-muted mt-1">
          Select 1 golfer from each of the {NUM_TIERS} tiers
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Sidebar — Tier Navigation + Lineup Summary */}
        <div className="space-y-4">
          {/* Tier Progress */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold text-foreground text-sm">Your Lineup</h3>
              <span className="text-xs font-mono text-muted">{totalPicks}/{NUM_TIERS}</span>
            </div>

            {/* Progress bar */}
            <div className="h-2 rounded-full bg-bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-masters-green transition-all duration-500"
                style={{ width: `${(totalPicks / NUM_TIERS) * 100}%` }}
              />
            </div>

            {/* Tier list */}
            <div className="space-y-1">
              {Array.from({ length: NUM_TIERS }, (_, i) => i + 1).map((tier) => {
                const picked = picks[tier];
                const player = picked ? PLAYERS.find((p) => p.name === picked) : null;
                const isActive = tier === currentTier;

                return (
                  <button
                    key={tier}
                    onClick={() => { setCurrentTier(tier); setSearch(""); setExpandedPlayer(null); }}
                    className={cn(
                      "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all cursor-pointer text-sm",
                      isActive
                        ? "bg-masters-green-light ring-1 ring-masters-green/30"
                        : "hover:bg-bg-muted"
                    )}
                  >
                    <span className={cn("flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold", getTierColor(tier))}>
                      {tier}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className={cn("font-medium", isActive ? "text-masters-green" : "text-foreground")}>
                        {getTierLabel(tier)}
                      </span>
                      {player ? (
                        <p className="text-xs text-muted truncate">{player.country} {player.name}</p>
                      ) : (
                        <p className="text-xs text-muted/50 italic">No pick</p>
                      )}
                    </div>
                    {picked ? (
                      <Check className="h-4 w-4 text-success flex-shrink-0" />
                    ) : isActive ? (
                      <ChevronRight className="h-4 w-4 text-masters-green flex-shrink-0" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Submit / Deadline */}
          <Card className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted">
              <Lock className="h-4 w-4" />
              <span>Picks lock April 9th @ 5:00 AM MT</span>
            </div>
            {!poolSlug && (
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Open from your pool page to save picks.
              </p>
            )}
            {saveError && (
              <p className="text-xs text-danger bg-danger/5 border border-danger/20 rounded-lg px-3 py-2">
                {saveError}
              </p>
            )}
            <button
              onClick={handleSubmit}
              disabled={!isComplete}
              className={cn(
                "w-full flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-bold transition-all cursor-pointer",
                isComplete
                  ? "bg-masters-green text-white hover:bg-masters-green/90 active:scale-[0.98]"
                  : "bg-bg-muted text-muted cursor-not-allowed"
              )}
            >
              <Save className="h-4 w-4" />
              {isComplete ? "Submit Picks" : `${NUM_TIERS - totalPicks} picks remaining`}
            </button>
          </Card>
        </div>

        {/* Main Content — Tier Selection */}
        <div className="space-y-4">
          {/* Tier Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={cn("px-3 py-1.5 rounded-full text-sm font-bold", getTierColor(currentTier))}>
                Tier {currentTier}
              </span>
              <h2 className="font-heading text-xl font-bold text-foreground">
                {getTierLabel(currentTier)}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setCurrentTier(Math.max(1, currentTier - 1)); setSearch(""); setExpandedPlayer(null); }}
                disabled={currentTier === 1}
                className="p-2 rounded-lg hover:bg-bg-muted disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-sm font-mono text-muted">{currentTier}/{NUM_TIERS}</span>
              <button
                onClick={() => { setCurrentTier(Math.min(NUM_TIERS, currentTier + 1)); setSearch(""); setExpandedPlayer(null); }}
                disabled={currentTier === NUM_TIERS}
                className="p-2 rounded-lg hover:bg-bg-muted disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Search + Watchlist Filter */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input
                type="text"
                placeholder={`Search Tier ${currentTier} players...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-border bg-white pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-masters-green focus:outline-none focus:ring-2 focus:ring-masters-green/20"
              />
            </div>
            <button
              onClick={() => setShowWatchlistOnly(!showWatchlistOnly)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer border",
                showWatchlistOnly
                  ? "bg-masters-gold/10 border-masters-gold text-masters-gold"
                  : "bg-white border-border text-muted hover:text-foreground"
              )}
            >
              <Star className={cn("h-4 w-4", showWatchlistOnly && "fill-current")} />
              <span className="hidden sm:inline">Watchlist</span>
            </button>
          </div>

          {/* Player Cards */}
          {tierPlayers.length === 0 ? (
            <Card className="p-8 text-center">
              <AlertCircle className="h-8 w-8 text-muted mx-auto mb-2" />
              <p className="text-muted text-sm">
                {showWatchlistOnly
                  ? "No watchlisted players in this tier"
                  : "No players match your search"}
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {tierPlayers.map((player) => {
                const isSelected = currentPick === player.name;
                const isExpanded = expandedPlayer === player.name;
                const trend = calculateTrend(player);
                const watched = isWatchlisted(player.name);

                return (
                  <Card
                    key={player.name}
                    className={cn(
                      "transition-all duration-200 overflow-hidden",
                      isSelected
                        ? "ring-2 ring-masters-green bg-masters-green-light/30"
                        : "hover:shadow-md"
                    )}
                  >
                    {/* Main Row */}
                    <div className="flex items-center gap-3 p-4">
                      {/* Select Button */}
                      <button
                        onClick={() => selectPlayer(player.name)}
                        className={cn(
                          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer border-2",
                          isSelected
                            ? "bg-masters-green border-masters-green text-white"
                            : "border-border hover:border-masters-green/50 hover:bg-masters-green-light"
                        )}
                      >
                        {isSelected ? <Check className="h-5 w-5" /> : <span className="text-xs font-mono text-muted">#{player.currentRank}</span>}
                      </button>

                      {/* Player Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-lg">{player.country}</span>
                          <span className="font-heading font-bold text-foreground">{player.name}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleWatchlist(player.name); }}
                            className={cn(
                              "p-0.5 rounded transition-colors cursor-pointer",
                              watched ? "text-masters-gold" : "text-border hover:text-masters-gold/60"
                            )}
                          >
                            <Star className={cn("h-3.5 w-3.5", watched && "fill-current")} />
                          </button>
                          {getPlayerGroupTags(player).map((tag) => (
                            <span
                              key={tag.name}
                              className={cn("inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold", tag.color)}
                            >
                              {tag.emoji} {tag.name}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted">
                          <span className="font-mono font-semibold">{player.odds}</span>
                          <span>OWGR #{player.worldRank}</span>
                          {trend !== 0 && (
                            <span className={cn("flex items-center gap-0.5 font-bold", trend > 0 ? "text-success" : "text-danger")}>
                              {trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                              {trend > 0 ? `+${trend}` : trend}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Expand Toggle */}
                      <button
                        onClick={() => setExpandedPlayer(isExpanded ? null : player.name)}
                        className="flex items-center gap-1 text-xs font-medium text-masters-green hover:underline cursor-pointer px-2 py-1"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">{isExpanded ? "Hide" : "Scouting"}</span>
                      </button>
                    </div>

                    {/* Expanded Scouting Report */}
                    {isExpanded && (
                      <div className="border-t border-border px-4 py-4 bg-bg-muted/30 space-y-3">
                        <p className="text-sm text-foreground leading-relaxed">{player.summary}</p>

                        <div className="grid sm:grid-cols-2 gap-3">
                          <div className="rounded-lg bg-success/10 border border-success/20 p-3">
                            <h5 className="text-xs font-bold text-success uppercase mb-1 flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" /> Bull Case
                            </h5>
                            <p className="text-sm text-foreground">{player.bullCase}</p>
                          </div>
                          <div className="rounded-lg bg-danger/10 border border-danger/20 p-3">
                            <h5 className="text-xs font-bold text-danger uppercase mb-1 flex items-center gap-1">
                              <TrendingDown className="h-3 w-3" /> Bear Case
                            </h5>
                            <p className="text-sm text-foreground">{player.bearCase}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <StatBlock label="Masters Best" value={player.bestMastersFinish} />
                          <StatBlock label="2025 Result" value={player.masters2025} />
                          <StatBlock label="Appearances" value={String(player.mastersAppearances)} />
                          <StatBlock label="Recent Form" value={player.recentForm} small />
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => { setCurrentTier(Math.max(1, currentTier - 1)); setSearch(""); setExpandedPlayer(null); }}
              disabled={currentTier === 1}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer",
                currentTier === 1
                  ? "text-muted/40 cursor-not-allowed"
                  : "text-foreground hover:bg-bg-muted"
              )}
            >
              <ChevronLeft className="h-4 w-4" />
              Tier {currentTier - 1}
            </button>

            {currentPick && currentTier < NUM_TIERS && (
              <button
                onClick={() => { setCurrentTier(currentTier + 1); setSearch(""); setExpandedPlayer(null); }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-masters-green text-white text-sm font-bold transition-all hover:bg-masters-green/90 active:scale-[0.98] cursor-pointer"
              >
                Next Tier
                <ChevronRight className="h-4 w-4" />
              </button>
            )}

            {!currentPick && currentTier < NUM_TIERS && (
              <button
                onClick={() => { setCurrentTier(currentTier + 1); setSearch(""); setExpandedPlayer(null); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-muted hover:bg-bg-muted cursor-pointer transition-all"
              >
                Skip to Tier {currentTier + 1}
                <ChevronRight className="h-4 w-4" />
              </button>
            )}

            {currentTier === NUM_TIERS && (
              <button
                onClick={handleSubmit}
                disabled={!isComplete}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer",
                  isComplete
                    ? "bg-masters-green text-white hover:bg-masters-green/90 active:scale-[0.98]"
                    : "bg-bg-muted text-muted cursor-not-allowed"
                )}
              >
                <Trophy className="h-4 w-4" />
                {isComplete ? "Submit Picks" : `${NUM_TIERS - totalPicks} remaining`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
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
