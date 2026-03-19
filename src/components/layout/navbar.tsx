"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { StartPoolButton } from "@/components/ui/start-pool-button";
import { PoolSwitcher, type PoolStub } from "@/components/layout/pool-switcher";
import { MoreMenu, type MoreMenuItem } from "@/components/layout/more-menu";
import {
  Trophy,
  BarChart3,
  ClipboardList,
  BookOpen,
  Search,
  Users,
  UserPlus,
  Crown,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect } from "react";
import type { LucideIcon } from "lucide-react";

type NavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userPools, setUserPools] = useState<PoolStub[]>([]);
  const { isSignedIn, isLoaded } = useUser();

  const showSignIn = !isLoaded || !isSignedIn;
  const showUserButton = isLoaded && isSignedIn;

  useEffect(() => {
    if (!isSignedIn) { setUserPools([]); return; }
    fetch("/api/me/pools")
      .then((r) => r.json())
      .then((d) => setUserPools(d.pools ?? []))
      .catch(() => {});
  }, [isSignedIn]);

  const activeSlug = userPools[0]?.slug;
  const hasPool = isLoaded && isSignedIn && userPools.length > 0;
  const isCommish = userPools[0]?.role === "commissioner";

  // ── Primary nav links ──────────────────────────────────────────────────────
  let primaryLinks: NavLink[];

  if (isLoaded && isSignedIn && !hasPool) {
    // Signed in, no pool yet → show Join a Pool prominently
    primaryLinks = [
      { href: "/join", label: "Join a Pool", icon: UserPlus },
      { href: "/leaderboard", label: "Leaderboard", icon: BarChart3 },
      { href: "/research", label: "Research", icon: BookOpen },
    ];
  } else if (hasPool) {
    // Pool member → core 3; rest goes in More menu
    primaryLinks = [
      { href: activeSlug ? `/standings?pool=${activeSlug}` : "/standings", label: "Standings", icon: Trophy },
      { href: "/leaderboard", label: "Leaderboard", icon: BarChart3 },
      { href: activeSlug ? `/picks?pool=${activeSlug}` : "/picks", label: "My Picks", icon: ClipboardList },
    ];
  } else {
    // Signed out (or loading)
    primaryLinks = [
      { href: "/standings", label: "Standings", icon: Trophy },
      { href: "/leaderboard", label: "Leaderboard", icon: BarChart3 },
      { href: "/research", label: "Research", icon: BookOpen },
      { href: "/rules", label: "Rules", icon: Users },
    ];
  }

  // ── More menu (pool members only) ─────────────────────────────────────────
  const moreItems: MoreMenuItem[] = hasPool
    ? [
        { href: activeSlug ? `/analytics?pool=${activeSlug}` : "/analytics", label: "Pool Analytics", icon: Search },
        { href: "/research", label: "Research", icon: BookOpen },
        { href: activeSlug ? `/rules?pool=${activeSlug}` : "/rules", label: "Rules", icon: Users },
        { href: "/join", label: "Join Another Pool", icon: UserPlus, dividerBefore: true },
        ...(isCommish
          ? [{ href: `/pool/${activeSlug}/commissioner`, label: "Commissioner Settings", icon: Crown }]
          : []),
      ]
    : [];

  // ── Mobile: flat list with divider before overflow section ─────────────────
  const mobileLinks: (NavLink & { dividerBefore?: boolean })[] = [
    ...primaryLinks,
    ...moreItems.map((item, i) => ({
      ...item,
      dividerBefore: i === 0 ? true : item.dividerBefore,
    })),
  ];

  function isActive(href: string) {
    const base = href.split("?")[0];
    return pathname === base || (base !== "/" && pathname.startsWith(base));
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo + Pool Switcher */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-masters-green text-white font-heading text-sm font-bold transition-transform duration-200 group-hover:scale-105">
                M
              </div>
              {!showUserButton && (
                <span className="font-heading text-xl font-bold text-foreground hidden sm:block">
                  Masters Madness
                </span>
              )}
            </Link>
            {showUserButton && <PoolSwitcher pools={userPools} />}
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {primaryLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive(link.href)
                      ? "bg-masters-green-light text-masters-green"
                      : "text-foreground/70 hover:text-foreground hover:bg-bg-muted"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
            <MoreMenu items={moreItems} />
          </div>

          {/* Auth + Start Pool */}
          <div className="flex items-center gap-3">
            <StartPoolButton className="hidden sm:block" />
            {showSignIn && (
              <SignInButton mode="modal">
                <button className="hidden sm:inline-flex items-center gap-2 rounded-lg border border-masters-green bg-white px-4 py-2 text-sm font-semibold text-masters-green transition-all duration-200 hover:bg-masters-green-light active:scale-[0.98] cursor-pointer">
                  Sign In
                </button>
              </SignInButton>
            )}
            {showUserButton && (
              <UserButton
                appearance={{ elements: { avatarBox: "h-9 w-9" } }}
              />
            )}
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg text-muted hover:text-foreground hover:bg-bg-muted transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Drawer */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border py-3 space-y-1 pb-[env(safe-area-inset-bottom,12px)]">
            {mobileLinks.map((link, i) => {
              const Icon = link.icon;
              return (
                <div key={`${link.href}-${i}`}>
                  {link.dividerBefore && (
                    <div className="my-2 border-t border-border-light" />
                  )}
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3.5 rounded-lg text-base font-medium transition-all duration-200 min-h-[48px] active:scale-[0.98]",
                      isActive(link.href)
                        ? "bg-masters-green-light text-masters-green"
                        : "text-foreground/70 hover:text-foreground hover:bg-bg-muted"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                </div>
              );
            })}

            <div className="pt-2 border-t border-border space-y-2">
              <StartPoolButton className="block w-full [&_button]:w-full [&_button]:justify-center [&_button]:min-h-[48px]" />
              {showSignIn && (
                <SignInButton mode="modal">
                  <button className="w-full flex items-center justify-center gap-2 rounded-lg border border-masters-green bg-white px-4 py-3.5 text-base font-semibold text-masters-green cursor-pointer min-h-[48px] active:scale-[0.98] active:bg-masters-green-light">
                    Sign In
                  </button>
                </SignInButton>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
