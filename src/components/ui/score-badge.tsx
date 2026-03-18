import { cn, formatScore } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number | string;
  size?: "sm" | "md" | "lg";
}

export function ScoreBadge({ score, size = "md" }: ScoreBadgeProps) {
  const numScore = typeof score === "string" ? parseFloat(score) : score;
  const display =
    typeof score === "string" ? score : formatScore(numScore);

  const colorClass = isNaN(numScore)
    ? "text-muted"
    : numScore < 0
      ? "score-under"
      : numScore > 0
        ? "score-over"
        : "score-even";

  return (
    <span
      className={cn(
        "font-mono font-semibold tabular-nums",
        colorClass,
        size === "sm" && "text-sm",
        size === "md" && "text-base",
        size === "lg" && "text-xl"
      )}
    >
      {display}
    </span>
  );
}
