import { Trophy, TrendingUp, Calendar, Info, Medal, Layers, Users, DollarSign, Award, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Countdown } from "@/components/ui/countdown";
import { Card, CardTitle } from "@/components/ui/card";
import { StandingsShell } from "@/components/standings/standings-shell";
import { type StandingsParticipant } from "@/components/standings/standings-shell";
import { getPoolState, poolStateLabel, poolStateDotColor } from "@/lib/pool-state";
import { auth } from "@clerk/nextjs/server";
import { isPlatformAdmin } from "@/lib/auth";
import { getPoolBySlug, getPoolMembers, getPoolsForUser } from "@/lib/db/pools";
import { DEFAULT_RULES, type PayoutRow } from "@/lib/db/settings";
import { redirect } from "next/navigation";
import { ShareButton } from "@/components/ui/share-button";

// Tournament deadline: Thursday, April 9, 2026 5:00 AM MT (11:00 AM UTC)
const PICKS_DEADLINE = new Date("2026-04-09T11:00:00Z");

// Medal colors for 1st / 2nd / 3rd / beyond
const MEDAL: Record<number, { dot: string; label: string }> = {
  0: { dot: "bg-masters-gold", label: "text-masters-gold-dark" },
  1: { dot: "bg-slate-400", label: "text-slate-500" },
  2: { dot: "bg-amber-600", label: "text-amber-700" },
};

export default async function StandingsPage({
  searchParams,
}: {
  searchParams: Promise<{ pool?: string }>;
}) {
  const poolState = getPoolState();
  const { userId } = await auth();
  const isCommissioner = !!userId && isPlatformAdmin(userId);

  // Resolve pool-specific config if ?pool= is present
  const { pool: poolSlug } = await searchParams;

  // Auth-aware redirect: signed-in users without a pool param get sent to their pool
  if (userId && !poolSlug) {
    const userPools = await getPoolsForUser(userId);
    if (userPools.length > 0) {
      redirect(`/standings?pool=${userPools[0].slug}`);
    }
  }

  const pool = poolSlug ? await getPoolBySlug(poolSlug) : null;
  const cfg = (pool?.config ?? {}) as Record<string, unknown>;

  // Always fetch members when pool is present (needed for count + standings)
  const members = pool ? await getPoolMembers(pool.id) : [];

  // Payouts: pool config overrides default
  const payouts: PayoutRow[] =
    Array.isArray(cfg.payouts) && cfg.payouts.length > 0
      ? (cfg.payouts as PayoutRow[])
      : DEFAULT_RULES.payouts;

  // Pool config values
  const numTiers = typeof cfg.numTiers === "number" ? cfg.numTiers : 9;
  const numScoring = typeof cfg.numScoring === "number" ? cfg.numScoring : 4;
  const maxEntriesPerUser = typeof cfg.maxEntriesPerUser === "number" ? cfg.maxEntriesPerUser : 1;
  const entryFeeNum = cfg.entryFee != null ? Number(cfg.entryFee) : 0;
  const venmoLink = typeof cfg.venmoLink === "string" ? cfg.venmoLink : undefined;
  const topPayout = payouts[0]?.amount ?? "TBD";

  // Prize pool: explicit override > auto-calc from members × fee > default sum
  const autoPrizePool = entryFeeNum > 0 && members.length > 0
    ? `$${(members.length * entryFeeNum).toLocaleString()}`
    : null;
  const prizePool: string =
    typeof cfg.prizePool === "string"
      ? cfg.prizePool
      : autoPrizePool ?? DEFAULT_RULES.payouts
          .reduce((sum, p) => {
            const n = parseFloat(p.amount.replace(/[^0-9.]/g, ""));
            return sum + (isNaN(n) ? 0 : n);
          }, 0)
          .toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  const APP_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://mastersmadness.com";
  const poolShareUrl = pool ? `${APP_URL}/pool/${pool.slug}` : null;

  // Participants for standings table (signed-in users)
  let participants: StandingsParticipant[] | undefined;
  if (pool && userId) {
    participants = members.map((m, i) => ({
      rank: i + 1,
      name: m.display_name ?? `Member ${i + 1}`,
      score: 0,
      movement: 0,
      customTag: m.custom_tag ?? null,
    }));
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section — compact for signed-in users, full for marketing/demo */}
      {userId ? (
        <section className="bg-masters-green border-b border-masters-green/20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3 flex-wrap">
            <h1 className="font-heading text-lg font-bold text-white leading-tight">
              {pool ? pool.name : "Masters Madness 2026"}
            </h1>
            <div className="flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-1 text-xs font-semibold text-white/80 border border-white/10">
                <span className={cn("h-1.5 w-1.5 rounded-full", poolStateDotColor(poolState))} />
                {poolStateLabel(poolState)}
              </div>
              <div className="inline-flex items-center gap-1.5 text-xs text-white/60">
                <Calendar className="h-3.5 w-3.5" />
                April 9–12, 2026
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="relative overflow-hidden bg-masters-green">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(196,167,71,0.3) 0%, transparent 50%)",
              }}
            />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
            <div className="text-center">
              <div className="inline-flex items-center gap-3 mb-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm">
                  <Calendar className="h-4 w-4" />
                  April 9–12, 2026
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-1.5 text-xs font-semibold text-white/80 backdrop-blur-sm border border-white/10">
                  <span className={cn("h-1.5 w-1.5 rounded-full", poolStateDotColor(poolState))} />
                  {poolStateLabel(poolState)}
                </div>
              </div>
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
                Masters Madness
                <span className="block text-masters-gold mt-1">2026</span>
              </h1>
              <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-8">
                The premier fantasy golf tournament pool. Pick your golfers, track live scores, and compete for glory at Augusta National.
              </p>
            </div>
          </div>

          {/* Wave divider */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg
              viewBox="0 0 1440 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full"
              preserveAspectRatio="none"
            >
              <path
                d="M0 80V40C240 0 480 0 720 40C960 80 1200 80 1440 40V80H0Z"
                fill="var(--color-bg)"
              />
            </svg>
          </div>
        </section>
      )}

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        {/* Countdown + stats — only for signed-out/demo view */}
        {!userId && (
          <div className="mb-8">
            <Countdown targetDate={PICKS_DEADLINE} />
          </div>
        )}

        {/* Stats Row — only for signed-out/demo view */}
        {!userId && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-enter">
            <StatCard
              icon={Trophy}
              label="Prize Pool"
              value={prizePool}
              accent
            />
            <PayoutsCard payouts={payouts} />
            <StatCard
              icon={TrendingUp}
              label="2025 Winner"
              value="Ryan M."
              sublabel="Defending champ"
            />
            <StatCard
              icon={Calendar}
              label="Tournament"
              value="Apr 9–12"
              sublabel="Augusta National"
            />
          </div>
        )}

        {/* Scoring Info Banner — only for signed-out/demo view */}
        {!userId && (
          <div className="mb-6 rounded-xl border border-masters-green/15 bg-masters-green-light px-4 py-3.5 flex items-start gap-3">
            <Info className="h-4 w-4 text-masters-green shrink-0 mt-0.5" />
            <div className="text-sm text-masters-green/80 leading-relaxed">
              <span className="font-bold text-masters-green">How scoring works: </span>
              Each player picks one golfer from each of {numTiers} tiers. Your{" "}
              <span className="font-semibold">best {numScoring} of {numTiers}</span> golfers' cumulative
              strokes-to-par count toward your score — lower is better. Standings
              update live each round during tournament week.{" "}
              {!pool && (
                <span className="text-masters-green/60 text-xs">
                  (Tiers, score count, and rules are customizable per pool.)
                </span>
              )}
            </div>
          </div>
        )}

        {/* Pool Overview — only shown when viewing a specific pool */}
        {pool && (
          <div className="mb-6 space-y-3">
            {/* Tiles row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <OverviewTile
                icon={Layers}
                label="Scoring"
                value={`${numScoring} of ${numTiers}`}
                sublabel="golfers count"
                accent="green"
              />
              <OverviewTile
                icon={Users}
                label="Entries"
                value={`${members.length}`}
                sublabel={maxEntriesPerUser === 1 ? "1 per person" : `up to ${maxEntriesPerUser} each`}
                accent="blue"
              />
              <OverviewTile
                icon={DollarSign}
                label="Entry Fee"
                value={entryFeeNum > 0 ? `$${entryFeeNum}` : "Free"}
                sublabel={venmoLink ? undefined : undefined}
                venmoLink={entryFeeNum > 0 ? venmoLink : undefined}
                accent="gold"
              />
              <OverviewTile
                icon={Award}
                label="1st Place"
                value={topPayout}
                sublabel={`${prizePool} pool`}
                accent="gold"
              />
            </div>

            {/* Invite button + rules link */}
            <div className="flex items-center gap-3 flex-wrap">
              {poolShareUrl && (
                <ShareButton
                  url={poolShareUrl}
                  title={pool.name}
                  text={`Join ${pool.name} on Masters Madness!`}
                  label="Invite Friends"
                  className="inline-flex items-center gap-2 rounded-lg bg-masters-green text-white px-4 py-2 text-sm font-semibold hover:bg-masters-green/90 active:scale-[0.98] transition-all cursor-pointer"
                />
              )}
              <a
                href={`/rules?pool=${pool.slug}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-bg-muted transition-colors"
              >
                View full rules →
              </a>
            </div>
          </div>
        )}

        {/* Standings Table */}
        <Card className="overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4 sm:mb-6">
            <CardTitle className="text-xl sm:text-2xl">Pool Standings</CardTitle>
            {(poolState === "in_progress" || poolState === "complete") && (
              <span className="text-xs sm:text-sm text-muted">
                Updates every 10 min during tournament
              </span>
            )}
            {poolState === "pre_lock" && (
              <span className="text-xs sm:text-sm text-muted">
                Picks hidden until deadline
              </span>
            )}
          </div>
          <StandingsShell
            poolState={poolState}
            isCommissioner={isCommissioner}
            showDemoToggle={!userId}
            defaultDemo={!userId}
            participants={participants}
          />
        </Card>
      </div>
    </div>
  );
}

// ── Pool Overview Tile ────────────────────────────────────────────────────────
function OverviewTile({
  icon: Icon,
  label,
  value,
  sublabel,
  venmoLink,
  accent = "green",
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sublabel?: string;
  venmoLink?: string;
  accent?: "green" | "gold" | "blue";
}) {
  const accentClasses = {
    green: "bg-masters-green-light text-masters-green",
    gold: "bg-masters-gold/15 text-masters-gold-dark",
    blue: "bg-info/10 text-info",
  };

  return (
    <div className="rounded-xl border border-border bg-white p-3 sm:p-4 flex flex-col items-center text-center gap-1.5">
      <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${accentClasses[accent]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">{label}</p>
      <p className="font-heading text-lg font-bold text-foreground leading-tight">{value}</p>
      {sublabel && !venmoLink && (
        <p className="text-[10px] text-muted">{sublabel}</p>
      )}
      {venmoLink && (
        <a
          href={venmoLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-semibold text-masters-green hover:underline"
        >
          Pay via Venmo →
        </a>
      )}
    </div>
  );
}

// ── Payouts Card ──────────────────────────────────────────────────────────────
function PayoutsCard({ payouts }: { payouts: PayoutRow[] }) {
  const visible = payouts.slice(0, 3);
  const overflow = payouts.length - visible.length;

  return (
    <Card className="flex flex-col">
      <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg mb-3 bg-masters-green-light text-masters-green">
        <Medal className="h-5 w-5" />
      </div>
      <p className="text-sm text-muted font-semibold mb-2">Payouts</p>
      <div className="space-y-1.5 flex-1">
        {visible.map((row, i) => {
          const medal = MEDAL[i] ?? { dot: "bg-muted", label: "text-muted" };
          return (
            <div key={row.place} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className={cn("h-2 w-2 rounded-full flex-shrink-0", medal.dot)} />
                <span className={cn("text-xs font-semibold", medal.label)}>
                  {row.place}
                </span>
              </div>
              <span className="font-heading text-sm font-bold text-foreground tabular-nums">
                {row.amount}
              </span>
            </div>
          );
        })}
        {overflow > 0 && (
          <p className="text-[11px] text-muted/60 pt-0.5">+{overflow} more place{overflow > 1 ? "s" : ""}</p>
        )}
      </div>
    </Card>
  );
}

// ── Generic Stat Card ─────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sublabel?: string;
  accent?: boolean;
}) {
  return (
    <Card className="text-center">
      <div
        className={cn(
          "inline-flex items-center justify-center h-10 w-10 rounded-lg mb-3",
          accent ? "bg-masters-gold/15 text-masters-gold-dark" : "bg-masters-green-light text-masters-green"
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm text-muted font-semibold">{label}</p>
      <p className="font-heading text-2xl font-bold text-foreground mt-1">
        {value}
      </p>
      {sublabel && (
        <p className="text-xs text-muted font-medium mt-1">{sublabel}</p>
      )}
    </Card>
  );
}

