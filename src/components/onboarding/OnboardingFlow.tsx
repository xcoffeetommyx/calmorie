'use client'

/**
 * OnboardingFlow
 *
 * Orchestrates the full onboarding experience:
 *   Step 0 — WelcomeStep   (standalone full-screen, no form)
 *   Step 1 — ProfileStep   (name, age, sex, height, weight)
 *   Step 2 — GoalStep      (activityLevel, goal)
 *   Step 3 — CalorieTargetStep (read-only result, confirm)
 *
 * Architecture:
 *   - `showWelcome` boolean gates the welcome screen vs. the form flow.
 *   - `useOnboarding()` still owns steps 0-2 (the three form steps).
 *   - Progress dots reflect the 3 form steps only (welcome is pre-step).
 *   - Outer AnimatePresence handles welcome ↔ form transition.
 *   - Inner AnimatePresence handles form step transitions (directional slide).
 *
 * Layout fixes vs. original:
 *   - `overflow-x-hidden` replaces `overflow-hidden` on the step wrapper so
 *     the horizontal slide animation is still clipped, but tall form content
 *     (including navigation buttons at the bottom) is never vertically clipped.
 *   - Safe-area padding is correctly applied at both the top and bottom.
 *
 * Swipe support:
 *   - Uses touchstart / touchend (same approach as LessonSwiper) to detect
 *     horizontal swipes for going back.
 *   - Vertical-dominant gestures are ignored (scroll intent).
 *   - Swiping right from form step 0 returns to the welcome screen.
 *   - Swiping right from steps 1-2 goes to the previous form step.
 *   - Forward swipe is NOT triggered (form steps require validation on submit).
 */

import { useState, useRef, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Leaf } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useOnboarding, ONBOARDING_STEP_COUNT } from '@/hooks/useOnboarding'
import { ProfileStep } from './ProfileStep'
import { GoalStep } from './GoalStep'
import { CalorieTargetStep } from './CalorieTargetStep'
import { WelcomeStep } from './WelcomeStep'
import type { UserProfileInput, ActivityLevel, UserGoal, BiologicalSex } from '@/types/user'

// ── Step metadata ──────────────────────────────────────────────────────────

const STEP_META = [
  { heading: 'Tell us about you',            subheading: 'Used only to estimate your calorie needs.' },
  { heading: 'Activity & goal',               subheading: 'Be honest — there are no wrong answers.' },
  { heading: 'Your calorie estimate',         subheading: 'You can adjust this any time in Settings.' },
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

// ── Swipe threshold ────────────────────────────────────────────────────────
// Higher than LessonSwiper (60 vs 40px) to reduce accidental swipes
// on steps with text input interaction.
const SWIPE_THRESHOLD = 60

// ── Component ──────────────────────────────────────────────────────────────

interface OnboardingFlowProps {
  onComplete: () => void
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const {
    step,
    stepCount,
    partialInput,
    goNext,
    goBack,
    onSubmit,
  } = useOnboarding()

  const [direction,    setDirection]    = useState(1)
  const [showWelcome,  setShowWelcome]  = useState(true)

  // ── Swipe detection refs ────────────────────────────────────────────────
  const swipeStartX = useRef<number | null>(null)
  const swipeStartY = useRef<number | null>(null)

  // ── Navigation helpers ──────────────────────────────────────────────────

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

  function handleEnterForm() {
    setDirection(1)
    setShowWelcome(false)
  }

  // ── Swipe handlers ─────────────────────────────────────────────────────

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    swipeStartX.current = e.touches[0].clientX
    swipeStartY.current = e.touches[0].clientY
  }, [])

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (swipeStartX.current === null || swipeStartY.current === null) return

      const dx = e.changedTouches[0].clientX - swipeStartX.current
      const dy = e.changedTouches[0].clientY - swipeStartY.current

      swipeStartX.current = null
      swipeStartY.current = null

      // Vertical-dominant = scroll intent, not a swipe
      if (Math.abs(dy) > Math.abs(dx)) return

      if (dx > SWIPE_THRESHOLD) {
        // Swipe right = go back
        if (step === 0) {
          setDirection(-1)
          setShowWelcome(true)
        } else {
          handleBack()
        }
      }
    },
    [step] // eslint-disable-line react-hooks/exhaustive-deps
  )

  // ── Derived ────────────────────────────────────────────────────────────
  const meta          = STEP_META[step]
  const completeInput = partialInput as UserProfileInput

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <AnimatePresence mode="wait">
      {showWelcome ? (
        /* ── Welcome screen ──────────────────────────────────────── */
        <WelcomeStep key="welcome" onStart={handleEnterForm} />
      ) : (
        /* ── Form flow ───────────────────────────────────────────── */
        <motion.div
          key="form-flow"
          initial={{ opacity: 0, x: '18%' }}
          animate={{
            opacity: 1,
            x: 0,
            transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
          }}
          exit={{
            opacity: 0,
            x: '12%',
            transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] },
          }}
          className="flex flex-col min-h-screen-dynamic bg-background"
        >
          {/* ── Sticky header ──────────────────────────────────────── */}
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

          {/* ── Scrollable content ─────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto">
            <div className="page-container py-6">

              {/* Step heading (not animated — anchors the screen) */}
              <div className="mb-7 space-y-1.5">
                <h1 className="font-display text-[1.75rem] font-semibold text-ink tracking-tight text-balance leading-tight">
                  {meta.heading}
                </h1>
                <p className="font-body text-[0.9375rem] text-ink-secondary leading-[1.65]">
                  {meta.subheading}
                </p>
              </div>

              {/*
               * Animated step content
               *
               * overflow-x-hidden (not overflow-hidden) clips the horizontal slide
               * animation without cutting off tall content below (navigation buttons).
               * touch-action: pan-y allows vertical scroll while enabling horizontal
               * swipe detection via our touch handlers.
               */}
              <div
                className="relative overflow-x-hidden"
                style={{ touchAction: 'pan-y' }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
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
                        onBack={() => { setDirection(-1); setShowWelcome(true) }}
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
        </motion.div>
      )}
    </AnimatePresence>
  )
}
