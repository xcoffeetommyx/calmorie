'use client'

import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Brain, CheckCircle2, ChevronLeft, Flame, HeartPulse } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { staggerContainer, staggerItem } from '@/lib/animations/variants'
import {
  type OnboardingFocus,
  ONBOARDING_FOCUS_DESCRIPTIONS,
  ONBOARDING_FOCUS_LABELS,
} from '@/types/user'

const FOCUS_OPTIONS: Array<{
  value: OnboardingFocus
  icon: ReactNode
}> = [
  {
    value: 'lose_weight',
    icon: <HeartPulse className="h-5 w-5" strokeWidth={2} aria-hidden="true" />,
  },
  {
    value: 'understand_calories',
    icon: <Brain className="h-5 w-5" strokeWidth={2} aria-hidden="true" />,
  },
  {
    value: 'build_consistency',
    icon: <Flame className="h-5 w-5" strokeWidth={2} aria-hidden="true" />,
  },
  {
    value: 'improve_habits',
    icon: <BarChart3 className="h-5 w-5" strokeWidth={2} aria-hidden="true" />,
  },
]

interface FocusStepProps {
  defaultValue?: OnboardingFocus
  onNext: (data: { onboardingFocus: OnboardingFocus }) => void
  onBack: () => void
}

export function FocusStep({ defaultValue, onNext, onBack }: FocusStepProps) {
  const [focus, setFocus] = useState<OnboardingFocus | null>(defaultValue ?? null)
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    if (!focus) return
    onNext({ onboardingFocus: focus })
  }

  return (
    <motion.form
      variants={staggerContainer}
      initial="initial"
      animate="enter"
      onSubmit={handleSubmit}
      className="space-y-4"
      noValidate
    >
      <motion.div
        variants={staggerItem}
        className="rounded-xl border border-primary-mid bg-primary-light px-4 py-4"
      >
        <p className="font-body text-sm font-semibold text-primary-text">
          We will use this to shape your first few prompts.
        </p>
        <p className="mt-1 font-body text-xs leading-relaxed text-primary-text/70">
          It does not change your calorie math. It just helps Calmorie guide you in a way that feels relevant.
        </p>
      </motion.div>

      <motion.div variants={staggerItem} className="space-y-2" role="radiogroup" aria-label="Onboarding focus">
        {FOCUS_OPTIONS.map(({ value, icon }) => {
          const isSelected = focus === value
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => {
                setFocus(value)
                setSubmitted(false)
              }}
              className={cn(
                'w-full rounded-xl border px-4 py-4 text-left',
                'transition-all duration-fast ease-smooth',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
                isSelected
                  ? 'border-primary-mid bg-primary-light shadow-card'
                  : 'border-border bg-surface shadow-xs hover:border-border-strong hover:bg-surface-raised',
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                    isSelected ? 'bg-primary text-ink-on-primary' : 'bg-accent-light text-accent',
                  )}
                  aria-hidden="true"
                >
                  {icon}
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      'block font-body text-sm font-semibold leading-snug',
                      isSelected ? 'text-primary-text' : 'text-ink',
                    )}
                  >
                    {ONBOARDING_FOCUS_LABELS[value]}
                  </span>
                  <span
                    className={cn(
                      'mt-1 block font-body text-xs leading-relaxed',
                      isSelected ? 'text-primary-text/70' : 'text-ink-muted',
                    )}
                  >
                    {ONBOARDING_FOCUS_DESCRIPTIONS[value]}
                  </span>
                </span>
                {isSelected && (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" strokeWidth={2} aria-hidden="true" />
                )}
              </div>
            </button>
          )
        })}
      </motion.div>

      {submitted && !focus && (
        <p className="font-body text-xs text-error" role="alert">
          Choose the focus that feels closest. You can still use every part of the app.
        </p>
      )}

      <motion.div variants={staggerItem} className="flex gap-3 pt-1 pb-2">
        <button
          type="button"
          onClick={onBack}
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-lg',
            'border border-border bg-surface text-ink-secondary',
            'transition-all duration-fast ease-smooth',
            'hover:bg-surface-raised hover:text-ink active:scale-[0.97]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
          )}
          aria-label="Go back"
        >
          <ChevronLeft size={18} strokeWidth={2} />
        </button>

        <button
          type="submit"
          className={cn(
            'h-12 flex-1 rounded-lg',
            'bg-primary text-ink-on-primary',
            'font-body text-sm font-semibold',
            'shadow-sm transition-all duration-fast ease-smooth',
            'hover:bg-primary-dark active:scale-[0.97]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2',
          )}
        >
          Continue
        </button>
      </motion.div>
    </motion.form>
  )
}
