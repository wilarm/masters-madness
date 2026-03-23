import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { PlayerTable } from "@/components/research/player-table";

export const metadata: Metadata = {
  title: "2026 Masters Golfer Research & Odds — Masters Madness",
  description:
    "Research every golfer in the 2026 Masters field before you pick. Compare odds, form, and tier placement to build the best fantasy golf pool lineup at Augusta National.",
  openGraph: {
    title: "2026 Masters Golfer Research & Odds — Masters Madness",
    description:
      "Research every golfer in the 2026 Masters field before you pick. Compare odds, form, and tier placement to build the best fantasy golf pool lineup at Augusta National.",
  },
};
import { TrendingUp, TrendingDown, BookOpen } from "lucide-react";
import { PLAYERS } from "@/data/players";
import { getAllGolfers, oddsMovement } from "@/lib/db/golfers";

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

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
          Player Research
        </h1>
        <p className="text-muted mt-2 max-w-2xl">
          Odds, trends, tiers, and scouting reports for every golfer in the 2026
          Masters field. Click any player for a full breakdown. Hover for a quick
          summary.
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
                    <span className="ml-2 text-xs text-muted font-mono">{g.prev_odds} → {g.odds}</span>
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
                    <span className="ml-2 text-xs text-muted font-mono">{g.prev_odds} → {g.odds}</span>
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
        <PlayerTable initialPlayer={player} />
      </Card>
    </div>
  );
}
