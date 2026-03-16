/**
 * src/hooks/useTodayLog.ts
 *
 * Hook for reading today's food log data.
 *
 * Combines logStore entries with the calorie target from useCalorieTarget()
 * to produce a complete daily summary ready for display.
 *
 * Returns:
 *   entries         — all FoodEntry[] for today
 *   byMeal          — entries grouped by MealType
 *   totalCalories   — sum of all entries today
 *   calorieTarget   — daily target (from profile or fallback)
 *   remaining       — calorieTarget - totalCalories (can be negative)
 *   progressRatio   — 0–1 clamp of totalCalories / calorieTarget
 *   isHydrated      — true once both stores have loaded from localStorage
 *   addEntry        — proxy to logStore.addEntry
 *   removeEntry     — proxy to logStore.removeEntry
 */

import { useLogStore, selectTodayEntries } from '@/stores/logStore'
import { useCalorieTarget } from '@/hooks/useCalorieTarget'
import { clamp } from '@/lib/utils/format'
import type { FoodEntry, FoodEntryInput, MealType } from '@/types/food'
import { MEAL_TYPE_ORDER } from '@/types/food'

// ── Default fallback target when no profile exists ─────────────────────────
const FALLBACK_TARGET = 2000

export interface TodayLogResult {
  /** All food entries logged today */
  entries: FoodEntry[]
  /** Entries grouped by meal type */
  byMeal: Record<MealType, FoodEntry[]>
  /** Total kcal logged today */
  totalCalories: number
  /** Daily calorie target (from profile or fallback) */
  calorieTarget: number
  /** kcal remaining until target (can be negative if over) */
  remaining: number
  /** 0–1 clamped ratio of consumed / target */
  progressRatio: number
  /** True when both stores have rehydrated from localStorage */
  isHydrated: boolean
  /** Add a new food entry for today */
  addEntry: (input: FoodEntryInput) => FoodEntry
  /** Remove an entry by id */
  removeEntry: (id: string) => void
}

export function useTodayLog(): TodayLogResult {
  // Log store
  const entries       = useLogStore(selectTodayEntries)
  const logHydrated   = useLogStore((s) => s.isHydrated)
  const addEntry      = useLogStore((s) => s.addEntry)
  const removeEntry   = useLogStore((s) => s.removeEntry)

  // Calorie target from profile
  const { calorieTarget: profileTarget, isHydrated: profileHydrated } = useCalorieTarget()
  const calorieTarget = profileTarget ?? FALLBACK_TARGET

  // Derived values
  const totalCalories = entries.reduce((sum, e) => sum + e.calories, 0)
  const remaining     = calorieTarget - totalCalories
  const progressRatio = clamp(totalCalories / calorieTarget, 0, 1)

  // Group by meal
  const byMeal = MEAL_TYPE_ORDER.reduce<Record<MealType, FoodEntry[]>>(
    (acc, meal) => {
      acc[meal] = entries.filter((e) => e.meal === meal)
      return acc
    },
    { breakfast: [], lunch: [], dinner: [], snack: [] },
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
