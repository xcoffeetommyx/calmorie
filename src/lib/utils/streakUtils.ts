/**
 * src/lib/utils/streakUtils.ts
 *
 * Pure utilities for streak visualization, milestone tracking, and copy.
 * Sits between raw StreakData (checkinStore) and the UI layer.
 * Components import from here so streak logic stays decoupled from presentation.
 *
 * Non-pure sections (localStorage):
 *   – Milestone "seen" tracking  (bottom, SSR-guarded)
 *   – Grace bridge date tracking (bottom, SSR-guarded)
 */

// ── Flame visual states ────────────────────────────────────────────────────

/**
 * Six intensity states that drive the flame's size, colour, glow, and animation.
 * Thresholds chosen to feel like natural progression rather than arbitrary numbers.
 */
export type FlameState = 'cold' | 'warm' | 'growing' | 'hot' | 'blazing' | 'legendary'

export function getFlameState(streak: number): FlameState {
  if (streak === 0)  return 'cold'
  if (streak <= 2)   return 'warm'
  if (streak <= 6)   return 'growing'
  if (streak <= 13)  return 'hot'
  if (streak <= 29)  return 'blazing'
  return 'legendary'
}

export interface FlameConfig {
  /** Icon size in px */
  size: number
  /** Tailwind class(es) for the SVG stroke colour */
  colorClass: string
  /** 0–1 opacity applied via inline style (keeps Tailwind purger happy) */
  opacity: number
  /** Container background class */
  bgClass: string
  /** CSS filter for the glow, or undefined for no glow */
  glowFilter: string | undefined
  /** Whether the idle breathing loop should run */
  breathingEnabled: boolean
  /** Peak scale during the breathing keyframe (1 → X → 1). Keep ≤ 1.05. */
  breathingScale: number
  /** Duration of one full breathing cycle in seconds */
  breathingDuration: number
}

/**
 * Visual config per flame state.
 * Breathing only plays when `isCheckedIn && !prefersReducedMotion`.
 * Scales and glow are intentionally restrained — subtle motion reads as alive,
 * large motion reads as gamey.
 */
export const FLAME_CONFIGS: Record<FlameState, FlameConfig> = {
  cold: {
    size: 18, colorClass: 'text-ink-muted', opacity: 0.4,
    bgClass: 'bg-surface-raised',
    glowFilter: undefined,
    breathingEnabled: false, breathingScale: 1.0, breathingDuration: 0,
  },
  warm: {
    size: 18, colorClass: 'text-warning', opacity: 0.55,
    bgClass: 'bg-surface-raised',
    glowFilter: undefined,
    breathingEnabled: false, breathingScale: 1.0, breathingDuration: 0,
  },
  growing: {
    size: 20, colorClass: 'text-warning', opacity: 0.80,
    bgClass: 'bg-warning-bg',
    glowFilter: 'drop-shadow(0 0 3px rgba(192, 140, 26, 0.20))',
    breathingEnabled: true, breathingScale: 1.03, breathingDuration: 3.0,
  },
  hot: {
    size: 20, colorClass: 'text-warning', opacity: 1.0,
    bgClass: 'bg-warning-bg',
    glowFilter: 'drop-shadow(0 0 4px rgba(192, 140, 26, 0.32))',
    breathingEnabled: true, breathingScale: 1.04, breathingDuration: 2.8,
  },
  blazing: {
    size: 22, colorClass: 'text-warning', opacity: 1.0,
    bgClass: 'bg-warning-bg',
    glowFilter: 'drop-shadow(0 0 5px rgba(192, 140, 26, 0.42))',
    breathingEnabled: true, breathingScale: 1.04, breathingDuration: 2.5,
  },
  legendary: {
    size: 22, colorClass: 'text-warning', opacity: 1.0,
    bgClass: 'bg-warning-bg',
    glowFilter: 'drop-shadow(0 0 7px rgba(192, 140, 26, 0.50))',
    breathingEnabled: true, breathingScale: 1.05, breathingDuration: 2.5,
  },
}

// ── Milestones ─────────────────────────────────────────────────────────────

/** Full milestone ladder. */
export const STREAK_MILESTONES_DISPLAY = [3, 7, 14, 30, 60, 100] as const
export type StreakMilestone = (typeof STREAK_MILESTONES_DISPLAY)[number]

/** Supportive, non-pressuring celebration copy per milestone. */
export const MILESTONE_MESSAGES: Record<StreakMilestone, string> = {
  3:   "You're building momentum.",
  7:   'One week strong.',
  14:  'This is becoming a habit.',
  30:  'A full month of consistency.',
  60:  'Your routine is holding strong.',
  100: "That's real commitment.",
}

export interface NextMilestoneInfo {
  target: number
  daysLeft: number
}

/**
 * Returns the nearest upcoming milestone and how many days remain.
 * Returns null when all milestones have been passed.
 */
export function getNextMilestone(currentStreak: number): NextMilestoneInfo | null {
  const next = (STREAK_MILESTONES_DISPLAY as readonly number[]).find(m => m > currentStreak)
  if (next === undefined) return null
  return { target: next, daysLeft: next - currentStreak }
}

// ── Milestone "seen" tracking (localStorage) ───────────────────────────────

const SEEN_MILESTONES_KEY = 'calmorie_seen_milestones'

/** Returns the set of milestone values the user has already seen. SSR-safe. */
export function getSeenMilestones(): Set<number> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem(SEEN_MILESTONES_KEY)
    return new Set<number>(raw ? (JSON.parse(raw) as number[]) : [])
  } catch {
    return new Set()
  }
}

/** Persists a milestone as seen. Subsequent renders won't show the celebration. */
export function markMilestoneSeen(milestone: number): void {
  if (typeof window === 'undefined') return
  try {
    const seen = getSeenMilestones()
    seen.add(milestone)
    localStorage.setItem(SEEN_MILESTONES_KEY, JSON.stringify([...seen]))
  } catch {
    // localStorage unavailable — fail silently
  }
}

// ── Grace day tracking (localStorage) ─────────────────────────────────────
//
// Grace stores the MISSED date that was bridged, not the activation date.
// This lets computeStreaks bridge that exact gap in consecutive-day counting
// without inserting phantom records into the check-in store.
//
// Rolling 7-day window: grace restores when >= 7 days have elapsed since
// the day grace was activated (= bridgeDate + 1 day). Equivalently:
//   daysBetween(bridgeDate, today) >= 8

const GRACE_BRIDGE_KEY = 'calmorie_grace_bridge_date'

/** Returns the missed date currently bridged by grace, or null. SSR-safe. */
export function getGraceBridgeDate(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return localStorage.getItem(GRACE_BRIDGE_KEY)
  } catch {
    return null
  }
}

/** Persists the missed date to bridge. Called once when grace first activates. */
export function recordGraceBridge(missedDate: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(GRACE_BRIDGE_KEY, missedDate)
  } catch {
    // fail silently
  }
}

/**
 * Returns true if grace can be used.
 *
 * Model: rolling 7-day window.
 * Grace was activated on (bridgeDate + 1 day); it restores when today is
 * at least 7 days after that activation, i.e. daysBetween(bridgeDate, today) >= 8.
 */
export function isGraceAvailable(bridgeDate: string | null, today: string): boolean {
  if (bridgeDate === null) return true
  const a = new Date(`${bridgeDate}T00:00:00`).getTime()
  const b = new Date(`${today}T00:00:00`).getTime()
  const days = Math.round((b - a) / 86_400_000)
  return days >= 8
}

// ── Streak copy ────────────────────────────────────────────────────────────

const ACTIVE_SUBTEXT = [
  "You're building momentum.",
  'Nice consistency.',
  'This is becoming a habit.',
  'Small habits, real results.',
  'Keep it going.',
] as const

/**
 * Short headline displayed next to the flame icon.
 * Grace day state gets the same headline (streak count is preserved).
 */
export function getStreakHeadline(streak: number, checkedIn: boolean, graceActive: boolean): string {
  if (graceActive || streak > 1)  return `${streak} day streak`
  if (streak === 1 && checkedIn)  return 'Day 1 — good start.'
  if (streak === 1)               return '1 day streak'
  return 'Start fresh today'
}

/**
 * One-line supportive subtext beneath the headline.
 * Designed to be forward-looking and never shaming.
 */
export function getStreakSubtext(streak: number, checkedIn: boolean, graceActive: boolean): string {
  if (graceActive)               return 'Streak protected — check in today to keep it going.'
  if (streak === 0)              return 'A small step today restarts the habit.'
  if (streak === 1 && checkedIn) return 'Check in tomorrow to build your streak.'
  if (!checkedIn)                return 'Check in to keep it going.'
  return ACTIVE_SUBTEXT[(streak - 2) % ACTIVE_SUBTEXT.length]
}

/** Gentle recovery copy shown when streak drops to 0. Rotates by day-of-year. */
export function getRecoveryCopy(): string {
  const options = [
    "Let's build it back today.",
    'A fresh start still counts.',
    'Consistency starts with one check-in.',
    'Every streak starts from one.',
  ]
  const d = new Date()
  const start = new Date(d.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((d.getTime() - start.getTime()) / 86_400_000)
  return options[dayOfYear % options.length]
}
