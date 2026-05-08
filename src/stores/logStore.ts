/**
 * src/stores/logStore.ts
 *
 * Zustand store for food log entries.
 *
 * Persistence: IndexedDB via db.foodEntries (Dexie).
 *
 * SELECTOR SAFETY NOTE:
 * selectTodayEntries and selectRecentFoodNames previously returned newly
 * allocated arrays on every call. Zustand re-renders the subscribing
 * component whenever the selector return value changes - and since array
 * equality in JS is by reference, a new [] !== [] on every render.
 * This caused an infinite render loop (React production error #185).
 *
 * Fix: export ONLY primitive/stable selectors from this file.
 * All derived array/object computations (filtering, grouping, deduplication)
 * are done with useMemo inside the hooks/components that consume raw entries.
 */

import { create } from 'zustand'
import { db, isDBOpen } from '@/lib/db'
import { generateId, nowISO, todayISO, daysAgo } from '@/lib/utils/date'
import type { FoodEntry, FoodEntryInput } from '@/types/food'

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

// ── Stable selectors (primitives / reference only) ────────────────────────
// These selectors return stable scalar values or the direct state reference,
// NOT newly-allocated arrays/objects. Safe to pass to useStore(selector).

/** Returns the raw entries array reference from the store */
export const selectEntries = (state: LogState): FoodEntry[] => state.entries

/** Returns whether the store has hydrated */
export const selectLogHydrated = (state: LogState): boolean => state.isHydrated

// NOTE: selectTodayEntries and selectRecentFoodNames have been REMOVED.
// They returned a new array instance on every call, which Zustand treats
// as "state changed" and triggers a re-render - causing an infinite loop.
// Derived values are now computed with useMemo in useTodayLog().
