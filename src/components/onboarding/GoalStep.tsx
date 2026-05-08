'use client'

/**
 * GoalStep
 *
 * Onboarding step 2 of 3.
 * Collects: activity level, goal.
 *
 * Layout v2:
 *   Each selection group (activity, goal) is wrapped in a card container
 *   with a clear section label, giving each group visual elevation and
 *   breaking the long vertical wall of options into two distinct chunks.
 *
 * Both fields use card-based selection (no dropdowns) for touch-friendliness.
 * All logic is unchanged from v1.
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { staggerContainer, staggerItem } from '@/lib/animations/variants'
import {
  type ActivityLevel,
  type UserGoal,
  ACTIVITY_LEVEL_SHORT,
  ACTIVITY_LEVEL_LABELS,
  GOAL_LABELS,
  GOAL_DESCRIPTIONS,
} from '@/types/user'

// ── Ordered options ────────────────────────────────────────────────────────

const ACTIVITY_OPTIONS: ActivityLevel[] = [
  'sedentary',
  'light',
  'moderate',
  'active',
  'very_active',
]

const GOAL_OPTIONS: UserGoal[] = ['maintain', 'lose_slow', 'educate']

// ── Component ──────────────────────────────────────────────────────────────

interface GoalStepProps {
  defaultValues?: { activityLevel?: ActivityLevel; goal?: UserGoal }
  onNext: (data: { activityLevel: ActivityLevel; goal: UserGoal }) => void
  onBack: () => void
}

export function GoalStep({ defaultValues, onNext, onBack }: GoalStepProps) {
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(
    defaultValues?.activityLevel ?? null
  )
  const [goal, setGoal] = useState<UserGoal | null>(
    defaultValues?.goal ?? null
  )
  const [submitted, setSubmitted] = useState(false)

  const activityError = submitted && !activityLevel
  const goalError     = submitted && !goal

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
    if (!activityLevel || !goal) return
    onNext({ activityLevel, goal })
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
      {/* ── Card: Activity level ───────────────────────────────── */}
      <motion.div variants={staggerItem}>
        <div className={cn('bg-surface rounded-xl border border-border px-4 py-4 shadow-xs')}>
          <p className="font-body text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
            Daily activity
          </p>
          <p className="font-body text-sm font-medium text-ink mb-0.5">
            How active are you day-to-day?
          </p>
          <p className="font-body text-xs text-ink-muted mb-3">
            Think about your typical week, including work and leisure.
          </p>

          <div className="space-y-2" role="radiogroup" aria-label="Activity level">
            {ACTIVITY_OPTIONS.map((level) => (
              <ActivityCard
                key={level}
                level={level}
                isSelected={activityLevel === level}
                onSelect={() => {
                  setActivityLevel(level)
                  setSubmitted(false)
                }}
              />
            ))}
          </div>

          {activityError && (
            <p className="font-body text-xs text-error mt-2" role="alert">
              Please select your activity level
            </p>
          )}
        </div>
      </motion.div>

      {/* ── Card: Goal ────────────────────────────────────────── */}
      <motion.div variants={staggerItem}>
        <div className={cn('bg-surface rounded-xl border border-border px-4 py-4 shadow-xs')}>
          <p className="font-body text-xs font-semibold text-ink-muted uppercase tracking-wider mb-3">
            Your goal
          </p>
          <p className="font-body text-sm font-medium text-ink mb-3">
            What&rsquo;s your main goal?
          </p>

          <div className="space-y-2" role="radiogroup" aria-label="Goal">
            {GOAL_OPTIONS.map((g) => (
              <GoalCard
                key={g}
                goal={g}
                isSelected={goal === g}
                onSelect={() => {
                  setGoal(g)
                  setSubmitted(false)
                }}
              />
            ))}
          </div>

          {goalError && (
            <p className="font-body text-xs text-error mt-2" role="alert">
              Please select a goal
            </p>
          )}
        </div>
      </motion.div>

      {/* ── Navigation ────────────────────────────────────────── */}
      <motion.div variants={staggerItem} className="flex gap-3 pt-1 pb-2">
        <button
          type="button"
          onClick={onBack}
          className={cn(
            'flex items-center justify-center w-12 h-12 rounded-lg shrink-0',
            'border border-border text-ink-secondary bg-surface',
            'hover:bg-surface-raised hover:text-ink active:scale-[0.97]',
            'transition-all duration-fast ease-smooth',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
          )}
          aria-label="Go back"
        >
          <ChevronLeft size={18} strokeWidth={2} />
        </button>

        <button
          type="submit"
          className={cn(
            'flex-1 h-12 rounded-lg',
            'bg-primary text-ink-on-primary',
            'font-body text-sm font-semibold',
            'shadow-sm hover:bg-primary-dark active:scale-[0.97]',
            'transition-[background-color,box-shadow,transform] duration-fast ease-out',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2',
          )}
        >
          See my calorie estimate
        </button>
      </motion.div>
    </motion.form>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────

function ActivityCard({
  level,
  isSelected,
  onSelect,
}: {
  level: ActivityLevel
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      onClick={onSelect}
      className={cn(
        'w-full text-left rounded-xl px-4 py-3',
        'border transition-all duration-fast ease-smooth',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
        isSelected
          ? 'bg-primary-light border-primary-mid'
          : 'bg-background border-border hover:bg-surface-raised hover:border-border-strong',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            'font-body text-sm font-semibold leading-snug',
            isSelected ? 'text-primary-text' : 'text-ink',
          )}
        >
          {ACTIVITY_LEVEL_SHORT[level]}
        </span>
        {isSelected && (
          <span
            className="w-4 h-4 rounded-full bg-primary flex items-center justify-center shrink-0"
            aria-hidden="true"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
          </span>
        )}
      </div>
      <p
        className={cn(
          'font-body text-xs mt-0.5 leading-snug',
          isSelected ? 'text-primary-text/70' : 'text-ink-muted',
        )}
      >
        {ACTIVITY_LEVEL_LABELS[level]}
      </p>
    </button>
  )
}

function GoalCard({
  goal,
  isSelected,
  onSelect,
}: {
  goal: UserGoal
  isSelected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      onClick={onSelect}
      className={cn(
        'w-full text-left rounded-xl px-4 py-3',
        'border transition-all duration-fast ease-smooth',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
        isSelected
          ? 'bg-primary-light border-primary-mid'
          : 'bg-background border-border hover:bg-surface-raised hover:border-border-strong',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={cn(
            'font-body text-sm font-semibold leading-snug',
            isSelected ? 'text-primary-text' : 'text-ink',
          )}
        >
          {GOAL_LABELS[goal]}
        </span>
        {isSelected && (
          <span
            className="w-4 h-4 rounded-full bg-primary flex items-center justify-center shrink-0"
            aria-hidden="true"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
          </span>
        )}
      </div>
      <p
        className={cn(
          'font-body text-xs mt-0.5 leading-snug',
          isSelected ? 'text-primary-text/70' : 'text-ink-muted',
        )}
      >
        {GOAL_DESCRIPTIONS[goal]}
      </p>
    </button>
  )
}
