/**
 * src/stores/checkinStore.ts
 *
 * Zustand store for daily check-in records.
 *
 * Persistence: IndexedDB via db.checkIns (Dexie).
 * The localStorage persist middleware has been replaced with explicit
 * IndexedDB write-through.
 *
 * The public API (hooks, selectors, CheckInRecordFull type) is unchanged.
 */

import { create } from 'zustand'
import { db, isDBOpen } from '@/lib/db'
import { todayISO } from '@/lib/utils/date'
import type { CheckInRecord } from '@/types/checkin'
import type { HabitWarning } from '@/types/habit'

// ── Extended record type ───────────────────────────────────────────────────

export interface CheckInRecordFull extends Omit<CheckInRecord, 'habitWarningIds'> {
  habitWarnings: HabitWarning[]
}

// ── Streak types ───────────────────────────────────────────────────────────

export interface StreakData {
  /** Consecutive check-in days ending at today (or yesterday if not yet done today) */
  currentStreak: number
  /** All-time best consecutive streak */
  bestStreak: number
  /** How many of the last 7 days (including today) had a check-in */
  weeklyCount: number
  /** Non-null when the current streak just hit a milestone (3 / 7 / 14 / 30) */
  milestoneReached: number | null
}

// ── Store shape ────────────────────────────────────────────────────────────

interface CheckInState {
  records:    Record<string, CheckInRecordFull>
  isHydrated: boolean

  hydrate:     (records: CheckInRecordFull[]) => void
  saveRecord:  (record: CheckInRecordFull) => void
  clearAll:    () => void
  setHydrated: () => void
}

// ── Store ──────────────────────────────────────────────────────────────────

export const useCheckinStore = create<CheckInState>()((set) => ({
  records:    {},
  isHydrated: false,

  hydrate: (records) => {
    const map: Record<string, CheckInRecordFull> = {}
    for (const r of records) {
      map[r.date] = r
    }
    set({ records: map, isHydrated: true })
  },

  saveRecord: (record) => {
    set((state) => ({
      records: { ...state.records, [record.date]: record },
    }))
    if (isDBOpen()) {
      db.checkIns.put(record).catch((err) =>
        console.warn('[checkinStore] saveRecord write failed:', err)
      )
    }
  },

  clearAll: () => {
    set({ records: {} })
    if (isDBOpen()) {
      db.checkIns.clear().catch((err) =>
        console.warn('[checkinStore] clearAll failed:', err)
      )
    }
  },

  setHydrated: () => set({ isHydrated: true }),
}))

// ── Selectors ──────────────────────────────────────────────────────────────

export const selectTodayRecord = (
  state: CheckInState
): CheckInRecordFull | null =>
  state.records[todayISO()] ?? null

export const selectIsCompletedToday = (state: CheckInState): boolean =>
  todayISO() in state.records

export const selectTopWarning = (
  state: CheckInState
): HabitWarning | null => {
  const record = state.records[todayISO()]
  return record?.habitWarnings[0] ?? null
}

export const selectStreakData = (state: CheckInState): StreakData => {
  const dates = Object.keys(state.records)
  return computeStreaks(dates)
}

// ── Streak computation ─────────────────────────────────────────────────────

const STREAK_MILESTONES = [3, 7, 14, 30] as const

/**
 * Derives streak statistics from an array of 'YYYY-MM-DD' check-in dates.
 * Pure function — safe to call in any context.
 */
function computeStreaks(dates: string[]): StreakData {
  if (dates.length === 0) {
    return { currentStreak: 0, bestStreak: 0, weeklyCount: 0, milestoneReached: null }
  }

  const dateSet = new Set(dates)
  const today   = todayISO()

  // Current streak: walk backwards from today
  // If today hasn't been checked yet, the streak is alive from yesterday
  const streakFromToday     = countConsecutiveBack(dateSet, today)
  const yesterday           = subtractOneDay(today)
  const streakFromYesterday = dateSet.has(yesterday)
    ? countConsecutiveBack(dateSet, yesterday)
    : 0
  const currentStreak = Math.max(streakFromToday, streakFromYesterday)

  // Best streak: scan all sorted dates
  const bestStreak = computeBestStreak(dates)

  // Weekly count: how many of the last 7 days (today inclusive)
  const weeklyCount = dates.filter((d) => {
    const diff = daysBetween(d, today)
    return diff >= 0 && diff < 7
  }).length

  // Milestone: only when streak is at an exact milestone value
  const milestoneReached =
    (STREAK_MILESTONES as readonly number[]).includes(currentStreak)
      ? currentStreak
      : null

  return { currentStreak, bestStreak, weeklyCount, milestoneReached }
}

/** Counts consecutive days ending at (and including) startDate. */
function countConsecutiveBack(dateSet: Set<string>, startDate: string): number {
  let count = 0
  let d     = startDate
  while (dateSet.has(d)) {
    count++
    d = subtractOneDay(d)
  }
  return count
}

/** Returns the all-time best consecutive-day streak from a list of dates. */
function computeBestStreak(dates: string[]): number {
  if (dates.length === 0) return 0
  const sorted = [...dates].sort()
  let best = 1
  let run  = 1
  for (let i = 1; i < sorted.length; i++) {
    if (subtractOneDay(sorted[i]) === sorted[i - 1]) {
      run++
      if (run > best) best = run
    } else {
      run = 1
    }
  }
  return best
}

/** Returns the ISO date string for one day before the given date. */
function subtractOneDay(dateISO: string): string {
  const d = new Date(`${dateISO}T00:00:00`)
  d.setDate(d.getDate() - 1)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Returns the number of days from dateA to dateB (positive if B is after A). */
function daysBetween(dateA: string, dateB: string): number {
  const a = new Date(`${dateA}T00:00:00`).getTime()
  const b = new Date(`${dateB}T00:00:00`).getTime()
  return Math.round((b - a) / 86_400_000)
}
