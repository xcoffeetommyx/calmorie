// ── Enums / union types ────────────────────────────────────────────────────

export type UnitPreference = 'metric' | 'imperial'

export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'very_active'

export type UserGoal = 'maintain' | 'lose_slow' | 'educate'

export type BiologicalSex = 'male' | 'female' | 'other'

// ── Core model ────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string                  // always 'local-user' (single-user app)
  name?: string
  age: number
  sex: BiologicalSex
  heightCm: number
  weightKg: number
  activityLevel: ActivityLevel
  goal: UserGoal
  calorieTarget: number       // TDEE adjusted for goal
  tdee: number                // total daily energy expenditure (unadjusted)
  onboardingComplete: boolean
  unitPreference?: UnitPreference  // defaults to 'metric' when absent
  createdAt: string           // ISO datetime
  updatedAt: string           // ISO datetime
}

/** Input shape collected during onboarding — no computed fields */
export interface UserProfileInput {
  name?: string
  age: number
  sex: BiologicalSex
  heightCm: number
  weightKg: number
  activityLevel: ActivityLevel
  goal: UserGoal
  unitPreference?: UnitPreference
}

// ── Display labels ─────────────────────────────────────────────────────────

export const ACTIVITY_LEVEL_LABELS: Record<ActivityLevel, string> = {
  sedentary:   'Mostly sitting (desk job, little exercise)',
  light:       'Light activity (1–3 days exercise per week)',
  moderate:    'Moderate activity (3–5 days exercise per week)',
  active:      'Very active (6–7 days hard exercise per week)',
  very_active: 'Extremely active (physical job or twice-daily training)',
}

export const ACTIVITY_LEVEL_SHORT: Record<ActivityLevel, string> = {
  sedentary:   'Sedentary',
  light:       'Lightly active',
  moderate:    'Moderately active',
  active:      'Very active',
  very_active: 'Extremely active',
}

export const GOAL_LABELS: Record<UserGoal, string> = {
  maintain:  'Maintain my current weight',
  lose_slow: 'Lose weight gradually and sustainably',
  educate:   'Just learn about nutrition and habits',
}

export const GOAL_DESCRIPTIONS: Record<UserGoal, string> = {
  maintain:
    'We\'ll calculate your maintenance calories and help you stay balanced.',
  lose_slow:
    'A modest deficit of ~300 kcal/day — sustainable and science-backed.',
  educate:
    'No calorie targets, just learning. You can add tracking later.',
}

/** kcal/day adjustment applied to TDEE based on goal */
export const GOAL_CALORIE_ADJUSTMENTS: Record<UserGoal, number> = {
  maintain:  0,
  lose_slow: -300,
  educate:   0,
}

/** Mifflin-St Jeor activity multipliers */
export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary:   1.2,
  light:       1.375,
  moderate:    1.55,
  active:      1.725,
  very_active: 1.9,
}
