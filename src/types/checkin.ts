// ── Enums / union types ────────────────────────────────────────────────────

/** 1–5 rating scale used for sleep quality and stress level */
export type CheckInRating = 1 | 2 | 3 | 4 | 5

/**
 * Optional focus intention the user sets at the end of a morning check-in.
 * Stored as-is; not used in scoring. 'none' = no particular focus today.
 */
export type DailyFocus =
  | 'regular_meals'
  | 'drink_more_water'
  | 'walk_more'
  | 'sleep_earlier'
  | 'reduce_sugary_drinks'
  | 'none'

// ── Core models ───────────────────────────────────────────────────────────

/** The raw answers collected from the Morning Check-In wizard */
export interface CheckInAnswers {
  sleepQuality: CheckInRating    // 1 = very poor, 5 = excellent
  lateNightEating: boolean       // did you eat after 9 PM last night?
  mealsEaten: number             // how many meals yesterday (1–5)
  skippedMeals: boolean          // did you skip any meals yesterday?
  sugaryDrinks: boolean          // did you have sugary drinks yesterday?
  stressLevel: CheckInRating     // 1 = none, 5 = very high (how you feel right now)
  dailyFocus: DailyFocus         // today's focus intention ('none' = no focus)
}

/** Persisted record after a Morning Check-In is completed and scored */
export interface CheckInRecord {
  id: string                   // 'YYYY-MM-DD' - enforces one per day
  date: string
  answers: CheckInAnswers
  score: number                // 0–100
  tip: string                  // personalised plain-language tip
  habitWarningIds: string[]    // references to triggered HabitWarning IDs
  completedAt: string          // ISO datetime
}

// ── Display helpers ────────────────────────────────────────────────────────

export const SLEEP_QUALITY_LABELS: Record<CheckInRating, string> = {
  1: 'Very poor',
  2: 'Poor',
  3: 'OK',
  4: 'Good',
  5: 'Excellent',
}

export const STRESS_LEVEL_LABELS: Record<CheckInRating, string> = {
  1: 'None',
  2: 'Mild',
  3: 'Moderate',
  4: 'High',
  5: 'Very high',
}

export const DAILY_FOCUS_LABELS: Record<DailyFocus, string> = {
  regular_meals:        'Eat regular meals',
  drink_more_water:     'Drink more water',
  walk_more:            'Walk more today',
  sleep_earlier:        'Sleep earlier tonight',
  reduce_sugary_drinks: 'Reduce sugary drinks',
  none:                 'No particular focus',
}
