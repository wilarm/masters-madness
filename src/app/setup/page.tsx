import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import {
  Settings2,
  Users,
  Link2,
  DollarSign,
  Sparkles,
  ArrowRight,
  CheckCircle,
  ClipboardList,
  Zap,
  Shield,
} from "lucide-react";

export const metadata: Metadata = {
  title: "How to Set Up a Masters Golf Pool in 2026 | Masters Madness",
  description:
    "Step-by-step guide to running a Masters golf pool for your office, friends, or family. Custom tiers, payouts, entry fees, and instant invite links — free to set up.",
  alternates: {
    canonical: "https://mastersmadness.com/setup",
  },
  openGraph: {
    title: "How to Set Up a Masters Golf Pool in 2026 — Masters Madness",
    description:
      "The complete commissioner's guide to running a Masters golf pool. Custom payouts, tiered draft, AI player research — free to set up.",
    type: "article",
    url: "https://mastersmadness.com/setup",
    siteName: "Masters Madness",
  },
  twitter: {
    card: "summary_large_image",
    title: "How to Set Up a Masters Golf Pool — Masters Madness",
    description:
      "Step-by-step guide to running a Masters golf pool in 2026. Custom tiers, payouts, and instant invite links — free.",
  },
  keywords: [
    "how to set up a masters pool",
    "how to run a masters golf pool",
    "masters pool commissioner",
    "create masters pool online",
    "masters pool setup guide",
    "free masters pool site",
    "run masters pool friends",
    "masters pool invite link",
    "custom masters pool payouts",
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How do I set up a Masters golf pool?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "To set up a Masters pool on Masters Madness: create a free account, click 'Start a Pool', configure your entry fee, number of tiers, scoring rules, and payout structure, then share your unique invite link with participants. The whole setup takes under 5 minutes.",
      },
    },
    {
      "@type": "Question",
      name: "How many tiers should a Masters pool have?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The standard Masters pool format uses 9 tiers — one per golfer pick. However, smaller groups sometimes use 5 or 6 tiers. Masters Madness lets commissioners customize the number of tiers when setting up their pool.",
      },
    },
    {
      "@type": "Question",
      name: "What is a good entry fee for a Masters pool?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Common Masters pool entry fees range from $20 to $50 per person. Office pools often land at $25. High-stakes friend groups sometimes go $50–$100. The right amount depends on your group — Masters Madness supports any entry fee, or you can run the pool for free with no money involved.",
      },
    },
    {
      "@type": "Question",
      name: "What is the best payout structure for a Masters pool?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The most common Masters pool payout is a top-3 split: 60% to 1st, 25% to 2nd, 15% to 3rd. For smaller groups, winner-take-all builds more drama. For larger pools (20+ people), paying out to the top 4 or 5 places keeps more participants engaged deep into the weekend.",
      },
    },
    {
      "@type": "Question",
      name: "When should picks lock for a Masters pool?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Masters pool picks should lock before the first tee time on Thursday morning of Masters week. Masters Madness automatically locks picks at the tournament start so no one can game the system with late information.",
      },
    },
  ],
};

const steps = [
  {
    icon: Settings2,
    step: "1",
    title: "Create your pool",
    desc: "Sign in and click 'Start a Pool'. Give it a name — your group name, year, whatever fits. Takes 30 seconds.",
  },
  {
    icon: DollarSign,
    step: "2",
    title: "Set entry fee & payouts",
    desc: "Decide the buy-in amount and how you want to split the prize pool. Winner-take-all, top 3, or any custom split. Or run it free with no money at all.",
  },
  {
    icon: ClipboardList,
    step: "3",
    title: "Configure scoring",
    desc: "Choose how many tiers to use (default: 9) and how many golfer scores count toward each entry (default: best 4 of 9). Lock in your rules before picks open.",
  },
  {
    icon: Link2,
    step: "4",
    title: "Share your invite link",
    desc: "Every pool gets a unique URL. Copy and paste it into your group chat, Slack, or email. Participants click it, make their picks, and they're in.",
  },
  {
    icon: Sparkles,
    step: "5",
    title: "Let the AI do the work",
    desc: "Everyone in your pool gets access to free AI-powered player research — scouting reports, odds, bull & bear cases — so even casual fans can make informed picks.",
  },
  {
    icon: Zap,
    step: "6",
    title: "Track it live",
    desc: "Once the Masters starts, your pool leaderboard updates in real time. Watch the standings shift with every hole. No manual score-keeping required.",
  },
];

export default function SetupPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Hero */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-masters-green/10 text-masters-green text-xs font-semibold">
            <Settings2 className="h-3 w-3" />
            Commissioner Guide
          </span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-3">
          How to Set Up a Masters Pool in 2026
        </h1>
        <p className="text-lg text-muted max-w-2xl leading-relaxed">
          The complete guide for pool commissioners — from configuring tiers and payouts
          to sharing your invite link and running the whole thing on autopilot during
          Masters week.
        </p>
      </div>

      <div className="space-y-8">

        {/* Steps */}
        <Card>
          <h2 className="font-heading text-xl font-bold text-foreground mb-6">
            Setup in 6 Steps
          </h2>
          <div className="space-y-5">
            {steps.map(({ icon: Icon, step, title, desc }) => (
              <div key={step} className="flex items-start gap-4">
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-masters-green flex items-center justify-center text-white font-bold text-sm">
                    {step}
                  </div>
                  {parseInt(step) < steps.length && (
                    <div className="w-px h-5 bg-border mt-1" />
                  )}
                </div>
                <div className="pt-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-4 w-4 text-masters-green" />
                    <h3 className="font-semibold text-foreground">{title}</h3>
                  </div>
                  <p className="text-sm text-muted leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Commissioner settings */}
        <Card>
          <h2 className="font-heading text-xl font-bold text-foreground mb-4">
            What You Can Customize
          </h2>
          <p className="text-muted text-sm leading-relaxed mb-5">
            Masters Madness gives commissioners full control over their pool setup.
            No two pools need to look the same.
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              {
                title: "Number of tiers",
                desc: "Use the standard 9-tier format or condense to 5 or 6 for smaller groups.",
              },
              {
                title: "Scoring count",
                desc: "Choose how many of your golfers' scores count — best 4 of 9 is standard, but any combination works.",
              },
              {
                title: "Entry fee",
                desc: "Set the buy-in amount. Venmo link integration makes collection simple.",
              },
              {
                title: "Payout structure",
                desc: "Full control over how the prize pool is split — any number of paid places and any percentages.",
              },
              {
                title: "Multiple entries",
                desc: "Allow participants to submit more than one team if your group likes that format.",
              },
              {
                title: "Welcome message",
                desc: "Add a custom message that shows up on your pool's rules page — good for side bets or house rules.",
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

        {/* Payout recommendations */}
        <Card>
          <h2 className="font-heading text-xl font-bold text-foreground mb-4">
            Recommended Payout Structures
          </h2>
          <div className="space-y-3">
            {[
              {
                label: "Small group (5–10 people)",
                structure: "Winner-take-all",
                detail: "Maximum drama, simple accounting. Works best when everyone knows each other.",
              },
              {
                label: "Medium group (10–25 people)",
                structure: "60% / 25% / 15%",
                detail: "Top 3 places paid out. Keeps the bottom two-thirds of the leaderboard invested all week.",
              },
              {
                label: "Large group (25+ people)",
                structure: "50% / 25% / 15% / 10%",
                detail: "Top 4 paid. Spreads the risk and rewards more participants in a competitive pool.",
              },
              {
                label: "Bragging rights only",
                structure: "No entry fee",
                detail: "Free to run. Great for families, casual coworkers, or first-timers testing the format.",
              },
            ].map(({ label, structure, detail }) => (
              <div key={label} className="rounded-xl border border-border p-4">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <p className="text-xs font-semibold text-muted uppercase tracking-wide">{label}</p>
                  <span className="text-sm font-bold text-masters-green font-mono flex-shrink-0">{structure}</span>
                </div>
                <p className="text-sm text-muted leading-relaxed">{detail}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Commissioner tips */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-masters-green" />
            <h2 className="font-heading text-xl font-bold text-foreground">
              Commissioner Tips
            </h2>
          </div>
          <div className="space-y-3">
            {[
              "Send the invite link at least a week before the tournament. Latecomers always want in at the last minute.",
              "Share the research page with your group. Players who can look up AI scouting reports make more informed picks and stay more engaged.",
              "Settle on your payout structure before sending invites — changing it after people have paid creates friction.",
              "For big groups, consider setting a pick deadline 24 hours before the first tee time so you're not chasing stragglers Thursday morning.",
              "The pool leaderboard is shareable. Post it in your group chat after each round to keep the trash talk going.",
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-masters-gold/15 text-masters-gold-dark text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-muted leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* FAQ */}
        <div>
          <h2 className="font-heading text-2xl font-bold text-foreground mb-5">
            Setup FAQ
          </h2>
          <div className="space-y-3">
            {[
              {
                q: "How many tiers should my pool have?",
                a: "9 tiers is the standard — it matches the full Masters field depth and gives each tier a distinct personality. For groups under 8 people, 5 or 6 tiers can work better so the field doesn't feel too thin.",
              },
              {
                q: "What's a good entry fee?",
                a: "Most office and friend pools land between $20–$50. The right amount is whatever your group is comfortable with. Masters Madness supports any fee — including zero if you're running a free pool.",
              },
              {
                q: "Can I change the rules after people have joined?",
                a: "Commissioners can edit most settings before picks lock. It's best practice to finalize rules before sharing the invite link so participants know exactly what they're signing up for.",
              },
              {
                q: "When do picks lock?",
                a: "Picks lock automatically when the Masters Tournament begins — typically Thursday morning of Masters week. No manual lock-in required from the commissioner.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="rounded-xl border border-border p-5">
                <h3 className="font-heading font-semibold text-foreground mb-1.5">{q}</h3>
                <p className="text-sm text-muted leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl bg-masters-green p-8 text-center">
          <h2 className="font-heading text-2xl font-bold text-white mb-2">
            Set Up Your Pool in 5 Minutes
          </h2>
          <p className="text-masters-green-light mb-6 max-w-md mx-auto">
            Free to use. Fully customizable. AI-powered player research included
            for every participant — no setup required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/pool/create"
              className="inline-flex items-center gap-2 rounded-xl bg-masters-gold px-6 py-3 text-sm font-bold text-masters-green hover:bg-masters-gold/90 transition-colors"
            >
              Start a Pool <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/guide"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
            >
              How pools work →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
