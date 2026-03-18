import { Card } from "@/components/ui/card";
import { PlayerTable } from "@/components/research/player-table";
import { TrendingUp, TrendingDown, BookOpen } from "lucide-react";
import { PLAYERS, calculateTrend } from "@/data/players";

export default async function ResearchPage({
  searchParams,
}: {
  searchParams: Promise<{ player?: string }>;
}) {
  const { player } = await searchParams;

  const trendingUp = PLAYERS.filter((p) => calculateTrend(p) > 0)
    .sort((a, b) => calculateTrend(b) - calculateTrend(a))
    .slice(0, 3);

  const trendingDown = PLAYERS.filter((p) => calculateTrend(p) < 0)
    .sort((a, b) => calculateTrend(a) - calculateTrend(b))
    .slice(0, 3);

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
            {trendingUp.map((player) => (
              <div
                key={player.name}
                className="flex items-center justify-between rounded-lg bg-success/5 border border-success/10 p-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{player.country}</span>
                  <span className="font-medium text-foreground">
                    {player.name}
                  </span>
                </div>
                <span className="text-success font-mono font-bold text-sm">
                  ▲ {calculateTrend(player)} spots
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
            {trendingDown.map((player) => (
              <div
                key={player.name}
                className="flex items-center justify-between rounded-lg bg-danger/5 border border-danger/10 p-3"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{player.country}</span>
                  <span className="font-medium text-foreground">
                    {player.name}
                  </span>
                </div>
                <span className="text-danger font-mono font-bold text-sm">
                  ▼ {Math.abs(calculateTrend(player))} spots
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
            {PLAYERS.length} players · Updated weekly
          </span>
        </div>
        <PlayerTable initialPlayer={player} />
      </Card>
    </div>
  );
}
