'use client'

import { useState, useRef, useCallback } from 'react'
import type { TouchEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AppLogo } from '@/components/layout/AppLogo'
import { cn } from '@/lib/utils/cn'
import { useOnboarding, ONBOARDING_STEP_COUNT } from '@/hooks/useOnboarding'
import { FocusStep } from './FocusStep'
import { ProfileStep } from './ProfileStep'
import { GoalStep } from './GoalStep'
import { CalorieTargetStep } from './CalorieTargetStep'
import { WelcomeStep } from './WelcomeStep'
import type {
  ActivityLevel,
  BiologicalSex,
  OnboardingFocus,
  UnitPreference,
  UserGoal,
  UserProfileInput,
} from '@/types/user'

const STEP_META = [
  {
    heading: 'What brings you here?',
    subheading: 'Pick the reason that feels closest. Calmorie will keep the rest simple.',
  },
  {
    heading: 'A few basics',
    subheading: 'Used only to estimate your calorie needs. Your data stays on this device.',
  },
  {
    heading: 'Activity & goal',
    subheading: 'Choose your normal week, not your perfect week.',
  },
  {
    heading: 'Your first day is ready',
    subheading: 'Here is your starting estimate and the first easy action to take.',
  },
] as const

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

const SWIPE_THRESHOLD = 60

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

  const [direction, setDirection] = useState(1)
  const [showWelcome, setShowWelcome] = useState(true)
  const swipeStartX = useRef<number | null>(null)
  const swipeStartY = useRef<number | null>(null)

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

  const handleTouchStart = useCallback((e: TouchEvent) => {
    swipeStartX.current = e.touches[0].clientX
    swipeStartY.current = e.touches[0].clientY
  }, [])

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (swipeStartX.current === null || swipeStartY.current === null) return

      const dx = e.changedTouches[0].clientX - swipeStartX.current
      const dy = e.changedTouches[0].clientY - swipeStartY.current

      swipeStartX.current = null
      swipeStartY.current = null

      if (Math.abs(dy) > Math.abs(dx)) return

      if (dx > SWIPE_THRESHOLD) {
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

  const meta = STEP_META[step]
  const completeInput = partialInput as UserProfileInput

  return (
    <AnimatePresence mode="wait">
      {showWelcome ? (
        <WelcomeStep
          key="welcome"
          onStart={() => {
            setDirection(1)
            setShowWelcome(false)
          }}
        />
      ) : (
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
          className="flex min-h-screen-dynamic flex-col bg-background"
        >
          <header
            className={cn(
              'sticky top-0 z-10',
              'pt-[env(safe-area-inset-top,0px)]',
              'border-b border-border bg-background/95 px-5 backdrop-blur-ios',
            )}
          >
            <div className="flex h-[var(--top-bar-height)] items-center justify-between">
              <div className="flex items-center gap-2">
                <AppLogo size={24} className="rounded-md" />
                <span className="font-display text-[15px] font-semibold tracking-tight text-primary">
                  Calmorie
                </span>
              </div>

              <span className="font-body text-xs text-ink-muted" aria-live="polite">
                Step {step + 1} of {stepCount}
              </span>
            </div>

            <div
              className="flex justify-center gap-1.5 pb-3"
              role="progressbar"
              aria-valuenow={step + 1}
              aria-valuemin={1}
              aria-valuemax={stepCount}
              aria-label={`Onboarding step ${step + 1} of ${stepCount}`}
            >
              {Array.from({ length: ONBOARDING_STEP_COUNT }).map((_, i) => (
                <motion.div
                  key={i}
                  className="h-1.5 rounded-full"
                  animate={{
                    width: i === step ? '24px' : '6px',
                    backgroundColor:
                      i <= step ? 'var(--color-primary)' : 'var(--color-border)',
                  }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  aria-hidden="true"
                />
              ))}
            </div>
          </header>

          <div className="flex-1 overflow-y-auto">
            <div className="page-container py-6">
              <div className="mb-7 space-y-1.5">
                <h1 className="font-display text-[1.75rem] font-semibold leading-tight tracking-tight text-ink text-balance">
                  {meta.heading}
                </h1>
                <p className="font-body text-[0.9375rem] leading-[1.65] text-ink-secondary">
                  {meta.subheading}
                </p>
              </div>

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
                      <FocusStep
                        defaultValue={partialInput.onboardingFocus as OnboardingFocus | undefined}
                        onNext={handleNext}
                        onBack={() => {
                          setDirection(-1)
                          setShowWelcome(true)
                        }}
                      />
                    )}

                    {step === 1 && (
                      <ProfileStep
                        defaultValues={{
                          name: partialInput.name,
                          age: partialInput.age,
                          sex: partialInput.sex as BiologicalSex | undefined,
                          heightCm: partialInput.heightCm,
                          weightKg: partialInput.weightKg,
                          unitPreference: partialInput.unitPreference as UnitPreference | undefined,
                        }}
                        onNext={handleNext}
                        onBack={handleBack}
                      />
                    )}

                    {step === 2 && (
                      <GoalStep
                        defaultValues={{
                          activityLevel: partialInput.activityLevel as ActivityLevel | undefined,
                          goal: partialInput.goal as UserGoal | undefined,
                        }}
                        onNext={handleNext}
                        onBack={handleBack}
                      />
                    )}

                    {step === 3 && (
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

            <div className="h-[env(safe-area-inset-bottom,0px)]" aria-hidden="true" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
