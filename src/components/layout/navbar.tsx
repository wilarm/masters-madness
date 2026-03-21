"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
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

  // Derive active pool from current URL (?pool=slug or /pool/[slug]/*)
  const searchParams = useSearchParams();
  const poolFromQuery = searchParams.get("pool");
  const poolFromPath = pathname.match(/^\/pool\/([^/]+)/)?.[1] ?? null;
  const urlPoolSlug = poolFromQuery ?? poolFromPath;

  // Persist active pool to localStorage and seed from it on load
  const [storedSlug, setStoredSlug] = useState<string | null>(null);
  useEffect(() => {
    setStoredSlug(localStorage.getItem("mm_active_pool"));
  }, []);
  useEffect(() => {
    if (urlPoolSlug) {
      localStorage.setItem("mm_active_pool", urlPoolSlug);
      setStoredSlug(urlPoolSlug);
    }
  }, [urlPoolSlug]);

  const activePool = userPools.find((p) => p.slug === (urlPoolSlug ?? storedSlug)) ?? userPools[0];
  const activeSlug = activePool?.slug;
  const hasPool = isLoaded && isSignedIn && userPools.length > 0;
  const isCommish = activePool?.role === "commissioner";

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
    const [base, query] = href.split("?");
    if (pathname !== base && !(base !== "/" && pathname.startsWith(base))) return false;
    // If the link has a pool param, make sure it matches the active pool
    if (query) {
      const linkParams = new URLSearchParams(query);
      const linkPool = linkParams.get("pool");
      if (linkPool && linkPool !== activeSlug) return false;
    }
    return true;
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo + Pool Switcher */}
          <div className="flex items-center gap-3">
            <Link href={hasPool && activeSlug ? `/standings?pool=${activeSlug}` : "/"} className="flex items-center gap-3 group">
              <Image
                src="/favicon-icon.png"
                alt="Masters Madness"
                width={28}
                height={28}
                className="block rounded-lg transition-transform duration-200 group-hover:scale-105"
                priority
              />
              <span className="font-heading text-xl font-bold text-foreground hidden sm:block">
                Masters Madness
              </span>
            </Link>
            {showUserButton && <PoolSwitcher pools={userPools} activeSlug={activeSlug} />}
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

            {/* Mobile: Active Pool Switcher */}
            {hasPool && userPools.length > 0 && (
              <div className="mb-3 px-1">
                <div className="rounded-xl bg-masters-green-light border border-masters-green/15 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-masters-green/50 mb-2">
                    Active Pool
                  </p>
                  {userPools.length === 1 ? (
                    <Link
                      href={`/standings?pool=${userPools[0].slug}`}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-2 text-sm font-bold text-masters-green"
                    >
                      <Trophy className="h-4 w-4 shrink-0" />
                      <span className="truncate">{userPools[0].name}</span>
                    </Link>
                  ) : (
                    <div className="space-y-1">
                      {userPools.map((pool) => (
                        <Link
                          key={pool.id}
                          href={`/standings?pool=${pool.slug}`}
                          onClick={() => setMobileOpen(false)}
                          className={cn(
                            "flex items-center gap-2 w-full rounded-lg px-2 py-1.5 text-sm font-semibold transition-colors",
                            pool.slug === activeSlug
                              ? "bg-masters-green text-white"
                              : "text-masters-green hover:bg-masters-green/10"
                          )}
                        >
                          <Trophy className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{pool.name}</span>
                          {pool.slug === activeSlug && (
                            <span className="ml-auto text-[10px] font-bold text-white/70">Active</span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

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
