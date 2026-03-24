import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import {
  Layers,
  Trophy,
  Users,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Sparkles,
  BarChart3,
  DollarSign,
} from "lucide-react";

export const metadata: Metadata = {
  title: "What Is a Masters Pool? Complete Guide to Masters Golf Pools | Masters Madness",
  description:
    "Learn how a Masters golf pool works — tiered drafts, scoring, payouts, and strategy. The complete beginner's guide to running or joining a Masters Tournament pool in 2026.",
  alternates: {
    canonical: "https://mastersmadness.com/guide",
  },
  openGraph: {
    title: "What Is a Masters Pool? Complete Guide — Masters Madness",
    description:
      "Learn how a Masters golf pool works: tiered drafts, scoring, payouts, and how to win. The complete guide for 2026.",
    type: "article",
    url: "https://mastersmadness.com/guide",
    siteName: "Masters Madness",
  },
  twitter: {
    card: "summary_large_image",
    title: "What Is a Masters Pool? Complete Guide — Masters Madness",
    description:
      "The complete guide to Masters golf pools — how they work, how to win, and how to run one for your group in 2026.",
  },
  keywords: [
    "what is a masters pool",
    "how does a masters golf pool work",
    "masters golf pool rules",
    "tiered masters pool",
    "masters tournament pool",
    "masters pool 2026",
    "how to play a masters pool",
    "masters pool scoring",
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is a Masters pool?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A Masters pool is a friendly competition where participants each draft a team of golfers from the Masters Tournament field. The person whose drafted golfers post the lowest combined score at Augusta National wins the pool prize. Most pools use a tiered draft system so every participant is forced to spread their picks across favorites and longshots.",
      },
    },
    {
      "@type": "Question",
      name: "How does a tiered Masters pool work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "In a tiered Masters pool, the field is divided into groups (tiers) based on betting odds. Tier 1 contains the favorites with the shortest odds, Tier 9 contains the biggest longshots. Each participant picks one golfer from every tier — so everyone has a mix of chalk and value picks. Your best 4 scores (out of 9) typically count toward your total, and lowest combined score wins.",
      },
    },
    {
      "@type": "Question",
      name: "How is a Masters pool scored?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most Masters pools use the golfers' actual tournament scores (strokes relative to par). Your team's score is the combined total of your best-performing golfers. In Masters Madness, your best 4 of 9 golfer scores count — so if one of your picks misses the cut or plays poorly, they simply don't count against you.",
      },
    },
    {
      "@type": "Question",
      name: "Do I need to know golf to join a Masters pool?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not at all. Masters pools are designed to be fun for casual fans and serious golf followers alike. The tiered format means you don't need deep golf knowledge — every participant picks from the same groups of players. Use the free AI-powered player research on Masters Madness to get up to speed on any golfer in under 30 seconds.",
      },
    },
    {
      "@type": "Question",
      name: "What happens if a golfer misses the cut?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "If one of your golfers misses the cut in a Masters pool, they typically receive a high score (like +20 or the field's worst score) that counts against you. However, in Masters Madness pools that use a 'best 4 of 9' scoring format, a missed cut simply means that golfer doesn't count toward your team total — your best performers carry you instead.",
      },
    },
  ],
};

const articleJsonLd = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "What Is a Masters Pool? Complete Guide to Masters Golf Pools",
  description:
    "The complete beginner's guide to Masters golf pools — how tiered drafts work, scoring, payouts, and how to win.",
  url: "https://mastersmadness.com/guide",
  publisher: {
    "@type": "Organization",
    name: "Masters Madness",
    url: "https://mastersmadness.com",
  },
  mainEntityOfPage: "https://mastersmadness.com/guide",
};

export default function GuidePage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      {/* Hero */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-masters-green/10 text-masters-green text-xs font-semibold">
            <Sparkles className="h-3 w-3" />
            Free Guide
          </span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-3">
          What Is a Masters Pool?
        </h1>
        <p className="text-lg text-muted max-w-2xl leading-relaxed">
          A Masters pool is one of the most popular office and friend-group
          traditions in sports. Here&apos;s everything you need to know — from how the
          tiered draft works to how winners are decided at Augusta National.
        </p>
      </div>

      <div className="space-y-8">

        {/* What is it */}
        <Card>
          <h2 className="font-heading text-xl font-bold text-foreground mb-3">
            The Basics
          </h2>
          <p className="text-muted leading-relaxed mb-4">
            A <strong className="text-foreground">Masters pool</strong> is a friendly
            competition tied to the Masters Tournament — the first major of the golf
            season, played every April at Augusta National Golf Club in Augusta, Georgia.
            Each person in the pool drafts a team of golfers before the tournament starts.
            Whoever&apos;s team posts the lowest combined score over the four rounds wins.
          </p>
          <p className="text-muted leading-relaxed">
            Masters pools have been a staple of office culture and friend groups for
            decades. They&apos;re quick to set up, easy to follow during the tournament, and
            make every round of coverage more exciting — whether you care about golf or
            not.
          </p>
        </Card>

        {/* How the tier system works */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Layers className="h-5 w-5 text-masters-green" />
            <h2 className="font-heading text-xl font-bold text-foreground">
              The Tiered Draft System
            </h2>
          </div>
          <p className="text-muted leading-relaxed mb-5">
            The most popular Masters pool format uses a <strong className="text-foreground">tiered draft</strong>.
            The field is divided into groups — or tiers — based on betting odds to win.
            Tier 1 holds the favorites (shortest odds, best players), while Tier 9 holds
            the biggest longshots. Each participant picks exactly one golfer from every tier.
          </p>
          <div className="grid sm:grid-cols-3 gap-3 mb-5">
            {[
              { tier: "Tier 1–2", label: "Elite Favorites", desc: "Scheffler, McIlroy, Rahm — the players oddsmakers expect to contend." },
              { tier: "Tier 4–6", label: "The Value Zone", desc: "Solid players at longer odds. Where pools are often won or lost." },
              { tier: "Tier 8–9", label: "Longshots", desc: "Big odds, big upside. One hot week at Augusta can flip a whole pool." },
            ].map(({ tier, label, desc }) => (
              <div key={tier} className="rounded-xl border border-border bg-bg-muted/30 p-4">
                <p className="text-xs font-bold text-masters-green uppercase tracking-wide mb-1">{tier}</p>
                <p className="font-semibold text-foreground mb-1">{label}</p>
                <p className="text-xs text-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <p className="text-muted leading-relaxed text-sm">
            This format is popular because it forces everyone to have a mix of chalk and
            upside picks — no one can load up exclusively on favorites. It keeps every
            tier of the leaderboard interesting throughout the week.
          </p>
        </Card>

        {/* Scoring */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-masters-green" />
            <h2 className="font-heading text-xl font-bold text-foreground">
              How Scoring Works
            </h2>
          </div>
          <p className="text-muted leading-relaxed mb-4">
            Masters pools use real tournament scores — strokes relative to par. Lower is
            better, just like real golf. Your team score is the combined total of your
            golfers&apos; scores across all four rounds.
          </p>
          <div className="rounded-xl bg-masters-green-light border border-masters-green/20 p-4 mb-4">
            <p className="text-sm font-semibold text-masters-green mb-2">Masters Madness Scoring Rule</p>
            <p className="text-sm text-foreground leading-relaxed">
              Your <strong>best 4 of 9 golfer scores</strong> count toward your total.
              This means missed cuts and bad weeks don&apos;t automatically eliminate
              you — your top performers carry the team.
            </p>
          </div>
          <div className="space-y-2">
            {[
              { step: "1", text: "You draft 9 golfers — one from each tier." },
              { step: "2", text: "All 9 play in the Masters Tournament April 9–12." },
              { step: "3", text: "Your 4 best-scoring golfers' strokes-vs-par total becomes your pool score." },
              { step: "4", text: "Lowest combined score at the end of Sunday wins the pool." },
            ].map(({ step, text }) => (
              <div key={step} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-masters-green text-white text-xs font-bold flex items-center justify-center mt-0.5">
                  {step}
                </span>
                <p className="text-sm text-muted leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Payouts */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-5 w-5 text-masters-green" />
            <h2 className="font-heading text-xl font-bold text-foreground">
              Entry Fees &amp; Payouts
            </h2>
          </div>
          <p className="text-muted leading-relaxed mb-4">
            Most pools collect an entry fee from each participant — commonly $20–$50 —
            and pay out to the top finishers. The pool commissioner sets the rules:
            winner-take-all, top 3 split, or any structure the group agrees on.
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { title: "Winner-Take-All", desc: "One payout, maximum drama. Works great for smaller groups." },
              { title: "Top 3 Split", desc: "Classic 50/30/20 split across first, second, and third place." },
              { title: "Free to Play", desc: "No entry fee required. Run the pool just for bragging rights." },
            ].map(({ title, desc }) => (
              <div key={title} className="rounded-lg border border-border p-3">
                <p className="font-semibold text-foreground text-sm mb-1">{title}</p>
                <p className="text-xs text-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Why Masters pools are fun */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-masters-gold-dark" />
            <h2 className="font-heading text-xl font-bold text-foreground">
              Why Masters Pools Are So Popular
            </h2>
          </div>
          <div className="space-y-3">
            {[
              { icon: Users, title: "Works for any group size", desc: "From 5 friends to a 100-person office pool — the format scales." },
              { icon: CheckCircle, title: "No golf knowledge required", desc: "The tiered system levels the playing field. A first-timer can beat a golf junkie." },
              { icon: TrendingUp, title: "Every round matters", desc: "Unlike brackets that go bust on Day 1, your team stays alive all week." },
              { icon: Sparkles, title: "AI makes research easy", desc: "Masters Madness gives every participant free AI-powered scouting reports on every golfer in the field." },
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
            Common Questions
          </h2>
          <div className="space-y-3">
            {[
              {
                q: "Do I need to know golf to play?",
                a: "Not at all. The tiered format is designed to be accessible. Use the free AI player research on Masters Madness to get a quick read on any golfer in under 30 seconds.",
              },
              {
                q: "What happens if a golfer misses the cut?",
                a: "In Masters Madness pools, missed cuts simply don't count toward your score — your best-performing picks carry you. In other formats, missed cuts typically get assigned a penalty score.",
              },
              {
                q: "How many people can be in a Masters pool?",
                a: "There's no hard limit. Masters Madness supports pools of any size. Larger pools create bigger prize pools but also more competition.",
              },
              {
                q: "When do picks lock?",
                a: "Picks are typically locked when the first round tee times begin — usually Thursday morning of Masters week. You must submit your team before the tournament starts.",
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
            Ready to Play?
          </h2>
          <p className="text-masters-green-light mb-6 max-w-md mx-auto">
            Run your own Masters pool in minutes — free to use, fully customizable,
            with AI-powered player research built in.
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
              Research Players <Sparkles className="h-4 w-4" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
