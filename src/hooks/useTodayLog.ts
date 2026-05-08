/**
 * src/hooks/useTodayLog.ts
 *
 * Hook for reading today's food log data with safe derived values.
 *
 * Key design: all derived arrays/objects are computed with useMemo so
 * they only produce new references when their inputs actually change,
 * not on every render. Previously the derived values were computed
 * inline (no memo), which meant new array references on every render,
 * which Zustand treated as "state changed", triggering another render,
 * causing an infinite loop (React production error #185).
 */

import { useMemo } from 'react'
import { useLogStore, selectEntries, selectLogHydrated } from '@/stores/logStore'
import { useCalorieTarget } from '@/hooks/useCalorieTarget'
import { clamp } from '@/lib/utils/format'
import { todayISO } from '@/lib/utils/date'
import type { FoodEntry, FoodEntryInput, MealType } from '@/types/food'
import { MEAL_TYPE_ORDER } from '@/types/food'

const FALLBACK_TARGET = 2000

export interface TodayLogResult {
  entries:       FoodEntry[]
  byMeal:        Record<MealType, FoodEntry[]>
  totalCalories: number
  calorieTarget: number
  remaining:     number
  progressRatio: number
  isHydrated:    boolean
  addEntry:      (input: FoodEntryInput) => FoodEntry
  removeEntry:   (id: string) => void
}

export function useTodayLog(): TodayLogResult {
  // Read raw stable state - these selectors return primitives or the
  // direct state reference, never newly-allocated arrays.
  const allEntries  = useLogStore(selectEntries)
  const logHydrated = useLogStore(selectLogHydrated)
  const addEntry    = useLogStore((s) => s.addEntry)
  const removeEntry = useLogStore((s) => s.removeEntry)

  const { calorieTarget: profileTarget, isHydrated: profileHydrated } = useCalorieTarget()
  const calorieTarget = profileTarget ?? FALLBACK_TARGET

  // Filter to today - memoized so the result array reference is stable
  // between renders unless allEntries actually changes.
  const today = todayISO()
  const entries = useMemo(
    () => allEntries.filter((e) => e.date === today),
    [allEntries, today]
  )

  // Derived scalar - cheap, no allocation
  const totalCalories = useMemo(
    () => entries.reduce((sum, e) => sum + e.calories, 0),
    [entries]
  )

  const remaining     = calorieTarget - totalCalories
  const progressRatio = clamp(totalCalories / calorieTarget, 0, 1)

  // Group by meal - memoized to avoid new object literal on every render
  const byMeal = useMemo(
    () =>
      MEAL_TYPE_ORDER.reduce<Record<MealType, FoodEntry[]>>(
        (acc, meal) => {
          acc[meal] = entries.filter((e) => e.meal === meal)
          return acc
        },
        { breakfast: [], lunch: [], dinner: [], snack: [] }
      ),
    [entries]
  )

  return {
    entries,
    byMeal,
    totalCalories,
    calorieTarget,
    remaining,
    progressRatio,
    isHydrated: logHydrated && profileHydrated,
    addEntry,
    removeEntry,
  }
}
