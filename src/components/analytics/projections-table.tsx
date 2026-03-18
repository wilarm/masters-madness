"use client";

import { useState } from "react";
import { MOCK_PARTICIPANT_PICKS } from "@/data/mock-picks";
import { ScoreBadge } from "@/components/ui/score-badge";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ChevronUp, ChevronDown } from "lucide-react";

type SortKey = "projectedFinish" | "poolScore" | "top3Chance" | "top10Chance";

const INITIAL_VISIBLE = 5;

export function ProjectionsTable() {
  const [sortKey, setSortKey] = useState<SortKey>("projectedFinish");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [expanded, setExpanded] = useState(false);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "projectedFinish" || key === "poolScore" ? "asc" : "desc");
    }
  }

  const sorted = [...MOCK_PARTICIPANT_PICKS].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    return sortDir === "asc" ? av - bv : bv - av;
  });

  const visible = expanded ? sorted : sorted.slice(0, INITIAL_VISIBLE);
  const hiddenCount = sorted.length - INITIAL_VISIBLE;

  function SortTh({
    label,
    colKey,
    className,
  }: {
    label: string;
    colKey: SortKey;
    className?: string;
  }) {
    const active = sortKey === colKey;
    return (
      <th
        className={cn(
          "py-3 px-3 text-xs font-semibold uppercase tracking-wider cursor-pointer select-none whitespace-nowrap transition-colors",
          active ? "text-white" : "text-white/60 hover:text-white/90",
          className
        )}
        onClick={() => toggleSort(colKey)}
      >
        <div className="flex items-center justify-center gap-1">
          {label}
          <span className="flex flex-col gap-[1px]">
            <ChevronUp
              className={cn(
                "h-2.5 w-2.5 -mb-[1px]",
                active && sortDir === "asc" ? "text-masters-gold" : "opacity-30"
              )}
            />
            <ChevronDown
              className={cn(
                "h-2.5 w-2.5",
                active && sortDir === "desc" ? "text-masters-gold" : "opacity-30"
              )}
            />
          </span>
        </div>
      </th>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h3 className="font-heading text-lg font-bold text-foreground">Pool Projections</h3>
        <p className="text-sm text-muted">
          Top 5 entries by projected finish. Click any column to sort.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border -mx-px">
        <table className="w-full min-w-[520px]">
          <thead>
            <tr className="bg-masters-green">
              <th className="text-left py-3 px-3 sm:px-4 text-xs font-semibold text-white/60 uppercase tracking-wider w-10">
                #
              </th>
              <th className="text-left py-3 px-3 text-xs font-semibold text-white/60 uppercase tracking-wider">
                Participant
              </th>
              <SortTh label="Pool Score"   colKey="poolScore"        className="text-right" />
              <SortTh label="Proj. Finish" colKey="projectedFinish"  className="text-center" />
              <SortTh label="Top 3 %"      colKey="top3Chance"       className="text-center" />
              <SortTh label="Top 10 %"     colKey="top10Chance"      className="text-center" />
            </tr>
          </thead>
          <tbody>
            {visible.map((entry, idx) => {
              const isTop3 = entry.projectedFinish <= 3;
              return (
                <tr
                  key={entry.name}
                  className={cn(
                    "border-b border-border/40 last:border-0 transition-colors hover:bg-masters-green-light/40",
                    isTop3 && "bg-masters-gold/4"
                  )}
                >
                  <td className="py-3 px-3 sm:px-4">
                    <span className="font-mono font-bold text-base text-muted">{idx + 1}</span>
                  </td>

                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={entry.name} size="sm" />
                      <span className="font-medium text-sm text-foreground">{entry.name}</span>
                    </div>
                  </td>

                  <td className="py-3 px-3 text-right">
                    <ScoreBadge score={entry.poolScore} size="md" />
                  </td>

                  <td className="py-3 px-3 text-center">
                    <span
                      className={cn(
                        "font-mono font-bold text-base",
                        entry.projectedFinish === 1
                          ? "text-masters-gold-dark"
                          : entry.projectedFinish <= 3
                            ? "text-masters-green"
                            : "text-foreground"
                      )}
                    >
                      #{entry.projectedFinish}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="font-mono font-semibold text-sm text-foreground">
                        {entry.top3Chance}%
                      </span>
                      <div className="w-12 h-1 rounded-full bg-border overflow-hidden">
                        <div
                          className="h-full rounded-full bg-masters-gold"
                          style={{ width: `${entry.top3Chance}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="font-mono font-semibold text-sm text-foreground">
                        {entry.top10Chance}%
                      </span>
                      <div className="w-12 h-1 rounded-full bg-border overflow-hidden">
                        <div
                          className="h-full rounded-full bg-masters-green"
                          style={{ width: `${entry.top10Chance}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Expand / collapse footer */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-center gap-2 border-t border-border bg-bg-muted/30 py-2.5 text-sm font-medium text-masters-green transition-colors hover:bg-masters-green-light cursor-pointer"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Show top {INITIAL_VISIBLE} only
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Show all {sorted.length} entries ({hiddenCount} more)
            </>
          )}
        </button>
      </div>

      <p className="text-xs text-muted mt-2 text-right">
        Projections based on current tournament scoring. Updates every 10 min.
      </p>
    </div>
  );
}
