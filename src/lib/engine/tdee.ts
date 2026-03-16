/**
 * src/lib/engine/tdee.ts
 *
 * Calorie target calculation engine.
 *
 * Formula: Mifflin-St Jeor (1990)
 *   Male:   BMR = (10 × weight_kg) + (6.25 × height_cm) − (5 × age) + 5
 *   Female: BMR = (10 × weight_kg) + (6.25 × height_cm) − (5 × age) − 161
 *   Other:  average of male and female estimates
 *
 * Mifflin-St Jeor performs well in comparative studies estimating
 * BMR across a range of body types and is widely used in nutrition practice.
 *
 * TDEE = BMR × activity multiplier (from ACTIVITY_MULTIPLIERS in types/user.ts)
 * Target = TDEE + goal adjustment (from GOAL_CALORIE_ADJUSTMENTS in types/user.ts)
 *
 * Goal adjustment philosophy:
 *   maintain:  ± 0 kcal  — eat at maintenance
 *   lose_slow: −300 kcal — modest, sustainable deficit; supports gradual, consistent progress
 *   educate:   ± 0 kcal  — awareness only, no target applied
 *
 * Floor: target is always >= 1,200 kcal (female) or 1,500 kcal (male/other)
 * to avoid inadvertently recommending unsafe restriction.
 *
 * All functions are pure — no side effects, no global state.
 */

import type {
  UserProfileInput,
  ActivityLevel,
  BiologicalSex,
  UserGoal,
} from '@/types/user'
import {
  ACTIVITY_MULTIPLIERS,
  GOAL_CALORIE_ADJUSTMENTS,
} from '@/types/user'

// ── Minimum safe calorie floors ────────────────────────────────────────────
// These are conservative lower bounds to prevent the formula from producing
// unreasonably low targets for very light users or aggressive goal settings.
const CALORIE_FLOOR: Record<BiologicalSex, number> = {
  female: 1200,
  male:   1500,
  other:  1350,  // midpoint of male/female floors
}

// ── Core formula ───────────────────────────────────────────────────────────

/**
 * Calculates Basal Metabolic Rate using the Mifflin-St Jeor equation.
 * Returns kcal/day rounded to the nearest whole number.
 *
 * @param weightKg  - body weight in kilograms
 * @param heightCm  - height in centimetres
 * @param age       - age in years
 * @param sex       - biological sex (affects the intercept constant)
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  sex: BiologicalSex,
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age

  let bmr: number
  switch (sex) {
    case 'male':
      bmr = base + 5
      break
    case 'female':
      bmr = base - 161
      break
    case 'other':
      // Average the male and female estimates — a reasonable approximation
      // when biological sex as relevant to hormonal metabolism is unknown
      bmr = base + (5 + -161) / 2   // base − 78
      break
  }

  return Math.round(bmr)
}

/**
 * Calculates Total Daily Energy Expenditure (TDEE) by applying the
 * activity multiplier to BMR.
 *
 * TDEE represents estimated total daily calorie burn including all
 * physical activity and the thermic effect of food.
 *
 * @param bmr           - Basal Metabolic Rate in kcal/day
 * @param activityLevel - user's typical activity level
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel])
}

/**
 * Calculates the recommended daily calorie target by applying the
 * goal adjustment to TDEE, then enforcing the safety floor.
 *
 * @param tdee - Total Daily Energy Expenditure in kcal/day
 * @param goal - user's stated goal
 * @param sex  - used to determine the appropriate calorie floor
 */
export function calculateCalorieTarget(
  tdee: number,
  goal: UserGoal,
  sex: BiologicalSex,
): number {
  const adjusted = tdee + GOAL_CALORIE_ADJUSTMENTS[goal]
  const floor    = CALORIE_FLOOR[sex]
  return Math.max(Math.round(adjusted), floor)
}

// ── Convenience composite ──────────────────────────────────────────────────

export interface TDEEResult {
  /** Basal Metabolic Rate — calories at complete rest */
  bmr: number
  /** Total Daily Energy Expenditure — maintenance calories */
  tdee: number
  /** Goal-adjusted daily target (≥ calorie floor) */
  calorieTarget: number
  /** kcal/day adjustment applied by the goal setting */
  adjustment: number
  /** Whether the calorie floor was applied (target was raised) */
  floorApplied: boolean
}

/**
 * Full TDEE calculation from raw profile inputs.
 * Returns all intermediate values for display in the onboarding
 * CalorieTargetStep and for storage in UserProfile.
 *
 * @example
 *   const result = calculateFromProfile({
 *     age: 32, sex: 'female', weightKg: 68,
 *     heightCm: 168, activityLevel: 'moderate', goal: 'lose_slow'
 *   })
 *   // result.bmr         → 1489
 *   // result.tdee        → 2308
 *   // result.calorieTarget → 2008
 */
export function calculateFromProfile(
  input: Pick<UserProfileInput, 'age' | 'sex' | 'weightKg' | 'heightCm' | 'activityLevel' | 'goal'>
): TDEEResult {
  const bmr           = calculateBMR(input.weightKg, input.heightCm, input.age, input.sex)
  const tdee          = calculateTDEE(bmr, input.activityLevel)
  const adjustment    = GOAL_CALORIE_ADJUSTMENTS[input.goal]
  const rawTarget     = tdee + adjustment
  const floor         = CALORIE_FLOOR[input.sex]
  const calorieTarget = Math.max(Math.round(rawTarget), floor)
  const floorApplied  = calorieTarget > rawTarget

  return { bmr, tdee, calorieTarget, adjustment, floorApplied }
}

// ── Plain-language explanation helper ─────────────────────────────────────

/**
 * Returns a human-readable summary of how the target was calculated.
 * Used in CalorieTargetStep to explain the number to the user.
 */
export function explainCalorieTarget(result: TDEEResult, goal: UserGoal): string {
  const { tdee, calorieTarget, adjustment, floorApplied } = result

  if (goal === 'educate') {
    return `Based on your details, your estimated maintenance level is around ${tdee.toLocaleString()} kcal/day. Since your goal is to learn, no specific target has been set — you can use this as a general reference.`
  }

  if (floorApplied) {
    return `Your estimated maintenance level is around ${tdee.toLocaleString()} kcal/day. A minimum of ${calorieTarget.toLocaleString()} kcal has been set to keep the target within a healthy range.`
  }

  if (goal === 'lose_slow') {
    return `Your estimated maintenance level is around ${tdee.toLocaleString()} kcal/day. A modest reduction of ${Math.abs(adjustment)} kcal gives a daily target of ${calorieTarget.toLocaleString()} kcal — a gradual, sustainable approach.`
  }

  // maintain
  return `Based on your details, your estimated maintenance level is around ${tdee.toLocaleString()} kcal/day. This is your daily calorie target.`
}
