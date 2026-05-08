// ── Enums / union types ────────────────────────────────────────────────────

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'

// ── Core models ───────────────────────────────────────────────────────────

export interface FoodEntry {
  id: string            // uuid
  date: string          // 'YYYY-MM-DD'
  meal: MealType
  name: string
  calories: number      // kcal, always a positive integer
  notes?: string
  loggedAt: string      // ISO datetime
}

/** Validated form input before ID/timestamp are assigned */
export interface FoodEntryInput {
  meal: MealType
  name: string
  calories: number
  notes?: string
}

/** Quick-add food from the common foods list */
export interface CommonFood {
  id: string
  name: string
  calories: number      // per standard serving
  servingDescription: string
  category?: string
  /** Preferred meal slot for this food. Used as the default when logging. */
  defaultMeal?: MealType
  /**
   * 'instant' - one tap logs immediately (predictable calorie count).
   * 'prefill' - opens form with values pre-filled so user can adjust.
   */
  mode?: 'instant' | 'prefill'
}

/**
 * Unified quick-add item - represents either a common food or a logged recent.
 * Drives both chip display and tap behaviour in the quick-add strip.
 */
export interface QuickItem {
  /** Stable unique key for the chip (e.g. "recent-banana", "cf-banana") */
  id: string
  name: string
  calories: number
  defaultMeal?: MealType
  mode: 'instant' | 'prefill'
  source: 'common' | 'recent'
  /** ISO datetime of most recent log; used for sorting recents */
  lastUsedAt?: string
}

/** Aggregated view for a single day */
export interface DailyLogSummary {
  date: string
  totalCalories: number
  calorieTarget: number
  caloriesRemaining: number
  entries: FoodEntry[]
  byMeal: Record<MealType, FoodEntry[]>
}

// ── Display helpers ────────────────────────────────────────────────────────

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch:     'Lunch',
  dinner:    'Dinner',
  snack:     'Snack',
}

export const MEAL_TYPE_EMOJI: Record<MealType, string> = {
  breakfast: '🌅',
  lunch:     '☀️',
  dinner:    '🌙',
  snack:     '🍎',
}

/** Canonical display order for meal sections */
export const MEAL_TYPE_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']
