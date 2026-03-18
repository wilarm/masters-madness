"use client";

import { useState, useEffect } from "react";
import { cn, formatCountdown } from "@/lib/utils";
import { Clock } from "lucide-react";

interface CountdownProps {
  targetDate: Date;
  label?: string;
}

export function Countdown({
  targetDate,
  label = "Picks lock in",
}: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    function update() {
      const result = formatCountdown(targetDate);
      if (result.expired) {
        setIsLocked(true);
        setTimeLeft("Picks are locked!");
      } else {
        setTimeLeft(
          `${result.days}d  ${result.hours}h  ${result.minutes}m  ${result.seconds}s`
        );
      }
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2 sm:gap-3 rounded-xl px-4 sm:px-6 py-3 sm:py-4 text-center transition-all duration-300",
        isLocked
          ? "bg-danger/10 text-danger"
          : "bg-masters-green-light text-masters-green"
      )}
    >
      <Clock className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
      <span className="font-semibold text-sm sm:text-lg">
        <span className="hidden sm:inline">{label}: </span>
        <span className="sm:hidden">{label.split(" ").slice(0, 2).join(" ")}: </span>
        <span className="font-mono font-bold">{timeLeft}</span>
      </span>
    </div>
  );
}
