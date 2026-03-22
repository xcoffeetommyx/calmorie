/**
 * src/hooks/useStreakData.ts
 *
 * Memoized hook for streak statistics derived from the check-in records map.
 *
 * Why this exists instead of a store selector:
 *   A selector that computes streak data (Object.keys + new object) returns a
 *   new reference on every call → infinite render loop (React error #185).
 *   Fix: read the raw records map via a stable selector, derive with useMemo.
 *
 * Grace day side-effect:
 *   computeStreaks is pure — it cannot write to localStorage itself.
 *   When grace first becomes active for a given missed day, this hook writes
 *   the bridge date once via useEffect, then passes it back into computeStreaks
 *   on the next render. The effect is idempotent: subsequent renders with the
 *   same graceActive/bridgeDate pair are no-ops.
 */

import { useState, useEffect, useMemo } from 'react'
import { useCheckinStore, selectCheckinRecords, computeStreaks } from '@/stores/checkinStore'
import { getGraceBridgeDate, recordGraceBridge } from '@/lib/utils/streakUtils'
import { todayISO } from '@/lib/utils/date'
import type { StreakData } from '@/stores/checkinStore'

/** Returns yesterday's ISO date string. */
function yesterdayISO(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function useStreakData(): StreakData {
  const records = useCheckinStore(selectCheckinRecords)

  // Initialise from localStorage so the bridge persists across page loads.
  const [bridgeDate, setBridgeDate] = useState<string | null>(() => getGraceBridgeDate())

  const streakData = useMemo(
    () => computeStreaks(Object.keys(records), bridgeDate),
    [records, bridgeDate],
  )

  // When grace becomes active for a NEW gap (not already recorded), persist the
  // bridge date so it survives refreshes and carries the streak forward.
  useEffect(() => {
    if (streakData.graceActive) {
      const yesterday = yesterdayISO()
      if (bridgeDate !== yesterday) {
        recordGraceBridge(yesterday)
        setBridgeDate(yesterday)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streakData.graceActive])
  // Intentionally omitting `bridgeDate` from deps: the write is idempotent and
  // including it would cause a second render on the same effect run.

  return streakData
}
