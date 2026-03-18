"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ReferenceLine,
} from "recharts";
import { OWNERSHIP_CHART_DATA } from "@/data/mock-analytics";

const TIER_COLORS: Record<number, string> = {
  1: "#c4a747", // gold
  2: "#025928", // masters green
  3: "#1a7a40",
  4: "#2d9155",
  5: "#4aab6d",
  6: "#6abf88",
  7: "#8bd0a4",
  8: "#aaddbf",
  9: "#c8ecd7",
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: (typeof OWNERSHIP_CHART_DATA)[0]; value: number }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl border border-border bg-white px-4 py-3 shadow-xl text-sm">
      <p className="font-bold text-foreground mb-1">
        {d.country} {d.name}
      </p>
      <p className="text-muted">
        Tier {d.tier} · <span className="font-semibold text-masters-green">{d.ownership}%</span> owned
      </p>
      <p className="text-muted">{d.pickedBy} of 15 entries</p>
      {d.isContrarianPick && (
        <p className="mt-1 text-xs font-semibold text-amber-600 bg-amber-50 rounded px-2 py-0.5 inline-block">
          Contrarian Pick
        </p>
      )}
    </div>
  );
}

export function PickOwnershipChart() {
  const data = [...OWNERSHIP_CHART_DATA].sort((a, b) => b.ownership - a.ownership);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-heading text-lg font-bold text-foreground">Pick Ownership</h3>
          <p className="text-sm text-muted">% of pool entries that selected each golfer</p>
        </div>
        <div className="flex items-center gap-3 text-xs font-medium text-muted">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-masters-gold" />
            Popular
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-masters-green" />
            Contrarian
          </span>
        </div>
      </div>

      <div className="h-[420px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 48, left: 8, bottom: 0 }}
            barSize={18}
          >
            <XAxis
              type="number"
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 11, fill: "#8a9fa8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={80}
              tick={{ fontSize: 12, fill: "#374151", fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(2,89,40,0.04)" }} />
            <ReferenceLine
              x={33}
              stroke="#e5e7eb"
              strokeDasharray="4 3"
              label={{ value: "Contrarian", position: "top", fontSize: 10, fill: "#9ca3af" }}
            />
            <Bar dataKey="ownership" radius={[0, 6, 6, 0]} label={{ position: "right", formatter: (v: number) => `${v}%`, fontSize: 11, fill: "#6b7280" }}>
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={entry.isContrarianPick ? "#c4a747" : TIER_COLORS[entry.tier] ?? "#025928"}
                  opacity={entry.isContrarianPick ? 1 : 0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
