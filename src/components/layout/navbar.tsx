"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { StartPoolButton } from "@/components/ui/start-pool-button";
import {
  Trophy,
  BarChart3,
  ClipboardList,
  BookOpen,
  Search,
  Users,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const navLinks = [
  { href: "/standings", label: "Standings", icon: Trophy },
  { href: "/leaderboard", label: "Leaderboard", icon: BarChart3 },
  { href: "/picks", label: "My Picks", icon: ClipboardList, auth: true },
  { href: "/analytics", label: "Pool Analytics", icon: Search },
  { href: "/research", label: "Research", icon: BookOpen },
  { href: "/rules", label: "Rules", icon: Users },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isSignedIn, isLoaded } = useUser();
  // Show signed-out UI when Clerk hasn't loaded yet (optimistic) or confirmed signed-out
  const showSignIn = !isLoaded || !isSignedIn;
  const showUserButton = isLoaded && isSignedIn;

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-masters-green text-white font-heading text-sm font-bold transition-transform duration-200 group-hover:scale-105">
              M
            </div>
            <span className="font-heading text-xl font-bold text-foreground hidden sm:block">
              Masters Madness
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));

              const linkEl = (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-masters-green-light text-masters-green"
                      : "text-foreground/70 hover:text-foreground hover:bg-bg-muted"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );

              // Auth-required links only show when signed in
              if (link.auth) {
                return showUserButton ? (
                  <span key={link.href}>{linkEl}</span>
                ) : null;
              }

              return <span key={link.href}>{linkEl}</span>;
            })}
          </div>

          {/* Auth Buttons + Start Pool */}
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
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9",
                  },
                }}
              />
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden flex items-center justify-center h-9 w-9 rounded-lg text-muted hover:text-foreground hover:bg-bg-muted transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-border py-3 space-y-1 pb-[env(safe-area-inset-bottom,12px)]">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));

              const linkEl = (
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3.5 rounded-lg text-base font-medium transition-all duration-200 min-h-[48px] active:scale-[0.98]",
                    isActive
                      ? "bg-masters-green-light text-masters-green"
                      : "text-foreground/70 hover:text-foreground hover:bg-bg-muted active:bg-bg-muted"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {link.label}
                </Link>
              );

              if (link.auth) {
                return showUserButton ? (
                  <span key={link.href}>{linkEl}</span>
                ) : null;
              }

              return <span key={link.href}>{linkEl}</span>;
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
