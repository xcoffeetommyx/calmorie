/**
 * src/hooks/useCheckIn.ts
 *
 * Manages the daily check-in wizard flow.
 *
 * Responsibilities:
 *   – Tracks current step (0-indexed)
 *   – Accumulates partial answers as the user progresses
 *   – On submit: runs scoreEngine + habitEngine, writes to checkinStore
 *   – Returns the completed result (score, tip, warnings) after submission
 *
 * The hook is intentionally unaware of navigation — the page component
 * handles any routing after the wizard completes.
 *
 * Step order (7 questions, one per step):
 *   0 — mealsEaten
 *   1 — skippedMeals
 *   2 — sugaryDrinks
 *   3 — stepsRange
 *   4 — sleepQuality
 *   5 — stressLevel
 *   6 — lateNightEating
 */

import { useState, useCallback } from 'react'
import { useCheckinStore, type CheckInRecordFull } from '@/stores/checkinStore'
import { calculateScore } from '@/lib/engine/scoreEngine'
import { evaluateHabits } from '@/lib/engine/habitEngine'
import { todayISO, nowISO } from '@/lib/utils/date'
import type { CheckInAnswers } from '@/types/checkin'

// ── Step count ─────────────────────────────────────────────────────────────
export const CHECKIN_STEP_COUNT = 7

// ── Partial answers ────────────────────────────────────────────────────────
type PartialAnswers = Partial<CheckInAnswers>

export interface UseCheckInReturn {
  step: number
  stepCount: number
  partialAnswers: PartialAnswers
  canGoBack: boolean
  isLastStep: boolean
  isSubmitted: boolean
  result: CheckInRecordFull | null
  /** Advance to the next step, merging in new partial answers */
  goNext: (answers: PartialAnswers) => void
  /** Go back one step */
  goBack: () => void
  /** Submit the completed check-in. Returns the saved record or null on failure. */
  submit: () => CheckInRecordFull | null
  /** Reset the flow (e.g. after navigating away) */
  reset: () => void
}

export function useCheckIn(): UseCheckInReturn {
  const [step,           setStep]           = useState(0)
  const [partialAnswers, setPartialAnswers] = useState<PartialAnswers>({})
  const [isSubmitted,    setIsSubmitted]    = useState(false)
  const [result,         setResult]         = useState<CheckInRecordFull | null>(null)

  const saveRecord = useCheckinStore((s) => s.saveRecord)

  const canGoBack  = step > 0
  const isLastStep = step === CHECKIN_STEP_COUNT - 1

  const goNext = useCallback((answers: PartialAnswers) => {
    setPartialAnswers((prev) => ({ ...prev, ...answers }))
    setStep((s) => Math.min(s + 1, CHECKIN_STEP_COUNT - 1))
  }, [])

  const goBack = useCallback(() => {
    setStep((s) => Math.max(s - 1, 0))
  }, [])

  const submit = useCallback((): CheckInRecordFull | null => {
    const answers = partialAnswers as CheckInAnswers

    // Guard: all required fields must be present
    if (
      answers.mealsEaten === undefined ||
      answers.sugaryDrinks === undefined ||
      answers.stepsRange === undefined ||
      answers.sleepQuality === undefined ||
      answers.stressLevel === undefined ||
      answers.lateNightEating === undefined ||
      answers.skippedMeals === undefined
    ) {
      console.warn('[useCheckIn] submit called with incomplete answers', partialAnswers)
      return null
    }

    const today = todayISO()
    const { score, tip } = calculateScore(answers)
    const habitWarnings  = evaluateHabits(answers, today)

    const record: CheckInRecordFull = {
      id:             today,
      date:           today,
      answers,
      score,
      tip,
      habitWarnings,
      completedAt:    nowISO(),
    }

    saveRecord(record)
    setResult(record)
    setIsSubmitted(true)
    return record
  }, [partialAnswers, saveRecord])

  const reset = useCallback(() => {
    setStep(0)
    setPartialAnswers({})
    setIsSubmitted(false)
    setResult(null)
  }, [])

  return {
    step,
    stepCount:      CHECKIN_STEP_COUNT,
    partialAnswers,
    canGoBack,
    isLastStep,
    isSubmitted,
    result,
    goNext,
    goBack,
    submit,
    reset,
  }
}
