"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface Golfer {
  name: string
  tier: number
  score: number
  missedCut: boolean
  scoreVersion: number // incremented to re-trigger score animation
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

const ROW_HEIGHT = 56  // px per row
const ROW_GAP = 4      // px between rows
const CUT_LINE_HEIGHT = 28 // px for the cut line separator

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

function getTopOffset(index: number): number {
  const base = index * (ROW_HEIGHT + ROW_GAP)
  // Add space for the cut line separator after index 3
  return index <= 3 ? base : base + CUT_LINE_HEIGHT
}

const CONTAINER_HEIGHT =
  9 * (ROW_HEIGHT + ROW_GAP) + CUT_LINE_HEIGHT

// Position of the cut line divider
const CUT_LINE_TOP = 4 * (ROW_HEIGHT + ROW_GAP)

interface RankDelta {
  delta: number
  id: number
}

export function ScoringVisualizer() {
  const [golfers, setGolfers] = useState<Golfer[]>(INITIAL_GOLFERS)
  const [isPlaying, setIsPlaying] = useState(true)
  const [missedCutMode, setMissedCutMode] = useState(false)
  const [rankDeltas, setRankDeltas] = useState<Record<string, RankDelta>>({})
  const [poolScoreFlash, setPoolScoreFlash] = useState<"better" | "worse" | null>(null)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const prevSortedNamesRef = useRef<string[]>([])
  const prevPoolScoreRef = useRef<number | null>(null)
  const flashIdRef = useRef(0)

  const sorted = getSortedGolfers(golfers)
  const top4 = sorted.slice(0, 4)
  const top4Names = new Set(top4.map((g) => g.name))
  const poolScore = top4.reduce((sum, g) => sum + getEffectiveScore(g), 0)

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
        const delta = Math.floor(Math.random() * 5) - 2 // -2 to +2
        const found = next.find((g) => g.name === golfer.name)
        if (found) {
          found.score = Math.max(-15, Math.min(15, found.score + delta))
          found.scoreVersion += 1
        }
      }
      return next
    })
  }, [])

  // Detect rank changes and pool score changes after each update
  useEffect(() => {
    const newSortedNames = sorted.map((g) => g.name)
    const prev = prevSortedNamesRef.current

    // Detect rank changes
    if (prev.length > 0) {
      const newDeltas: Record<string, RankDelta> = {}
      newSortedNames.forEach((name, newIdx) => {
        const prevIdx = prev.indexOf(name)
        if (prevIdx !== -1 && prevIdx !== newIdx) {
          flashIdRef.current += 1
          newDeltas[name] = {
            delta: prevIdx - newIdx, // positive = moved up (improved rank)
            id: flashIdRef.current,
          }
        }
      })
      if (Object.keys(newDeltas).length > 0) {
        setRankDeltas(newDeltas)
        setTimeout(() => setRankDeltas({}), 1800)
      }
    }

    prevSortedNamesRef.current = newSortedNames
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
      intervalRef.current = setInterval(simulateUpdate, 2500)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPlaying, simulateUpdate])

  const handleReset = () => {
    setGolfers(INITIAL_GOLFERS)
    setMissedCutMode(false)
    prevSortedNamesRef.current = []
    setRankDeltas({})
    setPoolScoreFlash(null)
  }

  const handleTogglePlay = () => setIsPlaying((p) => !p)

  const handleMissedCutToggle = () => {
    setMissedCutMode((prev) => {
      const next = !prev
      setGolfers((g) =>
        g.map((golfer, i) => ({
          ...golfer,
          missedCut: next && i >= 4,
          scoreVersion: next && i >= 4 ? golfer.scoreVersion + 1 : golfer.scoreVersion,
        }))
      )
      return next
    })
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Pool Score */}
      <div className="text-center space-y-1.5">
        <span className="text-xs font-semibold text-muted uppercase tracking-wider">
          Your Pool Score
        </span>
        <div className="flex items-center justify-center gap-3">
          <div
            className={cn(
              "font-heading text-6xl font-bold transition-colors duration-300",
              poolScore < 0 ? "text-score-under" : poolScore > 0 ? "text-score-over" : "text-foreground",
              poolScoreFlash === "better" && "animate-[score-pulse-green_0.6s_ease-out]",
              poolScoreFlash === "worse"  && "animate-[score-pulse-red_0.6s_ease-out]",
            )}
          >
            {formatScore(poolScore)}
          </div>
          {poolScoreFlash && (
            <span
              key={String(poolScore)}
              className={cn(
                "text-xl font-bold animate-[fade-slide-up_0.9s_ease-out_forwards]",
                poolScoreFlash === "better" ? "text-success" : "text-danger"
              )}
            >
              {poolScoreFlash === "better" ? "▼" : "▲"}
            </span>
          )}
        </div>
        <p className="text-xs text-muted">Best 4 of 9 scores count · Lower is better</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          onClick={handleTogglePlay}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 cursor-pointer",
            isPlaying
              ? "bg-masters-green text-white hover:bg-masters-green-dark"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          )}
        >
          {isPlaying ? (
            <>
              <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
              Pause
            </>
          ) : (
            <>
              <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              Play
            </>
          )}
        </button>
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 rounded-lg bg-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-300 cursor-pointer"
        >
          <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 0 1 9-9 9 9 0 0 1 6.36 2.64L21 8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 3v5h-5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M21 12a9 9 0 0 1-9 9 9 9 0 0 1-6.36-2.64L3 16" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 21v-5h5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Reset
        </button>
        <button
          onClick={handleMissedCutToggle}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200 cursor-pointer",
            missedCutMode
              ? "bg-score-over text-white hover:bg-red-700"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          )}
        >
          <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
            <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
          </svg>
          Simulate Missed Cut
        </button>
      </div>

      {missedCutMode && (
        <div className="rounded-lg border border-score-over/20 bg-red-50 px-4 py-2.5 text-center text-sm text-score-over">
          Cut score (+{CUT_SCORE}) applied as replacement for missed-cut players
        </div>
      )}

      {/* Animated list — absolute positioning enables smooth reorder */}
      <div className="relative select-none" style={{ height: CONTAINER_HEIGHT }}>
        {/* Cut line — fixed between positions 4 and 5 */}
        <div
          className="absolute left-0 right-0 z-10 flex items-center gap-2 transition-all duration-500"
          style={{ top: CUT_LINE_TOP, height: CUT_LINE_HEIGHT }}
        >
          <div className="h-px flex-1 bg-score-over/35" />
          <span className="shrink-0 rounded bg-score-over/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-score-over">
            Cut Line
          </span>
          <div className="h-px flex-1 bg-score-over/35" />
        </div>

        {sorted.map((golfer, index) => {
          const isCounting = top4Names.has(golfer.name)
          const rankDelta = rankDeltas[golfer.name]

          return (
            <div
              key={golfer.name}
              className={cn(
                "absolute left-0 right-0 flex items-center gap-2 sm:gap-3 rounded-lg px-2.5 sm:px-4",
                "transition-[top] duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]",
                isCounting && !golfer.missedCut
                  ? "bg-masters-green text-white shadow-[0_2px_12px_rgba(2,89,40,0.3)]"
                  : isCounting && golfer.missedCut
                    ? "bg-masters-green/80 text-white"
                    : "bg-gray-100 text-gray-500",
                !isCounting && "opacity-70",
                rankDelta && rankDelta.delta > 0 && "animate-[row-flash-up_0.7s_ease-out]",
                rankDelta && rankDelta.delta < 0 && "animate-[row-flash-down_0.7s_ease-out]",
              )}
              style={{
                top: getTopOffset(index),
                height: ROW_HEIGHT,
              }}
            >
              {/* Rank number */}
              <span
                className={cn(
                  "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  isCounting ? "bg-white/20 text-white" : "bg-gray-200 text-gray-500"
                )}
              >
                {index + 1}
              </span>

              {/* Tier badge */}
              <span
                className={cn(
                  "inline-flex shrink-0 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                  TIER_COLORS[golfer.tier]
                )}
              >
                T{golfer.tier}
              </span>

              {/* Name */}
              <span className="min-w-0 flex-1 truncate text-xs sm:text-sm font-medium">
                {golfer.name}
              </span>

              {/* Rank change badge — fades out after appearing */}
              {rankDelta && (
                <span
                  key={rankDelta.id}
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold animate-[fade-slide-up_1.6s_ease-out_forwards]",
                    rankDelta.delta > 0
                      ? "bg-success/25 text-success"
                      : "bg-danger/20 text-danger"
                  )}
                >
                  {rankDelta.delta > 0
                    ? `▲${rankDelta.delta}`
                    : `▼${Math.abs(rankDelta.delta)}`}
                </span>
              )}

              {/* Score badge — keyed to re-trigger animation */}
              <span
                key={`${golfer.name}-v${golfer.scoreVersion}`}
                className={cn(
                  "shrink-0 rounded-md px-2.5 py-1 text-sm font-bold font-mono tabular-nums",
                  golfer.missedCut
                    ? "bg-gray-300/30 text-gray-400 line-through decoration-1"
                    : isCounting
                      ? "bg-white/15 text-white animate-[pulse-score_0.5s_ease-out]"
                      : "bg-gray-200 text-gray-500 animate-[pulse-score-bench_0.5s_ease-out]",
                )}
              >
                {golfer.missedCut ? "MC" : formatScore(golfer.score)}
              </span>

              {/* MC effective score */}
              {golfer.missedCut && isCounting && (
                <span className="shrink-0 rounded-md bg-white/15 px-2.5 py-1 text-sm font-bold font-mono tabular-nums">
                  +{CUT_SCORE}
                </span>
              )}

              {/* Counting / Bench label */}
              <span
                className={cn(
                  "hidden sm:inline shrink-0 text-[10px] font-semibold uppercase tracking-wider w-14 text-right",
                  isCounting ? "text-white/90" : "text-gray-400"
                )}
              >
                {isCounting ? "Counting" : "Bench"}
              </span>
            </div>
          )
        })}
      </div>

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
        @keyframes score-pulse-green {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.06); filter: drop-shadow(0 0 10px rgba(2,89,40,0.5)); }
          100% { transform: scale(1); }
        }
        @keyframes score-pulse-red {
          0%   { transform: scale(1); }
          40%  { transform: scale(1.06); filter: drop-shadow(0 0 10px rgba(220,38,38,0.4)); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
