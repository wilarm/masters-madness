"use client";

import { useState } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Calculator, Lock, Sparkles, Eye, EyeOff, X } from "lucide-react";
import { type PoolState, picksVisible } from "@/lib/pool-state";
import { PickOwnershipChart } from "@/components/analytics/pick-ownership-chart";
import { RiskMatrix } from "@/components/analytics/risk-matrix";
import { TierCoverage } from "@/components/analytics/tier-coverage";
import { BoldPicks } from "@/components/analytics/bold-picks";
import { AnalyticsStatsBar } from "@/components/analytics/analytics-stats-bar";
import { ProjectionsTable } from "@/components/analytics/projections-table";
import { WhatIfSimulator } from "@/components/analytics/what-if-simulator";
import Link from "next/link";

type AnalyticsTab = "metrics" | "projections" | "simulator";

const TABS: { id: AnalyticsTab; label: string; icon: React.ReactNode }[] = [
  { id: "metrics",     label: "Metrics",     icon: <BarChart3   className="w-4 h-4" /> },
  { id: "projections", label: "Projections", icon: <TrendingUp  className="w-4 h-4" /> },
  { id: "simulator",   label: "Simulator",   icon: <Calculator  className="w-4 h-4" /> },
];

interface AnalyticsShellProps {
  poolState: PoolState;
  isCommissioner?: boolean;
  /** Show the demo toggle to all visitors (not just commissioners) */
  showDemoToggle?: boolean;
  /** Start with demo mode already on */
  defaultDemo?: boolean;
}

function CommissionerBanner({
  isDemo,
  onToggle,
}: {
  isDemo: boolean;
  onToggle: (v: boolean) => void;
}) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed && !isDemo) return null;

  if (isDemo) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm">
        <span className="flex h-2 w-2 shrink-0 rounded-full bg-amber-400" />
        <p className="flex-1 font-medium text-amber-800">
          <strong>DEMO MODE</strong> — Simulating post-lock analytics. This is how the dashboard will look after April 9.
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
      <Eye className="h-4 w-4 shrink-0 text-muted" />
      <p className="flex-1 text-muted">
        <strong className="text-foreground">Commissioner view:</strong> Analytics are hidden until picks lock. Preview what the dashboard will look like.
      </p>
      <button
        onClick={() => onToggle(true)}
        className="flex items-center gap-1.5 rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-bg-muted transition-colors"
      >
        <Eye className="h-3.5 w-3.5" />
        Preview Analytics
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

export function AnalyticsShell({
  poolState,
  isCommissioner = false,
  showDemoToggle = false,
  defaultDemo = false,
}: AnalyticsShellProps) {
  const [isDemo, setIsDemo] = useState(defaultDemo);
  const [activeTab, setActiveTab] = useState<AnalyticsTab>("metrics");
  const unlocked = picksVisible(poolState, isDemo);

  return (
    <div className="space-y-6">
      {/* Demo banner — shown to commissioners and on pages with showDemoToggle */}
      {(isCommissioner || showDemoToggle) && poolState === "pre_lock" && (
        <CommissionerBanner isDemo={isDemo} onToggle={setIsDemo} />
      )}

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="h-5 w-5 text-masters-green" />
            <h1 className="font-heading text-3xl font-bold text-foreground">Pool Analytics</h1>
          </div>
          <p className="text-muted">
            Risk vs. reward breakdown of every entry — pick ownership, contrarian moves, and who&apos;s sweating.
          </p>
        </div>
        {unlocked && !isDemo && (
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700 shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Live · Updates every 10 min
          </div>
        )}
        {isDemo && (
          <div className="flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-700 shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Demo Preview
          </div>
        )}
      </div>

      {/* Locked state */}
      {!unlocked && (
        <>
          <Card className="text-center py-14">
            <div className="flex flex-col items-center gap-4 max-w-lg mx-auto">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-masters-gold/15">
                <Lock className="h-8 w-8 text-masters-gold-dark" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-foreground">
                Unlocks After Picks Lock
              </h2>
              <p className="text-muted">
                Analytics become available once picks are locked on{" "}
                <strong className="text-foreground">Thursday, April 9, 2026 at 5:00 AM MT</strong>.
                Return then to see the full breakdown.
              </p>
              <Link
                href="/standings"
                className="inline-flex items-center gap-2 rounded-xl bg-masters-green px-6 py-3 text-sm font-semibold text-white hover:bg-masters-green/90 transition-colors"
              >
                View Current Standings
              </Link>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-masters-gold-dark" />
              <CardTitle className="text-lg">What you&apos;ll see after picks lock</CardTitle>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { title: "Metrics",     desc: "Pick ownership, risk matrix, tier concentration, and bold moves" },
                { title: "Projections", desc: "Full standings ranked by pool score, projected finish, and win %s" },
                { title: "Simulator",   desc: "Edit any entry's projected golfer scores and see where they'd finish" },
              ].map((item) => (
                <div key={item.title} className="rounded-xl bg-bg-muted p-4">
                  <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted">{item.desc}</p>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {/* Full analytics dashboard — tabs */}
      {unlocked && (
        <div className="space-y-6">
          {/* Pill tab selector */}
          <div className="inline-flex items-center gap-1 p-1.5 bg-bg-muted rounded-full border border-border shadow-sm">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    relative inline-flex items-center gap-2 px-5 py-2.5 rounded-full
                    font-medium text-sm transition-all duration-300 ease-in-out cursor-pointer
                    ${isActive ? "text-white shadow-lg" : "text-muted hover:text-foreground"}
                  `}
                  style={{ backgroundColor: isActive ? "#025928" : "transparent" }}
                >
                  <span
                    className={`transition-all duration-300 ${isActive ? "scale-110" : "scale-100"}`}
                    style={{ color: isActive ? "#C4A747" : "inherit" }}
                  >
                    {tab.icon}
                  </span>
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab: Metrics */}
          {activeTab === "metrics" && (
            <div className="space-y-6">
              <AnalyticsStatsBar />

              <div className="grid lg:grid-cols-5 gap-6">
                <Card className="lg:col-span-3 overflow-visible">
                  <PickOwnershipChart />
                </Card>
                <Card className="lg:col-span-2">
                  <TierCoverage />
                </Card>
              </div>

              <Card>
                <RiskMatrix />
              </Card>

              <Card>
                <div className="mb-2">
                  <CardTitle className="text-xl">Contrarian &amp; Consensus Picks</CardTitle>
                  <p className="text-sm text-muted mt-0.5">
                    Bold swings that could win the pool — and the consensus locks everyone shares.
                  </p>
                </div>
                <div className="mt-4">
                  <BoldPicks />
                </div>
              </Card>
            </div>
          )}

          {/* Tab: Projections */}
          {activeTab === "projections" && (
            <Card>
              <ProjectionsTable />
            </Card>
          )}

          {/* Tab: Simulator */}
          {activeTab === "simulator" && (
            <Card>
              <WhatIfSimulator />
            </Card>
          )}

          <p className="text-center text-xs text-muted pb-4">
            {isDemo
              ? "Demo mode — showing mock data as it would appear after picks lock on April 9."
              : "Analytics are based on post-lock picks. Projected scores update every 10 minutes during the tournament."}
          </p>
        </div>
      )}
    </div>
  );
}
