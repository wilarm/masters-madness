"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

type Pool = {
  id: string;
  slug: string;
  name: string;
};

export function PoolSwitcher() {
  const [pools, setPools] = useState<Pool[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/me/pools")
      .then((r) => r.json())
      .then((d) => setPools(d.pools ?? []))
      .catch(() => {});
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (pools.length === 0) return null;

  // Single pool — just a link
  if (pools.length === 1) {
    return (
      <Link
        href={`/pool/${pools[0].slug}`}
        className="hidden sm:flex items-center gap-1.5 rounded-lg border border-masters-green/20 bg-masters-green-light px-3 py-1.5 text-xs font-semibold text-masters-green hover:bg-masters-green/10 transition-colors max-w-[180px]"
      >
        <Trophy className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{pools[0].name}</span>
      </Link>
    );
  }

  // Multiple pools — dropdown
  return (
    <div ref={ref} className="relative hidden sm:block">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-lg border border-masters-green/20 bg-masters-green-light px-3 py-1.5 text-xs font-semibold text-masters-green hover:bg-masters-green/10 transition-colors max-w-[180px] cursor-pointer"
      >
        <Trophy className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{pools[0].name}</span>
        <ChevronDown
          className={cn(
            "h-3 w-3 shrink-0 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-50 min-w-[200px] rounded-xl border border-border bg-white shadow-lg py-1 overflow-hidden">
          <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted">
            My Pools
          </p>
          {pools.map((pool) => (
            <Link
              key={pool.id}
              href={`/pool/${pool.slug}`}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-foreground hover:bg-masters-green-light hover:text-masters-green transition-colors"
            >
              <Trophy className="h-3.5 w-3.5 shrink-0 text-masters-green/50" />
              <span className="truncate">{pool.name}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
