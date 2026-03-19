import { Trophy, TrendingUp, Users, Calendar, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Countdown } from "@/components/ui/countdown";
import { Card, CardTitle } from "@/components/ui/card";
import { StandingsShell } from "@/components/standings/standings-shell";
import { getPoolState, poolStateLabel, poolStateDotColor } from "@/lib/pool-state";
import { auth } from "@clerk/nextjs/server";
import { isPlatformAdmin } from "@/lib/auth";

// Tournament deadline: Thursday, April 9, 2026 5:00 AM MT (11:00 AM UTC)
const PICKS_DEADLINE = new Date("2026-04-09T11:00:00Z");

export default async function StandingsPage() {
  const poolState = getPoolState();
  const { userId } = await auth();
  // Platform admins always get commissioner view.
  // TODO Phase 15: also check pool_members.role = "commissioner" for pool-specific access.
  const isCommissioner = !!userId && isPlatformAdmin(userId);
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-masters-green">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(196,167,71,0.3) 0%, transparent 50%)",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur-sm">
                <Calendar className="h-4 w-4" />
                April 9–12, 2026
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-black/20 px-3 py-1.5 text-xs font-semibold text-white/80 backdrop-blur-sm border border-white/10">
                <span className={cn("h-1.5 w-1.5 rounded-full", poolStateDotColor(poolState))} />
                {poolStateLabel(poolState)}
              </div>
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
              Masters Madness
              <span className="block text-masters-gold mt-1">2026</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-8">
              The premier fantasy golf tournament pool. Pick your golfers,
              track live scores, and compete for glory at Augusta National.
            </p>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
            preserveAspectRatio="none"
          >
            <path
              d="M0 80V40C240 0 480 0 720 40C960 80 1200 80 1440 40V80H0Z"
              fill="var(--color-bg)"
            />
          </svg>
        </div>
      </section>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-4 pb-16">
        {/* Countdown */}
        <div className="mb-8">
          <Countdown targetDate={PICKS_DEADLINE} />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-enter">
          <StatCard
            icon={Trophy}
            label="Prize Pool"
            value="$1,500"
            accent
          />
          <StatCard
            icon={Users}
            label="Entries"
            value="—"
            sublabel="Accepting entries"
          />
          <StatCard
            icon={TrendingUp}
            label="2025 Winner"
            value="Ryan M."
            sublabel="Defending champ"
          />
          <StatCard
            icon={Calendar}
            label="Tournament"
            value="Apr 9–12"
            sublabel="Augusta National"
          />
        </div>

        {/* Scoring Info Banner */}
        <div className="mb-6 rounded-xl border border-masters-green/15 bg-masters-green-light px-4 py-3.5 flex items-start gap-3">
          <Info className="h-4 w-4 text-masters-green shrink-0 mt-0.5" />
          <div className="text-sm text-masters-green/80 leading-relaxed">
            <span className="font-bold text-masters-green">How scoring works: </span>
            Each player picks one golfer from each of 9 tiers. Your{" "}
            <span className="font-semibold">best 4 of 9</span> golfers' cumulative
            strokes-to-par count toward your score — lower is better. Standings
            update live each round during tournament week.{" "}
            <span className="text-masters-green/60 text-xs">
              (Tiers, score count, and rules are customizable per pool.)
            </span>
          </div>
        </div>

        {/* Standings Table */}
        <Card className="overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-4 sm:mb-6">
            <CardTitle className="text-xl sm:text-2xl">Pool Standings</CardTitle>
            {(poolState === "in_progress" || poolState === "complete") && (
              <span className="text-xs sm:text-sm text-muted">
                Updates every 10 min during tournament
              </span>
            )}
            {poolState === "pre_lock" && (
              <span className="text-xs sm:text-sm text-muted">
                Picks hidden until deadline
              </span>
            )}
          </div>
          <StandingsShell
            poolState={poolState}
            isCommissioner={isCommissioner}
            showDemoToggle={!userId}
            defaultDemo={!userId}
          />
        </Card>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sublabel?: string;
  accent?: boolean;
}) {
  return (
    <Card className="text-center">
      <div
        className={cn(
          "inline-flex items-center justify-center h-10 w-10 rounded-lg mb-3",
          accent ? "bg-masters-gold/15 text-masters-gold-dark" : "bg-masters-green-light text-masters-green"
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-sm text-muted font-semibold">{label}</p>
      <p className="font-heading text-2xl font-bold text-foreground mt-1">
        {value}
      </p>
      {sublabel && (
        <p className="text-xs text-muted font-medium mt-1">{sublabel}</p>
      )}
    </Card>
  );
}
