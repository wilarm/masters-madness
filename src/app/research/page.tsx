import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { PlayerTable } from "@/components/research/player-table";
import { TrendingUp, TrendingDown, BookOpen, Sparkles } from "lucide-react";
import { PLAYERS } from "@/data/players";
import { getAllGolfers, oddsMovement } from "@/lib/db/golfers";

export const metadata: Metadata = {
  title: "2026 Masters Pool Picks & Player Research — AI-Powered Analysis | Masters Madness",
  description:
    "Free AI-powered research tool for your 2026 Masters golf pool. Compare every player's odds, form, bull/bear case, and tier — so you can make the best picks at Augusta National regardless of which pool you're in.",
  alternates: {
    canonical: "https://mastersmadness.com/research",
  },
  openGraph: {
    title: "2026 Masters Pool Picks & Player Research — AI-Powered Analysis",
    description:
      "Free AI-powered research tool for your 2026 Masters golf pool. Compare every player's odds, form, bull/bear case, and tier — pick smarter at Augusta National.",
    type: "website",
    url: "https://mastersmadness.com/research",
    siteName: "Masters Madness",
  },
  twitter: {
    card: "summary_large_image",
    title: "2026 Masters Pool Picks & Player Research — AI-Powered",
    description:
      "Free AI-powered player research for your 2026 Masters golf pool. Odds, trends, scouting reports, bull/bear cases — all in one place.",
  },
  keywords: [
    "2026 Masters pool picks",
    "Masters golf pool strategy",
    "Masters tournament player research",
    "who to pick Masters pool",
    "Masters pool best value picks",
    "Augusta National 2026 field",
    "Masters golf odds 2026",
    "fantasy golf Masters picks",
    "Masters pool tier system",
    "best Masters pool picks 2026",
  ],
};

export const revalidate = 300; // revalidate every 5 minutes

export default async function ResearchPage({
  searchParams,
}: {
  searchParams: Promise<{ player?: string }>;
}) {
  const { player } = await searchParams;

  // DB golfers drive trends (prev_odds_rank vs odds_rank)
  const dbGolfers = await getAllGolfers();

  const trendingUp = dbGolfers
    .filter((g) => oddsMovement(g) > 0)
    .sort((a, b) => oddsMovement(b) - oddsMovement(a))
    .slice(0, 3);

  const trendingDown = dbGolfers
    .filter((g) => oddsMovement(g) < 0)
    .sort((a, b) => oddsMovement(a) - oddsMovement(b))
    .slice(0, 3);

  // Country flag lookup from static player data
  const flagByName = new Map(PLAYERS.map((p) => [p.name, p.country]));

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Who should I pick in my 2026 Masters pool?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The best Masters pool strategy depends on your pool's scoring format, but generally you want a mix of chalk favorites (Scheffler, McIlroy, Rahm) from the top tiers and high-upside longshots from the lower tiers. Use this tool's AI-generated bull/bear cases to evaluate each player's ceiling and risk before committing."
        }
      },
      {
        "@type": "Question",
        "name": "What is the tier system in a Masters golf pool?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Most Masters pools divide the field into tiers based on betting odds — Tier 1 contains the favorites (shortest odds) while Tier 9 contains the biggest longshots. You pick one golfer from each tier, forcing you to spread risk across the entire field rather than loading up on favorites."
        }
      },
      {
        "@type": "Question",
        "name": "How accurate are Masters betting odds as a predictor?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Betting odds are the best available predictor of Masters performance, incorporating course history, current form, world ranking, and sharp money from professional bettors. However, Augusta National is historically unpredictable — past champions like Patrick Reed (2018) and Sergio Garcia (2017) were significant longshots. Tracking odds movement since the season started can reveal which players are gaining or losing momentum."
        }
      },
      {
        "@type": "Question",
        "name": "What is the best value pick in the 2026 Masters pool?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Value picks are players whose pool pick rate is lower than their odds-implied win probability suggest. Look for players in Tiers 4–6 who have strong Augusta course history or are trending up in the odds. Use the 'Trending Up' section on this page to spot players whose odds have shortened since the season started."
        }
      },
      {
        "@type": "Question",
        "name": "How is this Masters player research generated?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Each player scouting report — including the summary, bull case, bear case, and recent form — is generated using AI trained on PGA Tour statistics, course history data, current world rankings, and betting market movements. The odds and trends are updated regularly throughout the season leading up to the Masters."
        }
      },
      {
        "@type": "Question",
        "name": "Is this Masters pool research free?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes — this player research tool is completely free to use. You don't need to be in a Masters Madness pool to use it. Browse every golfer's AI-generated scouting report, compare odds and tiers, and build your picks strategy for any Masters pool format."
        }
      }
    ]
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* JSON-LD: FAQ rich results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-masters-green/10 text-masters-green text-xs font-semibold">
            <Sparkles className="h-3 w-3" />
            AI-Powered · Free
          </span>
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
          2026 Masters Pool Player Research
        </h1>
        <p className="text-muted mt-2 max-w-2xl">
          Free AI-powered scouting reports for every golfer in the 2026 Masters field —
          odds, trends, bull &amp; bear cases, course history, and tier placement.
          Click any player for a full breakdown. Works for any Masters pool format.
        </p>
      </div>

      {/* Trending Cards */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-success" />
            <h2 className="font-heading text-lg font-bold text-foreground">
              Trending Up 📈
            </h2>
            <span className="ml-auto text-[10px] text-muted font-medium">since Dec 31</span>
          </div>
          <div className="space-y-2">
            {trendingUp.length === 0 ? (
              <p className="text-sm text-muted">No movement yet — updates when odds change.</p>
            ) : trendingUp.map((g) => (
              <div
                key={g.name}
                className="flex items-center justify-between rounded-lg bg-success/5 border border-success/10 p-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{flagByName.get(g.name) ?? "🌍"}</span>
                  <div>
                    <span className="font-medium text-foreground">{g.name}</span>
                    <span className="ml-2 text-xs text-muted font-mono">{g.starting_odds} → {g.odds}</span>
                  </div>
                </div>
                <span className="text-success font-mono font-bold text-sm">
                  ▲ {oddsMovement(g)} spots
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="h-5 w-5 text-danger" />
            <h2 className="font-heading text-lg font-bold text-foreground">
              Trending Down 📉
            </h2>
            <span className="ml-auto text-[10px] text-muted font-medium">since Dec 31</span>
          </div>
          <div className="space-y-2">
            {trendingDown.length === 0 ? (
              <p className="text-sm text-muted">No movement yet — updates when odds change.</p>
            ) : trendingDown.map((g) => (
              <div
                key={g.name}
                className="flex items-center justify-between rounded-lg bg-danger/5 border border-danger/10 p-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{flagByName.get(g.name) ?? "🌍"}</span>
                  <div>
                    <span className="font-medium text-foreground">{g.name}</span>
                    <span className="ml-2 text-xs text-muted font-mono">{g.starting_odds} → {g.odds}</span>
                  </div>
                </div>
                <span className="text-danger font-mono font-bold text-sm">
                  ▼ {Math.abs(oddsMovement(g))} spots
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Full Field Table */}
      <Card>
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="h-5 w-5 text-masters-green" />
          <h2 className="font-heading text-xl font-bold text-foreground">
            Full Field — 2026 Masters
          </h2>
          <span className="ml-auto text-xs text-muted font-medium bg-bg-muted px-3 py-1 rounded-full">
            {dbGolfers.length} players · Odds updated {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </div>
        <PlayerTable initialPlayer={player} dbGolfers={dbGolfers} />
      </Card>

      {/* How It Works — SEO content */}
      <div className="mt-12 grid sm:grid-cols-3 gap-6">
        <div className="sm:col-span-3">
          <h2 className="font-heading text-2xl font-bold text-foreground mb-2">
            How to Research Your 2026 Masters Pool Picks
          </h2>
          <p className="text-muted text-sm max-w-3xl">
            This tool gives you AI-generated scouting reports for the entire Masters field — completely free, no account required.
            Each player profile includes current betting odds, season-long odds movement, their draft tier, and an AI-written
            summary covering course history, recent form, and a bull &amp; bear case for Augusta. Use it to sharpen your
            strategy whether you're in a tiered pool, a salary-cap format, or a simple pick-one contest.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-bg-muted/30 p-5">
          <h3 className="font-heading font-bold text-foreground mb-2">Check the Odds Trends</h3>
          <p className="text-sm text-muted">
            The &ldquo;Trending Up&rdquo; section shows which players have moved the most since the season baseline.
            A player shortening from +4000 to +2500 is gaining momentum — bookmakers and sharps are taking notice.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-bg-muted/30 p-5">
          <h3 className="font-heading font-bold text-foreground mb-2">Read the AI Scouting Reports</h3>
          <p className="text-sm text-muted">
            Click any player to expand their full AI-generated profile: a one-paragraph summary, bull case (why they could
            win), bear case (the risk factors), recent form, Masters history, and age context.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-bg-muted/30 p-5">
          <h3 className="font-heading font-bold text-foreground mb-2">Filter by Tier or Group</h3>
          <p className="text-sm text-muted">
            Narrow the field to a specific tier to compare the options available at each pick slot. Use the Groups filter
            to browse past champions, LIV players, rookies, lefties, and more.
          </p>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mt-12 mb-4">
        <h2 className="font-heading text-2xl font-bold text-foreground mb-6">
          Masters Pool FAQ
        </h2>
        <div className="space-y-4">
          {[
            {
              q: "Who should I pick in my 2026 Masters pool?",
              a: "The best strategy depends on your pool's format, but a solid approach is to take a chalk favorite from the top tier (Scheffler, McIlroy, Rahm) and use your lower tiers to find high-upside value. Use this tool's AI bull/bear cases to evaluate ceiling and risk for each player before committing.",
            },
            {
              q: "What is the tier system in a Masters pool?",
              a: "Most tiered Masters pools group the field by betting odds — Tier 1 is the favorites with the shortest odds, Tier 9 is the biggest longshots. You pick one golfer per tier, forcing you to spread your picks across the full odds spectrum rather than going all chalk.",
            },
            {
              q: "What is the best value pick in a Masters pool?",
              a: "Value comes from Tiers 4–6 where the pick percentages are most spread out. Look for players trending up in the odds who have strong Augusta course history. Our Trending Up cards on this page highlight exactly those players.",
            },
            {
              q: "How is the player research generated?",
              a: "Each scouting report — summary, bull case, bear case, and recent form — is generated using AI that incorporates PGA Tour statistics, Augusta course history, OWGR rankings, and live betting market data. Odds and trends are updated throughout the season.",
            },
            {
              q: "Is this tool free to use?",
              a: "Yes, completely free. You don't need to create an account or be in a Masters Madness pool. Browse all AI-generated player reports and use the research for any pool format you're participating in.",
            },
          ].map(({ q, a }) => (
            <div key={q} className="rounded-xl border border-border p-5">
              <h3 className="font-heading font-semibold text-foreground mb-1.5">{q}</h3>
              <p className="text-sm text-muted leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
