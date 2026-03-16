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
      const now = new Date().getTime();
      if (targetDate.getTime() - now < 0) {
        setIsLocked(true);
        setTimeLeft("Picks are locked!");
      } else {
        setTimeLeft(formatCountdown(targetDate));
      }
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-3 rounded-xl px-6 py-4 text-center transition-all duration-300",
        isLocked
          ? "bg-danger/10 text-danger"
          : "bg-masters-green-light text-masters-green"
      )}
    >
      <Clock className="h-5 w-5 flex-shrink-0" />
      <span className="font-semibold text-lg">
        {label}: <span className="font-mono font-bold">{timeLeft}</span>
      </span>
    </div>
  );
}
