import { Card } from "@/components/ui/card";
import { BookOpen, TrendingUp, TrendingDown, Search } from "lucide-react";

// Placeholder data — will be replaced with real golfer data from Supabase
const MOCK_GOLFERS = [
  {
    name: "Scottie Scheffler",
    odds: "+500",
    tier: 1,
    ranking: 1,
    trend: 0,
    country: "USA",
  },
  {
    name: "Rory McIlroy",
    odds: "+800",
    tier: 1,
    ranking: 3,
    trend: 2,
    country: "NIR",
  },
  {
    name: "Xander Schauffele",
    odds: "+900",
    tier: 1,
    ranking: 2,
    trend: -1,
    country: "USA",
  },
  {
    name: "Jon Rahm",
    odds: "+1200",
    tier: 2,
    ranking: 7,
    trend: 3,
    country: "ESP",
  },
  {
    name: "Collin Morikawa",
    odds: "+1400",
    tier: 2,
    ranking: 4,
    trend: 1,
    country: "USA",
  },
  {
    name: "Ludvig Åberg",
    odds: "+1600",
    tier: 2,
    ranking: 5,
    trend: -2,
    country: "SWE",
  },
  {
    name: "Viktor Hovland",
    odds: "+2000",
    tier: 3,
    ranking: 8,
    trend: 0,
    country: "NOR",
  },
  {
    name: "Brooks Koepka",
    odds: "+2200",
    tier: 3,
    ranking: 12,
    trend: -3,
    country: "USA",
  },
];

// Tier color mapping
const TIER_COLORS: Record<number, string> = {
  1: "bg-masters-green text-white",
  2: "bg-info text-white",
  3: "bg-masters-gold text-white",
  4: "bg-danger text-white",
  5: "bg-purple-600 text-white",
  6: "bg-teal-600 text-white",
  7: "bg-orange-500 text-white",
  8: "bg-cyan-600 text-white",
  9: "bg-rose-400 text-white",
};

export default function ResearchPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Player Research
          </h1>
          <p className="text-muted mt-1">
            Odds, trends, and analysis for every golfer in the field
          </p>
        </div>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
          <input
            type="text"
            placeholder="Search players by name..."
            className="w-full rounded-lg border border-border bg-bg pl-10 pr-4 py-3 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-masters-green/30 focus:border-masters-green transition-all"
          />
        </div>
      </Card>

      {/* Trending Section */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-success" />
            <h2 className="font-heading text-lg font-bold text-foreground">
              Trending Up
            </h2>
          </div>
          <div className="space-y-3">
            {MOCK_GOLFERS.filter((g) => g.trend > 0)
              .sort((a, b) => b.trend - a.trend)
              .slice(0, 3)
              .map((golfer) => (
                <div
                  key={golfer.name}
                  className="flex items-center justify-between rounded-lg bg-success/5 p-3"
                >
                  <span className="font-medium text-foreground">
                    {golfer.name}
                  </span>
                  <span className="text-success font-mono font-semibold text-sm">
                    ▲ {golfer.trend}
                  </span>
                </div>
              ))}
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="h-5 w-5 text-danger" />
            <h2 className="font-heading text-lg font-bold text-foreground">
              Trending Down
            </h2>
          </div>
          <div className="space-y-3">
            {MOCK_GOLFERS.filter((g) => g.trend < 0)
              .sort((a, b) => a.trend - b.trend)
              .slice(0, 3)
              .map((golfer) => (
                <div
                  key={golfer.name}
                  className="flex items-center justify-between rounded-lg bg-danger/5 p-3"
                >
                  <span className="font-medium text-foreground">
                    {golfer.name}
                  </span>
                  <span className="text-danger font-mono font-semibold text-sm">
                    ▼ {Math.abs(golfer.trend)}
                  </span>
                </div>
              ))}
          </div>
        </Card>
      </div>

      {/* Full Player Table */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5 text-masters-green" />
          <h2 className="font-heading text-xl font-bold text-foreground">
            Full Field
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-masters-green">
                <th className="text-left py-3 px-4 text-sm font-semibold text-masters-green uppercase tracking-wider">
                  Player
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-masters-green uppercase tracking-wider w-20">
                  Tier
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-masters-green uppercase tracking-wider w-24">
                  Odds
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-masters-green uppercase tracking-wider w-24">
                  Trend
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-masters-green uppercase tracking-wider w-20">
                  OWGR
                </th>
              </tr>
            </thead>
            <tbody className="stagger-enter">
              {MOCK_GOLFERS.map((golfer) => (
                <tr
                  key={golfer.name}
                  className="border-b border-border-light hover:bg-masters-green-light/50 transition-colors duration-150 cursor-pointer group"
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-bg-muted flex items-center justify-center text-xs font-medium text-muted">
                        {golfer.country}
                      </div>
                      <span className="font-medium text-foreground group-hover:text-masters-green transition-colors">
                        {golfer.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <span
                      className={`inline-flex items-center justify-center h-6 w-6 rounded-full text-xs font-bold ${
                        TIER_COLORS[golfer.tier] || "bg-muted text-white"
                      }`}
                    >
                      {golfer.tier}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-sm text-foreground">
                    {golfer.odds}
                  </td>
                  <td className="py-4 px-4 text-center">
                    {golfer.trend > 0 && (
                      <span className="text-success font-mono font-semibold text-sm">
                        ▲ {golfer.trend}
                      </span>
                    )}
                    {golfer.trend < 0 && (
                      <span className="text-danger font-mono font-semibold text-sm">
                        ▼ {Math.abs(golfer.trend)}
                      </span>
                    )}
                    {golfer.trend === 0 && (
                      <span className="text-muted text-sm">—</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-center font-mono text-sm text-muted">
                    #{golfer.ranking}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 rounded-lg bg-bg-muted p-4 text-sm text-muted">
          <strong className="text-foreground">Coming soon:</strong> Hover over
          any player to see a detailed breakdown — bio, Augusta history, recent
          form, and analysis on why they may or may not contend. Odds will be
          tracked week-over-week with baseline comparisons.
        </div>
      </Card>
    </div>
  );
}
