"use client";

import { TIER_BREAKDOWN } from "@/data/mock-analytics";
import { cn } from "@/lib/utils";

export function TierCoverage() {
  return (
    <div>
      <div className="mb-4">
        <h3 className="font-heading text-lg font-bold text-foreground">Tier Concentration</h3>
        <p className="text-sm text-muted">
          How concentrated each tier's picks are in one golfer. High = everyone picked the same player.
        </p>
      </div>

      <div className="space-y-3">
        {TIER_BREAKDOWN.map((t) => {
          const pct = t.concentration;
          let barColor = "bg-masters-green";
          let textColor = "text-masters-green";
          if (pct >= 80) { barColor = "bg-danger"; textColor = "text-danger"; }
          else if (pct >= 60) { barColor = "bg-amber-500"; textColor = "text-amber-600"; }

          return (
            <div key={t.tier} className="flex items-center gap-3 group">
              {/* Tier label */}
              <span className="w-14 shrink-0 text-xs font-bold text-muted text-right">
                {t.label}
              </span>

              {/* Bar */}
              <div className="relative flex-1 h-7 bg-bg-muted rounded-lg overflow-hidden">
                <div
                  className={cn("h-full rounded-lg transition-all duration-500", barColor)}
                  style={{ width: `${pct}%`, opacity: 0.8 }}
                />
                {/* Top pick label inside bar */}
                <span className="absolute inset-y-0 left-2 flex items-center text-xs font-semibold text-white whitespace-nowrap">
                  {t.topPick}
                </span>
              </div>

              {/* Ownership % */}
              <span className={cn("w-10 shrink-0 text-xs font-bold tabular-nums", textColor)}>
                {t.topPickOwnership}%
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border text-xs font-medium text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-4 rounded-sm bg-danger opacity-80" /> High concentration (80%+)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-4 rounded-sm bg-amber-500 opacity-80" /> Moderate (60–79%)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-4 rounded-sm bg-masters-green opacity-80" /> Spread out (&lt;60%)
        </span>
      </div>
    </div>
  );
}
