import { Card } from "@/components/ui/card";
import {
  Trophy,
  DollarSign,
  Clock,
  Users,
  Heart,
  Share2,
  CheckCircle,
} from "lucide-react";

export default function RulesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
          Masters Madness Pool 2026
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
              <p className="text-muted leading-relaxed">
                Beyond the competition, this pool is about community. A portion
                of the proceeds will go to support someone in our community who
                could use a little help. Details will be shared before the
                tournament.
              </p>
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
                  <p className="text-muted text-sm">
                    ~5am MT, Thursday, April 9th, 2026
                  </p>
                </div>

                <div className="rounded-lg bg-bg-muted p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-masters-green" />
                    <span className="font-semibold text-foreground">Entry Fee</span>
                  </div>
                  <p className="text-muted text-sm">
                    $100 per team (max 2 entries per person)
                  </p>
                </div>

                <div className="rounded-lg bg-bg-muted p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-masters-green" />
                    <span className="font-semibold text-foreground">Max Entries</span>
                  </div>
                  <p className="text-muted text-sm">
                    2 teams per participant
                  </p>
                </div>

                <div className="rounded-lg bg-bg-muted p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-masters-green" />
                    <span className="font-semibold text-foreground">Payment</span>
                  </div>
                  <p className="text-muted text-sm">
                    Venmo or contact pool admin for arrangements
                  </p>
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
            <div>
              <h2 className="font-heading text-xl font-bold text-foreground mb-4">
                Payouts & Prizes
              </h2>

              <div className="space-y-3">
                <PayoutRow place="1st" amount="$1,000" highlight />
                <PayoutRow place="2nd" amount="$400" />
                <PayoutRow place="3rd" amount="$100" />
              </div>

              <p className="text-sm text-muted mt-4">
                Total prize pool: $1,500. Tiebreakers are in place to ensure
                fairness and competition.
              </p>
            </div>
          </div>
        </Card>

        {/* Share */}
        <Card>
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10 text-info flex-shrink-0 mt-1">
              <Share2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-foreground mb-2">
                Spread the Word
              </h2>
              <p className="text-muted leading-relaxed">
                Share this pool with friends and family! Just send them:{" "}
                <a
                  href="https://mastersmadness.com"
                  className="text-masters-green font-semibold hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  mastersmadness.com
                </a>
              </p>
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
