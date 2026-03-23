import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { ScoringVisualizer } from "@/components/rules/scoring-visualizer";

export const metadata: Metadata = {
  title: "Pool Rules & Scoring — Masters Madness 2026",
  description:
    "How scoring works in Masters Madness: pick 9 golfers across 9 tiers, lowest combined score wins. Learn the tier system, tiebreakers, and payout structure.",
  openGraph: {
    title: "Pool Rules & Scoring — Masters Madness 2026",
    description:
      "How scoring works in Masters Madness: pick 9 golfers across 9 tiers, lowest combined score wins. Learn the tier system, tiebreakers, and payout structure.",
  },
};
import { getRulesContent, topPayoutStats, parsePayoutAmount, type PayoutRow } from "@/lib/db/settings";
import { getPoolBySlug, getPoolMembers, getPoolsForUser } from "@/lib/db/pools";
import { CopyShareButton } from "@/components/ui/share-button";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  Trophy,
  DollarSign,
  Share2,
  CheckCircle,
  PartyPopper,
  Users,
  Award,
  Layers,
} from "lucide-react";

export const revalidate = 60; // revalidate every minute

export default async function RulesPage({
  searchParams,
}: {
  searchParams: Promise<{ pool?: string }>;
}) {
  const { pool: poolSlug } = await searchParams;
  const { userId } = await auth();

  // Auth-aware redirect
  if (userId && !poolSlug) {
    const userPools = await getPoolsForUser(userId);
    if (userPools.length > 0) {
      redirect(`/rules?pool=${userPools[0].slug}`);
    }
  }

  const [rules, pool] = await Promise.all([
    getRulesContent(),
    poolSlug ? getPoolBySlug(poolSlug) : null,
  ]);

  // Pull members count for auto prize pool calc
  const members = pool ? await getPoolMembers(pool.id) : [];

  // Pool config overrides
  const config = (pool?.config ?? {}) as Record<string, unknown>;
  const poolEntryFee = config.entryFee != null ? Number(config.entryFee) : null;
  const poolPrizePool = config.prizePool as string | undefined;
  const poolVenmoLink = config.venmoLink as string | undefined;
  const poolCommunityMessage = config.communityMessage as string | undefined;
  const poolCommunityTitle = config.communityMessageTitle as string | undefined;
  const numTiers = typeof config.numTiers === "number" ? config.numTiers : 9;
  const numScoring = typeof config.numScoring === "number" ? config.numScoring : 4;
  const maxEntriesPerUser = typeof config.maxEntriesPerUser === "number" ? config.maxEntriesPerUser : 1;

  // Compute displayed values — pool config wins over global settings
  const entryFeeLabel = poolEntryFee != null && poolEntryFee > 0
    ? `$${poolEntryFee}`
    : rules.entryFee;

  const autoPrizePool =
    poolEntryFee && poolEntryFee > 0 && members.length > 0
      ? `$${(members.length * poolEntryFee).toLocaleString()}`
      : null;
  const prizePoolLabel = poolPrizePool || autoPrizePool || null;

  const genericWelcomeMessage =
    "Pick 9 golfers across 9 tiers and compete with friends during the Masters Tournament. " +
    "Each pool is fully customizable — commissioners set the entry fee, payout structure, and invite their own group. " +
    "Lowest combined score wins. May the best picker win!";

  const communityMessage = poolCommunityMessage || (pool ? rules.communityMessage : genericWelcomeMessage);

  // Community message title: pool config > pool name > generic
  const defaultTitle = pool ? `Welcome to ${pool.name}` : "Welcome to Masters Madness";
  const communityTitle = poolCommunityTitle || defaultTitle;

  // Effective payout rows for this page (pool config wins over global settings)
  const effectivePayouts: PayoutRow[] =
    Array.isArray(config.payouts) && (config.payouts as PayoutRow[]).length > 0
      ? (config.payouts as PayoutRow[])
      : rules.payouts;

  // Numeric prize pool for percentage math
  const prizePoolNum =
    poolEntryFee && poolEntryFee > 0 && members.length > 0
      ? members.length * poolEntryFee
      : parseFloat((prizePoolLabel ?? "").replace(/[^0-9.]/g, "")) || 0;
  const { pct: topPayoutPct, dollars: topPayoutDollars } = topPayoutStats(effectivePayouts, prizePoolNum);

  // Per-row percentages + estimated dollar amounts for the Payouts section
  const payoutTotal = effectivePayouts.reduce((s, p) => s + parsePayoutAmount(p.amount), 0);
  const payoutRows = effectivePayouts.map((row) => {
    const amt = parsePayoutAmount(row.amount);
    const pct = payoutTotal > 0 ? Math.round((amt / payoutTotal) * 100) : null;
    const dollars = pct != null && prizePoolNum > 0 ? Math.round(prizePoolNum * (amt / payoutTotal)) : null;
    return { ...row, pct, dollars };
  });

  const shareUrl = pool
    ? `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://mastersmadness.com"}/pool/${pool.slug}`
    : `https://${rules.shareUrl}`;

  const pageTitle = pool ? pool.name : "Masters Madness Pool 2026";

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-10">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
          {pageTitle}
        </h1>
        <p className="text-lg text-muted mt-3 max-w-2xl mx-auto">
          Rules, scoring, and everything you need to compete.
        </p>
      </div>

      <div className="space-y-6">
        {/* Community Message — always at top */}
        <Card>
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-masters-gold/15 text-masters-gold-dark flex-shrink-0 mt-1">
              <PartyPopper className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-foreground mb-2">
                {communityTitle}
              </h2>
              <p className="text-muted leading-relaxed">{communityMessage}</p>
            </div>
          </div>
        </Card>

        {/* Overview Tiles — 4 key stats at a glance */}
        <div className="space-y-2">
        {!poolSlug && (
          <p className="text-xs text-muted text-center italic">
            Default setup — entry fee, payouts, and scoring are fully customizable per pool.
          </p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Tile 1: Scoring */}
          <OverviewTile
            icon={Layers}
            label="Scoring"
            value={`${numScoring} of ${numTiers}`}
            sublabel="golfers count"
            accent="green"
          />
          {/* Tile 2: Entries */}
          <OverviewTile
            icon={Users}
            label="Entries"
            value={maxEntriesPerUser === 1 ? "1 entry" : `${maxEntriesPerUser} entries`}
            sublabel="per person"
            accent="blue"
          />
          {/* Tile 3: Entry Fee */}
          <OverviewTile
            icon={DollarSign}
            label="Entry Fee"
            value={poolEntryFee != null && poolEntryFee > 0 ? `$${poolEntryFee}` : "Customizable"}
            sublabel={poolVenmoLink ? undefined : poolSlug ? "contact commissioner" : "set by commissioner"}
            venmoLink={poolVenmoLink}
            accent="gold"
          />
          {/* Tile 4: 1st Place payout */}
          <OverviewTile
            icon={Award}
            label="1st Place"
            value={
              poolSlug
                ? topPayoutPct != null
                  ? `${topPayoutPct}%`
                  : (effectivePayouts[0]?.amount ?? "TBD")
                : "Customizable"
            }
            sublabel={
              poolSlug
                ? topPayoutDollars != null
                  ? `~$${topPayoutDollars.toLocaleString()} · ${prizePoolLabel ?? "prize pool"}`
                  : prizePoolLabel
                    ? `${prizePoolLabel} prize pool`
                    : "prize pool"
                : "set by commissioner"
            }
            accent="gold"
          />
        </div>
        </div>

        {/* How It Works */}
        <Card>
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-masters-green-light text-masters-green flex-shrink-0 mt-1">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-foreground mb-4">
                How It Works
              </h2>

              <div className="space-y-4">
                <RuleItem
                  title="Selection"
                  description={`Select 1 golfer from each of the ${numTiers} groups (tiers based on odds to win).`}
                />
                <RuleItem
                  title="Scoring"
                  description={`Your team's scores are aggregated. The scores of your ${numScoring} lowest-scoring (best) golfers count towards your total.`}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Interactive Scoring Visualizer */}
        <Card>
          <div>
            <h2 className="font-heading text-xl font-bold text-foreground mb-2">
              See It in Action
            </h2>
            <p className="text-muted text-sm mb-4">
              Watch how your pool score changes as golfers play. Your best {numScoring} of {numTiers} scores count — lower is better in golf!
            </p>
            <ScoringVisualizer />
          </div>
        </Card>

        {/* Payouts */}
        {poolSlug ? (
          <Card>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-masters-gold/15 text-masters-gold-dark flex-shrink-0 mt-1">
                <Trophy className="h-5 w-5" />
              </div>
              <div className="w-full">
                <h2 className="font-heading text-xl font-bold text-foreground mb-4">
                  Payouts &amp; Prizes
                </h2>
                {prizePoolLabel ? (
                  <div className="mb-4 rounded-lg bg-masters-gold/10 border border-masters-gold/30 px-4 py-3">
                    <p className="text-sm font-semibold text-foreground">
                      Total Prize Pool: <span className="text-masters-gold-dark">{prizePoolLabel}</span>
                    </p>
                  </div>
                ) : null}
                <div className="space-y-3">
                  {payoutRows.map((row) => (
                    <PayoutRow
                      key={row.place}
                      place={row.place}
                      amount={row.amount}
                      pct={row.pct}
                      dollars={row.dollars}
                      highlight={row.highlight}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted mt-4">{rules.payoutNote}</p>
              </div>
            </div>
          </Card>
        ) : (
          <Card>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-masters-gold/15 text-masters-gold-dark flex-shrink-0 mt-1">
                <Trophy className="h-5 w-5" />
              </div>
              <div className="w-full">
                <h2 className="font-heading text-xl font-bold text-foreground mb-2">
                  Payouts &amp; Side Games
                </h2>
                <p className="text-muted text-sm leading-relaxed mb-4">
                  Every pool is different — commissioners set their own entry fee, prize pool, and payout structure.
                  Split it winner-take-all, across the top 3, or however your group likes it.
                </p>
                <div className="space-y-3">
                  <div className="rounded-lg border border-border-light p-4">
                    <h3 className="font-semibold text-foreground mb-1">Custom Payouts</h3>
                    <p className="text-sm text-muted leading-relaxed">
                      Set 1st, 2nd, 3rd place prizes — or any split you want. The commissioner controls the full payout structure when setting up the pool.
                    </p>
                  </div>
                  <div className="rounded-lg border border-border-light p-4">
                    <h3 className="font-semibold text-foreground mb-1">Side Games</h3>
                    <p className="text-sm text-muted leading-relaxed">
                      Add friendly side bets on top of the main pool — closest to the pin, best single-round score, most birdies, or any prop your group agrees on. Keep it simple or get creative.
                    </p>
                  </div>
                  <div className="rounded-lg border border-border-light p-4">
                    <h3 className="font-semibold text-foreground mb-1">Free Pools</h3>
                    <p className="text-sm text-muted leading-relaxed">
                      No entry fee required. Run a free pool just for bragging rights — no money, no problem.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Entry Details — Payment only shown for pool-specific pages */}
        {poolSlug && (poolVenmoLink || rules.paymentInfo) && (
          <Card>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-masters-gold/15 text-masters-gold-dark flex-shrink-0 mt-1">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-heading text-xl font-bold text-foreground mb-2">
                  Payment
                </h2>
                <p className="text-muted text-sm mb-2">
                  Entry fee: <span className="font-semibold text-foreground">{entryFeeLabel}</span>
                </p>
                {poolVenmoLink ? (
                  <a
                    href={poolVenmoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-masters-green text-white px-4 py-2 text-sm font-semibold hover:bg-masters-green/90 transition-colors"
                  >
                    Pay via Venmo →
                  </a>
                ) : (
                  <p className="text-muted text-sm">{rules.paymentInfo}</p>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Share */}
        <Card>
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10 text-info flex-shrink-0 mt-1">
              <Share2 className="h-5 w-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-heading text-xl font-bold text-foreground mb-2">
                Spread the Word
              </h2>
              <p className="text-muted leading-relaxed mb-3">
                Share this pool with friends and family!
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <code className="text-sm text-masters-green font-mono bg-masters-green-light px-2 py-1 rounded break-all">
                  {shareUrl}
                </code>
                <CopyShareButton url={shareUrl} />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Overview Tile ──────────────────────────────────────────────────────────────
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
    <div className="rounded-xl border border-border bg-white p-4 flex flex-col items-center text-center gap-2">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${accentClasses[accent]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</p>
      <p className="font-heading text-xl font-bold text-foreground leading-tight">{value}</p>
      {sublabel && !venmoLink && (
        <p className="text-[11px] text-muted">{sublabel}</p>
      )}
      {venmoLink && (
        <a
          href={venmoLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-semibold text-masters-green hover:underline"
        >
          Pay via Venmo →
        </a>
      )}
    </div>
  );
}

// ── Rule Item ─────────────────────────────────────────────────────────────────
function RuleItem({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-border-light p-4">
      <h3 className="font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted leading-relaxed">{description}</p>
    </div>
  );
}

// ── Payout Row ────────────────────────────────────────────────────────────────
function PayoutRow({
  place,
  amount,
  pct,
  dollars,
  highlight,
}: {
  place: string;
  amount: string;
  pct?: number | null;
  dollars?: number | null;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-lg p-4 ${
        highlight ? "bg-masters-gold/10 border border-masters-gold/30" : "bg-bg-muted"
      }`}
    >
      <span className="font-semibold text-foreground">{place} Place</span>
      <div className="flex items-baseline gap-2">
        {pct != null ? (
          <>
            <span className="font-mono font-bold text-lg text-foreground">{pct}%</span>
            <span className="font-mono text-sm text-muted">
              {dollars != null ? `~$${dollars.toLocaleString()}` : amount}
            </span>
          </>
        ) : (
          <span className="font-mono font-bold text-lg text-foreground">{amount}</span>
        )}
      </div>
    </div>
  );
}
