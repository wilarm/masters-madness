"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatScore } from "@/lib/utils";
import { getTierColor } from "@/data/players";
import type { ParticipantPicks, GolferPick, GolferStatus } from "@/data/mock-picks";
import { ScoreBadge } from "@/components/ui/score-badge";
import { Trophy, Target, TrendingUp, BarChart3 } from "lucide-react";

interface ParticipantPicksExpandedProps {
  participant: ParticipantPicks;
}

export function ParticipantPicksExpanded({ participant }: ParticipantPicksExpandedProps) {
  const { picks, poolScore, projectedFinish, top3Chance, top10Chance } = participant;

  const countingPicks = picks.filter((p) => p.status === "counting");
  const benchPicks = picks.filter((p) => p.status === "bench");
  const cutPicks = picks.filter((p) => p.status === "cut");

  return (
    <div
      className="border-t border-masters-green/10 px-3 py-4 sm:px-6 sm:py-5"
      style={{
        animation: "expandIn 0.3s var(--ease-out) forwards",
        background: "linear-gradient(180deg, rgba(230,247,233,0.5) 0%, rgba(250,250,245,0.3) 100%)",
      }}
    >
      {/* Stats bar — unified card with dividers like 21st.dev pattern */}
      <div
        role="list"
        aria-label="Participant stats"
        className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border/40 rounded-xl bg-white/80 border border-border/40 shadow-sm mb-4 sm:mb-5 backdrop-blur-sm"
      >
        <StatCell
          icon={<Trophy className="h-3.5 w-3.5 text-masters-gold" />}
          label="Pool Score"
          value={<ScoreBadge score={poolScore} size="lg" />}
        />
        <StatCell
          icon={<Target className="h-3.5 w-3.5 text-masters-green" />}
          label="Proj. Finish"
          value={
            <span className="font-mono font-bold text-lg sm:text-xl tracking-tight text-foreground">
              #{projectedFinish}
            </span>
          }
        />
        <StatCell
          icon={<TrendingUp className="h-3.5 w-3.5 text-success" />}
          label="Top 3"
          value={
            <div className="flex items-baseline gap-0.5">
              <span className="font-mono font-bold text-lg sm:text-xl tracking-tight text-foreground">
                {top3Chance}
              </span>
              <span className="font-mono text-sm font-semibold text-foreground/55">%</span>
            </div>
          }
        />
        <StatCell
          icon={<BarChart3 className="h-3.5 w-3.5 text-info" />}
          label="Top 10"
          value={
            <div className="flex items-baseline gap-0.5">
              <span className="font-mono font-bold text-lg sm:text-xl tracking-tight text-foreground">
                {top10Chance}
              </span>
              <span className="font-mono text-sm font-semibold text-foreground/55">%</span>
            </div>
          }
        />
      </div>

      {/* Picks sections */}
      <div className="space-y-4">
        {countingPicks.length > 0 && (
          <PickSection
            label="Counting"
            count={countingPicks.length}
            accentColor="bg-success"
            labelColor="text-masters-green"
            picks={countingPicks}
          />
        )}
        {benchPicks.length > 0 && (
          <PickSection
            label="Bench"
            count={benchPicks.length}
            accentColor="bg-foreground/20"
            labelColor="text-muted"
            picks={benchPicks}
          />
        )}
        {cutPicks.length > 0 && (
          <PickSection
            label="Missed Cut"
            count={cutPicks.length}
            accentColor="bg-danger"
            labelColor="text-danger"
            picks={cutPicks}
          />
        )}
      </div>
    </div>
  );
}

/** Inline golfer chips for the collapsed standings row */
export function GolferChips({ picks, count = 4 }: { picks: GolferPick[]; count?: number }) {
  const counting = picks
    .filter((p) => p.status === "counting")
    .slice(0, count);

  return (
    <div className="flex flex-wrap gap-1.5">
      {counting.map((pick) => (
        <Link
          key={pick.golferName}
          href={`/research?player=${encodeURIComponent(pick.golferName)}`}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 rounded-full bg-white/90 border border-border/50 px-2.5 py-0.5 text-xs shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:border-masters-green/40 hover:bg-masters-green-light/50 transition-colors"
        >
          <span className={cn("inline-block h-2 w-2 rounded-full ring-1 ring-white", tierDotColor(pick.tier))} />
          <span className="font-medium text-foreground/80 truncate max-w-[80px]">
            {abbreviateName(pick.golferName)}
          </span>
          {pick.totalScore !== null && (
            <span
              className={cn(
                "font-mono font-semibold text-[10px]",
                pick.totalScore < 0
                  ? "text-score-under"
                  : pick.totalScore > 0
                    ? "text-score-over"
                    : "text-score-even"
              )}
            >
              {formatScore(pick.totalScore)}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}

// --- Internal components ---

function StatCell({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div role="listitem" className="flex flex-col items-center justify-center gap-1.5 py-4 px-3">
      {value}
      <div className="flex items-center gap-1">
        {icon}
        <span className="text-[10px] font-semibold text-muted uppercase tracking-widest">
          {label}
        </span>
      </div>
    </div>
  );
}

function PickSection({
  label,
  count,
  accentColor,
  labelColor,
  picks,
}: {
  label: string;
  count: number;
  accentColor: string;
  labelColor: string;
  picks: GolferPick[];
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className={cn("h-3 w-1 rounded-full", accentColor)} />
        <span className={cn("text-xs font-bold uppercase tracking-wider", labelColor)}>
          {label}
        </span>
        <span className="text-[10px] text-muted font-medium">{count}</span>
        <span className="flex-1 h-px bg-border/30" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        {picks.map((pick, i) => (
          <GolferCard key={pick.golferName} pick={pick} index={i} />
        ))}
      </div>
    </div>
  );
}

function GolferCard({ pick, index }: { pick: GolferPick; index: number }) {
  const isCut = pick.status === "cut";
  const isCounting = pick.status === "counting";

  // Calculate cumulative scores for sparkline
  const playedRounds = pick.rounds.filter((r): r is number => r !== null);
  const cumulativeScores: number[] = [];
  playedRounds.reduce((sum, r) => {
    const next = sum + r;
    cumulativeScores.push(next);
    return next;
  }, 0);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border transition-all",
        isCounting && "bg-white border-success/25 shadow-sm",
        pick.status === "bench" && "bg-white/60 border-border/40",
        isCut && "bg-white/30 border-danger/15 opacity-55"
      )}
      style={{
        animation: "staggerFadeIn 0.3s var(--ease-out) forwards",
        animationDelay: `${index * 40}ms`,
        opacity: 0,
      }}
    >
      {/* Left accent stripe */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-[3px]",
          isCounting && "bg-success",
          pick.status === "bench" && "bg-border",
          isCut && "bg-danger/40"
        )}
      />

      <div className="pl-3.5 pr-3 py-2.5">
        {/* Status badge */}
        <div className="absolute top-2 right-2">
          <StatusBadge status={pick.status} />
        </div>

        {/* Tier + Name */}
        <div className="flex items-center gap-2 mb-1.5 pr-16">
          <span
            className={cn(
              "inline-flex items-center justify-center h-5 min-w-[26px] rounded text-[10px] font-bold px-1.5 shrink-0",
              getTierColor(pick.tier)
            )}
          >
            T{pick.tier}
          </span>
          <Link
            href={`/research?player=${encodeURIComponent(pick.golferName)}`}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "font-semibold text-sm text-foreground leading-tight truncate hover:text-masters-green hover:underline transition-colors",
              isCut && "line-through text-foreground/50"
            )}
          >
            {pick.golferName}
          </Link>
        </div>

        {/* Score + Position */}
        <div className="flex items-center gap-2 mb-2">
          {pick.totalScore !== null ? (
            <ScoreBadge score={pick.totalScore} size="md" />
          ) : isCut ? (
            <span className="text-sm text-score-cut font-mono font-semibold">MC</span>
          ) : (
            <span
              className="inline-flex items-center gap-1 text-xs text-muted font-medium"
              title="Score not yet available — updates every 10 minutes during the tournament"
            >
              <span className="animate-pulse">⏳</span>
              <span>Syncing</span>
            </span>
          )}
          {pick.position && (
            <span className="text-xs text-muted font-medium tabular-nums">
              {pick.position}
            </span>
          )}
        </div>

        {/* Round-by-round scores + Sparkline */}
        <div className="flex items-end gap-2 rounded-md bg-foreground/[0.03] px-1.5 py-1">
          <div className="flex gap-0.5 flex-1 min-w-0">
            {pick.rounds.map((round, i) => (
              <div key={i} className="flex flex-col items-center flex-1">
                <span className="text-[8px] text-foreground/65 font-semibold uppercase">
                  R{i + 1}
                </span>
                <span
                  className={cn(
                    "font-mono text-xs font-semibold leading-tight",
                    round === null
                      ? "text-foreground/55"
                      : round < 0
                        ? "text-score-under"
                        : round > 0
                          ? "text-score-over"
                          : "text-score-even"
                  )}
                >
                  {round === null ? "–" : round > 0 ? `+${round}` : round === 0 ? "E" : round}
                </span>
              </div>
            ))}
          </div>

          {/* Mini sparkline — score trajectory */}
          {cumulativeScores.length >= 2 && (
            <div className="shrink-0 ml-1">
              <ScoreSparkline scores={cumulativeScores} isCut={isCut} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Tiny SVG sparkline showing cumulative score trajectory */
function ScoreSparkline({ scores, isCut }: { scores: number[]; isCut: boolean }) {
  const width = 40;
  const height = 20;
  const padding = 2;

  if (scores.length < 2) return null;

  const min = Math.min(...scores, 0);
  const max = Math.max(...scores, 0);
  const range = max - min || 1;

  const points = scores.map((score, i) => {
    const x = padding + (i / (scores.length - 1)) * (width - padding * 2);
    // Invert Y: lower (more negative) scores should be higher on the chart (better in golf)
    const y = padding + ((score - min) / range) * (height - padding * 2);
    return { x, y };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  // Zero line (par)
  const zeroY = padding + ((0 - min) / range) * (height - padding * 2);

  // Color based on final score direction
  const finalScore = scores[scores.length - 1];
  const strokeColor = isCut
    ? "var(--color-score-cut)"
    : finalScore < 0
      ? "var(--color-score-under)"
      : finalScore > 0
        ? "var(--color-score-over)"
        : "var(--color-score-even)";

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
      aria-label={`Score trajectory: ${scores.map((s) => (s > 0 ? `+${s}` : s)).join(", ")}`}
    >
      {/* Zero/par reference line */}
      <line
        x1={padding}
        y1={zeroY}
        x2={width - padding}
        y2={zeroY}
        stroke="currentColor"
        strokeOpacity={0.1}
        strokeWidth={0.5}
        strokeDasharray="2 2"
      />
      {/* Score trajectory line */}
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r={2}
        fill={strokeColor}
      />
    </svg>
  );
}

function StatusBadge({ status }: { status: GolferStatus }) {
  const config = {
    counting: {
      label: "COUNTING",
      className: "bg-success/10 text-success border-success/20",
    },
    bench: {
      label: "BENCH",
      className: "bg-foreground/[0.05] text-muted border-foreground/15",
    },
    cut: {
      label: "CUT",
      className: "bg-danger/10 text-danger border-danger/20",
    },
  };

  const { label, className } = config[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-1.5 py-0.5 text-[8px] font-extrabold uppercase tracking-wider",
        className
      )}
    >
      {label}
    </span>
  );
}

// --- Helpers ---

function abbreviateName(name: string): string {
  const parts = name.split(" ");
  if (parts.length < 2) return name;
  return `${parts[0][0]}. ${parts.slice(1).join(" ")}`;
}

function tierDotColor(tier: number): string {
  const colors: Record<number, string> = {
    1: "bg-yellow-500",
    2: "bg-orange-500",
    3: "bg-red-500",
    4: "bg-pink-500",
    5: "bg-purple-500",
    6: "bg-indigo-500",
    7: "bg-blue-500",
    8: "bg-teal-500",
    9: "bg-emerald-500",
  };
  return colors[tier] || "bg-gray-400";
}
