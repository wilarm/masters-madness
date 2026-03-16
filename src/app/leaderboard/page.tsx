import { Card, CardTitle } from "@/components/ui/card";
import { ScoreBadge } from "@/components/ui/score-badge";
import { RefreshCw } from "lucide-react";

// Placeholder data — will be replaced with live Masters API data
const MOCK_LEADERBOARD = [
  { pos: "1", player: "Scottie Scheffler", score: -14, today: -5, thru: "F" },
  { pos: "2", player: "Rory McIlroy", score: -12, today: -3, thru: "F" },
  { pos: "T3", player: "Jon Rahm", score: -10, today: -4, thru: "F" },
  { pos: "T3", player: "Xander Schauffele", score: -10, today: -2, thru: "F" },
  { pos: "5", player: "Collin Morikawa", score: -9, today: -1, thru: "F" },
  { pos: "T6", player: "Ludvig Åberg", score: -8, today: -3, thru: "F" },
  { pos: "T6", player: "Brooks Koepka", score: -8, today: 0, thru: "F" },
  { pos: "8", player: "Tiger Woods", score: -7, today: -2, thru: "F" },
  { pos: "T9", player: "Jordan Spieth", score: -6, today: -1, thru: "F" },
  { pos: "T9", player: "Viktor Hovland", score: -6, today: 0, thru: "F" },
];

export default function LeaderboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            Live Leaderboard
          </h1>
          <p className="text-muted mt-1">
            Masters Tournament — Augusta National Golf Club
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-masters-green-light px-4 py-2 text-sm font-medium text-masters-green hover:bg-masters-green hover:text-white transition-all duration-200 cursor-pointer">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-masters-green">
                <th className="text-left py-3 px-4 text-sm font-semibold text-masters-green uppercase tracking-wider w-16">
                  Pos
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-masters-green uppercase tracking-wider">
                  Player
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-masters-green uppercase tracking-wider w-24">
                  Total
                </th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-masters-green uppercase tracking-wider w-24">
                  Today
                </th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-masters-green uppercase tracking-wider w-20">
                  Thru
                </th>
              </tr>
            </thead>
            <tbody className="stagger-enter">
              {MOCK_LEADERBOARD.map((entry, i) => (
                <tr
                  key={i}
                  className="border-b border-border-light hover:bg-masters-green-light/50 transition-colors duration-150"
                >
                  <td className="py-4 px-4 font-mono font-bold text-foreground">
                    {entry.pos}
                  </td>
                  <td className="py-4 px-4 font-medium text-foreground">
                    {entry.player}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <ScoreBadge score={entry.score} />
                  </td>
                  <td className="py-4 px-4 text-right">
                    <ScoreBadge score={entry.today} size="sm" />
                  </td>
                  <td className="py-4 px-4 text-center text-sm text-muted">
                    {entry.thru}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
