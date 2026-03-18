import { CONTRARIAN_PICKS, CONSENSUS_PICKS } from "@/data/mock-analytics";
import { Flame, Users } from "lucide-react";
import { cn } from "@/lib/utils";

export function BoldPicks() {
  return (
    <div className="grid sm:grid-cols-2 gap-6">
      {/* Contrarian picks */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100">
            <Flame className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <h3 className="font-heading text-base font-bold text-foreground leading-none">Bold Moves</h3>
            <p className="text-xs text-muted">Picked by ≤ 2 entries</p>
          </div>
        </div>

        <div className="space-y-2">
          {CONTRARIAN_PICKS.map((g) => (
            <div
              key={g.name}
              className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{g.country}</span>
                <div>
                  <p className="text-sm font-semibold text-foreground leading-none">{g.name}</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    {g.pickedBy} {g.pickedBy === 1 ? "person" : "people"} · Tier {g.tier}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-amber-700 bg-amber-100 border border-amber-300 rounded-full px-2 py-0.5">
                  {g.ownership}% owned
                </span>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted mt-3 italic">
          If these golfers run, the picker has a massive edge.
        </p>
      </div>

      {/* Consensus picks */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-masters-green-light">
            <Users className="h-4 w-4 text-masters-green" />
          </div>
          <div>
            <h3 className="font-heading text-base font-bold text-foreground leading-none">Consensus Locks</h3>
            <p className="text-xs text-muted">Picked by 10+ entries</p>
          </div>
        </div>

        <div className="space-y-2">
          {CONSENSUS_PICKS.map((g) => (
            <div
              key={g.name}
              className="flex items-center justify-between rounded-xl border border-masters-green/20 bg-masters-green-light/50 px-3 py-2.5"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">{g.country}</span>
                <div>
                  <p className="text-sm font-semibold text-foreground leading-none">{g.name}</p>
                  <p className="text-xs text-masters-green mt-0.5">
                    {g.pickedBy} of 15 · Tier {g.tier}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-masters-green bg-masters-green-light border border-masters-green/20 rounded-full px-2 py-0.5">
                  {g.ownership}% owned
                </span>
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted mt-3 italic">
          These misses hurt everyone equally — no one gets an edge here.
        </p>
      </div>
    </div>
  );
}
