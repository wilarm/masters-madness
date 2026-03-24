import type { Metadata } from "next";
import Link from "next/link";
import {
  Trophy,
  Users,
  TrendingUp,
  BarChart3,
  Link2,
  Gamepad2,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Microscope,
  Settings2,
  Zap,
  ClipboardList,
  BookOpen,
} from "lucide-react";
import { ScoringVisualizer } from "@/components/rules/scoring-visualizer";
import { getAuthUserId } from "@/lib/auth";
import { getPoolsForUser } from "@/lib/db/pools";
import type { PoolWithRole } from "@/lib/db/pools";

export const metadata: Metadata = {
  title: "Masters Madness 2026 — Fantasy Golf Pool for Augusta",
  description:
    "Pick 9 golfers across 9 tiers for the 2026 Masters Tournament. Live leaderboard, private pools, custom payouts — free to play. April 9–12 at Augusta National.",
  alternates: {
    canonical: "https://mastersmadness.com",
  },
  openGraph: {
    title: "Masters Madness 2026 — Fantasy Golf Pool for Augusta",
    description:
      "Pick 9 golfers across 9 tiers for the 2026 Masters Tournament. Live leaderboard, private pools, custom payouts — free to play. April 9–12 at Augusta National.",
  },
  twitter: {
    title: "Masters Madness 2026 — Fantasy Golf Pool for Augusta",
    description:
      "Pick 9 golfers across 9 tiers for the 2026 Masters Tournament. Live leaderboard, private pools, custom payouts — free to play. April 9–12 at Augusta National.",
  },
};

// ─── Hero Section ──────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative overflow-hidden min-h-[92vh] flex flex-col justify-center bg-masters-green">
      {/* Hero background image */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="/hero-course.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        {/* Overlay: darken left side for text legibility, keep right side visible */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(2,62,28,0.85) 0%, rgba(2,62,28,0.60) 45%, rgba(2,62,28,0.20) 100%)",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Left: Text content */}
        <div>
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-4 py-2 text-sm font-medium text-white/90 mb-8 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-masters-gold opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-masters-gold" />
            </span>
            April 9–12, 2026 · Augusta National
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.08] tracking-tight mb-6">
            Your Fantasy
            <br />
            Golf Pool,{" "}
            <span
              className="text-masters-gold"
              style={{ textShadow: "0 0 60px rgba(196,167,71,0.4)" }}
            >
              Perfected.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-white/70 leading-relaxed max-w-xl mb-10">
            Run a Masters pool with live scoring, built-in player research,
            custom tiers and payouts — all shareable with a single link. Free
            during beta.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Link
              href="/pool/create"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-masters-gold px-7 py-4 text-base font-bold text-white shadow-[0_4px_24px_rgba(196,167,71,0.5)] hover:bg-masters-gold-dark transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
            >
              Start a Pool
              <ChevronRight className="h-5 w-5" />
            </Link>
            <Link
              href="/join"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/10 border border-white/25 px-7 py-4 text-base font-semibold text-white hover:bg-white/20 transition-all duration-200 cursor-pointer backdrop-blur-sm"
            >
              Join a Pool
            </Link>
          </div>

          <p className="text-sm text-white/45 font-medium">
            Always free during beta · No credit card required
          </p>
        </div>

        {/* Right: Visual — mock pool card */}
        <div className="relative hidden lg:block">
          {/* Floating glow */}
          <div className="absolute inset-0 rounded-3xl bg-masters-gold/10 blur-3xl scale-110 pointer-events-none" />

          {/* Mock standings card */}
          <div className="relative rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md shadow-2xl overflow-hidden">
            {/* Card header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <div>
                <p className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                  Armstrong Family Pool
                </p>
                <p className="text-sm font-bold text-white mt-0.5">
                  Pool Standings · Round 3
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-masters-gold/20 border border-masters-gold/30 px-3 py-1 text-xs font-semibold text-masters-gold">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-masters-gold opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-masters-gold" />
                </span>
                Live
              </span>
            </div>

            {/* Mock standings rows */}
            <div className="divide-y divide-white/8">
              {MOCK_STANDINGS.map((entry, i) => (
                <MockStandingRow key={entry.name} entry={entry} rank={i + 1} />
              ))}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-white/5 border-t border-white/10">
              <p className="text-xs text-white/40">
                Updated 2 min ago · 15 entries · $1,500 prize pool
              </p>
            </div>
          </div>

          {/* Floating badge */}
          <div className="absolute -top-4 -right-4 rounded-xl bg-white shadow-xl px-4 py-3 border border-border">
            <p className="text-xs font-semibold text-muted">Prize Pool</p>
            <p className="font-heading text-2xl font-bold text-masters-green">
              $1,500
            </p>
          </div>
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
  );
}

const MOCK_STANDINGS = [
  {
    name: "Will A.",
    score: -18,
    move: "up",
    golfers: ["Scheffler", "McIlroy", "Rahm"],
  },
  {
    name: "Sarah M.",
    score: -15,
    move: "up",
    golfers: ["Schauffele", "Fleetwood", "Koepka"],
  },
  {
    name: "Mike T.",
    score: -14,
    move: "none",
    golfers: ["McIlroy", "Lowry", "Hatton"],
  },
  {
    name: "Jake R.",
    score: -12,
    move: "down",
    golfers: ["Scheffler", "Spieth", "Thomas"],
  },
  {
    name: "Courtney B.",
    score: -11,
    move: "down",
    golfers: ["Rahm", "Hovland", "Burns"],
  },
];

function MockStandingRow({
  entry,
  rank,
}: {
  entry: (typeof MOCK_STANDINGS)[0];
  rank: number;
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5">
      <span className="text-sm font-bold text-white/50 w-5 text-center font-mono">
        {rank}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white">{entry.name}</p>
        <div className="flex items-center gap-1.5 mt-1">
          {entry.golfers.map((g) => (
            <span
              key={g}
              className="text-[10px] font-medium text-white/50 bg-white/8 rounded px-1.5 py-0.5"
            >
              {g}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {entry.move === "up" && (
          <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
        )}
        {entry.move === "down" && (
          <ArrowDownRight className="h-3.5 w-3.5 text-rose-400" />
        )}
        {entry.move === "none" && <Minus className="h-3.5 w-3.5 text-white/30" />}
        <span
          className={`font-mono font-bold text-sm tabular-nums ${
            entry.score < 0 ? "text-emerald-400" : "text-rose-400"
          }`}
        >
          {entry.score < 0 ? entry.score : `+${entry.score}`}
        </span>
      </div>
    </div>
  );
}

// ─── Social Proof Strip ────────────────────────────────────────────────────────
function SocialProofStrip() {
  return (
    <section className="bg-masters-green py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 gap-8 text-center">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <p
                className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-masters-gold tabular-nums"
                style={{ textShadow: "0 0 40px rgba(196,167,71,0.3)" }}
              >
                {stat.value}
              </p>
              <p className="text-sm sm:text-base font-medium text-white/60 mt-2">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
        <p className="text-center text-white/30 text-xs italic mt-8">
          Jk, this app is still in beta. Those stats help with SEO though...
        </p>
      </div>
    </section>
  );
}

const STATS = [
  { value: "847", label: "Pools Created" },
  { value: "12.4k", label: "Picks Made" },
  { value: "4.9/5", label: "Commissioner Rating" },
];

// ─── How It Works ──────────────────────────────────────────────────────────────
function HowItWorksSection() {
  return (
    <section className="py-12 sm:py-16 bg-[var(--color-bg)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-masters-green text-sm font-bold uppercase tracking-widest mb-3">
            Getting Started
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
            Up and running in 5 minutes.
          </h2>
        </div>

        <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-10 left-[calc(12.5%+32px)] right-[calc(12.5%+32px)] h-px bg-gradient-to-r from-masters-green/20 via-masters-green/40 to-masters-green/20 z-0" />

          {HOW_STEPS.map((step, i) => (
            <div key={step.title} className="relative z-10 text-center group">
              {/* Step number circle */}
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white border-2 border-masters-green/15 shadow-[0_4px_24px_rgba(2,89,40,0.08)] mb-5 group-hover:border-masters-green/40 group-hover:shadow-[0_8px_32px_rgba(2,89,40,0.15)] transition-all duration-300">
                <step.icon className="h-8 w-8 text-masters-green" />
              </div>
              <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-7 h-7 rounded-full bg-masters-green text-white text-xs font-bold flex items-center justify-center shadow-md">
                {i + 1}
              </div>
              <h3 className="font-heading text-lg font-bold text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-muted leading-relaxed max-w-[220px] mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const HOW_STEPS = [
  {
    icon: Settings2,
    title: "Create Your Pool",
    description:
      "Set your custom tiers, scoring rules, entry fee, and payouts in the 5-step wizard.",
  },
  {
    icon: Users,
    title: "Invite Your People",
    description:
      "Share a single link. Players sign up and pick one golfer from each of 9 tiers.",
  },
  {
    icon: Zap,
    title: "Track the Action",
    description:
      "Live scores update every few minutes during tournament week. Watch your rank shift in real time.",
  },
  {
    icon: Trophy,
    title: "Crown the Champion",
    description:
      "Automatic final standings, payout tracking, and pool history saved forever.",
  },
];

// ─── Scoring Explainer ─────────────────────────────────────────────────────────
function ScoringExplainerSection() {
  return (
    <section className="py-12 sm:py-16 bg-white border-t border-border">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-masters-green text-sm font-bold uppercase tracking-widest mb-3">
            How It Works
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Tiers, picks, and live scoring.
          </h2>
          <p className="text-muted max-w-xl mx-auto">
            Your commissioner splits the field into tiers. You pick one golfer per tier.
            Your best 4 scores count — watch your rank shift live as golfers play.
          </p>
        </div>

        {/* Stat pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          {SCORING_PILLS.map(({ label, value }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-full border border-masters-green/20 bg-masters-green-light px-4 py-2"
            >
              <span className="text-xs font-bold text-masters-green uppercase tracking-wider">{label}</span>
              <span className="h-3 w-px bg-masters-green/20" />
              <span className="text-sm font-bold text-foreground">{value}</span>
            </div>
          ))}
        </div>

        {/* Live simulator */}
        <div className="rounded-2xl border border-border bg-[var(--color-bg)] p-4 sm:p-6 shadow-sm">
          <ScoringVisualizer />
        </div>
      </div>
    </section>
  );
}

const SCORING_PILLS = [
  { label: "Groups", value: "9 tiers" },
  { label: "Golfers per tier", value: "~5 players" },
  { label: "Your pick", value: "1 per tier" },
  { label: "Scores that count", value: "Best 4 of 9" },
  { label: "Everything", value: "Customizable" },
];

// ─── Features Grid ─────────────────────────────────────────────────────────────
function FeaturesSection() {
  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-masters-green text-sm font-bold uppercase tracking-widest mb-3">
            Everything You Need
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Built for serious pools.
          </h2>
          <p className="text-muted max-w-xl mx-auto">
            From casual family pools to high-stakes office competitions — all
            the tools commissioners and players need, in one place.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feat) => (
            <div
              key={feat.title}
              className={`relative group rounded-2xl border ${feat.borderColor} bg-white p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden`}
            >
              {/* Top accent bar */}
              <div
                className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl ${feat.accentBar} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
              />
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${feat.iconBg} mb-4`}
              >
                <feat.icon className={`h-6 w-6 ${feat.iconColor}`} />
              </div>
              <h3 className="font-heading text-lg font-bold text-foreground mb-2">
                {feat.title}
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                {feat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  {
    icon: Zap,
    title: "Live Scoring",
    description:
      "Scores pulled directly from the Masters leaderboard, updated every 5 minutes during tournament week.",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-700",
    borderColor: "border-border",
    accentBar: "bg-gradient-to-r from-emerald-400 to-emerald-600",
  },
  {
    icon: Microscope,
    title: "Player Research",
    description:
      "Odds, scouting reports, bull/bear cases, tier assignments, and form data for every golfer in the field.",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-700",
    borderColor: "border-border",
    accentBar: "bg-gradient-to-r from-blue-400 to-blue-600",
  },
  {
    icon: Settings2,
    title: "Custom Rules",
    description:
      "Design your own tiers, scoring system, cut rules, bonus groups (LIV, Lefties, Past Champs), and payouts.",
    iconBg: "bg-violet-50",
    iconColor: "text-violet-700",
    borderColor: "border-border",
    accentBar: "bg-gradient-to-r from-violet-400 to-violet-600",
  },
  {
    icon: BarChart3,
    title: "Pool Analytics",
    description:
      "Risk matrix, pick ownership heatmaps, correlation charts, and what-if swap simulations — post lock.",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-700",
    borderColor: "border-border",
    accentBar: "bg-gradient-to-r from-amber-400 to-amber-600",
  },
  {
    icon: Link2,
    title: "Shareable Links",
    description:
      "Anyone with your pool link can view standings. No account required to watch. Perfect for spectators.",
    iconBg: "bg-teal-50",
    iconColor: "text-teal-700",
    borderColor: "border-border",
    accentBar: "bg-gradient-to-r from-teal-400 to-teal-600",
  },
  {
    icon: Gamepad2,
    title: "Side Games",
    description:
      "Optional bonus picks: Day 1 Leader, Closest to Score, Missed the Cut prediction, and more.",
    iconBg: "bg-rose-50",
    iconColor: "text-rose-700",
    borderColor: "border-border",
    accentBar: "bg-gradient-to-r from-rose-400 to-rose-600",
  },
];

// ─── Live Pool Preview ─────────────────────────────────────────────────────────
function PoolPreviewSection() {
  return (
    <section className="py-12 sm:py-16 bg-[var(--color-bg)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Left: Copy */}
        <div>
          <p className="text-masters-green text-sm font-bold uppercase tracking-widest mb-3">
            Live Standings
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-5">
            Watch every rank shift in real time.
          </h2>
          <p className="text-muted leading-relaxed mb-8">
            During tournament week, standings update automatically as golfers
            post their scores. Your best 4 of 9 golfers count — watch the
            leaderboard come alive round by round.
          </p>
          <ul className="space-y-3">
            {[
              "Score trajectory sparklines per golfer",
              "Rank movement indicators (↑↓)",
              "Counting vs. bench golfer highlighting",
              "Click any row to see a full lineup breakdown",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-foreground">
                <span className="flex-shrink-0 mt-0.5 h-5 w-5 rounded-full bg-masters-green-light flex items-center justify-center">
                  <svg
                    className="h-3 w-3 text-masters-green"
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Mock standings table */}
        <div className="rounded-2xl border border-border shadow-xl overflow-hidden bg-white">
          {/* Table header */}
          <div className="bg-masters-green px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                Armstrong Family Pool
              </p>
              <p className="text-sm font-bold text-white mt-0.5">
                Round 3 Standings
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-masters-gold opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-masters-gold" />
              </span>
              Live
            </span>
          </div>

          {/* Column headers */}
          <div className="grid grid-cols-[40px_1fr_auto_auto] gap-2 px-4 py-2 bg-bg-muted border-b border-border">
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider text-center">
              #
            </span>
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider">
              Participant
            </span>
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider text-right pr-4">
              Score
            </span>
            <span className="text-[10px] font-bold text-muted uppercase tracking-wider text-right">
              Move
            </span>
          </div>

          {/* Rows */}
          <div className="divide-y divide-border/60">
            {MOCK_TABLE_ROWS.map((row, i) => (
              <MockTableRow key={row.name} row={row} rank={i + 1} />
            ))}
          </div>

          <div className="px-5 py-3 bg-bg-muted/50 border-t border-border">
            <p className="text-xs text-muted">
              Updated 2 min ago · 15 entries · Best 4 of 9 count
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

const MOCK_TABLE_ROWS = [
  {
    name: "Will A.",
    score: -18,
    move: "+2",
    golfers: [
      { name: "Scheffler", tier: 1 },
      { name: "McIlroy", tier: 2 },
      { name: "Rahm", tier: 3 },
      { name: "Scott", tier: 7 },
    ],
  },
  {
    name: "Sarah M.",
    score: -15,
    move: "+1",
    golfers: [
      { name: "Schauffele", tier: 2 },
      { name: "Fleetwood", tier: 4 },
      { name: "Koepka", tier: 5 },
      { name: "Finau", tier: 8 },
    ],
  },
  {
    name: "Mike T.",
    score: -14,
    move: "0",
    golfers: [
      { name: "McIlroy", tier: 2 },
      { name: "Lowry", tier: 4 },
      { name: "Hatton", tier: 6 },
      { name: "Kim", tier: 7 },
    ],
  },
  {
    name: "Jake R.",
    score: -12,
    move: "-1",
    golfers: [
      { name: "Scheffler", tier: 1 },
      { name: "Spieth", tier: 4 },
      { name: "Thomas", tier: 5 },
      { name: "Theegala", tier: 8 },
    ],
  },
  {
    name: "Courtney B.",
    score: -11,
    move: "-2",
    golfers: [
      { name: "Rahm", tier: 3 },
      { name: "Hovland", tier: 5 },
      { name: "Burns", tier: 6 },
      { name: "Lee", tier: 9 },
    ],
  },
];

const TIER_COLORS: Record<number, string> = {
  1: "bg-yellow-100 text-yellow-800",
  2: "bg-orange-100 text-orange-800",
  3: "bg-red-100 text-red-800",
  4: "bg-pink-100 text-pink-800",
  5: "bg-purple-100 text-purple-800",
  6: "bg-indigo-100 text-indigo-800",
  7: "bg-blue-100 text-blue-800",
  8: "bg-teal-100 text-teal-800",
  9: "bg-emerald-100 text-emerald-800",
};

function MockTableRow({
  row,
  rank,
}: {
  row: (typeof MOCK_TABLE_ROWS)[0];
  rank: number;
}) {
  const moveNum = parseInt(row.move);
  return (
    <div className="grid grid-cols-[40px_1fr_auto_auto] gap-2 px-4 py-3 items-center hover:bg-masters-green-light/40 transition-colors cursor-pointer">
      <span className="text-sm font-bold text-muted text-center font-mono">
        {rank}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{row.name}</p>
        <div className="flex items-center gap-1 mt-1 flex-wrap">
          {row.golfers.map((g) => (
            <span
              key={g.name}
              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${TIER_COLORS[g.tier] ?? ""}`}
            >
              T{g.tier} · {g.name}
            </span>
          ))}
        </div>
      </div>
      <span
        className={`font-mono font-bold text-sm tabular-nums pr-4 ${
          row.score < 0 ? "text-score-under" : "text-score-over"
        }`}
      >
        {row.score < 0 ? row.score : `+${row.score}`}
      </span>
      <span
        className={`text-xs font-bold tabular-nums ${
          moveNum > 0
            ? "text-emerald-600"
            : moveNum < 0
              ? "text-rose-600"
              : "text-muted"
        }`}
      >
        {moveNum > 0 ? `▲${moveNum}` : moveNum < 0 ? `▼${Math.abs(moveNum)}` : "—"}
      </span>
    </div>
  );
}

// ─── Research Preview ──────────────────────────────────────────────────────────
function ResearchPreviewSection() {
  return (
    <section className="py-12 sm:py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Right: Cards (shown first on mobile via order) */}
        <div className="order-2 lg:order-1 grid sm:grid-cols-3 gap-4">
          {RESEARCH_PLAYERS.map((player) => (
            <ResearchPlayerCard key={player.name} player={player} />
          ))}
        </div>

        {/* Left: Copy */}
        <div className="order-1 lg:order-2">
          <p className="text-masters-green text-sm font-bold uppercase tracking-widest mb-3">
            Built-In Research
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-5">
            Research every golfer before you pick.
          </h2>
          <p className="text-muted leading-relaxed mb-6">
            Full field coverage with betting odds, world ranking, recent form,
            Augusta history, and AI-written bull/bear cases for every golfer.
            Make informed picks — not random ones.
          </p>
          <ul className="space-y-3 mb-8">
            {[
              "Odds to win, updated weekly",
              "Bull & bear case for every golfer",
              "Augusta-specific historical data",
              "Watchlist to bookmark your targets",
              "Trend indicators (rising / falling odds)",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-foreground">
                <span className="flex-shrink-0 mt-0.5 h-5 w-5 rounded-full bg-masters-green-light flex items-center justify-center">
                  <svg
                    className="h-3 w-3 text-masters-green"
                    viewBox="0 0 12 12"
                    fill="none"
                  >
                    <path
                      d="M2 6l3 3 5-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
          <Link
            href="/research"
            className="inline-flex items-center gap-2 text-masters-green font-semibold hover:underline text-sm cursor-pointer"
          >
            Explore the research page
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

const RESEARCH_PLAYERS = [
  {
    name: "Scottie Scheffler",
    country: "🇺🇸",
    odds: "9/2",
    tier: 1,
    summary: "World #1. Defending champ. Dominant in 2025.",
  },
  {
    name: "Rory McIlroy",
    country: "🇬🇧",
    odds: "8/1",
    tier: 2,
    summary: "Hungry for the career slam. Best ball-striker alive.",
  },
  {
    name: "Jon Rahm",
    country: "🇪🇸",
    odds: "12/1",
    tier: 3,
    summary: "2023 champion. Known Augusta performer.",
  },
];

function ResearchPlayerCard({
  player,
}: {
  player: (typeof RESEARCH_PLAYERS)[0];
}) {
  return (
    <div className="rounded-xl border border-border bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
      <div className="bg-masters-green/5 border-b border-border px-4 py-3 flex items-center justify-between">
        <span className="text-base">{player.country}</span>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-bold ${TIER_COLORS[player.tier]}`}
        >
          T{player.tier}
        </span>
      </div>
      <div className="px-4 py-3">
        <p className="font-semibold text-foreground text-sm leading-tight mb-1">
          {player.name}
        </p>
        <p className="font-mono font-bold text-masters-green text-sm">
          {player.odds}
        </p>
        <p className="text-xs text-muted mt-2 leading-relaxed">{player.summary}</p>
      </div>
    </div>
  );
}

// ─── Founding Members ──────────────────────────────────────────────────────────
function FoundingMembersSection() {
  return (
    <section className="py-12 sm:py-16 bg-[var(--color-bg)]">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        <div
          className="rounded-3xl px-8 py-14 sm:py-16 relative overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, #FDF6E4 0%, #FBF0D4 50%, #F9EABB 100%)",
            border: "1.5px solid #DFC97A",
          }}
        >
          {/* Background glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(196,167,71,0.15) 0%, transparent 70%)",
            }}
          />

          {/* Trophy icon */}
          <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-masters-gold/15 border border-masters-gold/30 mb-6">
            <Trophy className="h-8 w-8 text-masters-gold-dark" />
          </div>

          <div className="relative">
            <p className="text-masters-gold-dark text-xs font-bold uppercase tracking-widest mb-3">
              Limited Time Offer
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-5">
              Founding Members Get
              <br />
              Free Pools Forever.
            </h2>
            <p className="text-muted text-base leading-relaxed max-w-xl mx-auto mb-8" data-nosnippet>
              Masters Madness is 100% free during our 2026 beta. When we
              eventually start charging (~$5 per pool), everyone who signs up{" "}
              <strong className="text-foreground">before April 9, 2026</strong>{" "}
              gets locked in free for life. No catch.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/pool/create"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-masters-gold px-8 py-4 text-base font-bold text-white shadow-[0_4px_20px_rgba(196,167,71,0.4)] hover:bg-masters-gold-dark transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
              >
                Claim Your Spot — It&apos;s Free
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>

            <p className="text-xs text-muted/70 mt-5">
              24 days left in the founding member window · No credit card required
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA ─────────────────────────────────────────────────────────────────
function FinalCTASection() {
  return (
    <section className="py-12 sm:py-16 bg-masters-green relative overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 60% 80% at 100% 50%, rgba(196,167,71,0.12) 0%, transparent 70%)",
        }}
      />
      <div className="relative mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-5">
          Ready to run your pool?
        </h2>
        <p className="text-white/60 text-lg mb-10">
          Set up in 5 minutes. Share a link. Watch the leaderboard come alive.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/pool/create"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-masters-gold px-8 py-4 text-base font-bold text-white shadow-[0_4px_24px_rgba(196,167,71,0.5)] hover:bg-masters-gold-dark transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
          >
            <Trophy className="h-5 w-5" />
            Start a Pool
          </Link>
          <Link
            href="/join"
            className="inline-flex items-center gap-1.5 text-white/70 font-medium hover:text-white transition-colors text-sm cursor-pointer"
          >
            or join an existing pool
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Your Pools Section (signed-in users only) ─────────────────────────────────
function YourPoolsSection({ pools }: { pools: PoolWithRole[] }) {
  return (
    <section className="bg-white border-b border-border py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading text-lg font-bold text-foreground mb-4">Your Pools</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pools.map((pool) => (
            <div
              key={pool.slug}
              className="rounded-xl border border-border bg-white p-4 flex items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="min-w-0">
                <p className="font-semibold text-foreground truncate">{pool.name}</p>
                <p className="text-sm text-muted capitalize mt-0.5">{pool.state.replace("_", " ")}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/standings?pool=${pool.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted/10 transition-colors"
                >
                  <Trophy className="h-3.5 w-3.5" />
                  Standings
                </Link>
                <Link
                  href={`/picks?pool=${pool.slug}`}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-masters-green px-3 py-1.5 text-xs font-semibold text-white hover:bg-masters-green-dark transition-colors"
                >
                  <ClipboardList className="h-3.5 w-3.5" />
                  My Picks
                </Link>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-4 text-sm text-muted">
          <Link href="/join" className="hover:text-foreground transition-colors inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            Join another pool
          </Link>
          <span className="text-border">·</span>
          <Link href="/pool/create" className="hover:text-foreground transition-colors inline-flex items-center gap-1">
            <Zap className="h-3.5 w-3.5" />
            Create a pool
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── FAQ Schema (GEO: +40% AI search visibility) ───────────────────────────────
const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is Masters Madness?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Masters Madness is a free fantasy golf pool platform built specifically for the Masters Tournament at Augusta National. Players pick 9 golfers across 9 tiers, compete in private pools, and track live leaderboard scores during the tournament April 9–12, 2026."
      }
    },
    {
      "@type": "Question",
      "name": "How does the Masters golf pool work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Each player selects one golfer from each of 9 tiers — Tier 1 contains the favorites like Scottie Scheffler, while Tier 9 contains long shots. Your score is the combined total of all 9 golfers' scores. The pool member with the lowest combined score wins. If a golfer misses the cut, they receive a penalty score."
      }
    },
    {
      "@type": "Question",
      "name": "How many golfers do I pick for the Masters pool?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You pick exactly 9 golfers — one from each of 9 tiers ranked by Masters odds. This tiered system ensures every pool member has a mix of favorites and long shots, making every round of the Masters exciting regardless of who you picked."
      }
    },
    {
      "@type": "Question",
      "name": "Is Masters Madness free to use?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes — Masters Madness is completely free during the 2026 beta. No credit card is required. Anyone who signs up before April 9, 2026 locks in free access for life."
      }
    },
    {
      "@type": "Question",
      "name": "When is the 2026 Masters Tournament?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The 2026 Masters Tournament is held April 9–12, 2026 at Augusta National Golf Club in Augusta, Georgia. Masters Madness syncs live scores from the tournament so your pool leaderboard updates in real time throughout all four rounds."
      }
    },
    {
      "@type": "Question",
      "name": "Can I create a private Masters pool for my friends?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. You can create a private pool in under 5 minutes, customize payout structures, set pick deadlines, and share a single invite link. Pool commissioners can manage members, lock picks, and announce results."
      }
    },
    {
      "@type": "Question",
      "name": "How is Masters pool scoring calculated?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Scoring is based on each golfer's cumulative score to par across all four rounds. Your total is the sum of all 9 picked golfers' scores. Lower is better — just like real golf. Golfers who miss the cut receive a predetermined penalty score set by the pool commissioner."
      }
    }
  ]
};

// ─── Page ──────────────────────────────────────────────────────────────────────
export default async function HomePage() {
  const userId = await getAuthUserId();
  const userPools = userId ? await getPoolsForUser(userId) : [];

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }}
      />
      {userPools.length > 0 && <YourPoolsSection pools={userPools} />}
      <HeroSection />
      <SocialProofStrip />
      <HowItWorksSection />
      <ScoringExplainerSection />
      <FeaturesSection />
      <PoolPreviewSection />
      <ResearchPreviewSection />
      <FoundingMembersSection />
      <FinalCTASection />
    </main>
  );
}
