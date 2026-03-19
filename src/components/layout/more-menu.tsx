"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export type MoreMenuItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Renders a thin divider line above this item */
  dividerBefore?: boolean;
};

interface MoreMenuProps {
  items: MoreMenuItem[];
}

export function MoreMenu({ items }: MoreMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (items.length === 0) return null;

  // Highlight the trigger if any overflow item matches the current path
  const isAnyActive = items.some((item) => {
    const base = item.href.split("?")[0];
    return pathname === base || (base !== "/" && pathname.startsWith(base));
  });

  return (
    <div ref={ref} className="relative hidden md:block">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
          open || isAnyActive
            ? "bg-masters-green-light text-masters-green"
            : "text-foreground/70 hover:text-foreground hover:bg-bg-muted"
        )}
        aria-label="More navigation options"
        aria-expanded={open}
      >
        <MoreHorizontal className="h-4 w-4" />
        More
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 min-w-[210px] rounded-xl border border-border bg-white shadow-lg py-1 overflow-hidden">
          {items.map((item) => {
            const Icon = item.icon;
            const base = item.href.split("?")[0];
            const isActive =
              pathname === base || (base !== "/" && pathname.startsWith(base));
            return (
              <div key={item.href}>
                {item.dividerBefore && (
                  <div className="my-1 border-t border-border-light" />
                )}
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "text-masters-green bg-masters-green-light"
                      : "text-foreground hover:bg-bg-muted"
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {item.label}
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
