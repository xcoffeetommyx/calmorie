/**
 * src/hooks/useStreakData.ts
 *
 * Memoized hook for streak statistics derived from the check-in records map.
 *
 * Why this exists instead of a store selector:
 *   A selector that computes streak data (Object.keys + new object) returns a
 *   new reference on every call. Zustand uses reference equality to decide
 *   whether to re-render subscribers — so a new object every call means an
 *   infinite render loop (React production error #185).
 *
 *   Fix: read the raw records map via a stable selector (selectCheckinRecords),
 *   then derive streak data with useMemo. The memo only recomputes when the
 *   records map reference changes (i.e. when a record is actually added).
 */

import { useMemo } from 'react'
import { useCheckinStore, selectCheckinRecords, computeStreaks } from '@/stores/checkinStore'
import type { StreakData } from '@/stores/checkinStore'

export function useStreakData(): StreakData {
  const records = useCheckinStore(selectCheckinRecords)

  return useMemo(
    () => computeStreaks(Object.keys(records)),
    [records]
  )
}
