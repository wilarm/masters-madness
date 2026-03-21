"use client";

import { Fragment, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { ScoreBadge } from "@/components/ui/score-badge";
import { ParticipantPicksExpanded, GolferChips } from "@/components/standings/participant-picks";
import { getParticipantPicks } from "@/data/mock-picks";
import { ChevronDown, ChevronUp, ChevronRight, Maximize2, Minimize2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PoolState } from "@/lib/pool-state";
import type { StandingsParticipant } from "@/components/standings/standings-shell";

// Placeholder data — will be replaced with Supabase realtime data
const MOCK_STANDINGS: StandingsParticipant[] = [
  { rank: 1, name: "Ryan McKenzie", score: -12, movement: 0 },
  { rank: 2, name: "Wes Upchurch", score: -10, movement: 2 },
  { rank: 3, name: "Mike Walton", score: -9, movement: -1 },
  { rank: 4, name: "Drake Fages", score: -7, movement: 1 },
  { rank: 5, name: "Will Armstrong", score: -6, movement: -2 },
  { rank: 6, name: "Jake Patterson", score: -5, movement: 0 },
  { rank: 7, name: "Chris Martinez", score: -4, movement: 3 },
  { rank: 8, name: "Tyler Brooks", score: -3, movement: -1 },
  { rank: 9, name: "Alex Chen", score: -2, movement: 1 },
  { rank: 10, name: "Sam Rivera", score: -1, movement: -2 },
  { rank: 11, name: "Jordan Lee", score: 0, movement: 0 },
  { rank: 12, name: "Casey Williams", score: 1, movement: -1 },
  { rank: 13, name: "Morgan Taylor", score: 2, movement: 2 },
  { rank: 14, name: "Riley Anderson", score: 3, movement: -3 },
  { rank: 15, name: "Quinn Davis", score: 5, movement: 0 },
];

const INITIAL_VISIBLE = 5;

interface StandingsPreviewProps {
  poolState?: PoolState;
  showPicks?: boolean;
  /** When provided, overrides MOCK_STANDINGS with real pool member data */
  participants?: StandingsParticipant[];
}

export function StandingsPreview({ poolState = "pre_lock", showPicks = false, participants }: StandingsPreviewProps) {
  const [expanded, setExpanded] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [expandedParticipant, setExpandedParticipant] = useState<string | null>(null);

  const colCount = showPicks ? 5 : 2; // rank + player only in pre-lock

  const standings = participants ?? MOCK_STANDINGS;
  const visibleStandings = expanded
    ? standings
    : standings.slice(0, INITIAL_VISIBLE);
  const hasMore = standings.length > INITIAL_VISIBLE;

  function toggleParticipant(name: string) {
    setExpandedParticipant((prev) => (prev === name ? null : name));
  }

  return (
    <div
      className={
        fullscreen
          ? "fixed inset-0 z-50 overflow-y-auto bg-white p-6"
          : "relative"
      }
    >
      {/* Controls */}
      {hasMore && (
        <div className="flex items-center justify-end gap-2 mb-2">
          <span className="text-xs text-muted font-medium">
            {expanded
              ? standings.length
              : Math.min(INITIAL_VISIBLE, standings.length)}{" "}
            of {standings.length} entries
          </span>
          <button
            onClick={() => setFullscreen(!fullscreen)}
            className="flex items-center justify-center h-7 w-7 rounded-md text-muted hover:text-foreground hover:bg-bg-muted transition-colors cursor-pointer"
            aria-label={fullscreen ? "Exit fullscreen" : "Fullscreen"}
          >
            {fullscreen ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-border -mx-px">
        <table className="w-full min-w-0">
          <thead>
            <tr className="bg-masters-green">
              <th className="text-left py-3 px-3 sm:px-4 text-xs font-semibold text-white uppercase tracking-wider w-12 sm:w-16">
                {showPicks ? "Rank" : "#"}
              </th>
              <th className="text-left py-3 px-3 sm:px-4 text-xs font-semibold text-white uppercase tracking-wider">
                Participant
              </th>
              {showPicks && (
                <>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-white uppercase tracking-wider hidden md:table-cell">
                    Top Picks
                  </th>
                  <th className="text-right py-3 px-3 sm:px-4 text-xs font-semibold text-white uppercase tracking-wider w-16 sm:w-24">
                    Score
                  </th>
                  <th className="text-center py-3 px-2 sm:px-4 text-xs font-semibold text-white uppercase tracking-wider w-14 sm:w-24 hidden sm:table-cell">
                    Move
                  </th>
                </>
              )}
              {!showPicks && (
                <th className="text-right py-3 px-3 sm:px-4 text-xs font-semibold text-white/70 uppercase tracking-wider">
                  Status
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {visibleStandings.map((entry, idx) => {
              const isExpanded = expandedParticipant === entry.name;
              const participantPicks = getParticipantPicks(entry.name);

              return (
                <Fragment key={entry.rank}>
                  <tr
                    className={cn(
                      "border-b border-border/50 transition-colors duration-150",
                      showPicks && isExpanded
                        ? "bg-masters-green-light/70 border-b-0"
                        : "hover:bg-masters-green-light/50 active:bg-masters-green-light/60",
                      !isExpanded && "last:border-0"
                    )}
                    style={{
                      animation: "staggerFadeIn 0.4s var(--ease-out) forwards",
                      animationDelay: `${idx * 30}ms`,
                      opacity: 0,
                    }}
                  >
                    <td className="py-3 sm:py-3.5 px-3 sm:px-4">
                      <span className="font-mono font-bold text-base sm:text-lg text-foreground">
                        {showPicks ? entry.rank : idx + 1}
                      </span>
                    </td>
                    <td className="py-3 sm:py-3.5 px-3 sm:px-4">
                      {showPicks ? (
                        <button
                          onClick={() => toggleParticipant(entry.name)}
                          className="flex items-center gap-2 sm:gap-3 cursor-pointer group text-left min-h-[44px] -my-1"
                        >
                          <Avatar name={entry.name} size="sm" />
                          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap min-w-0">
                            <span className="font-medium text-sm sm:text-base text-foreground group-hover:text-masters-green transition-colors truncate">
                              {entry.name}
                            </span>
                            {entry.customTag && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-masters-gold/15 text-masters-gold-dark shrink-0">
                                {entry.customTag}
                              </span>
                            )}
                            <span className="sm:hidden shrink-0">
                              <MovementBadge change={entry.movement} compact />
                            </span>
                            <ChevronRight
                              className={cn(
                                "h-3.5 w-3.5 text-foreground/30 transition-transform duration-200 shrink-0",
                                isExpanded && "rotate-90 text-masters-green"
                              )}
                            />
                          </div>
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 sm:gap-3 min-h-[44px] -my-1">
                          <Avatar name={entry.name} size="sm" />
                          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                            <span className="font-medium text-sm sm:text-base text-foreground truncate">
                              {entry.name}
                            </span>
                            {entry.customTag && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-masters-gold/15 text-masters-gold-dark shrink-0">
                                {entry.customTag}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </td>
                    {showPicks && (
                      <>
                        <td className="py-3 sm:py-3.5 px-4 hidden md:table-cell">
                          {participantPicks && (
                            <GolferChips picks={participantPicks.picks} count={4} />
                          )}
                        </td>
                        <td className="py-3 sm:py-3.5 px-3 sm:px-4 text-right">
                          <ScoreBadge score={entry.score} size="md" />
                        </td>
                        <td className="py-3 sm:py-3.5 px-2 sm:px-4 text-center hidden sm:table-cell">
                          <MovementBadge change={entry.movement} />
                        </td>
                      </>
                    )}
                    {!showPicks && (
                      <td className="py-3 sm:py-3.5 px-3 sm:px-4 text-right">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Submitted
                        </span>
                      </td>
                    )}
                  </tr>

                  {/* Expanded picks row — only in post-lock mode */}
                  {showPicks && isExpanded && participantPicks && (
                    <tr>
                      <td colSpan={colCount} className="p-0">
                        <ParticipantPicksExpanded participant={participantPicks} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>

        {/* Expand/Collapse */}
        {hasMore && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex w-full items-center justify-center gap-2 border-t border-border bg-bg-muted/30 py-2.5 text-sm font-medium text-masters-green transition-colors hover:bg-masters-green-light cursor-pointer"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Show top {INITIAL_VISIBLE}
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Show full field ({standings.length - INITIAL_VISIBLE} more)
              </>
            )}
          </button>
        )}
      </div>

      {/* Empty state */}
      {standings.length === 0 && (
        <div className="text-center py-16 text-muted">
          <p className="text-lg font-medium">No standings yet</p>
          <p className="text-sm mt-1">
            Standings will appear once the tournament begins
          </p>
        </div>
      )}

      {/* Fullscreen: close on Escape key is handled natively; no dark overlay needed */}
    </div>
  );
}

function MovementBadge({ change, compact }: { change: number; compact?: boolean }) {
  if (change === 0) {
    return compact ? null : <span className="text-muted text-sm">—</span>;
  }

  const sizeClass = compact ? "text-[10px]" : "text-sm";

  if (change > 0) {
    return (
      <span className={cn("inline-flex items-center gap-0.5 text-success font-semibold", sizeClass)}>
        ▲{compact ? "" : ` ${change}`}{compact && change}
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-0.5 text-danger font-semibold", sizeClass)}>
      ▼{compact ? "" : ` ${Math.abs(change)}`}{compact && Math.abs(change)}
    </span>
  );
}
