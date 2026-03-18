"use client";

import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import { PARTICIPANT_RISK, type ParticipantRisk } from "@/data/mock-analytics";
import { cn } from "@/lib/utils";

const RISK_COLOR: Record<ParticipantRisk["risk"], string> = {
  safe:     "#025928",
  balanced: "#c4a747",
  bold:     "#dc2626",
};

const RISK_LABEL: Record<ParticipantRisk["risk"], string> = {
  safe:     "Safe",
  balanced: "Balanced",
  bold:     "Bold",
};

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ParticipantRisk }>;
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-xl border border-border bg-white px-4 py-3 shadow-xl text-sm min-w-[160px]">
      <p className="font-bold text-foreground mb-1">{d.name}</p>
      <p className="text-muted">
        Avg ownership: <span className="font-semibold text-foreground">{d.avgOwnership}%</span>
      </p>
      <p className="text-muted">
        Projected: <span className="font-semibold text-masters-green">{d.projectedScore > 0 ? "+" : ""}{d.projectedScore}</span>
      </p>
      <span
        className="mt-1.5 inline-block text-xs font-semibold rounded-full px-2 py-0.5"
        style={{
          color: RISK_COLOR[d.risk],
          background: `${RISK_COLOR[d.risk]}18`,
        }}
      >
        {RISK_LABEL[d.risk]}
      </span>
    </div>
  );
}

interface DotProps {
  cx?: number;
  cy?: number;
  payload?: ParticipantRisk;
}

function CustomDot({ cx = 0, cy = 0, payload }: DotProps) {
  if (!payload) return null;
  const color = RISK_COLOR[payload.risk];
  const initials = payload.name.split(" ").map((w) => w[0]).join("").slice(0, 2);
  return (
    <g>
      <circle cx={cx} cy={cy} r={20} fill={color} opacity={0.15} />
      <circle cx={cx} cy={cy} r={14} fill={color} opacity={0.9} />
      <text
        x={cx}
        y={cy + 4}
        textAnchor="middle"
        fill="white"
        fontSize={9}
        fontWeight={700}
        fontFamily="Inter, sans-serif"
      >
        {initials}
      </text>
    </g>
  );
}

export function RiskMatrix() {
  return (
    <div>
      <div className="mb-4">
        <h3 className="font-heading text-lg font-bold text-foreground">Risk Matrix</h3>
        <p className="text-sm text-muted">
          Each dot is an entry — right = under par (ahead), left = over par (behind). Top = consensus picks, bottom = contrarian.
        </p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4">
        {(["safe", "balanced", "bold"] as const).map((r) => (
          <span key={r} className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: RISK_COLOR[r] }}>
            <span className="h-2.5 w-2.5 rounded-full inline-block" style={{ background: RISK_COLOR[r] }} />
            {RISK_LABEL[r]}
          </span>
        ))}
      </div>

      <div className="h-[340px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 24, bottom: 20, left: 32 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              type="number"
              dataKey="projectedScore"
              name="Projected Score"
              domain={[8, -14]}
              reversed={true}
              tickFormatter={(v) => (v > 0 ? `+${v}` : `${v}`)}
              label={{ value: "← Behind (Over Par) | Ahead (Under Par) →", position: "insideBottom", offset: -12, fontSize: 11, fill: "#9ca3af" }}
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              type="number"
              dataKey="avgOwnership"
              name="Avg Ownership %"
              domain={[20, 80]}
              tickFormatter={(v) => `${v}%`}
              label={{ value: "← Contrarian | Consensus →", angle: -90, position: "insideLeft", offset: -16, fontSize: 11, fill: "#9ca3af" }}
              tick={{ fontSize: 11, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <ReferenceLine x={0} stroke="#d1d5db" strokeDasharray="4 3" />
            <ReferenceLine y={50} stroke="#d1d5db" strokeDasharray="4 3" />
            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Scatter
              data={PARTICIPANT_RISK}
              shape={(props: DotProps) => <CustomDot {...props} />}
            />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Quadrant labels — X: score (right=ahead/under par), Y: ownership (top=consensus) */}
      <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-muted font-medium">
        <div className="flex items-center gap-1.5 bg-bg-muted rounded-lg px-3 py-2">
          <span className="text-muted">↖</span>
          <span><strong className="text-foreground">Consensus &amp; Behind</strong> — safe plays underperforming</span>
        </div>
        <div className="flex items-center gap-1.5 bg-blue-50 rounded-lg px-3 py-2">
          <span className="text-blue-600">↗</span>
          <span><strong className="text-blue-700">Consensus &amp; Ahead</strong> — safety first, currently leading</span>
        </div>
        <div className="flex items-center gap-1.5 bg-amber-50 rounded-lg px-3 py-2">
          <span className="text-amber-600">↙</span>
          <span><strong className="text-amber-700">Contrarian &amp; Behind</strong> — bold swings, not connecting yet</span>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-50 rounded-lg px-3 py-2">
          <span className="text-emerald-600">↘</span>
          <span><strong className="text-emerald-700">Contrarian &amp; Ahead</strong> — took the road less travelled and it&apos;s paying off</span>
        </div>
      </div>
    </div>
  );
}
