'use client'

/**
 * CheckInFlow
 *
 * Orchestrates the 7-step daily check-in wizard and the result screen.
 *
 * Phases:
 *   1. Questions — 7 steps, one per field in CheckInAnswers
 *   2. Result    — CheckInScore screen shown after submission
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
 *   This avoids the async state flush problem cleanly.
 *
 * Props:
 *   onComplete — called after user taps "Back to dashboard"
 */

import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import { useCheckIn } from '@/hooks/useCheckIn'
import { CheckInStep, type StepOption } from './CheckInStep'
import { CheckInScore } from './CheckInScore'
import type { CheckInAnswers } from '@/types/checkin'
import { STEPS_RANGE_LABELS, STEPS_RANGE_ORDER } from '@/types/checkin'

// ── Step configuration ─────────────────────────────────────────────────────

interface StepConfig {
  key: keyof CheckInAnswers
  question: string
  helperText?: string
  type: 'number_select' | 'rating' | 'yes_no' | 'option_select'
  options?: StepOption[]
  ratingAnchors?: { low: string; high: string }
}

const STEPS_CONFIG: StepConfig[] = [
  {
    key:        'mealsEaten',
    question:   'How many meals did you eat today?',
    helperText: 'Count snacks as meals if they replaced a main meal.',
    type:       'number_select',
  },
  {
    key:        'skippedMeals',
    question:   'Did you skip any meals today?',
    helperText: "A skipped meal is one you intended to have but didn't.",
    type:       'yes_no',
  },
  {
    key:        'sugaryDrinks',
    question:   'Did you have any sugary drinks today?',
    helperText: 'Includes soft drinks, juice, sweetened coffee, or energy drinks.',
    type:       'yes_no',
  },
  {
    key:        'stepsRange',
    question:   'How active were you today?',
    helperText: 'Give your best estimate — no device needed.',
    type:       'option_select',
    options:    STEPS_RANGE_ORDER.map((v) => ({
      value: v,
      label: STEPS_RANGE_LABELS[v],
    })),
  },
  {
    key:           'sleepQuality',
    question:      'How well did you sleep last night?',
    helperText:    'Rate the quality, not just the hours.',
    type:          'rating',
    ratingAnchors: { low: 'Very poor', high: 'Excellent' },
  },
  {
    key:           'stressLevel',
    question:      'How stressed are you feeling today?',
    helperText:    'Think about your overall mood and tension level.',
    type:          'rating',
    ratingAnchors: { low: 'None at all', high: 'Very high' },
  },
  {
    key:        'lateNightEating',
    question:   'Did you eat after 9 PM last night?',
    helperText: 'Include any snacks or meals in the two hours before bed.',
    type:       'yes_no',
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

  const [direction,      setDirection]      = useState(1)
  const [pendingSubmit,  setPendingSubmit]  = useState(false)

  /**
   * When pendingSubmit becomes true (set after the last goNext call),
   * useEffect runs after the state flush so partialAnswers is complete.
   * We call submit() here and clear the flag.
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
      // Schedule submit for after state flush
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
          aria-label={`Check-in step ${step + 1} of ${stepCount}`}
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
          />
        ) : null}
      </AnimatePresence>
    </div>
  )
}
