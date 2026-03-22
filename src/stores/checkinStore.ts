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
  /** Non-null when the user checks in today at an exact milestone (3/7/14/30/60/100) */
  milestoneReached: number | null
  /** True when the user missed yesterday but their ≥3-day streak is automatically preserved */
  graceActive: boolean
  /** True when the user has an active ≥3-day streak and hasn't burned a grace day today */
  graceAvailable: boolean
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

/**
 * Stable selector — returns the records map reference directly.
 * The reference only changes when a record is added or the store is cleared,
 * not on every render. Use this with useMemo in hooks for derived values.
 *
 * NOTE: selectStreakData was removed because it called Object.keys() and
 * returned a new object on every invocation. Zustand compares selector
 * results by reference, so a new object every render == infinite loop
 * (React production error #185). Derived streak data lives in useStreakData().
 */
export const selectCheckinRecords = (
  state: CheckInState
): Record<string, CheckInRecordFull> => state.records

// ── Streak computation ─────────────────────────────────────────────────────

const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100] as const

/**
 * Derives streak statistics from an array of 'YYYY-MM-DD' check-in dates.
 *
 * @param dates          Array of ISO date strings the user has checked in on.
 * @param graceBridgeDate The missed date currently bridged by grace (from
 *                        localStorage via useStreakData). Pass null if grace
 *                        has never been used or the window has expired.
 *
 * Grace model: rolling 7-day window.
 *   – User missed exactly yesterday AND has a check-in 2 days ago → eligible
 *   – Grace is active when eligible AND (bridgeDate === yesterday OR window open)
 *   – Window open = graceBridgeDate is null OR daysBetween(bridgeDate, today) >= 8
 *   – When grace is active, yesterday is bridged in the consecutive-day count
 *     so the streak is preserved both before AND after checking in today.
 */
export function computeStreaks(
  dates: string[],
  graceBridgeDate: string | null = null,
): StreakData {
  if (dates.length === 0) {
    return {
      currentStreak: 0, bestStreak: 0, weeklyCount: 0,
      milestoneReached: null, graceActive: false, graceAvailable: false,
    }
  }

  const dateSet           = new Set(dates)
  const today             = todayISO()
  const yesterday         = subtractOneDay(today)
  const dayBeforeYesterday = subtractOneDay(yesterday)

  // ── Grace detection ──────────────────────────────────────────────────────
  // Eligible = missed exactly yesterday AND had a meaningful prior streak (≥3).
  // A single stray check-in from 2 days ago does not qualify.
  const priorRun = countConsecutiveBack(dateSet, dayBeforeYesterday)
  const eligibleForGrace = !dateSet.has(yesterday) && priorRun >= 3

  // Rolling-window open = grace was never used, OR used far enough in the past.
  // daysBetween(bridgeDate, today) >= 8 means grace was activated >= 7 days ago.
  const graceWindowOpen = graceBridgeDate === null
    || daysBetween(graceBridgeDate, today) >= 8

  // Grace already bridging this exact gap = bridge was recorded for yesterday.
  const graceAlreadyBridgingThisGap = graceBridgeDate === yesterday

  const graceActive    = eligibleForGrace && (graceAlreadyBridgingThisGap || graceWindowOpen)
  const graceAvailable = graceWindowOpen && !eligibleForGrace

  // ── Streak count with optional bridge ────────────────────────────────────
  // When grace is active, yesterday is treated as present even if missing.
  // This keeps the streak alive before check-in AND correctly counts today
  // (and all future days) once the user checks in.
  const bridgeToday = graceActive ? yesterday : null

  const currentStreak = Math.max(
    countConsecutiveBackWithBridge(dateSet, today, bridgeToday),
    dateSet.has(yesterday) ? countConsecutiveBack(dateSet, yesterday) : 0,
  )

  // Best streak: scan all sorted dates (no grace bridging — reflects real history)
  const bestStreak = computeBestStreak(dates)

  // Weekly count: how many of the last 7 days (today inclusive)
  const weeklyCount = dates.filter((d) => {
    const diff = daysBetween(d, today)
    return diff >= 0 && diff < 7
  }).length

  // Milestone: fires only on the day the user actually checks in at that value.
  const milestoneReached =
    dateSet.has(today) && (STREAK_MILESTONES as readonly number[]).includes(currentStreak)
      ? currentStreak
      : null

  return { currentStreak, bestStreak, weeklyCount, milestoneReached, graceActive, graceAvailable }
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

/**
 * Counts consecutive days ending at startDate, bridging one missing date.
 * The bridge is used at most once and only when the chain reaches that date.
 */
function countConsecutiveBackWithBridge(
  dateSet: Set<string>,
  startDate: string,
  bridgeDate: string | null,
): number {
  let count       = 0
  let d           = startDate
  let bridgeUsed  = false
  while (true) {
    if (dateSet.has(d)) {
      count++
    } else if (!bridgeUsed && bridgeDate !== null && d === bridgeDate) {
      count++
      bridgeUsed = true
    } else {
      break
    }
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
