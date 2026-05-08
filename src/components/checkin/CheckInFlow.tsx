'use client'

/**
 * CheckInFlow
 *
 * Orchestrates the 7-step Morning Check-In wizard and the result screen.
 *
 * Phases:
 *   1. Questions - 7 steps, one per field in CheckInAnswers
 *   2. Result    - CheckInScore screen shown after submission
 *
 * Each question step auto-advances on answer selection. A back button
 * is available from step 1 onward.
 *
 * The step question definitions live in STEPS_CONFIG. Changing the
 * config changes the wizard without touching the hook.
 *
 * Submit timing:
 *   goNext() schedules a React state update. To ensure submit() reads
 *   the fully-merged partialAnswers (including the last answer), we
 *   track a `pendingSubmit` flag. When goNext() advances past the last
 *   step index, the next render detects the flag and calls submit().
 */

import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import { useCheckIn } from '@/hooks/useCheckIn'
import { CheckInStep, type StepOption } from './CheckInStep'
import { CheckInScore } from './CheckInScore'
import type { CheckInAnswers, DailyFocus } from '@/types/checkin'
import { DAILY_FOCUS_LABELS } from '@/types/checkin'

// ── Step configuration ─────────────────────────────────────────────────────

interface StepConfig {
  key: keyof CheckInAnswers
  question: string
  helperText?: string
  type: 'number_select' | 'rating' | 'yes_no' | 'option_select'
  options?: StepOption[]
  ratingAnchors?: { low: string; high: string }
}

// Daily focus options - ordered from most to least actionable.
// 'none' is placed last so it doesn't anchor the default choice.
const DAILY_FOCUS_OPTIONS: StepOption[] = (
  [
    'regular_meals',
    'drink_more_water',
    'walk_more',
    'sleep_earlier',
    'reduce_sugary_drinks',
    'none',
  ] as DailyFocus[]
).map((v) => ({ value: v, label: DAILY_FOCUS_LABELS[v] }))

const STEPS_CONFIG: StepConfig[] = [
  {
    key:           'sleepQuality',
    question:      'How well did you sleep last night?',
    helperText:    'Rate the quality, not just the hours.',
    type:          'rating',
    ratingAnchors: { low: 'Very poor', high: 'Excellent' },
  },
  {
    key:        'lateNightEating',
    question:   'Did you eat after 9 PM last night?',
    helperText: 'Include any snacks or small meals in the two hours before bed.',
    type:       'yes_no',
  },
  {
    key:        'mealsEaten',
    question:   'How many meals did you eat yesterday?',
    helperText: 'Count snacks as meals if they replaced a main meal.',
    type:       'number_select',
  },
  {
    key:        'skippedMeals',
    question:   'Did you skip any meals yesterday?',
    helperText: "A skipped meal is one you intended to have but didn't.",
    type:       'yes_no',
  },
  {
    key:        'sugaryDrinks',
    question:   'Did you have any sugary drinks yesterday?',
    helperText: 'Includes soft drinks, juice, sweetened coffee, or energy drinks.',
    type:       'yes_no',
  },
  {
    key:           'stressLevel',
    question:      'How stressed are you feeling right now?',
    helperText:    'Think about your overall mood and tension level this morning.',
    type:          'rating',
    ratingAnchors: { low: 'None at all', high: 'Very high' },
  },
  {
    key:        'dailyFocus',
    question:   "What's your focus for today?",
    helperText: 'Pick one thing to be intentional about - or skip if nothing stands out.',
    type:       'option_select',
    options:    DAILY_FOCUS_OPTIONS,
  },
]

// ── Component ──────────────────────────────────────────────────────────────

interface CheckInFlowProps {
  onComplete?: () => void
}

export function CheckInFlow({ onComplete }: CheckInFlowProps) {
  const {
    step,
    stepCount,
    isSubmitted,
    result,
    goNext,
    goBack,
    submit,
    canGoBack,
  } = useCheckIn()

  const [direction,     setDirection]     = useState(1)
  const [pendingSubmit, setPendingSubmit] = useState(false)

  /**
   * When pendingSubmit becomes true (set after the last goNext call),
   * useEffect runs after the state flush so partialAnswers is complete.
   */
  useEffect(() => {
    if (pendingSubmit && !isSubmitted) {
      submit()
      setPendingSubmit(false)
    }
  }, [pendingSubmit, isSubmitted, submit])

  function handleAnswer(key: keyof CheckInAnswers, value: string | number | boolean) {
    const isLast = step === stepCount - 1
    setDirection(1)
    goNext({ [key]: value } as Partial<CheckInAnswers>)
    if (isLast) {
      setPendingSubmit(true)
    }
  }

  function handleBack() {
    setDirection(-1)
    goBack()
  }

  const currentConfig = STEPS_CONFIG[step]

  return (
    <div className="w-full">
      {/* ── Progress indicator ────────────────────────────── */}
      {!isSubmitted && (
        <div
          className="mb-5"
          role="progressbar"
          aria-valuenow={step + 1}
          aria-valuemin={1}
          aria-valuemax={stepCount}
          aria-label={`Morning check-in step ${step + 1} of ${stepCount}`}
        >
          <div className="flex gap-1.5 mb-1">
            {Array.from({ length: stepCount }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1.5 flex-1 rounded-full transition-colors duration-normal',
                  i < step ? 'bg-primary' : i === step ? 'bg-primary/50' : 'bg-border',
                )}
                aria-hidden="true"
              />
            ))}
          </div>
          <p className="font-body text-xs text-ink-muted text-right">
            {step + 1} / {stepCount}
          </p>
        </div>
      )}

      {/* ── Step / result ─────────────────────────────────── */}
      <AnimatePresence mode="wait" custom={direction}>
        {!isSubmitted && currentConfig && step < stepCount ? (
          <CheckInStep
            key={`step-${step}`}
            stepIndex={step}
            totalSteps={stepCount}
            question={currentConfig.question}
            helperText={currentConfig.helperText}
            type={currentConfig.type}
            options={currentConfig.options}
            ratingAnchors={currentConfig.ratingAnchors}
            direction={direction}
            onBack={canGoBack ? handleBack : undefined}
            onAnswer={(value) => handleAnswer(currentConfig.key, value)}
          />
        ) : isSubmitted && result ? (
          <CheckInScore
            key="result"
            record={result}
            onDone={onComplete}
            celebrateOnDone
          />
        ) : null}
      </AnimatePresence>
    </div>
  )
}
