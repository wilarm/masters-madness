import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import {
  TrendingUp,
  Target,
  Sparkles,
  ArrowRight,
  Lightbulb,
  BarChart3,
  ShieldCheck,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Masters Pool Strategy Guide 2026 — How to Pick & Win | Masters Madness",
  description:
    "Expert strategy for winning your 2026 Masters golf pool. When to go chalk, how to find value picks by tier, differentiation strategy, and how AI-powered research gives you an edge.",
  alternates: {
    canonical: "https://mastersmadness.com/strategy",
  },
  openGraph: {
    title: "Masters Pool Strategy Guide 2026 — Masters Madness",
    description:
      "How to win your Masters pool in 2026: chalk vs. contrarian strategy, value picks by tier, and using AI research to find edges before picks lock.",
    type: "article",
    url: "https://mastersmadness.com/strategy",
    siteName: "Masters Madness",
  },
  twitter: {
    card: "summary_large_image",
    title: "Masters Pool Strategy Guide 2026 — Masters Madness",
    description:
      "How to win your 2026 Masters pool: tier-by-tier strategy, value picks, chalk vs. contrarian, and AI research tips.",
  },
  keywords: [
    "masters pool strategy 2026",
    "how to win a masters pool",
    "masters pool picks strategy",
    "best value picks masters pool",
    "masters pool chalk vs contrarian",
    "masters pool tier strategy",
    "masters golf pool tips",
    "who to pick masters pool 2026",
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is the best strategy for a Masters pool?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The best Masters pool strategy combines chalk in the top tiers with high-upside picks in the middle and lower tiers. Take the field favorite in Tier 1 (usually Scottie Scheffler), then use Tiers 4–6 to differentiate from the field with value picks that have Augusta course history and trending odds.",
      },
    },
    {
      "@type": "Question",
      name: "Should I go chalk or contrarian in my Masters pool?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "It depends on your pool size. In small pools (under 15 people), chalk is fine. In larger pools, pure chalk means you'll have the same team as many competitors. True differentiation — picking players others overlook — is how pools are won in larger fields. Focus your contrarian plays in Tiers 4–7 where pick percentages are most spread out.",
      },
    },
    {
      "@type": "Question",
      name: "Which tiers matter most in a Masters pool?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Tiers 4–6 have the biggest impact on Masters pool results. Tier 1 is usually won by the same 2–3 players across most entries. The middle tiers are where differentiated picks separate winners from losers. Look for players in these tiers with strong Augusta course history, rising odds, and good recent form.",
      },
    },
    {
      "@type": "Question",
      name: "How do I use AI to improve my Masters pool picks?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Masters Madness provides free AI-generated scouting reports for every player in the field. Each report includes a bull case (reasons to pick them), bear case (risks), recent form, Augusta course history, and odds movement since the season started. Use the bull/bear cases to stress-test your instincts before locking in picks.",
      },
    },
  ],
};

export default function StrategyPage() {
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
            <Target className="h-3 w-3" />
            Strategy Guide · 2026
          </span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-3">
          How to Win Your 2026 Masters Pool
        </h1>
        <p className="text-lg text-muted max-w-2xl leading-relaxed">
          The tiered Masters pool format rewards research. Here&apos;s how to use odds
          data, course history, and AI-powered scouting reports to build a team that
          wins — whether you&apos;re going chalk or hunting value.
        </p>
      </div>

      <div className="space-y-8">

        {/* The fundamental rule */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="h-5 w-5 text-masters-gold-dark" />
            <h2 className="font-heading text-xl font-bold text-foreground">
              The Fundamental Rule
            </h2>
          </div>
          <div className="rounded-xl bg-masters-gold/10 border border-masters-gold/30 p-4 mb-4">
            <p className="text-sm font-semibold text-foreground leading-relaxed">
              To win a Masters pool, you don&apos;t need to pick the Masters champion.
              You need to pick a better team than everyone else in your pool.
            </p>
          </div>
          <p className="text-muted leading-relaxed text-sm">
            This distinction matters enormously. In small pools, taking the outright
            favorite at every tier might be enough. In larger pools, everyone does the
            same — and the winner is usually the person who found two or three overlooked
            picks in the middle tiers that happened to contend. Differentiation beats
            chalk at scale.
          </p>
        </Card>

        {/* Tier-by-tier strategy */}
        <Card>
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 className="h-5 w-5 text-masters-green" />
            <h2 className="font-heading text-xl font-bold text-foreground">
              Tier-by-Tier Strategy
            </h2>
          </div>
          <div className="space-y-4">
            {[
              {
                tier: "Tier 1 — Elite Favorites",
                strategy: "Take the field-consensus pick unless you have a strong opinion",
                detail: "Most pools have 80%+ of entries on the same Tier 1 player. Going contrarian here is high risk, low reward. Unless you have a genuine edge (injury intel, course fit argument), default to the chalk. Scottie Scheffler has been the unanimous Tier 1 pick two years running.",
                color: "bg-amber-100 text-amber-800",
              },
              {
                tier: "Tier 2–3 — Contenders",
                strategy: "Pick the best Augusta fit, not just the best player",
                detail: "Course history matters more at Augusta than anywhere else on tour. Look for players with multiple top-10s at the Masters, not just current world ranking. These tiers often have 3–4 viable options — check the AI bull cases for Augusta-specific reasons.",
                color: "bg-orange-100 text-orange-800",
              },
              {
                tier: "Tier 4–6 — The Value Zone",
                strategy: "This is where pools are won. Differentiate here.",
                detail: "Pick percentages are most spread out in these tiers. An overlooked player in Tier 5 who contends is worth far more to your pool standing than an obvious chalk pick that everyone has. Look for: rising odds trends, strong Augusta history, recent form momentum. Use the Trending Up section on the research page.",
                color: "bg-emerald-100 text-emerald-800",
              },
              {
                tier: "Tier 7–9 — Longshots",
                strategy: "Swing for Augusta specialists and hot streaks",
                detail: "Nobody expects to win here, but Augusta regularly produces unlikely contenders — past longshot champions include Patrick Reed, Sergio Garcia, and Danny Willett. Look for players with previous top-20 Masters finishes who are healthier or playing better than their current odds suggest. A good Tier 9 pick separates pool winners from the pack every few years.",
                color: "bg-blue-100 text-blue-800",
              },
            ].map(({ tier, strategy, detail, color }) => (
              <div key={tier} className="rounded-xl border border-border p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-semibold text-foreground">{tier}</h3>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${color}`}>
                    {strategy.split(" ")[0]} {strategy.split(" ")[1]}
                  </span>
                </div>
                <p className="text-xs font-semibold text-masters-green mb-2">{strategy}</p>
                <p className="text-sm text-muted leading-relaxed">{detail}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Chalk vs contrarian */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="h-5 w-5 text-masters-green" />
            <h2 className="font-heading text-xl font-bold text-foreground">
              Chalk vs. Contrarian: Which Pool Size Needs Which?
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl bg-success/5 border border-success/20 p-4">
              <h3 className="font-semibold text-foreground mb-2">Small Pool (&lt;15 people)</h3>
              <p className="text-sm text-muted leading-relaxed mb-3">
                Go mostly chalk. In small pools, you need your team to perform — there&apos;s
                less need to differentiate because the field has more variance anyway.
                Stick to players with genuine contention odds.
              </p>
              <p className="text-xs font-semibold text-success">Recommended: 70% chalk, 30% value</p>
            </div>
            <div className="rounded-xl bg-info/5 border border-info/20 p-4">
              <h3 className="font-semibold text-foreground mb-2">Large Pool (15+ people)</h3>
              <p className="text-sm text-muted leading-relaxed mb-3">
                Differentiate in the middle tiers. When 40+ people all take Scheffler and McIlroy,
                the winner is almost always decided by Tiers 4–7. Find two picks others won&apos;t have
                and you give yourself a real edge.
              </p>
              <p className="text-xs font-semibold text-info">Recommended: 50% chalk, 50% value</p>
            </div>
          </div>
        </Card>

        {/* Using AI research */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-masters-green" />
            <h2 className="font-heading text-xl font-bold text-foreground">
              Using AI Research to Find Your Edge
            </h2>
          </div>
          <p className="text-muted leading-relaxed mb-5 text-sm">
            Masters Madness is the only pool platform that provides free AI-generated
            scouting reports for the full field. Here&apos;s how to get the most out of them.
          </p>
          <div className="space-y-3">
            {[
              {
                icon: TrendingUp,
                title: "Check Trending Up first",
                desc: "The Research page shows players whose betting odds have shortened the most since the season started. Oddsmakers and sharps moving in on a player is a signal worth paying attention to.",
              },
              {
                icon: Target,
                title: "Read the bull & bear case",
                desc: "Every AI scouting report includes a bull case (reasons they could win) and bear case (the risk factors). Reading both takes 30 seconds and gives you a clearer picture than odds alone.",
              },
              {
                icon: BarChart3,
                title: "Compare within a tier",
                desc: "Filter the research table by tier to compare all your options at that pick slot side by side. Sort by OWGR or trend to spot players punching above or below their current seeding.",
              },
              {
                icon: Zap,
                title: "Look at Masters history, not just world ranking",
                desc: "Augusta National rewards specific skills — precise iron play, creativity around the greens, and nerves. Players who consistently perform above their world ranking at Augusta are exactly the type to target in the middle tiers.",
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

        {/* FAQ */}
        <div>
          <h2 className="font-heading text-2xl font-bold text-foreground mb-5">
            Strategy FAQ
          </h2>
          <div className="space-y-3">
            {[
              {
                q: "Should I pick the same player everyone else picks in Tier 1?",
                a: "In most cases, yes. Scottie Scheffler has been the consensus Tier 1 pick for two years running with good reason. Going against him requires a strong, specific argument — injury concern, weather preferences, recent slump. Without that, you're adding variance without a corresponding edge.",
              },
              {
                q: "How much does Masters course history matter?",
                a: "More than almost anywhere else on tour. Augusta rewards specific shot shapes, precise iron play, and comfort on fast Bermuda greens. Players who have multiple top-10s at Augusta but rank lower globally than their record suggests are prime middle-tier targets every year.",
              },
              {
                q: "What is a good Tier 5–6 pick?",
                a: "Look for players who: (1) have a positive odds trend since the season started, (2) have at least one top-15 Masters finish in the past three years, and (3) have good recent form coming in. The AI research page filters and sorts by all of these factors.",
              },
              {
                q: "Does the pick order matter in a tiered Masters pool?",
                a: "No — everyone picks independently and simultaneously from the same tier list. There's no snake draft or pick order. Every participant sees the same tiers and makes their own selections before the lock deadline.",
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
            Start Your Research
          </h2>
          <p className="text-masters-green-light mb-6 max-w-md mx-auto">
            Free AI-powered scouting reports for every golfer in the 2026 Masters field.
            Odds, trends, bull &amp; bear cases — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/research"
              className="inline-flex items-center gap-2 rounded-xl bg-masters-gold px-6 py-3 text-sm font-bold text-masters-green hover:bg-masters-gold/90 transition-colors"
            >
              View Player Research <Sparkles className="h-4 w-4" />
            </Link>
            <Link
              href="/pool/create"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
            >
              Start a Pool <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
