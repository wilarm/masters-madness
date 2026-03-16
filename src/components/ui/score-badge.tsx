import { cn, formatScore } from "@/lib/utils";

interface ScoreBadgeProps {
  score: number | string;
  size?: "sm" | "md" | "lg";
}

export function ScoreBadge({ score, size = "md" }: ScoreBadgeProps) {
  const { display, className } = formatScore(score);

  return (
    <span
      className={cn(
        "font-mono font-semibold tabular-nums",
        className,
        size === "sm" && "text-sm",
        size === "md" && "text-base",
        size === "lg" && "text-xl"
      )}
    >
      {display}
    </span>
  );
}
