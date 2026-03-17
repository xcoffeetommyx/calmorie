/**
 * src/hooks/useHabitAlerts.ts
 *
 * Returns today's habit warnings from the check-in store.
 *
 * allWarnings is wrapped in useMemo to prevent a new [] being created
 * on every render when todayRecord is null (no check-in today).
 * Previously `todayRecord?.habitWarnings ?? []` created a new empty
 * array on every call, making the reference unstable.
 */

import { useMemo } from 'react'
import {
  useCheckinStore,
  selectTodayRecord,
  selectIsCompletedToday,
  selectTopWarning,
} from '@/stores/checkinStore'
import type { HabitWarning } from '@/types/habit'

export interface UseHabitAlertsReturn {
  topWarning:  HabitWarning | null
  allWarnings: HabitWarning[]
  hasWarnings: boolean
  isCheckedIn: boolean
}

// Stable empty array — reused when there are no warnings.
// Avoids creating a new [] on every render when no check-in exists.
const EMPTY_WARNINGS: HabitWarning[] = []

export function useHabitAlerts(): UseHabitAlertsReturn {
  const todayRecord = useCheckinStore(selectTodayRecord)
  const isCheckedIn = useCheckinStore(selectIsCompletedToday)
  const topWarning  = useCheckinStore(selectTopWarning)

  // When todayRecord is null, return the stable EMPTY_WARNINGS constant.
  // When todayRecord exists, return the same array reference from the record.
  const allWarnings = useMemo(
    () => todayRecord?.habitWarnings ?? EMPTY_WARNINGS,
    [todayRecord]
  )

  return {
    topWarning,
    allWarnings,
    hasWarnings: allWarnings.length > 0,
    isCheckedIn,
  }
}
