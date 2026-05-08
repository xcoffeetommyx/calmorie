/**
 * src/hooks/useCalorieTarget.ts
 *
 * Hook for reading the user's daily calorie target and related values.
 *
 * Returns:
 *   calorieTarget   - the goal-adjusted daily kcal target
 *                     (null if onboarding not complete)
 *   tdee            - maintenance calories before goal adjustment
 *   isOnboarded     - whether a profile exists and is complete
 *   isHydrated      - whether the persisted state has loaded from localStorage
 *
 * Usage:
 *   const { calorieTarget, isOnboarded, isHydrated } = useCalorieTarget()
 *
 *   if (!isHydrated) return <Skeleton />
 *   if (!isOnboarded) return <OnboardingPrompt />
 *
 * Phase 4: this hook will also consume useTodayLog() to return
 * `caloriesRemaining` and `caloriesEaten` from logged entries.
 */

import { useUserStore } from '@/stores/userStore'

export interface CalorieTargetResult {
  /** Goal-adjusted daily kcal target. Null if onboarding not complete. */
  calorieTarget: number | null
  /** Maintenance calories (TDEE) before goal adjustment. */
  tdee: number | null
  /** Whether the user has completed onboarding */
  isOnboarded: boolean
  /** Whether the persisted store has finished loading from localStorage */
  isHydrated: boolean
  /** User's display name, or 'there' if not set */
  displayName: string
}

export function useCalorieTarget(): CalorieTargetResult {
  const profile    = useUserStore((s) => s.profile)
  const isHydrated = useUserStore((s) => s.isHydrated)

  const isOnboarded = profile?.onboardingComplete === true

  return {
    calorieTarget: isOnboarded ? profile!.calorieTarget : null,
    tdee:          isOnboarded ? profile!.tdee          : null,
    isOnboarded,
    isHydrated,
    displayName:   profile?.name?.trim() || 'there',
  }
}
