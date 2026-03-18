import { OWNERSHIP_CHART_DATA, PARTICIPANT_RISK, CONTRARIAN_PICKS } from "@/data/mock-analytics";
import { Target, Users, Flame, TrendingUp } from "lucide-react";

export function AnalyticsStatsBar() {
  const topOwned = OWNERSHIP_CHART_DATA.sort((a, b) => b.ownership - a.ownership)[0];
  const mostContrarianEntry = PARTICIPANT_RISK.sort((a, b) => a.avgOwnership - b.avgOwnership)[0];
  const leading = PARTICIPANT_RISK.sort((a, b) => a.projectedScore - b.projectedScore)[0];

  const stats = [
    {
      icon: Target,
      label: "Most Owned",
      value: topOwned.name,
      sub: `${topOwned.ownership}% of entries`,
      color: "text-masters-green bg-masters-green-light",
    },
    {
      icon: Users,
      label: "Pool Size",
      value: "15 entries",
      sub: "Picks locked",
      color: "text-masters-gold-dark bg-masters-gold/10",
    },
    {
      icon: Flame,
      label: "Boldest Entry",
      value: mostContrarianEntry.name,
      sub: `${mostContrarianEntry.avgOwnership}% avg ownership`,
      color: "text-amber-600 bg-amber-50",
    },
    {
      icon: TrendingUp,
      label: "Current Leader",
      value: leading.name,
      sub: `${leading.projectedScore} projected`,
      color: "text-emerald-700 bg-emerald-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="rounded-xl border border-border bg-white p-4 flex items-start gap-3">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${s.color}`}>
            <s.icon className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-muted uppercase tracking-wide">{s.label}</p>
            <p className="font-heading text-base font-bold text-foreground truncate">{s.value}</p>
            <p className="text-xs text-muted">{s.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
