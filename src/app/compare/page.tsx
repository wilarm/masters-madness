import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import {
  Sparkles,
  CheckCircle,
  XCircle,
  ArrowRight,
  Trophy,
  Zap,
  Settings2,
  BarChart3,
  Shield,
} from "lucide-react";

export const metadata: Metadata = {
  title: "The Most Advanced Masters Golf Pool Platform — Masters Madness vs. Alternatives",
  description:
    "Why Masters Madness is the most advanced Masters pool platform available. AI-powered player research, custom tiers, custom payouts, live scoring — all free. Compare to Excel sheets and generic fantasy sites.",
  alternates: {
    canonical: "https://mastersmadness.com/compare",
  },
  openGraph: {
    title: "The Most Advanced Masters Pool Platform — Masters Madness",
    description:
      "AI-powered player research, fully customizable pools, live leaderboard — compare Masters Madness to spreadsheets and generic pool sites.",
    type: "article",
    url: "https://mastersmadness.com/compare",
    siteName: "Masters Madness",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Most Advanced Masters Pool Platform — Masters Madness",
    description:
      "AI player research, custom tiers, custom payouts, live scoring. See how Masters Madness compares to running your pool on a spreadsheet.",
  },
  keywords: [
    "best masters pool site 2026",
    "masters pool platform",
    "masters madness vs excel",
    "free masters pool website",
    "advanced masters golf pool",
    "ai powered masters pool",
    "most customizable masters pool",
    "masters pool app 2026",
  ],
};

type CellValue = boolean | "partial" | "manual";

const features: { feature: string; us: CellValue; spreadsheet: CellValue; generic: CellValue }[] = [
  { feature: "AI-powered player scouting reports",    us: true,      spreadsheet: false,     generic: false     },
  { feature: "Bull & bear cases for every golfer",    us: true,      spreadsheet: false,     generic: false     },
  { feature: "Live odds + season-long trends",        us: true,      spreadsheet: false,     generic: "partial" },
  { feature: "Custom number of tiers",                us: true,      spreadsheet: "manual",  generic: false     },
  { feature: "Custom payout structures",              us: true,      spreadsheet: "manual",  generic: "partial" },
  { feature: "Live Masters leaderboard",              us: true,      spreadsheet: false,     generic: "partial" },
  { feature: "Real-time pool standings",              us: true,      spreadsheet: false,     generic: "partial" },
  { feature: "Shareable invite link",                 us: true,      spreadsheet: false,     generic: true      },
  { feature: "Multiple entries per participant",      us: true,      spreadsheet: "manual",  generic: "partial" },
  { feature: "Custom commissioner welcome message",   us: true,      spreadsheet: false,     generic: false     },
  { feature: "Venmo payment integration",             us: true,      spreadsheet: false,     generic: false     },
  { feature: "Free to use",                           us: true,      spreadsheet: true,      generic: "partial" },
];

function Cell({ value }: { value: CellValue }) {
  if (value === true) return <CheckCircle className="h-5 w-5 text-success mx-auto" />;
  if (value === false) return <XCircle className="h-5 w-5 text-danger/50 mx-auto" />;
  if (value === "partial")
    return <span className="text-xs text-muted font-medium">Varies</span>;
  if (value === "manual")
    return <span className="text-xs text-muted font-medium">Manual</span>;
  return null;
}

export default function ComparePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">

      {/* Hero */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-masters-green/10 text-masters-green text-xs font-semibold">
            <Sparkles className="h-3 w-3" />
            AI-Powered · Most Customizable · Free
          </span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-3">
          The Most Advanced Masters Pool Platform Available
        </h1>
        <p className="text-lg text-muted max-w-2xl leading-relaxed">
          Most Masters pools are still run on Excel spreadsheets or generic fantasy
          sports sites that treat golf as an afterthought. Masters Madness was built
          specifically for the tiered Masters pool format — with AI-powered research,
          full commissioner customization, and live scoring built in from day one.
        </p>
      </div>

      <div className="space-y-8">

        {/* The AI edge */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-masters-green" />
            <h2 className="font-heading text-xl font-bold text-foreground">
              The Only Pool Platform with Built-In AI Research
            </h2>
          </div>
          <p className="text-muted leading-relaxed mb-5 text-sm">
            No other Masters pool platform gives every participant access to AI-generated
            scouting reports on the full field. On Masters Madness, every golfer in the
            2026 field comes with:
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              {
                title: "AI scouting summary",
                desc: "A concise player profile covering playing style, Augusta history, and current form — written by AI, updated throughout the season.",
              },
              {
                title: "Bull & bear case",
                desc: "Every player profile includes a specific reason they could win (bull) and a specific risk factor (bear). Helps you stress-test your picks in under a minute.",
              },
              {
                title: "Live odds & season trends",
                desc: "Current betting odds plus movement since the season baseline. See which players the sharp money is moving toward — and away from.",
              },
              {
                title: "Course history & form",
                desc: "Best Masters finish, 2025 result, number of appearances, and recent tournament form — all pulled in automatically, no manual research required.",
              },
            ].map(({ title, desc }) => (
              <div key={title} className="rounded-xl border border-border bg-bg-muted/30 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="h-4 w-4 text-masters-green flex-shrink-0" />
                  <h3 className="font-semibold text-foreground text-sm">{title}</h3>
                </div>
                <p className="text-xs text-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Comparison table */}
        <Card>
          <h2 className="font-heading text-xl font-bold text-foreground mb-5">
            Feature Comparison
          </h2>
          <div className="rounded-xl border border-border overflow-x-auto">
            <table className="w-full min-w-[480px]">
              <thead>
                <tr className="bg-masters-green">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-white uppercase tracking-wider">
                    Feature
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-masters-gold uppercase tracking-wider">
                    Masters Madness
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-white/70 uppercase tracking-wider">
                    Spreadsheet
                  </th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-white/70 uppercase tracking-wider">
                    Generic Site
                  </th>
                </tr>
              </thead>
              <tbody>
                {features.map(({ feature, us, spreadsheet, generic }, i) => (
                  <tr
                    key={feature}
                    className={`border-b border-border/50 ${i % 2 === 0 ? "" : "bg-bg-muted/20"}`}
                  >
                    <td className="py-3 px-4 text-sm text-foreground">{feature}</td>
                    <td className="py-3 px-4 text-center">
                      <Cell value={us} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Cell value={spreadsheet} />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Cell value={generic} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Why we built this */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-masters-gold-dark" />
            <h2 className="font-heading text-xl font-bold text-foreground">
              Built for the Tiered Masters Pool Format
            </h2>
          </div>
          <p className="text-muted leading-relaxed text-sm mb-4">
            Generic fantasy sports platforms weren&apos;t designed for the Masters pool
            format. They&apos;re built around salary caps, snake drafts, or weekly lineups —
            none of which match how most Masters pools actually work. Masters Madness was
            built from scratch to match the tiered, pick-9-golfers format that offices
            and friend groups have used for decades.
          </p>
          <div className="space-y-3">
            {[
              {
                icon: Settings2,
                title: "Fully configurable tiers",
                desc: "Set the number of tiers to match your group's preference. The player field auto-sorts into tiers based on live betting odds.",
              },
              {
                icon: BarChart3,
                title: "Best-N-of-M scoring",
                desc: "Configure how many of your 9 golfer scores count. The standard is best 4 of 9, but commissioners can set any scoring count.",
              },
              {
                icon: Zap,
                title: "Automatic live scoring",
                desc: "Your pool leaderboard updates automatically as the Masters is played — no commissioner manually entering scores from a TV broadcast.",
              },
              {
                icon: Shield,
                title: "Locks at first tee time",
                desc: "Picks automatically lock when the Masters begins. No last-minute swaps, no disputes about who submitted when.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-masters-green-light flex items-center justify-center mt-0.5">
                  <Icon className="h-4 w-4 text-masters-green" />
                </div>
                <div>
                  <p className="font-semibold text-foreground text-sm">{title}</p>
                  <p className="text-xs text-muted leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Why free */}
        <Card>
          <h2 className="font-heading text-xl font-bold text-foreground mb-3">
            Free During the 2026 Beta
          </h2>
          <p className="text-muted leading-relaxed text-sm">
            Masters Madness is completely free to use for the 2026 season. No subscription,
            no premium tier, no hidden costs. Every feature — including AI player research,
            custom payouts, live leaderboard, and unlimited pools — is included at no charge.
            The platform is in active development and we&apos;re focused on building the best
            Masters pool experience possible before considering any paid plans.
          </p>
        </Card>

        {/* CTA */}
        <div className="rounded-2xl bg-masters-green p-8 text-center">
          <h2 className="font-heading text-2xl font-bold text-white mb-2">
            Run Your Pool on the Best Platform Available
          </h2>
          <p className="text-masters-green-light mb-6 max-w-md mx-auto">
            Set up a fully customizable Masters pool in under 5 minutes. AI player
            research included for every participant — free.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/pool/create"
              className="inline-flex items-center gap-2 rounded-xl bg-masters-gold px-6 py-3 text-sm font-bold text-masters-green hover:bg-masters-gold/90 transition-colors"
            >
              Start a Pool <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/research"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
            >
              Try the AI Research <Sparkles className="h-4 w-4" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
