"use client";

import { useState } from "react";
import { StandingsPreview } from "@/components/standings/standings-preview";
import { DemoModeBanner } from "@/components/standings/demo-mode-banner";
import { type PoolState, picksVisible, analyticsUnlocked } from "@/lib/pool-state";
import Link from "next/link";
import { BarChart3, Lock } from "lucide-react";

export interface StandingsParticipant {
  rank: number;
  name: string;
  score: number;
  movement: number;
  customTag?: string | null;
}

interface StandingsShellProps {
  poolState: PoolState;
  isCommissioner?: boolean;
  /** Show the demo mode toggle to all visitors (not just commissioners) */
  showDemoToggle?: boolean;
  /** Start with demo mode already on */
  defaultDemo?: boolean;
  /** Real participant data; overrides mock standings when provided */
  participants?: StandingsParticipant[];
}

export function StandingsShell({
  poolState,
  isCommissioner = false,
  showDemoToggle = false,
  defaultDemo = false,
  participants,
}: StandingsShellProps) {
  const [isDemo, setIsDemo] = useState(defaultDemo);

  const showPicks = picksVisible(poolState, isDemo);
  const analyticsOn = analyticsUnlocked(poolState, isDemo);

  return (
    <div className="space-y-4">
      {/* Demo mode banner — shown to commissioners and on pages with showDemoToggle */}
      {(isCommissioner || showDemoToggle) && (
        <DemoModeBanner poolState={poolState} isDemo={isDemo} onToggle={setIsDemo} />
      )}

      {/* Pre-lock info bar (non-commissioner) */}
      {poolState === "pre_lock" && !isCommissioner && (
        <div className="flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <Lock className="h-4 w-4 flex-shrink-0" />
          <span>
            <strong>Picks are hidden</strong> until the deadline passes on April 9, 2026.
            Submit your picks to lock in your entry.
          </span>
        </div>
      )}

      {/* Analytics unlock notice */}
      {!analyticsOn && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-bg-muted px-4 py-3 text-sm text-muted">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 flex-shrink-0" />
            <span>Pool Analytics unlock after picks are submitted and the deadline passes.</span>
          </div>
        </div>
      )}

      {analyticsOn && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-masters-green/20 bg-masters-green-light/40 px-4 py-3 text-sm">
          <div className="flex items-center gap-2 text-masters-green">
            <BarChart3 className="h-4 w-4 flex-shrink-0" />
            <span className="font-medium">Pool Analytics are now available.</span>
          </div>
          <Link
            href="/analytics"
            className="text-xs font-semibold text-masters-green hover:underline"
          >
            View Analytics →
          </Link>
        </div>
      )}

      {/* Standings table */}
      <StandingsPreview poolState={poolState} showPicks={showPicks} participants={participants} />
    </div>
  );
}
