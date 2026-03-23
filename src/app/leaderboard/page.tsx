import type { Metadata } from "next";
import { Card, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Live Masters Leaderboard 2026 — Masters Madness",
  description:
    "Track live scores from the 2026 Masters Tournament at Augusta National. Real-time leaderboard updated every 10 minutes during the April 9–12 tournament.",
  openGraph: {
    title: "Live Masters Leaderboard 2026 — Masters Madness",
    description:
      "Track live scores from the 2026 Masters Tournament at Augusta National. Real-time leaderboard updated every 10 minutes during the April 9–12 tournament.",
  },
};
import { ScoreBadge } from "@/components/ui/score-badge";
import { getCurrentEvent } from "@/lib/db/settings";
import { getFullLeaderboard } from "@/lib/db/scores";
import { Calendar, Flag, Clock } from "lucide-react";

function formatScore(score: number | null): string {
  if (score === null) return "—";
  if (score === 0) return "E";
  return score > 0 ? `+${score}` : String(score);
}

function RoundCell({ score }: { score: number | null }) {
  if (score === null) return <td className="py-3 px-3 text-center text-sm text-muted/40">—</td>;
  return (
    <td className="py-3 px-3 text-center text-sm font-mono text-foreground">
      {score > 0 ? `+${score}` : score === 0 ? "E" : score}
    </td>
  );
}

export const revalidate = 60; // ISR: revalidate every 60s

export default async function LeaderboardPage() {
  const currentEvent = await getCurrentEvent();

  if (!currentEvent) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Live Leaderboard</h1>
            <p className="text-muted mt-1">2026 Masters Tournament · Augusta National</p>
          </div>
        </div>
        <Card>
          <div className="py-20 text-center px-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-masters-green/10 mb-6">
              <Clock className="h-8 w-8 text-masters-green" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-foreground mb-2">
              The Masters hasn&apos;t started yet
            </h2>
            <p className="text-muted max-w-md mx-auto mb-2">
              The live leaderboard will populate automatically once the 2026 Masters Tournament begins.
            </p>
            <p className="text-sm font-semibold text-masters-green">
              First round tee times: Thursday, April 9, 2026
            </p>
            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted/60">
              <Flag className="h-3.5 w-3.5" />
              <span>Scores update every 10 minutes during play · Augusta National Golf Club</span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const rows = await getFullLeaderboard(currentEvent.eventId);

  const updatedAt = new Date(currentEvent.updatedAt);
  const minutesAgo = Math.floor((Date.now() - updatedAt.getTime()) / 60000);
  const updatedLabel =
    minutesAgo < 1 ? "Just now" : minutesAgo === 1 ? "1 min ago" : `${minutesAgo} min ago`;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">
            {currentEvent.eventName}
          </h1>
          <div className="flex items-center gap-3 mt-1 text-sm text-muted">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              PGA Tour
            </span>
            <span>·</span>
            <span>Updated {updatedLabel}</span>
            {rows.length > 0 && (
              <>
                <span>·</span>
                <span>{rows.filter((r) => !r.is_cut && !r.is_wd).length} active</span>
              </>
            )}
          </div>
        </div>
      </div>

      {rows.length === 0 ? (
        <Card>
          <div className="py-16 text-center">
            <p className="font-semibold text-foreground mb-1">Scores not yet available</p>
            <p className="text-sm text-muted">
              {currentEvent.eventName} is queued — scores will appear here once the first round begins.
            </p>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-masters-green">
                  <th className="text-left py-3 px-4 text-xs font-semibold text-masters-green uppercase tracking-wider w-14">Pos</th>
                  <th className="text-left py-3 px-4 text-xs font-semibold text-masters-green uppercase tracking-wider">Player</th>
                  <th className="text-right py-3 px-4 text-xs font-semibold text-masters-green uppercase tracking-wider w-20">Total</th>
                  <th className="text-center py-3 px-3 text-xs font-semibold text-masters-green uppercase tracking-wider w-16 hidden sm:table-cell">R1</th>
                  <th className="text-center py-3 px-3 text-xs font-semibold text-masters-green uppercase tracking-wider w-16 hidden sm:table-cell">R2</th>
                  <th className="text-center py-3 px-3 text-xs font-semibold text-masters-green uppercase tracking-wider w-16 hidden sm:table-cell">R3</th>
                  <th className="text-center py-3 px-3 text-xs font-semibold text-masters-green uppercase tracking-wider w-16 hidden sm:table-cell">R4</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((entry, i) => {
                  const isCutOrWd = entry.is_cut || entry.is_wd;
                  // Assign position rank: show tie prefix if multiple share same total
                  const pos = entry.is_wd ? "WD" : entry.is_cut ? "CUT" : (entry.position ?? String(i + 1));
                  return (
                    <tr
                      key={entry.golfer_name}
                      className={`border-b border-border-light transition-colors duration-150 ${
                        isCutOrWd ? "opacity-50" : "hover:bg-masters-green-light/50"
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-sm text-foreground">{pos}</td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-foreground">{entry.golfer_name}</span>
                        {entry.golfer_country && (
                          <span className="ml-2 text-sm text-muted hidden sm:inline">{entry.golfer_country}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isCutOrWd ? (
                          <span className="text-sm text-muted font-mono">{formatScore(entry.total)}</span>
                        ) : (
                          <ScoreBadge score={entry.total ?? 0} />
                        )}
                      </td>
                      <RoundCell score={entry.rounds[0]} />
                      <RoundCell score={entry.rounds[1]} />
                      <RoundCell score={entry.rounds[2]} />
                      <RoundCell score={entry.rounds[3]} />
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted/60 px-4 py-3 border-t border-border-light">
            Scores via ESPN · Updates every 10 min during rounds · {rows.length} players
          </p>
        </Card>
      )}
    </div>
  );
}
