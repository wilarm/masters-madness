import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Trophy,
  Users,
  Calendar,
  Crown,
  ArrowRight,
  Settings,
  ClipboardList,
  CheckCircle2,
  DollarSign,
} from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CopyLinkButton } from "@/components/ui/copy-link-button";
import { ShareButton } from "@/components/ui/share-button";
import { StandingsShell } from "@/components/standings/standings-shell";
import { getPoolBySlug, getPoolMembers } from "@/lib/db/pools";
import { getPicksByUser } from "@/lib/db/picks";
import { getUserPoolRole } from "@/lib/auth";
import { getPoolState, picksVisible } from "@/lib/pool-state";
import { JoinPoolButton } from "@/components/pool/join-pool-button";
import { isVenmoHandle, formatPaymentAction } from "@/lib/payment-utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const pool = await getPoolBySlug(slug);
  if (!pool) return {};

  const config = pool.config as Record<string, unknown>;
  const entryFeeNum = config.entryFee ? Number(config.entryFee) : 0;
  const members = await getPoolMembers(pool.id);
  const prizePoolOverride = config.prizePool as string | undefined;
  const autoPrizePool = entryFeeNum > 0
    ? `$${(members.length * entryFeeNum).toLocaleString()}`
    : null;
  const prizePool = prizePoolOverride || autoPrizePool;

  const description = [
    `${members.length} ${members.length === 1 ? "participant" : "participants"}`,
    prizePool ? `${prizePool} prize pool` : null,
    "Masters Tournament 2026",
  ]
    .filter(Boolean)
    .join(" · ");

  const url = `https://mastersmadness.com/pool/${slug}`;

  return {
    title: `${pool.name} | Masters Madness 2026`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: pool.name,
      description,
      url,
      type: "website",
      siteName: "Masters Madness",
      images: [{ url: "/thumbnail.png", width: 1200, height: 630, alt: pool.name }],
    },
    twitter: {
      card: "summary_large_image",
      title: pool.name,
      description,
      images: ["/thumbnail.png"],
    },
  };
}

export default async function PoolPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { slug } = await params;
  const { created } = await searchParams;

  const pool = await getPoolBySlug(slug);
  if (!pool) notFound();

  const { userId } = await auth();
  const [members, userRole] = await Promise.all([
    getPoolMembers(pool.id),
    userId ? getUserPoolRole(userId, pool.id) : Promise.resolve(null),
  ]);

  const userPicks = userId && userRole ? await getPicksByUser(pool.id, userId) : [];

  const poolState = getPoolState();
  const isCommissioner = userRole === "commissioner";
  const isMember = !!userRole;
  const hasSubmittedPicks = userPicks.length > 0;
  const userMember = userId ? members.find((m) => m.user_id === userId) : null;
  const isPaid = userMember?.paid ?? true; // default true so banner doesn't show without entry fee
  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://mastersmadness.com"}/pool/${slug}`;
  const prizePoolOverride = pool.config?.prizePool as string | undefined;
  const entryFee = pool.config?.entryFee as string | number | undefined;
  const heroSubtitle = pool.config?.heroSubtitle as string | undefined;

  // Auto-calculate prize pool from members × entry fee; commissioner can override with custom text
  const entryFeeNum = entryFee ? Number(entryFee) : 0;
  const autoPrizePool =
    entryFeeNum > 0
      ? `$${(members.length * entryFeeNum).toLocaleString()}`
      : null;
  const prizePool = prizePoolOverride || autoPrizePool;
  const picksRedirect = encodeURIComponent(`/picks?pool=${slug}`);

  return (
    <div className="min-h-screen bg-bg">
      {/* Pool Created Success Banner */}
      {created === "true" && (
        <div className="bg-masters-green border-b border-masters-gold/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-3 flex-1">
              <span className="flex-shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full bg-masters-gold/20 border border-masters-gold/40">
                <Trophy className="h-4 w-4 text-masters-gold" />
              </span>
              <div>
                <p className="text-sm font-bold text-white">Your pool is live!</p>
                <p className="text-xs text-white/65">
                  Share this link with your participants to get started.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <code className="flex-1 sm:flex-none text-xs bg-black/20 text-white/80 rounded-lg px-3 py-2 font-mono truncate max-w-[260px]">
                {shareUrl}
              </code>
              <CopyLinkButton url={shareUrl} />
            </div>
          </div>
        </div>
      )}

      {/* Pool Hero */}
      <section className="relative overflow-hidden bg-masters-green">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(196,167,71,0.3) 0%, transparent 50%)",
            }}
          />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm mb-4">
              <Users className="h-4 w-4" />
              {members.length} {members.length === 1 ? "Member" : "Members"}
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 tracking-tight">
              {pool.name}
            </h1>
            <p className="text-lg text-white/80 max-w-xl mx-auto">
              {heroSubtitle || "Masters Tournament Pool · Augusta National Golf Club"}
            </p>
            <div className="flex items-center justify-center mt-6 mb-2">
              <ShareButton
                url={shareUrl}
                title={pool.name}
                text={`Join the ${pool.name} Masters pool!`}
                label="Share Pool"
              />
            </div>
            <div className="flex items-center justify-center gap-4 mt-4">
              {prizePool && (
                <div className="flex items-center gap-2 text-white/85 text-sm">
                  <Trophy className="h-4 w-4 text-masters-gold" />
                  <span>Prize Pool: {prizePool}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-white/85 text-sm">
                <Calendar className="h-4 w-4" />
                <span>April 9–12, 2026</span>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none">
            <path d="M0 80V40C240 0 480 0 720 40C960 80 1200 80 1440 40V80H0Z" fill="var(--color-bg)" />
          </svg>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-4 pb-16 space-y-6">

        {/* Signed out */}
        {!userId && (
          <div className="rounded-xl bg-masters-gold px-5 py-4 shadow-[0_4px_24px_rgba(196,167,71,0.35)]">
            <div className="flex flex-row items-center gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-heading text-base font-bold text-white leading-tight">
                  Want to join? Sign up to make your picks
                </p>
                <p className="text-white/70 text-xs mt-0.5 hidden sm:block">
                  Create an account to enter this pool and compete.
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  href={`/sign-up?redirect_url=${picksRedirect}`}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-masters-green px-4 py-2 text-sm font-bold text-white shadow-[0_2px_8px_rgba(2,89,40,0.4)] hover:bg-[#013D1B] transition-all duration-200 whitespace-nowrap"
                >
                  Join this Pool
                </Link>
                <Link
                  href={`/sign-in?redirect_url=${encodeURIComponent(`/pool/${slug}`)}`}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-masters-gold hover:bg-white/90 transition-all duration-200 whitespace-nowrap"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Signed in, not a member */}
        {userId && !isMember && (
          <div className="rounded-xl bg-masters-green-light border border-masters-green/20 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="flex-1 text-center sm:text-left">
                <h2 className="font-heading text-xl font-bold text-foreground mb-1">
                  Join this pool
                </h2>
                <p className="text-muted text-sm">
                  You&apos;ve been invited — join to submit your picks and appear on the leaderboard.
                </p>
              </div>
              <JoinPoolButton slug={slug} />
            </div>
          </div>
        )}

        {/* Player — picks status */}
        {userId && isMember && !isCommissioner && (
          <div className="rounded-xl border border-border bg-card p-5 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1">
              {hasSubmittedPicks ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <span className="font-semibold text-foreground">Picks submitted</span>
                  <Badge variant="secondary">
                    {Object.keys(userPicks[0]?.golfer_picks ?? {}).length} / 9 tiers
                  </Badge>
                </div>
              ) : (
                <p className="font-semibold text-foreground">You haven&apos;t submitted picks yet</p>
              )}
              <p className="text-sm text-muted mt-0.5">
                {poolState === "pre_lock" ? "Picks lock April 9th at 5:00 AM MT" : "Picks are locked"}
              </p>
            </div>
            {poolState === "pre_lock" && (
              <Link href={`/picks?pool=${slug}`}>
                <Button variant="default">
                  <ClipboardList className="h-4 w-4" />
                  {hasSubmittedPicks ? "Edit Picks" : "Make Picks"}
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Commissioner */}
        {userId && isCommissioner && (
          <div className="rounded-xl border border-masters-green/30 bg-masters-green-light p-5 flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              <span className="flex-shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full bg-masters-green/10 border border-masters-green/30">
                <Crown className="h-4 w-4 text-masters-green" />
              </span>
              <div>
                <p className="font-semibold text-foreground">Commissioner</p>
                <p className="text-sm text-muted">
                  {members.length} member{members.length !== 1 ? "s" : ""} &middot; Picks lock April 9th
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {poolState === "pre_lock" && (
                <Link href={`/picks?pool=${slug}`}>
                  <Button variant="outline" size="sm">
                    <ClipboardList className="h-4 w-4" />
                    {hasSubmittedPicks ? "Edit Picks" : "My Picks"}
                  </Button>
                </Link>
              )}
              <Link href={`/pool/${slug}/commissioner`}>
                <Button variant="default" size="sm">
                  <Settings className="h-4 w-4" />
                  Manage Pool
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Payment pending banner */}
        {isMember && !isPaid && entryFeeNum > 0 && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 px-5 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-3 flex-1">
              <span className="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 border border-amber-300">
                <DollarSign className="h-4 w-4 text-amber-600" />
              </span>
              <div>
                <p className="text-sm font-semibold text-amber-900">
                  Entry fee payment pending — ${entryFeeNum}
                </p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Your spot is reserved. Send your entry fee to the commissioner to confirm.
                </p>
              </div>
            </div>
            {typeof pool.config?.venmoLink === "string" && pool.config.venmoLink && (
              isVenmoHandle(pool.config.venmoLink as string) ? (
                <span className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-amber-100 border border-amber-300 px-4 py-2 text-sm font-semibold text-amber-900">
                  {formatPaymentAction(pool.config.venmoLink as string)}
                </span>
              ) : (
                <a
                  href={pool.config.venmoLink as string}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 px-4 py-2 text-sm font-semibold text-white transition-colors"
                >
                  Pay Now
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              )
            )}
          </div>
        )}

        {/* Pool Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="text-center">
            <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg mb-3 bg-masters-gold/15 text-masters-gold-dark">
              <Trophy className="h-5 w-5" />
            </div>
            <p className="text-sm text-muted font-semibold">Prize Pool</p>
            <p className="font-heading text-2xl font-bold text-foreground mt-1">
              {prizePool ?? "—"}
            </p>
            <p className="text-xs text-muted font-medium mt-1">
              {prizePoolOverride ? "Custom" : autoPrizePool ? `${members.length} × $${entryFeeNum}` : "Winner takes all"}
            </p>
          </Card>
          <Card className="text-center">
            <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg mb-3 bg-masters-green-light text-masters-green">
              <Users className="h-5 w-5" />
            </div>
            <p className="text-sm text-muted font-semibold">Participants</p>
            <p className="font-heading text-2xl font-bold text-foreground mt-1">
              {members.length}
            </p>
            <p className="text-xs text-muted font-medium mt-1">
              {members.length === 1 ? "member" : "members"} joined
            </p>
          </Card>
          <Card className="text-center">
            <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg mb-3 bg-masters-green-light text-masters-green">
              <DollarSign className="h-5 w-5" />
            </div>
            <p className="text-sm text-muted font-semibold">Entry Fee</p>
            <p className="font-heading text-2xl font-bold text-foreground mt-1">
              {entryFeeNum > 0 ? `$${entryFeeNum}` : "Free"}
            </p>
            <p className="text-xs text-muted font-medium mt-1">per entry</p>
          </Card>
          <Card className="text-center">
            <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg mb-3 bg-masters-green-light text-masters-green">
              <Calendar className="h-5 w-5" />
            </div>
            <p className="text-sm text-muted font-semibold">Tournament</p>
            <p className="font-heading text-2xl font-bold text-foreground mt-1">Apr 9–12</p>
            <p className="text-xs text-muted font-medium mt-1">Augusta National</p>
          </Card>
        </div>

        {/* Members / Standings */}
        <Card className="overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4 sm:mb-6">
            <CardTitle className="text-xl sm:text-2xl">
              {picksVisible(poolState) ? "Standings" : "Participants"}
            </CardTitle>
            <Badge variant="secondary">
              {poolState === "pre_lock" && "Picks Open"}
              {poolState === "post_lock" && "Picks Locked"}
              {poolState === "in_progress" && (
                <>
                  <span className="mr-1.5 h-2 w-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                  Live
                </>
              )}
              {poolState === "complete" && "Final"}
            </Badge>
          </div>
          <StandingsShell
            poolState={poolState}
            isCommissioner={isCommissioner}
            participants={members.map((m, i) => ({
              rank: i + 1,
              name: m.display_name ?? "Anonymous",
              score: 0,
              movement: 0,
            }))}
          />
        </Card>

        {/* Bottom CTA for signed-out */}
        {!userId && (
          <Card className="bg-masters-green text-white border-none">
            <div className="flex flex-col sm:flex-row items-center gap-4 py-2">
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-heading text-lg font-bold">Start Your Own Pool</h3>
                <p className="text-white/80 text-sm mt-1">
                  Create a custom Masters pool, invite your friends, and compete for bragging rights.
                </p>
              </div>
              <Link href="/pool/create">
                <Button variant="outline" size="lg" className="bg-white text-masters-green hover:bg-white/90 border-white">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
