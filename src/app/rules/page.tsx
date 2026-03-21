import { Card } from "@/components/ui/card";
import { ScoringVisualizer } from "@/components/rules/scoring-visualizer";
import { getRulesContent } from "@/lib/db/settings";
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

  const communityMessage = poolCommunityMessage || rules.communityMessage;

  // Community message title: pool config > global rules > dynamic default
  const defaultTitle = pool ? `Welcome to ${pool.name}` : rules.communityMessageTitle;
  const communityTitle = poolCommunityTitle || defaultTitle;

  const topPayout = Array.isArray(config.payouts) && (config.payouts as {place: string; amount: string}[]).length > 0
    ? (config.payouts as {place: string; amount: string}[])[0]?.amount
    : rules.payouts[0]?.amount;

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
            value={poolEntryFee != null && poolEntryFee > 0 ? `$${poolEntryFee}` : (rules.entryFee.split(" ")[0] || "TBD")}
            sublabel={poolVenmoLink ? undefined : "contact commissioner"}
            venmoLink={poolVenmoLink}
            accent="gold"
          />
          {/* Tile 4: Top Payout */}
          <OverviewTile
            icon={Award}
            label="1st Place"
            value={topPayout ?? "TBD"}
            sublabel={prizePoolLabel ? `${prizePoolLabel} prize pool` : "prize pool"}
            accent="gold"
          />
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
                <RuleItem
                  title="The Cut Rule"
                  description={`If more than ${numScoring} of your golfers miss the cut, your team will automatically use the cut line score as a replacement for each missing golfer beyond ${numScoring}.`}
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
                {rules.payouts.map((row) => (
                  <PayoutRow
                    key={row.place}
                    place={row.place}
                    amount={row.amount}
                    highlight={row.highlight}
                  />
                ))}
              </div>

              <p className="text-sm text-muted mt-4">{rules.payoutNote}</p>
            </div>
          </div>
        </Card>

        {/* Entry Details — Payment only (fee + entries now in overview tiles) */}
        {(poolVenmoLink || rules.paymentInfo) && (
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
  highlight,
}: {
  place: string;
  amount: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-lg p-4 ${
        highlight ? "bg-masters-gold/10 border border-masters-gold/30" : "bg-bg-muted"
      }`}
    >
      <span className="font-semibold text-foreground">{place} Place</span>
      <span className="font-mono font-bold text-lg text-foreground">
        {amount}
      </span>
    </div>
  );
}
