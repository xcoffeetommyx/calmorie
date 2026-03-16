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
