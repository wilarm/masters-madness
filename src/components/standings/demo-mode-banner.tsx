"use client";

import { useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import type { PoolState } from "@/lib/pool-state";

interface DemoModeBannerProps {
  poolState: PoolState;
  /** Called when demo mode is toggled so parent can re-render with new value */
  onToggle: (enabled: boolean) => void;
  isDemo: boolean;
}

export function DemoModeBanner({ poolState, onToggle, isDemo }: DemoModeBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  // Only show if we're in pre_lock state (post-lock the real data is available)
  if (poolState !== "pre_lock") return null;
  if (dismissed && !isDemo) return null;

  if (isDemo) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm">
        <span className="flex h-2 w-2 flex-shrink-0 rounded-full bg-amber-400" />
        <p className="flex-1 font-medium text-amber-800">
          <strong>DEMO MODE</strong> — Simulating post-lock view. Picks and scores are visible as if the deadline has passed.
        </p>
        <button
          onClick={() => onToggle(false)}
          className="flex items-center gap-1.5 rounded-lg bg-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-300 transition-colors"
        >
          <EyeOff className="h-3.5 w-3.5" />
          Exit Demo
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-bg-muted px-4 py-3 text-sm">
      <Eye className="h-4 w-4 flex-shrink-0 text-muted" />
      <p className="flex-1 text-muted">
        <strong className="text-foreground">Commissioner view:</strong> Picks are hidden until the deadline passes. Preview what post-lock looks like.
      </p>
      <button
        onClick={() => onToggle(true)}
        className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-bg-muted transition-colors"
      >
        <Eye className="h-3.5 w-3.5" />
        Preview Post-Lock
      </button>
      <button
        onClick={() => setDismissed(true)}
        className="text-muted hover:text-foreground"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
