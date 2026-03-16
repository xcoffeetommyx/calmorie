/**
 * src/hooks/useHabitAlerts.ts
 *
 * Returns today's habit warnings from the check-in store for display
 * on the dashboard.
 *
 * Returns:
 *   topWarning     — the highest-priority warning (null if no check-in today)
 *   allWarnings    — full sorted list of today's warnings
 *   hasWarnings    — true if at least one warning was generated
 *   isCheckedIn    — whether today's check-in has been completed
 *
 * The dashboard uses `topWarning` to show a single alert banner.
 * The check-in result screen shows `allWarnings` in full.
 *
 * This hook is read-only — it never calls the habit engine directly.
 * The engine runs inside useCheckIn.submit() and the results are
 * stored in checkinStore. This hook simply reads them out.
 */

import {
  useCheckinStore,
  selectTodayRecord,
  selectIsCompletedToday,
  selectTopWarning,
} from '@/stores/checkinStore'
import type { HabitWarning } from '@/types/habit'

export interface UseHabitAlertsReturn {
  /** Highest-priority warning from today's check-in, or null */
  topWarning: HabitWarning | null
  /** All warnings from today's check-in, sorted by severity */
  allWarnings: HabitWarning[]
  /** True if any warnings were generated today */
  hasWarnings: boolean
  /** True if today's check-in has been completed */
  isCheckedIn: boolean
}

export function useHabitAlerts(): UseHabitAlertsReturn {
  const todayRecord  = useCheckinStore(selectTodayRecord)
  const isCheckedIn  = useCheckinStore(selectIsCompletedToday)
  const topWarning   = useCheckinStore(selectTopWarning)

  const allWarnings  = todayRecord?.habitWarnings ?? []

  return {
    topWarning,
    allWarnings,
    hasWarnings: allWarnings.length > 0,
    isCheckedIn,
  }
}
