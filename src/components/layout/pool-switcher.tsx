"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export type PoolStub = {
  id: string;
  slug: string;
  name: string;
  role: string;
};

// Pages that support the ?pool= query param
const POOL_AWARE_PATHS = ["/standings", "/analytics", "/rules", "/picks"];

function getPoolHref(slug: string, pathname: string, searchParams: URLSearchParams): string {
  const isPoolAware = POOL_AWARE_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );
  if (isPoolAware) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("pool", slug);
    return `${pathname}?${params.toString()}`;
  }
  return `/standings?pool=${slug}`;
}

interface PoolSwitcherProps {
  pools: PoolStub[];
  activeSlug?: string;
}

export function PoolSwitcher({ pools, activeSlug }: PoolSwitcherProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();

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

  // Single pool — just a link that stays on current page
  if (pools.length === 1) {
    const href = getPoolHref(pools[0].slug, pathname, searchParams);
    return (
      <Link
        href={href}
        className="hidden sm:flex items-center gap-1.5 rounded-lg border border-masters-green/20 bg-masters-green-light px-3 py-1.5 text-xs font-semibold text-masters-green hover:bg-masters-green/10 transition-colors max-w-[180px]"
      >
        <Trophy className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{pools[0].name}</span>
      </Link>
    );
  }

  // Multiple pools — dropdown
  const activePool = pools.find((p) => p.slug === activeSlug) ?? pools[0];

  return (
    <div ref={ref} className="relative hidden sm:block">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-lg border border-masters-green/20 bg-masters-green-light px-3 py-1.5 text-xs font-semibold text-masters-green hover:bg-masters-green/10 transition-colors max-w-[180px] cursor-pointer"
      >
        <Trophy className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{activePool.name}</span>
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
              href={getPoolHref(pool.slug, pathname, searchParams)}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-2 px-3 py-2.5 text-sm font-medium transition-colors",
                pool.slug === activeSlug
                  ? "bg-masters-green-light text-masters-green"
                  : "text-foreground hover:bg-masters-green-light hover:text-masters-green"
              )}
            >
              <Trophy className="h-3.5 w-3.5 shrink-0 text-masters-green/50" />
              <span className="truncate">{pool.name}</span>
              {pool.slug === activeSlug && (
                <span className="ml-auto text-[10px] font-semibold text-masters-green/50">Active</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
