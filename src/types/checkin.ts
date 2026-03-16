// ── Enums / union types ────────────────────────────────────────────────────

export type StepsRange = 'under_2k' | '2k_5k' | '5k_10k' | 'over_10k'

/** 1–5 rating scale used for sleep quality and stress level */
export type CheckInRating = 1 | 2 | 3 | 4 | 5

// ── Core models ───────────────────────────────────────────────────────────

/** The raw answers collected from the check-in wizard */
export interface CheckInAnswers {
  mealsEaten: number           // 1–5 meals today
  sugaryDrinks: boolean
  stepsRange: StepsRange
  sleepQuality: CheckInRating  // 1 = poor, 5 = excellent
  stressLevel: CheckInRating   // 1 = none, 5 = very high
  lateNightEating: boolean
  skippedMeals: boolean
}

/** Persisted record after check-in is completed and scored */
export interface CheckInRecord {
  id: string                   // 'YYYY-MM-DD' — enforces one per day
  date: string
  answers: CheckInAnswers
  score: number                // 0–100
  tip: string                  // personalised plain-language tip
  habitWarningIds: string[]    // references to triggered HabitWarning IDs
  completedAt: string          // ISO datetime
}

// ── Display helpers ────────────────────────────────────────────────────────

export const STEPS_RANGE_LABELS: Record<StepsRange, string> = {
  under_2k: 'Under 2,000 steps',
  '2k_5k':  '2,000 – 5,000 steps',
  '5k_10k': '5,000 – 10,000 steps',
  over_10k: 'Over 10,000 steps',
}

export const STEPS_RANGE_ORDER: StepsRange[] = [
  'under_2k',
  '2k_5k',
  '5k_10k',
  'over_10k',
]

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
