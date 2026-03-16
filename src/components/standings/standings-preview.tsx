"use client";

import { Avatar } from "@/components/ui/avatar";
import { ScoreBadge } from "@/components/ui/score-badge";

// Placeholder data — will be replaced with Supabase realtime data
const MOCK_STANDINGS = [
  { rank: 1, name: "Ryan McKenzie", score: -12, movement: 0 },
  { rank: 2, name: "Wes Upchurch", score: -10, movement: 2 },
  { rank: 3, name: "Mike Walton", score: -9, movement: -1 },
  { rank: 4, name: "Drake Fages", score: -7, movement: 1 },
  { rank: 5, name: "Will Armstrong", score: -6, movement: -2 },
];

export function StandingsPreview() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-masters-green">
            <th className="text-left py-3 px-4 text-sm font-semibold text-masters-green uppercase tracking-wider w-16">
              Rank
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-masters-green uppercase tracking-wider">
              Player
            </th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-masters-green uppercase tracking-wider w-24">
              Score
            </th>
            <th className="text-center py-3 px-4 text-sm font-semibold text-masters-green uppercase tracking-wider w-24">
              Move
            </th>
          </tr>
        </thead>
        <tbody className="stagger-enter">
          {MOCK_STANDINGS.map((entry) => (
            <tr
              key={entry.rank}
              className="border-b border-border-light hover:bg-masters-green-light/50 transition-colors duration-150"
            >
              <td className="py-4 px-4">
                <span className="font-mono font-bold text-lg text-foreground">
                  {entry.rank}
                </span>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                  <Avatar name={entry.name} size="sm" />
                  <span className="font-medium text-foreground">
                    {entry.name}
                  </span>
                </div>
              </td>
              <td className="py-4 px-4 text-right">
                <ScoreBadge score={entry.score} size="md" />
              </td>
              <td className="py-4 px-4 text-center">
                <MovementBadge change={entry.movement} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Empty state for when there's no data yet */}
      {MOCK_STANDINGS.length === 0 && (
        <div className="text-center py-16 text-muted">
          <p className="text-lg font-medium">No standings yet</p>
          <p className="text-sm mt-1">
            Standings will appear once the tournament begins
          </p>
        </div>
      )}
    </div>
  );
}

function MovementBadge({ change }: { change: number }) {
  if (change === 0) {
    return <span className="text-muted text-sm">—</span>;
  }

  if (change > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-success text-sm font-semibold">
        ▲ {change}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-danger text-sm font-semibold">
      ▼ {Math.abs(change)}
    </span>
  );
}
