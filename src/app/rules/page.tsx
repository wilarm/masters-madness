import { Card } from "@/components/ui/card";
import { ScoringVisualizer } from "@/components/rules/scoring-visualizer";
import { getRulesContent } from "@/lib/db/settings";
import { getPoolBySlug, getPoolMembers } from "@/lib/db/pools";
import { CopyShareButton } from "@/components/ui/share-button";
import {
  Trophy,
  DollarSign,
  Clock,
  Users,
  Heart,
  Share2,
  CheckCircle,
} from "lucide-react";

export const revalidate = 60; // revalidate every minute

export default async function RulesPage({
  searchParams,
}: {
  searchParams: Promise<{ pool?: string }>;
}) {
  const { pool: poolSlug } = await searchParams;
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

  // Compute displayed values — pool config wins over global settings
  const entryFeeLabel = poolEntryFee != null && poolEntryFee > 0
    ? `$${poolEntryFee} per entry`
    : rules.entryFee;

  const autoPrizePool =
    poolEntryFee && poolEntryFee > 0 && members.length > 0
      ? `$${(members.length * poolEntryFee).toLocaleString()}`
      : null;
  const prizePoolLabel = poolPrizePool || autoPrizePool || null;

  const paymentLabel = poolVenmoLink
    ? poolVenmoLink
    : rules.paymentInfo;

  const communityMessage = poolCommunityMessage || rules.communityMessage;

  const shareUrl = pool
    ? `${process.env.NEXT_PUBLIC_BASE_URL ?? "https://mastersmadness.com"}/pool/${pool.slug}`
    : `https://${rules.shareUrl}`;

  const pageTitle = pool ? pool.name : "Masters Madness Pool 2026";

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
          {pageTitle}
        </h1>
        <p className="text-lg text-muted mt-3 max-w-2xl mx-auto">
          Welcome to the Masters Fantasy Golf Tournament.
          Read the rules below, then head to the picks page to enter.
        </p>
      </div>

      <div className="space-y-6">
        {/* Why Participate */}
        <Card>
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-danger/10 text-danger flex-shrink-0 mt-1">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-foreground mb-2">
                Why Your Participation Matters
              </h2>
              <p className="text-muted leading-relaxed">{communityMessage}</p>
            </div>
          </div>
        </Card>

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
                  description="Select 1 golfer from each of the 9 groups (tiers based on odds to win)."
                />
                <RuleItem
                  title="Scoring"
                  description="Your team&rsquo;s scores are aggregated. The scores of your 4 lowest-scoring (best) golfers count towards your total."
                />
                <RuleItem
                  title="The Cut Rule"
                  description="If more than 4 of your golfers miss the cut, your team will automatically use the cut line score as a replacement for each missing golfer beyond 4."
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
              Watch how your pool score changes as golfers play. Your best 4 of 9 scores count — lower is better in golf!
            </p>
            <ScoringVisualizer />
          </div>
        </Card>

        {/* Entry Details */}
        <Card>
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-masters-gold/15 text-masters-gold-dark flex-shrink-0 mt-1">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-foreground mb-4">
                Entry Details
              </h2>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-lg bg-bg-muted p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-masters-green" />
                    <span className="font-semibold text-foreground">Deadline</span>
                  </div>
                  <p className="text-muted text-sm">{rules.deadline}</p>
                </div>

                <div className="rounded-lg bg-bg-muted p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-masters-green" />
                    <span className="font-semibold text-foreground">Entry Fee</span>
                  </div>
                  <p className="text-muted text-sm">{entryFeeLabel}</p>
                </div>

                <div className="rounded-lg bg-bg-muted p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-masters-green" />
                    <span className="font-semibold text-foreground">Max Entries</span>
                  </div>
                  <p className="text-muted text-sm">{rules.maxEntries}</p>
                </div>

                <div className="rounded-lg bg-bg-muted p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-masters-green" />
                    <span className="font-semibold text-foreground">Payment</span>
                  </div>
                  {poolVenmoLink ? (
                    <a
                      href={poolVenmoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-masters-green font-medium text-sm hover:underline break-all"
                    >
                      {poolVenmoLink}
                    </a>
                  ) : (
                    <p className="text-muted text-sm">{paymentLabel}</p>
                  )}
                </div>
              </div>
            </div>
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
                Payouts & Prizes
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
