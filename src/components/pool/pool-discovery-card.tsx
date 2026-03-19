"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Users, DollarSign, Loader2, LogIn } from "lucide-react";
import type { PoolWithCount } from "@/lib/db/pools";
import type { PoolState } from "@/lib/pool-state";

const STATE_LABELS: Record<PoolState, { label: string; className: string }> = {
  pre_lock: { label: "Open", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  post_lock: { label: "Locked", className: "bg-amber-50 text-amber-700 border-amber-200" },
  in_progress: { label: "Live", className: "bg-masters-gold/10 text-masters-gold-dark border-masters-gold/30" },
  complete: { label: "Complete", className: "bg-bg-muted text-muted border-border" },
};

interface PoolDiscoveryCardProps {
  pool: PoolWithCount;
  /** Whether the current user is already a member */
  isMember: boolean;
  /** Whether the user is signed in */
  isSignedIn: boolean;
}

export function PoolDiscoveryCard({ pool, isMember, isSignedIn }: PoolDiscoveryCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const config = pool.config as Record<string, unknown>;
  const entryFee = config.entryFee != null ? `$${Number(config.entryFee)}` : null;
  const stateInfo = STATE_LABELS[pool.state] ?? STATE_LABELS.pre_lock;

  async function handleJoin() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/pools/${pool.slug}/join`, { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Failed to join pool");
        return;
      }
      router.push(`/pool/${pool.slug}`);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-white p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-heading font-bold text-foreground truncate">{pool.name}</h3>
            <span className={`flex-shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${stateInfo.className}`}>
              {stateInfo.label}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {pool.memberCount} {pool.memberCount === 1 ? "member" : "members"}
            </span>
            {entryFee && (
              <span className="flex items-center gap-1">
                <DollarSign className="h-3.5 w-3.5" />
                {entryFee} entry
              </span>
            )}
          </div>
          {typeof config.heroSubtitle === "string" && config.heroSubtitle && (
            <p className="text-xs text-muted mt-1.5 line-clamp-1">{config.heroSubtitle}</p>
          )}
        </div>

        <div className="flex-shrink-0">
          {isMember ? (
            <Link
              href={`/pool/${pool.slug}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-masters-green/30 bg-masters-green-light px-3 py-1.5 text-xs font-semibold text-masters-green hover:bg-masters-green/10 transition-colors"
            >
              View Pool
            </Link>
          ) : isSignedIn ? (
            <div className="flex flex-col items-end gap-1">
              <button
                onClick={handleJoin}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-lg bg-masters-green px-3 py-1.5 text-xs font-semibold text-white hover:bg-masters-green-dark transition-colors disabled:opacity-60 cursor-pointer disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Users className="h-3.5 w-3.5" />
                )}
                {loading ? "Joining…" : "Join Pool"}
              </button>
              {error && <p className="text-[11px] text-danger">{error}</p>}
            </div>
          ) : (
            <Link
              href="/sign-in"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-bg-muted transition-colors"
            >
              <LogIn className="h-3.5 w-3.5" />
              Sign In to Join
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
