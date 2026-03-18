"use client";

import { useState } from "react";
import { MOCK_PARTICIPANT_PICKS } from "@/data/mock-picks";
import { ScoreBadge } from "@/components/ui/score-badge";
import { Avatar } from "@/components/ui/avatar";
import { getTierColor } from "@/data/players";
import { cn } from "@/lib/utils";
import { Shuffle, RefreshCw, ChevronDown } from "lucide-react";

function parseScore(val: string): number {
  const n = parseInt(val.replace(/^\+/, ""), 10);
  return isNaN(n) ? 0 : n;
}

export function WhatIfSimulator() {
  const [selectedName, setSelectedName] = useState(MOCK_PARTICIPANT_PICKS[0].name);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const participant = MOCK_PARTICIPANT_PICKS.find((p) => p.name === selectedName)!;
  const activePicks = participant.picks.filter((p) => p.status !== "cut");
  const cutPicks = participant.picks.filter((p) => p.status === "cut");

  const [inputs, setInputs] = useState<Record<string, Record<string, string>>>(() =>
    Object.fromEntries(
      MOCK_PARTICIPANT_PICKS.map((p) => [
        p.name,
        Object.fromEntries(
          p.picks
            .filter((pick) => pick.status !== "cut")
            .map((pick) => [pick.golferName, String(pick.totalScore ?? 0)])
        ),
      ])
    )
  );

  const currentInputs = inputs[selectedName] ?? {};

  function setScore(golfer: string, val: string) {
    setInputs((prev) => ({
      ...prev,
      [selectedName]: { ...prev[selectedName], [golfer]: val },
    }));
  }

  function reset() {
    setInputs((prev) => ({
      ...prev,
      [selectedName]: Object.fromEntries(
        activePicks.map((p) => [p.golferName, String(p.totalScore ?? 0)])
      ),
    }));
  }

  // Compute what-if pool score: best 4 of active picks
  const adjustedActive = activePicks.map((p) => ({
    ...p,
    whatIfScore: parseScore(currentInputs[p.golferName] ?? String(p.totalScore ?? 0)),
  }));
  const sortedByScore = [...adjustedActive].sort((a, b) => a.whatIfScore - b.whatIfScore);
  const counting4 = new Set(sortedByScore.slice(0, 4).map((p) => p.golferName));
  const whatIfPoolScore = sortedByScore.slice(0, 4).reduce((s, p) => s + p.whatIfScore, 0);

  // Simulated finish vs. rest of field at their CURRENT scores
  const others = MOCK_PARTICIPANT_PICKS.filter((p) => p.name !== selectedName);
  const simulatedFinish = others.filter((p) => p.poolScore < whatIfPoolScore).length + 1;
  const currentFinish = participant.projectedFinish;
  const finishDelta = currentFinish - simulatedFinish;
  const scoreDelta = whatIfPoolScore - participant.poolScore;
  const hasChanges = scoreDelta !== 0;

  return (
    <div>
      <div className="mb-4">
        <h3 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
          <Shuffle className="h-4.5 w-4.5 text-masters-gold-dark" />
          What-If Simulator
        </h3>
        <p className="text-sm text-muted">
          Select any entry, edit their projected final scores, and see where they'd finish.
        </p>
      </div>

      {/* Participant selector */}
      <div className="relative mb-4 max-w-xs">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-bg-muted transition-colors"
        >
          <div className="flex items-center gap-2">
            <Avatar name={selectedName} size="sm" />
            {selectedName}
          </div>
          <ChevronDown className={cn("h-4 w-4 text-muted transition-transform", dropdownOpen && "rotate-180")} />
        </button>
        {dropdownOpen && (
          <div className="absolute z-20 mt-1 w-full rounded-xl border border-border bg-white shadow-xl overflow-hidden">
            {MOCK_PARTICIPANT_PICKS.map((p) => (
              <button
                key={p.name}
                onClick={() => { setSelectedName(p.name); setDropdownOpen(false); }}
                className={cn(
                  "flex w-full items-center gap-2 px-4 py-2.5 text-sm hover:bg-masters-green-light/50 transition-colors text-left",
                  p.name === selectedName && "bg-masters-green-light/70 font-semibold text-masters-green"
                )}
              >
                <Avatar name={p.name} size="sm" />
                <span>{p.name}</span>
                <span className="ml-auto font-mono text-xs text-muted">#{p.projectedFinish}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Simulator card */}
      <div className="rounded-xl border border-masters-gold/30 bg-masters-gold/5 overflow-hidden">
        {/* Card header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-masters-gold/20 bg-masters-gold/8">
          <div className="flex items-center gap-2.5">
            <Avatar name={selectedName} size="sm" />
            <div>
              <p className="text-sm font-bold text-foreground leading-none">{selectedName}</p>
              <p className="text-xs text-muted mt-0.5">
                Current: <span className="font-semibold text-foreground">{participant.poolScore > 0 ? "+" : ""}{participant.poolScore}</span>
                {" · "}Proj. #{currentFinish}
              </p>
            </div>
          </div>
          {hasChanges && (
            <button
              onClick={reset}
              className="flex items-center gap-1.5 text-xs text-masters-gold-dark/70 hover:text-masters-gold-dark transition-colors border border-masters-gold/30 rounded-lg px-2.5 py-1.5"
            >
              <RefreshCw className="h-3 w-3" />
              Reset
            </button>
          )}
        </div>

        {/* Golfer table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-masters-gold/15">
                <th className="text-left py-2 px-4 text-[10px] font-semibold text-masters-gold-dark/60 uppercase tracking-wider">
                  Golfer
                </th>
                <th className="text-center py-2 px-3 text-[10px] font-semibold text-masters-gold-dark/60 uppercase tracking-wider w-24">
                  Current
                </th>
                <th className="text-center py-2 px-3 text-[10px] font-semibold text-masters-gold-dark/60 uppercase tracking-wider w-36">
                  Projected Final
                </th>
                <th className="text-center py-2 px-3 text-[10px] font-semibold text-masters-gold-dark/60 uppercase tracking-wider w-24">
                  Counts?
                </th>
              </tr>
            </thead>
            <tbody>
              {adjustedActive.map((p) => {
                const isCounting = counting4.has(p.golferName);
                const inputVal = currentInputs[p.golferName] ?? "0";
                const delta = p.whatIfScore - (p.totalScore ?? 0);

                return (
                  <tr
                    key={p.golferName}
                    className={cn(
                      "border-b border-masters-gold/10 transition-colors",
                      isCounting ? "bg-masters-gold/6" : "bg-transparent"
                    )}
                  >
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className={cn("inline-flex items-center justify-center h-5 min-w-[26px] rounded text-[10px] font-bold px-1.5 shrink-0", getTierColor(p.tier))}>
                          T{p.tier}
                        </span>
                        <span className={cn("text-xs sm:text-sm text-foreground truncate", isCounting && "font-semibold")}>
                          {p.golferName}
                        </span>
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      {p.totalScore !== null ? (
                        <ScoreBadge score={p.totalScore} size="sm" />
                      ) : (
                        <span className="text-xs text-muted font-mono">E</span>
                      )}
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <input
                          type="number"
                          value={inputVal}
                          onChange={(e) => setScore(p.golferName, e.target.value)}
                          step={1}
                          className={cn(
                            "w-16 rounded-lg border px-2 py-1 text-center text-sm font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-masters-gold/40 transition-colors",
                            p.whatIfScore < 0
                              ? "text-score-under border-success/30 bg-success/5"
                              : p.whatIfScore > 0
                                ? "text-score-over border-danger/30 bg-danger/5"
                                : "text-score-even border-border bg-white"
                          )}
                        />
                        {delta !== 0 && (
                          <span className={cn("text-[10px] font-bold tabular-nums w-6 text-left", delta < 0 ? "text-score-under" : "text-score-over")}>
                            {delta > 0 ? `+${delta}` : delta}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-2.5 px-3 text-center">
                      {isCounting ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-success/10 border border-success/20 px-2 py-0.5 text-[10px] font-bold text-success uppercase">
                          ✓ Counts
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted font-medium">Bench</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {cutPicks.map((p) => (
                <tr key={p.golferName} className="border-b border-masters-gold/10 opacity-35">
                  <td className="py-2 px-4">
                    <div className="flex items-center gap-2">
                      <span className={cn("inline-flex items-center justify-center h-5 min-w-[26px] rounded text-[10px] font-bold px-1.5 shrink-0", getTierColor(p.tier))}>
                        T{p.tier}
                      </span>
                      <span className="text-xs sm:text-sm text-foreground line-through truncate">{p.golferName}</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span className="text-xs font-bold text-danger font-mono">MC</span>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span className="text-xs text-muted">—</span>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span className="inline-flex items-center rounded-full bg-danger/10 border border-danger/20 px-2 py-0.5 text-[10px] font-bold text-danger uppercase">
                      Cut
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Result bar */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-8 px-4 py-3.5 bg-masters-gold/10 border-t border-masters-gold/20">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-masters-gold-dark/60 uppercase tracking-wide">
              What-If Score
            </span>
            <div className="flex items-center gap-1.5">
              <ScoreBadge score={whatIfPoolScore} size="lg" />
              {hasChanges && (
                <span className={cn("text-xs font-bold tabular-nums", scoreDelta < 0 ? "text-score-under" : "text-score-over")}>
                  ({scoreDelta > 0 ? "+" : ""}{scoreDelta})
                </span>
              )}
            </div>
          </div>

          <div className="h-5 w-px bg-masters-gold/25 hidden sm:block" />

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-masters-gold-dark/60 uppercase tracking-wide">
              Simulated Finish
            </span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-2xl text-foreground leading-none">#{simulatedFinish}</span>
              {hasChanges && finishDelta !== 0 && (
                <span className={cn("text-sm font-bold", finishDelta > 0 ? "text-score-under" : "text-score-over")}>
                  {finishDelta > 0 ? `▲ ${finishDelta}` : `▼ ${Math.abs(finishDelta)}`}
                </span>
              )}
              {hasChanges && finishDelta === 0 && (
                <span className="text-xs text-muted">no change</span>
              )}
            </div>
          </div>

          <p className="text-xs text-masters-gold-dark/50 italic sm:ml-auto">
            {hasChanges
              ? "Projected vs. field's current scores — edit above to keep exploring."
              : "Edit projected scores to simulate your finish."}
          </p>
        </div>
      </div>
    </div>
  );
}
