/**
 * src/hooks/useOnboarding.ts
 *
 * Manages the multi-step onboarding flow state.
 *
 * Responsibilities:
 *   – Tracks the current step index (0-based)
 *   – Accumulates partial answers across steps
 *   – On submit: runs TDEE calculation, builds a UserProfile, saves to store
 *   – Provides `goNext`, `goBack`, `canGoBack` navigation helpers
 *
 * Step order (matches OnboardingFlow.tsx component order):
 *   0 — ProfileStep  (name, age, sex, height, weight)
 *   1 — GoalStep     (activityLevel, goal)
 *   2 — CalorieTargetStep (read-only result, confirm)
 *
 * The hook does NOT own navigation (router.push) — the page component
 * calls router.push('/dashboard') after onSubmit resolves.
 */

import { useState, useCallback } from 'react'
import { useUserStore } from '@/stores/userStore'
import { calculateFromProfile } from '@/lib/engine/tdee'
import { nowISO } from '@/lib/utils/date'
import type { UserProfileInput, UserProfile } from '@/types/user'

// ── Step count ─────────────────────────────────────────────────────────────
export const ONBOARDING_STEP_COUNT = 3

// ── Partial input accumulated across steps ─────────────────────────────────
// Only the fields collected in steps 0 and 1 are needed; step 2 is read-only.
type PartialInput = Partial<UserProfileInput>

export interface UseOnboardingReturn {
  /** Current step index, 0-based */
  step: number
  /** Total number of steps */
  stepCount: number
  /** Accumulated form data across steps */
  partialInput: PartialInput
  /** Whether there is a previous step to go back to */
  canGoBack: boolean
  /** Whether this is the last step (CalorieTargetStep) */
  isLastStep: boolean
  /** Move to the next step, merging in new partial data */
  goNext: (data: PartialInput) => void
  /** Move to the previous step */
  goBack: () => void
  /**
   * Submit the final onboarding. Calculates TDEE, writes UserProfile to store.
   * Call this from CalorieTargetStep when the user taps "Start tracking".
   * Returns true on success, false if required fields are missing.
   */
  onSubmit: () => boolean
}

export function useOnboarding(): UseOnboardingReturn {
  const [step, setStep]               = useState(0)
  const [partialInput, setPartialInput] = useState<PartialInput>({})
  const setProfile                    = useUserStore((s) => s.setProfile)

  const canGoBack  = step > 0
  const isLastStep = step === ONBOARDING_STEP_COUNT - 1

  const goNext = useCallback((data: PartialInput) => {
    setPartialInput((prev) => ({ ...prev, ...data }))
    setStep((s) => Math.min(s + 1, ONBOARDING_STEP_COUNT - 1))
  }, [])

  const goBack = useCallback(() => {
    setStep((s) => Math.max(s - 1, 0))
  }, [])

  const onSubmit = useCallback((): boolean => {
    // Validate that required fields are present before calculating
    const input = partialInput as UserProfileInput
    if (
      !input.age ||
      !input.sex ||
      !input.heightCm ||
      !input.weightKg ||
      !input.activityLevel ||
      !input.goal
    ) {
      // Should not reach here if steps validate correctly; guard defensively
      console.warn('[useOnboarding] onSubmit called with incomplete input', partialInput)
      return false
    }

    const { tdee, calorieTarget } = calculateFromProfile(input)
    const now = nowISO()

    const profile: UserProfile = {
      id:                 'local-user',
      name:               input.name?.trim() || undefined,
      age:                input.age,
      sex:                input.sex,
      heightCm:           input.heightCm,
      weightKg:           input.weightKg,
      activityLevel:      input.activityLevel,
      goal:               input.goal,
      tdee,
      calorieTarget,
      onboardingComplete: true,
      createdAt:          now,
      updatedAt:          now,
    }

    setProfile(profile)
    return true
  }, [partialInput, setProfile])

  return {
    step,
    stepCount:    ONBOARDING_STEP_COUNT,
    partialInput,
    canGoBack,
    isLastStep,
    goNext,
    goBack,
    onSubmit,
  }
}
