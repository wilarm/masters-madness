"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface Golfer {
  name: string
  tier: number
  score: number
  missedCut: boolean
  scoreVersion: number
}

const INITIAL_GOLFERS: Golfer[] = [
  { name: "Scottie Scheffler", tier: 1, score: -8, missedCut: false, scoreVersion: 0 },
  { name: "Rory McIlroy",      tier: 2, score: -6, missedCut: false, scoreVersion: 0 },
  { name: "Jon Rahm",          tier: 3, score: -4, missedCut: false, scoreVersion: 0 },
  { name: "Brooks Koepka",     tier: 4, score: -3, missedCut: false, scoreVersion: 0 },
  { name: "Collin Morikawa",   tier: 5, score: -2, missedCut: false, scoreVersion: 0 },
  { name: "Viktor Hovland",    tier: 6, score: -1, missedCut: false, scoreVersion: 0 },
  { name: "Tony Finau",        tier: 7, score:  1, missedCut: false, scoreVersion: 0 },
  { name: "Sahith Theegala",   tier: 8, score:  3, missedCut: false, scoreVersion: 0 },
  { name: "Min Woo Lee",       tier: 9, score:  5, missedCut: false, scoreVersion: 0 },
]

const COUNTING_COUNT = 4
const CUT_SCORE = 3

const TIER_COLORS: Record<number, string> = {
  1: "bg-yellow-500 text-white",
  2: "bg-orange-500 text-white",
  3: "bg-red-500 text-white",
  4: "bg-pink-500 text-white",
  5: "bg-purple-500 text-white",
  6: "bg-indigo-500 text-white",
  7: "bg-blue-500 text-white",
  8: "bg-teal-500 text-white",
  9: "bg-emerald-500 text-white",
}

const ROW_HEIGHT = 56
const ROW_GAP = 4
const ZONE_HEADER_HEIGHT = 28
const BENCH_DIVIDER_HEIGHT = 36

function formatScore(score: number): string {
  if (score === 0) return "E"
  if (score > 0) return `+${score}`
  return `${score}`
}

function getSortedGolfers(golfers: Golfer[]): Golfer[] {
  return [...golfers].sort((a, b) => {
    if (a.missedCut && !b.missedCut) return 1
    if (!a.missedCut && b.missedCut) return -1
    if (a.missedCut && b.missedCut) return 0
    return a.score - b.score
  })
}

function getEffectiveScore(golfer: Golfer): number {
  return golfer.missedCut ? CUT_SCORE : golfer.score
}

// Maps sorted index → pixel top
function getTopOffset(index: number): number {
  if (index < COUNTING_COUNT) {
    // inside counting zone: after the "COUNTING" header
    return ZONE_HEADER_HEIGHT + index * (ROW_HEIGHT + ROW_GAP)
  }
  // inside bench zone: after counting rows + bench divider header
  const countingHeight = ZONE_HEADER_HEIGHT + COUNTING_COUNT * (ROW_HEIGHT + ROW_GAP)
  const benchStart = countingHeight + BENCH_DIVIDER_HEIGHT
  return benchStart + (index - COUNTING_COUNT) * (ROW_HEIGHT + ROW_GAP)
}

const CONTAINER_HEIGHT =
  ZONE_HEADER_HEIGHT +
  COUNTING_COUNT * (ROW_HEIGHT + ROW_GAP) +
  BENCH_DIVIDER_HEIGHT +
  (INITIAL_GOLFERS.length - COUNTING_COUNT) * (ROW_HEIGHT + ROW_GAP)

// Y position for the bench divider block
const BENCH_DIVIDER_TOP =
  ZONE_HEADER_HEIGHT + COUNTING_COUNT * (ROW_HEIGHT + ROW_GAP)

type CrossingType = "to-counting" | "to-bench"

export function ScoringVisualizer() {
  const [golfers, setGolfers] = useState<Golfer[]>(INITIAL_GOLFERS)
  const [isPlaying, setIsPlaying] = useState(true)
  const [missedCutMode, setMissedCutMode] = useState(false)
  const [rankDeltas, setRankDeltas] = useState<Record<string, { delta: number; id: number }>>({})
  const [crossings, setCrossings] = useState<Record<string, { type: CrossingType; id: number }>>({})
  const [poolScoreFlash, setPoolScoreFlash] = useState<"better" | "worse" | null>(null)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const prevSortedNamesRef = useRef<string[]>([])
  const prevCountingNamesRef = useRef<Set<string>>(new Set())
  const prevPoolScoreRef = useRef<number | null>(null)
  const flashIdRef = useRef(0)

  const sorted = getSortedGolfers(golfers)
  const top4 = sorted.slice(0, COUNTING_COUNT)
  const top4Names = new Set(top4.map((g) => g.name))
  const poolScore = top4.reduce((sum, g) => sum + getEffectiveScore(g), 0)
  const cutoffScore = sorted[COUNTING_COUNT - 1]?.score ?? 0 // 4th place score = bench threshold

  const simulateUpdate = useCallback(() => {
    setGolfers((prev) => {
      const next = prev.map((g) => ({ ...g }))
      const eligible = next.filter((g) => !g.missedCut)
      if (eligible.length === 0) return next

      const numChanges = Math.floor(Math.random() * 2) + 2
      const indices = [...Array(eligible.length).keys()]
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[indices[i], indices[j]] = [indices[j], indices[i]]
      }
      const toChange = indices.slice(0, Math.min(numChanges, eligible.length))
      for (const idx of toChange) {
        const golfer = eligible[idx]
        const delta = Math.floor(Math.random() * 5) - 2
        const found = next.find((g) => g.name === golfer.name)
        if (found) {
          found.score = Math.max(-15, Math.min(15, found.score + delta))
          found.scoreVersion += 1
        }
      }
      return next
    })
  }, [])

  // Detect rank changes + bench/counting crossings
  useEffect(() => {
    const newSortedNames = sorted.map((g) => g.name)
    const prev = prevSortedNamesRef.current
    const prevCounting = prevCountingNamesRef.current

    if (prev.length > 0) {
      const newDeltas: Record<string, { delta: number; id: number }> = {}
      const newCrossings: Record<string, { type: CrossingType; id: number }> = {}

      newSortedNames.forEach((name, newIdx) => {
        const prevIdx = prev.indexOf(name)
        if (prevIdx !== -1 && prevIdx !== newIdx) {
          flashIdRef.current += 1
          newDeltas[name] = { delta: prevIdx - newIdx, id: flashIdRef.current }
        }
        const wasCounting = prevCounting.has(name)
        const isCounting = top4Names.has(name)
        if (!wasCounting && isCounting) {
          flashIdRef.current += 1
          newCrossings[name] = { type: "to-counting", id: flashIdRef.current }
        } else if (wasCounting && !isCounting) {
          flashIdRef.current += 1
          newCrossings[name] = { type: "to-bench", id: flashIdRef.current }
        }
      })

      if (Object.keys(newDeltas).length > 0) {
        setRankDeltas(newDeltas)
        setTimeout(() => setRankDeltas({}), 1800)
      }
      if (Object.keys(newCrossings).length > 0) {
        setCrossings(newCrossings)
        setTimeout(() => setCrossings({}), 2000)
      }
    }

    prevSortedNamesRef.current = newSortedNames
    prevCountingNamesRef.current = new Set(top4Names)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [golfers])

  // Pool score flash
  useEffect(() => {
    if (prevPoolScoreRef.current !== null && prevPoolScoreRef.current !== poolScore) {
      setPoolScoreFlash(poolScore < prevPoolScoreRef.current ? "better" : "worse")
      setTimeout(() => setPoolScoreFlash(null), 800)
    }
    prevPoolScoreRef.current = poolScore
  }, [poolScore])

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(simulateUpdate, 1600)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPlaying, simulateUpdate])

  const handleReset = () => {
    setGolfers(INITIAL_GOLFERS)
    setMissedCutMode(false)
    prevSortedNamesRef.current = []
    prevCountingNamesRef.current = new Set()
    setRankDeltas({})
    setCrossings({})
    setPoolScoreFlash(null)
  }

  const handleMissedCutToggle = () => {
    setMissedCutMode((prev) => {
      const next = !prev
      setGolfers((g) =>
        g.map((golfer, i) => ({
          ...golfer,
          missedCut: next && i >= COUNTING_COUNT,
          scoreVersion: next && i >= COUNTING_COUNT ? golfer.scoreVersion + 1 : golfer.scoreVersion,
        }))
      )
      return next
    })
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-5">
      {/* Pool Score */}
      <div className="flex items-center justify-between gap-4 rounded-xl bg-masters-green px-5 py-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-white/50 mb-1">Your Pool Score</p>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "font-heading text-4xl font-bold text-white transition-colors duration-300",
                poolScoreFlash === "better" && "animate-[score-pulse-green_0.6s_ease-out]",
                poolScoreFlash === "worse"  && "animate-[score-pulse-red_0.6s_ease-out]",
              )}
            >
              {formatScore(poolScore)}
            </span>
            {poolScoreFlash && (
              <span
                key={String(poolScore)}
                className={cn(
                  "text-lg font-bold animate-[fade-slide-up_0.9s_ease-out_forwards]",
                  poolScoreFlash === "better" ? "text-emerald-300" : "text-red-300"
                )}
              >
                {poolScoreFlash === "better" ? "▼" : "▲"}
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-white/50 font-medium">Bench cutoff</p>
          <p className="font-mono font-bold text-white/80 text-lg">{formatScore(cutoffScore)}</p>
          <p className="text-[10px] text-white/40 mt-0.5">4th place score</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setIsPlaying((p) => !p)}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 cursor-pointer",
            isPlaying
              ? "bg-masters-green text-white hover:bg-masters-green/90"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          {isPlaying ? (
            <><svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>Pause</>
          ) : (
            <><svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>Play</>
          )}
        </button>
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200 cursor-pointer transition-colors"
        >
          <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 0 1 9-9 9 9 0 0 1 6.36 2.64L21 8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 3v5h-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Reset
        </button>
        <button
          onClick={handleMissedCutToggle}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 cursor-pointer",
            missedCutMode
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
            <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
          </svg>
          Simulate Missed Cut
        </button>

        {missedCutMode && (
          <span className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-full px-3 py-1">
            +{CUT_SCORE} applied as replacement
          </span>
        )}
      </div>

      {/* "Your Team" bracket */}
      <div className="relative rounded-2xl border border-masters-green/20 bg-white/50 px-3 pt-5 pb-3">
        {/* bracket label */}
        <div className="absolute top-2 left-4 flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-masters-green/40" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-masters-green/50">
            Your Team · 9 golfers
          </span>
        </div>

        {/* Animated list */}
        <div className="relative select-none" style={{ height: CONTAINER_HEIGHT }}>

        {/* "COUNTING" zone header — fixed at top */}
        <div
          className="absolute left-0 right-0 flex items-center gap-2 z-10"
          style={{ top: 0, height: ZONE_HEADER_HEIGHT }}
        >
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-masters-green" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-masters-green">
              Counting · Best {COUNTING_COUNT} of {INITIAL_GOLFERS.length}
            </span>
          </div>
        </div>

        {/* Bench zone divider — floats between counting & bench rows */}
        <div
          className="absolute left-0 right-0 z-10 flex items-center gap-2 transition-all duration-500"
          style={{ top: BENCH_DIVIDER_TOP, height: BENCH_DIVIDER_HEIGHT }}
        >
          <div className="h-px flex-1 bg-gray-300" />
          <span className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-gray-100 border border-gray-200 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-gray-400">
            <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
            Bench
          </span>
          <div className="h-px flex-1 bg-gray-300" />
        </div>

        {/* Golfer rows */}
        {sorted.map((golfer, index) => {
          const isCounting = top4Names.has(golfer.name)
          const rankDelta = rankDeltas[golfer.name]
          const crossing = crossings[golfer.name]

          return (
            <div
              key={golfer.name}
              className={cn(
                "absolute left-0 right-0 flex items-center gap-2 sm:gap-3 rounded-xl px-2.5 sm:px-4",
                "transition-[top] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
                isCounting && !golfer.missedCut
                  ? "bg-masters-green text-white shadow-[0_2px_12px_rgba(2,89,40,0.25)]"
                  : isCounting && golfer.missedCut
                    ? "bg-masters-green/70 text-white"
                    : "bg-gray-100 text-gray-400",
                rankDelta && rankDelta.delta > 0 && "animate-[row-flash-up_0.7s_ease-out]",
                rankDelta && rankDelta.delta < 0 && "animate-[row-flash-down_0.7s_ease-out]",
                crossing?.type === "to-counting" && "animate-[row-flash-counting_0.8s_ease-out]",
                crossing?.type === "to-bench" && "animate-[row-flash-bench_0.8s_ease-out]",
              )}
              style={{
                top: getTopOffset(index),
                height: ROW_HEIGHT,
              }}
            >
              {/* Rank */}
              <span className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                isCounting ? "bg-white/20 text-white" : "bg-gray-200 text-gray-400"
              )}>
                {index + 1}
              </span>

              {/* Tier badge */}
              <span className={cn(
                "hidden sm:inline-flex shrink-0 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase",
                TIER_COLORS[golfer.tier]
              )}>
                T{golfer.tier}
              </span>

              {/* Name */}
              <span className="min-w-0 flex-1 truncate text-xs sm:text-sm font-medium">
                {golfer.name}
              </span>

              {/* Crossing badge — "↑ COUNTING" or "↓ BENCH" */}
              {crossing && (
                <span
                  key={crossing.id}
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold animate-[fade-slide-up_2s_ease-out_forwards]",
                    crossing.type === "to-counting"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-200 text-gray-500"
                  )}
                >
                  {crossing.type === "to-counting" ? "▲ Counting" : "▼ Bench"}
                </span>
              )}

              {/* Rank change delta */}
              {!crossing && rankDelta && (
                <span
                  key={rankDelta.id}
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold animate-[fade-slide-up_1.6s_ease-out_forwards]",
                    rankDelta.delta > 0 ? "bg-white/20 text-white" : "bg-black/10 text-white/70"
                  )}
                >
                  {rankDelta.delta > 0 ? `▲${rankDelta.delta}` : `▼${Math.abs(rankDelta.delta)}`}
                </span>
              )}

              {/* Score badge */}
              <span
                key={`${golfer.name}-v${golfer.scoreVersion}`}
                className={cn(
                  "shrink-0 rounded-lg px-2.5 py-1 text-sm font-bold font-mono tabular-nums min-w-[48px] text-center",
                  golfer.missedCut
                    ? "bg-gray-200/50 text-gray-400 line-through"
                    : isCounting
                      ? "bg-white/15 text-white animate-[pulse-score_0.5s_ease-out]"
                      : "bg-gray-200 text-gray-400 animate-[pulse-score-bench_0.5s_ease-out]"
                )}
              >
                {golfer.missedCut ? "MC" : formatScore(golfer.score)}
              </span>

              {golfer.missedCut && isCounting && (
                <span className="shrink-0 rounded-lg bg-white/15 px-2.5 py-1 text-sm font-bold font-mono">
                  +{CUT_SCORE}
                </span>
              )}
            </div>
          )
        })}
        </div>{/* end animated list */}
      </div>{/* end Your Team bracket */}

      <style>{`
        @keyframes pulse-score {
          0%   { transform: scale(1); }
          35%  { transform: scale(1.2); background-color: rgba(255,255,255,0.3); }
          100% { transform: scale(1); }
        }
        @keyframes pulse-score-bench {
          0%   { transform: scale(1); }
          35%  { transform: scale(1.15); background-color: rgba(0,0,0,0.08); }
          100% { transform: scale(1); }
        }
        @keyframes fade-slide-up {
          0%   { opacity: 1; transform: translateY(0); }
          60%  { opacity: 1; transform: translateY(-6px); }
          100% { opacity: 0; transform: translateY(-12px); }
        }
        @keyframes row-flash-up {
          0%   { box-shadow: inset 0 0 0 2px rgba(22,163,74,0.6); }
          100% { box-shadow: inset 0 0 0 2px rgba(22,163,74,0); }
        }
        @keyframes row-flash-down {
          0%   { box-shadow: inset 0 0 0 2px rgba(220,38,38,0.5); }
          100% { box-shadow: inset 0 0 0 2px rgba(220,38,38,0); }
        }
        @keyframes row-flash-counting {
          0%   { box-shadow: 0 0 0 3px rgba(2,89,40,0.7), inset 0 0 0 2px rgba(255,255,255,0.4); }
          50%  { box-shadow: 0 0 0 6px rgba(2,89,40,0.2), inset 0 0 0 2px rgba(255,255,255,0.2); }
          100% { box-shadow: 0 0 0 0px rgba(2,89,40,0); }
        }
        @keyframes row-flash-bench {
          0%   { box-shadow: 0 0 0 3px rgba(156,163,175,0.7); }
          100% { box-shadow: 0 0 0 0px rgba(156,163,175,0); }
        }
        @keyframes score-pulse-green {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.06); filter: drop-shadow(0 0 10px rgba(255,255,255,0.6)); }
          100% { transform: scale(1); }
        }
        @keyframes score-pulse-red {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.06); filter: drop-shadow(0 0 10px rgba(255,100,100,0.5)); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
