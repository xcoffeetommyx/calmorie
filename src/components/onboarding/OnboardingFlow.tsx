'use client'

/**
 * OnboardingFlow
 *
 * Orchestrates the three-step onboarding wizard.
 * Uses useOnboarding() hook for step state management.
 *
 * Layout:
 *   – Sticky header: brand mark + step progress dots
 *   – Scrollable body: per-step heading + component
 *
 * Step transitions use AnimatePresence with a custom directional
 * slide so forward/back feel spatially consistent.
 *
 * Props:
 *   onComplete — called after the user confirms on step 3;
 *                the parent page handles router navigation.
 */

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Leaf } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useOnboarding, ONBOARDING_STEP_COUNT } from '@/hooks/useOnboarding'
import { ProfileStep } from './ProfileStep'
import { GoalStep } from './GoalStep'
import { CalorieTargetStep } from './CalorieTargetStep'
import type { UserProfileInput, ActivityLevel, UserGoal, BiologicalSex } from '@/types/user'

// ── Step metadata ──────────────────────────────────────────────────────────

const STEP_META = [
  { heading: 'Tell us a little about you',       subheading: 'Used only to estimate your calorie needs.' },
  { heading: 'Your activity and goal',            subheading: 'Be honest — there are no wrong answers.' },
  { heading: 'Your estimated calorie target',     subheading: 'You can adjust this any time in Settings.' },
] as const

// ── Slide variants (directional) ───────────────────────────────────────────

const stepVariants = {
  enter: (dir: number) => ({
    x: dir >= 0 ? '100%' : '-100%',
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (dir: number) => ({
    x: dir >= 0 ? '-40%' : '40%',
    opacity: 0,
    transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] },
  }),
}

// ── Component ──────────────────────────────────────────────────────────────

interface OnboardingFlowProps {
  onComplete: () => void
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const {
    step,
    stepCount,
    partialInput,
    canGoBack,
    isLastStep,
    goNext,
    goBack,
    onSubmit,
  } = useOnboarding()

  // Track direction for the slide animation
  const [direction, setDirection] = useState(1)

  function handleNext(data: Partial<UserProfileInput>) {
    setDirection(1)
    goNext(data)
  }

  function handleBack() {
    setDirection(-1)
    goBack()
  }

  function handleSubmit() {
    const success = onSubmit()
    if (success) onComplete()
  }

  const meta = STEP_META[step]

  // Build the typed complete input for CalorieTargetStep
  const completeInput = partialInput as UserProfileInput

  return (
    <div className="flex flex-col min-h-screen-dynamic bg-background">

      {/* ── Sticky header ──────────────────────────────────── */}
      <header
        className={cn(
          'sticky top-0 z-10',
          'pt-[env(safe-area-inset-top,0px)]',
          'bg-background/95 backdrop-blur-ios border-b border-border',
          'px-5',
        )}
      >
        {/* Brand row */}
        <div className="h-[var(--top-bar-height)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <Leaf className="w-3.5 h-3.5 text-white" strokeWidth={2.25} aria-hidden="true" />
            </div>
            <span className="font-display text-[15px] font-semibold text-primary tracking-tight">
              Calmorie
            </span>
          </div>

          {/* Step counter */}
          <span className="font-body text-xs text-ink-muted" aria-live="polite">
            Step {step + 1} of {stepCount}
          </span>
        </div>

        {/* Progress dots */}
        <div
          className="flex gap-1.5 pb-3 justify-center"
          role="progressbar"
          aria-valuenow={step + 1}
          aria-valuemin={1}
          aria-valuemax={stepCount}
          aria-label={`Onboarding step ${step + 1} of ${stepCount}`}
        >
          {Array.from({ length: ONBOARDING_STEP_COUNT }).map((_, i) => (
            <motion.div
              key={i}
              className={cn('h-1.5 rounded-full')}
              animate={{
                width: i === step ? '24px' : '6px',
                backgroundColor:
                  i <= step
                    ? 'var(--color-primary)'
                    : 'var(--color-border)',
              }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              aria-hidden="true"
            />
          ))}
        </div>
      </header>

      {/* ── Scrollable content ─────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="page-container py-6">

          {/* Step heading (not animated — anchors the screen) */}
          <div className="mb-6 space-y-1">
            <h1 className="font-display text-2xl font-semibold text-ink tracking-tight text-balance">
              {meta.heading}
            </h1>
            <p className="font-body text-sm text-ink-secondary">
              {meta.subheading}
            </p>
          </div>

          {/* Animated step content */}
          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                {step === 0 && (
                  <ProfileStep
                    defaultValues={{
                      name:     partialInput.name,
                      age:      partialInput.age,
                      sex:      partialInput.sex as BiologicalSex | undefined,
                      heightCm: partialInput.heightCm,
                      weightKg: partialInput.weightKg,
                    }}
                    onNext={(data) => handleNext(data)}
                  />
                )}

                {step === 1 && (
                  <GoalStep
                    defaultValues={{
                      activityLevel: partialInput.activityLevel as ActivityLevel | undefined,
                      goal:          partialInput.goal as UserGoal | undefined,
                    }}
                    onNext={(data) => handleNext(data)}
                    onBack={handleBack}
                  />
                )}

                {step === 2 && (
                  <CalorieTargetStep
                    profileInput={completeInput}
                    onSubmit={handleSubmit}
                    onBack={handleBack}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Safe-area bottom spacer */}
        <div
          className="h-[env(safe-area-inset-bottom,0px)]"
          aria-hidden="true"
        />
      </div>
    </div>
  )
}
