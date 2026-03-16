/**
 * src/stores/logStore.ts
 *
 * Zustand store for food log entries.
 *
 * Persistence: IndexedDB via db.foodEntries (Dexie).
 * The localStorage persist middleware has been replaced with explicit
 * IndexedDB write-through. IndexedDB can store far more data than
 * localStorage, so the 14-day pruning cap has been increased to 90 days.
 *
 * The public API (hooks, selectors) is unchanged.
 */

import { create } from 'zustand'
import { db, isDBOpen } from '@/lib/db'
import { generateId, nowISO, todayISO, daysAgo } from '@/lib/utils/date'
import type { FoodEntry, FoodEntryInput } from '@/types/food'

// ── Constants ──────────────────────────────────────────────────────────────

/** Days of history to keep in the in-memory Zustand state.
 *  IndexedDB retains all entries; this cap only affects what's loaded
 *  into memory on hydration. Older entries remain queryable from Dexie. */
const MEMORY_HISTORY_DAYS = 90

// ── Store shape ────────────────────────────────────────────────────────────

interface LogState {
  entries:     FoodEntry[]
  isHydrated:  boolean

  hydrate:         (entries: FoodEntry[]) => void
  addEntry:        (input: FoodEntryInput) => FoodEntry
  removeEntry:     (id: string) => void
  clearAllEntries: () => void
  setHydrated:     () => void
}

// ── Store ──────────────────────────────────────────────────────────────────

export const useLogStore = create<LogState>()((set, get) => ({
  entries:    [],
  isHydrated: false,

  hydrate: (entries) => {
    // On hydration, only load entries within the memory window
    const recent = entries.filter((e) => daysAgo(e.date) <= MEMORY_HISTORY_DAYS)
    set({ entries: recent, isHydrated: true })
  },

  addEntry: (input) => {
    const newEntry: FoodEntry = {
      id:       generateId(),
      date:     todayISO(),
      meal:     input.meal,
      name:     input.name.trim(),
      calories: Math.round(input.calories),
      notes:    input.notes?.trim() || undefined,
      loggedAt: nowISO(),
    }

    set((state) => ({ entries: [...state.entries, newEntry] }))

    if (isDBOpen()) {
      db.foodEntries.put(newEntry).catch((err) =>
        console.warn('[logStore] addEntry write failed:', err)
      )
    }

    return newEntry
  },

  removeEntry: (id) => {
    set((state) => ({
      entries: state.entries.filter((e) => e.id !== id),
    }))
    if (isDBOpen()) {
      db.foodEntries.delete(id).catch((err) =>
        console.warn('[logStore] removeEntry write failed:', err)
      )
    }
  },

  clearAllEntries: () => {
    set({ entries: [] })
    if (isDBOpen()) {
      db.foodEntries.clear().catch((err) =>
        console.warn('[logStore] clearAllEntries write failed:', err)
      )
    }
  },

  setHydrated: () => set({ isHydrated: true }),
}))

// ── Selectors ──────────────────────────────────────────────────────────────

export const selectTodayEntries = (state: LogState): FoodEntry[] => {
  const today = todayISO()
  return state.entries.filter((e) => e.date === today)
}

export const selectTodayTotal = (state: LogState): number =>
  selectTodayEntries(state).reduce((sum, e) => sum + e.calories, 0)

export const selectRecentFoodNames = (
  state: LogState,
  limit = 10
): string[] => {
  const seen   = new Set<string>()
  const result: string[] = []
  for (let i = state.entries.length - 1; i >= 0 && result.length < limit; i--) {
    const name = state.entries[i].name
    if (!seen.has(name)) {
      seen.add(name)
      result.push(name)
    }
  }
  return result
}
