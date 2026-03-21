"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  ExternalLink,
  RefreshCw,
  Trophy,
  Lock,
  Play,
  CheckCircle,
  Database,
  Trash2,
} from "lucide-react";
import type { AdminPool, SystemStats } from "@/lib/db/admin";
import type { RulesContent } from "@/lib/db/settings";
import type { PoolState } from "@/lib/pool-state";
import { cn } from "@/lib/utils";
import { RulesEditor } from "./rules-editor";

// ─── Tournament Actions ────────────────────────────────────────────────────────
function TournamentActions() {
  const [eventId, setEventId] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  async function seedGolfers() {
    setLoading("seed");
    setResult(null);
    try {
      const res = await fetch("/api/admin/seed-golfers", { method: "POST" });
      const data = await res.json();
      setResult(res.ok ? `✓ Seeded ${data.inserted} of ${data.total} golfers` : `Error: ${data.error}`);
    } catch {
      setResult("Network error");
    } finally {
      setLoading(null);
    }
  }

  async function clearScores() {
    if (!eventId.trim()) {
      setResult("Enter an event ID first");
      return;
    }
    if (!confirm(`Clear all scores for event "${eventId}"? This cannot be undone.`)) return;
    setLoading("clear");
    setResult(null);
    try {
      const res = await fetch(`/api/admin/seed-golfers?clearScores=true&eventId=${encodeURIComponent(eventId)}`, { method: "POST" });
      const data = await res.json();
      setResult(res.ok ? `✓ Cleared scores for event ${data.clearedScoresFor}, then seeded ${data.inserted} golfers` : `Error: ${data.error}`);
    } catch {
      setResult("Network error");
    } finally {
      setLoading(null);
    }
  }

  async function triggerCron() {
    if (!eventId.trim()) {
      setResult("Enter a GOLF_EVENT_ID first (set it in Vercel env vars too)");
      return;
    }
    setLoading("cron");
    setResult(null);
    try {
      const res = await fetch(`/api/cron/scores`);
      const data = await res.json();
      setResult(res.ok
        ? `✓ Fetched ${data.golfers} golfers, upserted ${data.upserted} scores (${data.skipped} skipped)`
        : `Error: ${data.error}`);
    } catch {
      setResult("Network error");
    } finally {
      setLoading(null);
    }
  }

  return (
    <Card>
      <CardTitle className="text-base mb-1 flex items-center gap-2">
        <Database className="h-4 w-4 text-masters-green" />
        Tournament Data
      </CardTitle>
      <p className="text-xs text-muted mb-4">
        Seed golfers from the local players.ts dataset, or trigger a manual score fetch.
        Set <code className="bg-muted/20 px-1 rounded text-xs">GOLF_EVENT_ID</code> in Vercel env vars to the ESPN event ID for the tournament.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="ESPN Event ID (e.g. 401353228)"
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
          className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-masters-green/30"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={seedGolfers}
          disabled={!!loading}
          className="inline-flex items-center gap-2 rounded-lg bg-masters-green px-4 py-2 text-sm font-semibold text-white hover:bg-masters-green-dark transition-colors disabled:opacity-50"
        >
          <Database className="h-4 w-4" />
          {loading === "seed" ? "Seeding…" : "Seed Golfers"}
        </button>
        <button
          onClick={triggerCron}
          disabled={!!loading}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted/10 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn("h-4 w-4", loading === "cron" && "animate-spin")} />
          {loading === "cron" ? "Fetching…" : "Fetch Scores Now"}
        </button>
        <button
          onClick={clearScores}
          disabled={!!loading || !eventId.trim()}
          className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors disabled:opacity-40"
        >
          <Trash2 className="h-4 w-4" />
          {loading === "clear" ? "Clearing…" : "Clear Scores + Reseed"}
        </button>
      </div>

      {result && (
        <p className={cn("mt-3 text-sm font-medium", result.startsWith("✓") ? "text-emerald-600" : "text-red-600")}>
          {result}
        </p>
      )}
    </Card>
  );
}

const STATE_CONFIG: Record<PoolState, { label: string; color: string; icon: React.ElementType }> = {
  pre_lock:    { label: "Pre-Lock",    color: "bg-blue-100 text-blue-700 border-blue-200",    icon: ClipboardList },
  post_lock:   { label: "Post-Lock",   color: "bg-amber-100 text-amber-700 border-amber-200",  icon: Lock },
  in_progress: { label: "Live",        color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: Play },
  complete:    { label: "Complete",    color: "bg-gray-100 text-gray-600 border-gray-200",     icon: CheckCircle },
};

function StateTile({ label, value, icon: Icon, accent }: { label: string; value: number; icon: React.ElementType; accent?: boolean }) {
  return (
    <Card className="text-center">
      <div className={cn(
        "inline-flex items-center justify-center h-10 w-10 rounded-lg mb-3",
        accent ? "bg-masters-gold/15 text-masters-gold-dark" : "bg-masters-green-light text-masters-green"
      )}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm text-muted font-semibold">{label}</p>
      <p className="font-heading text-2xl font-bold text-foreground mt-1">{value}</p>
    </Card>
  );
}

function PoolStateButton({
  state,
  current,
  poolId,
  onSuccess,
}: {
  state: PoolState;
  current: PoolState;
  poolId: string;
  onSuccess: (poolId: string, newState: PoolState) => void;
}) {
  const [loading, setLoading] = useState(false);
  const cfg = STATE_CONFIG[state];
  const isActive = state === current;

  async function handleClick() {
    if (isActive) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/pools/${poolId}/state`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state }),
      });
      if (res.ok) onSuccess(poolId, state);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading || isActive}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer",
        isActive
          ? cfg.color + " opacity-100 ring-2 ring-offset-1 ring-current"
          : "border-border bg-bg-muted text-muted hover:border-current hover:" + cfg.color,
        loading && "opacity-50 cursor-not-allowed"
      )}
    >
      {loading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <cfg.icon className="h-3 w-3" />}
      {cfg.label}
    </button>
  );
}

interface AdminShellProps {
  pools: AdminPool[];
  stats: SystemStats;
  rules: RulesContent;
}

export function AdminShell({ pools: initialPools, stats, rules }: AdminShellProps) {
  const router = useRouter();
  const [pools, setPools] = useState(initialPools);
  const [search, setSearch] = useState("");

  function handleStateChange(poolId: string, newState: PoolState) {
    setPools((prev) =>
      prev.map((p) => (p.id === poolId ? { ...p, state: newState } : p))
    );
    // Revalidate server data in background
    router.refresh();
  }

  const filtered = search.trim()
    ? pools.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.slug.includes(search.toLowerCase())
      )
    : pools;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LayoutDashboard className="h-5 w-5 text-masters-green" />
            <h1 className="font-heading text-3xl font-bold text-foreground">Admin Portal</h1>
          </div>
          <p className="text-muted text-sm">Platform admin — internal use only</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700">
          <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
          Admin Access
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StateTile label="Total Pools" value={stats.total_pools} icon={Trophy} accent />
        <StateTile label="Total Members" value={stats.total_members} icon={Users} />
        <StateTile label="Total Picks" value={stats.total_picks} icon={ClipboardList} />
        <StateTile label="Live Pools" value={stats.pools_by_state.in_progress} icon={Play} />
      </div>

      {/* Pool State Summary */}
      <Card>
        <CardTitle className="mb-4">Pools by State</CardTitle>
        <div className="flex flex-wrap gap-3">
          {(Object.entries(STATE_CONFIG) as [PoolState, typeof STATE_CONFIG[PoolState]][]).map(([state, cfg]) => (
            <div key={state} className={cn("flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold", cfg.color)}>
              <cfg.icon className="h-3.5 w-3.5" />
              {cfg.label}
              <span className="ml-1 font-bold">{stats.pools_by_state[state]}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Pools Table */}
      <Card className="overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <CardTitle className="text-xl">All Pools</CardTitle>
          <input
            type="search"
            placeholder="Search pools…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-border bg-bg-muted px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-masters-green/40 w-full sm:w-56"
          />
        </div>

        <div className="overflow-x-auto -mx-px">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="bg-masters-green">
                <th className="text-left py-3 px-4 text-xs font-semibold text-white uppercase tracking-wider">Pool</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-white uppercase tracking-wider w-28">State</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-white uppercase tracking-wider w-20">Members</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-white uppercase tracking-wider w-16">Picks</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-white uppercase tracking-wider">Override State</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-white uppercase tracking-wider w-20">View</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-muted text-sm">
                    No pools found
                  </td>
                </tr>
              )}
              {filtered.map((pool) => {
                const cfg = STATE_CONFIG[pool.state];
                return (
                  <tr key={pool.id} className="border-b border-border/50 hover:bg-masters-green-light/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-semibold text-foreground text-sm">{pool.name}</p>
                        <p className="text-xs text-muted font-mono mt-0.5">{pool.slug}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold", cfg.color)}>
                        <cfg.icon className="h-3 w-3" />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-mono font-bold text-foreground">{pool.member_count}</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-mono font-bold text-foreground">{pool.pick_count}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1.5">
                        {(["pre_lock", "post_lock", "in_progress", "complete"] as PoolState[]).map((s) => (
                          <PoolStateButton
                            key={s}
                            state={s}
                            current={pool.state}
                            poolId={pool.id}
                            onSuccess={handleStateChange}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Link
                        href={`/pool/${pool.slug}`}
                        target="_blank"
                        className="inline-flex items-center justify-center h-8 w-8 rounded-lg text-muted hover:text-masters-green hover:bg-masters-green-light transition-colors"
                        title="View pool"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted mt-4 text-right">
          {filtered.length} of {pools.length} pools
        </p>
      </Card>

      {/* Tournament Actions */}
      <TournamentActions />

      {/* Rules Editor */}
      <RulesEditor initialRules={rules} />

      {/* State Glossary */}
      <Card>
        <CardTitle className="text-base mb-4">Pool State Glossary</CardTitle>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {([
            {
              state: "pre_lock" as PoolState,
              description: "Picks are open. Members can submit and edit picks. Picks are hidden from other participants. The countdown timer is active.",
            },
            {
              state: "post_lock" as PoolState,
              description: "Picks are locked — no edits allowed (commissioner override only). All picks are now visible to everyone. Tournament hasn't started yet.",
            },
            {
              state: "in_progress" as PoolState,
              description: "Tournament is live. Scores update every 10 minutes. Standings are calculated in real time. Pool is public on the leaderboard.",
            },
            {
              state: "complete" as PoolState,
              description: "Tournament is finished. Final standings are locked. Pool shows historical results. No further score updates.",
            },
          ]).map(({ state, description }) => {
            const cfg = STATE_CONFIG[state];
            return (
              <div key={state} className="rounded-xl border border-border bg-bg-muted p-4">
                <div className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold mb-3", cfg.color)}>
                  <cfg.icon className="h-3.5 w-3.5" />
                  {cfg.label}
                </div>
                <p className="text-xs text-muted leading-relaxed">{description}</p>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
