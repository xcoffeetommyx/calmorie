/**
 * src/lib/utils/quickAddUtils.ts
 *
 * Utilities for the two-speed quick-add food logging system.
 */

import type { MealType, QuickItem, FoodEntry } from '@/types/food'
import { COMMON_FOODS } from '@/data/commonFoods'

// ── Meal time heuristic ────────────────────────────────────────────────────

/**
 * Returns the most appropriate meal type for the current time of day.
 *   05:00–10:59 → breakfast
 *   11:00–14:59 → lunch
 *   15:00–20:59 → dinner
 *   otherwise   → snack
 */
export function getMealByTimeOfDay(): MealType {
  const hour = new Date().getHours()
  if (hour >= 5  && hour < 11) return 'breakfast'
  if (hour >= 11 && hour < 15) return 'lunch'
  if (hour >= 15 && hour < 21) return 'dinner'
  return 'snack'
}

/**
 * Picks the best default meal for a quick-add item.
 * Prefers the item's own defaultMeal, falls back to time-of-day heuristic.
 */
export function getDefaultMealForItem(item: Pick<QuickItem, 'defaultMeal'>): MealType {
  return item.defaultMeal ?? getMealByTimeOfDay()
}

// ── Time-of-day chip ordering ──────────────────────────────────────────────

export type TimePeriod = 'morning' | 'midday' | 'evening' | 'other'

/**
 * Returns the current time period for chip ordering heuristics.
 *   05:00–10:59 → morning   (breakfast/drinks first)
 *   11:00–14:59 → midday    (lunch/protein/grains first)
 *   15:00–20:59 → evening   (dinner/meals first)
 *   otherwise   → other     (snacks/drinks first)
 */
export function getTimePeriod(): TimePeriod {
  const hour = new Date().getHours()
  if (hour >= 5  && hour < 11) return 'morning'
  if (hour >= 11 && hour < 15) return 'midday'
  if (hour >= 15 && hour < 21) return 'evening'
  return 'other'
}

/**
 * Returns a lower-is-better sort score for a common food chip based on the
 * current time period. Uses defaultMeal as the primary signal, category as
 * secondary. Ties are broken by original array order (stable sort).
 */
export function getTimeOfDayScore(
  defaultMeal: MealType | undefined,
  category:    string | undefined,
  period:      TimePeriod,
): number {
  const meal = defaultMeal
  const cat  = category ?? ''
  switch (period) {
    case 'morning':
      if (meal === 'breakfast' || cat === 'breakfast') return 0
      if (cat === 'drinks')                            return 1
      if (cat === 'dairy'   || cat === 'fruit')        return 2
      if (cat === 'snacks')                            return 3
      return 4
    case 'midday':
      if (meal === 'lunch')                            return 0
      if (cat === 'protein' || cat === 'grains')       return 1
      if (cat === 'meals'   || cat === 'vegetables')   return 2
      if (cat === 'dairy'   || cat === 'fruit')        return 3
      if (cat === 'snacks'  || cat === 'drinks')       return 4
      return 5
    case 'evening':
      if (meal === 'dinner')                           return 0
      if (cat === 'meals'   || cat === 'protein')      return 1
      if (cat === 'grains'  || cat === 'drinks')       return 2
      if (cat === 'vegetables')                        return 3
      if (cat === 'snacks'  || cat === 'dairy')        return 4
      return 5
    case 'other':
      if (meal === 'snack'  || cat === 'snacks')       return 0
      if (cat === 'drinks'  || cat === 'fruit')        return 1
      if (cat === 'dairy')                             return 2
      return 3
  }
}

// ── Name normalisation ─────────────────────────────────────────────────────

/**
 * Normalises a food name for deduplication purposes.
 * Lowercases, collapses whitespace, strips trailing punctuation.
 */
export function normalizeFoodName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, ' ').replace(/[.,;:!?]+$/, '')
}

// ── Recent quick-item builders ─────────────────────────────────────────────

/**
 * Infers the appropriate mode for a recent item by checking whether the food
 * name matches a known common food preset.
 *
 *   Matched preset with explicit mode → use preset's mode
 *   No match (manual / custom entry)  → 'prefill' (user should confirm amount)
 *
 * This prevents manual entries (e.g. "Homemade pasta bake") from being
 * instant-logged with potentially wrong calories on re-tap.
 */
export function inferRecentMode(name: string): 'instant' | 'prefill' {
  const key    = normalizeFoodName(name)
  const preset = COMMON_FOODS.find((f) => normalizeFoodName(f.name) === key)
  return preset?.mode ?? 'prefill'
}

/**
 * Builds a QuickItem from a logged FoodEntry (for the recents list).
 * If `explicitMode` is provided it is used directly; otherwise mode is
 * inferred from the common foods preset lookup (falls back to 'prefill').
 */
export function buildRecentQuickItem(
  entry:        FoodEntry,
  explicitMode?: 'instant' | 'prefill',
): QuickItem {
  return {
    id:          `recent-${normalizeFoodName(entry.name).replace(/\s+/g, '-')}`,
    name:        entry.name,
    calories:    entry.calories,
    defaultMeal: entry.meal,
    mode:        explicitMode ?? inferRecentMode(entry.name),
    source:      'recent',
    lastUsedAt:  entry.loggedAt,
  }
}

/**
 * Merges a new recent item into an existing list.
 * Deduplicates by normalized name (most recent wins), capped at `maxItems`.
 * Returns a new array sorted by lastUsedAt descending.
 */
export function mergeRecentQuickItems(
  existing: QuickItem[],
  incoming: QuickItem,
  maxItems = 10,
): QuickItem[] {
  const incomingKey = normalizeFoodName(incoming.name)
  const filtered    = existing.filter(
    (item) => normalizeFoodName(item.name) !== incomingKey,
  )
  const merged = [incoming, ...filtered]
  return merged
    .sort((a, b) => {
      if (!a.lastUsedAt) return 1
      if (!b.lastUsedAt) return -1
      return b.lastUsedAt.localeCompare(a.lastUsedAt)
    })
    .slice(0, maxItems)
}
