'use client'

/**
 * CheckInStep
 *
 * A single animated question card in the check-in wizard.
 *
 * Supports four answer layouts via the `type` prop:
 *
 *   number_select  — numeric choices (e.g. meals eaten: 1 2 3 4 5)
 *   rating         — 1–5 scale with emoji anchors (sleep, stress)
 *   yes_no         — binary yes / no pill buttons
 *   option_select  — labelled multi-option grid (steps range)
 *
 * Each layout calls `onAnswer(value)` when the user makes a selection.
 * The step auto-advances on selection — no separate "Next" button needed
 * for most steps.
 *
 * Props:
 *   stepIndex     — 0-based, used for animation direction via Framer Motion
 *   totalSteps    — for progress display
 *   question      — main question text
 *   helperText    — optional secondary explanation
 *   type          — which answer layout to render
 *   options       — for option_select type
 *   ratingAnchors — for rating type (low label, high label)
 *   onAnswer      — called with the selected value
 *   onBack        — called when back button is pressed (optional)
 *   direction     — slide direction: 1 = forward, -1 = backward
 */

import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { checkInStepVariants } from '@/lib/animations/variants'

// ── Types ──────────────────────────────────────────────────────────────────

export type StepAnswerType = 'number_select' | 'rating' | 'yes_no' | 'option_select'

export interface StepOption {
  value: string | number | boolean
  label: string
  sublabel?: string
}

interface CheckInStepProps {
  stepIndex: number
  totalSteps: number
  question: string
  helperText?: string
  type: StepAnswerType
  options?: StepOption[]
  ratingAnchors?: { low: string; high: string }
  onAnswer: (value: string | number | boolean) => void
  onBack?: () => void
  direction?: number
}

// ── Component ──────────────────────────────────────────────────────────────

export function CheckInStep({
  stepIndex,
  totalSteps,
  question,
  helperText,
  type,
  options = [],
  ratingAnchors,
  onAnswer,
  onBack,
  direction = 1,
}: CheckInStepProps) {
  return (
    <motion.div
      custom={direction}
      variants={checkInStepVariants}
      initial="initial"
      animate="enter"
      exit="exit"
      className="w-full"
    >
      <div className="bg-surface rounded-2xl shadow-card px-5 py-6 space-y-6">
        {/* ── Question header ─────────────────────────────── */}
        <div className="space-y-1.5">
          <p className="font-body text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
            Question {stepIndex + 1} of {totalSteps}
          </p>
          <h2 className="font-display text-xl font-semibold text-ink tracking-tight leading-snug text-balance">
            {question}
          </h2>
          {helperText && (
            <p className="font-body text-sm text-ink-secondary leading-relaxed">
              {helperText}
            </p>
          )}
        </div>

        {/* ── Answer input ─────────────────────────────────── */}
        <div>
          {type === 'number_select' && (
            <NumberSelect onAnswer={onAnswer} />
          )}
          {type === 'rating' && (
            <RatingSelect anchors={ratingAnchors} onAnswer={onAnswer} />
          )}
          {type === 'yes_no' && (
            <YesNoSelect onAnswer={onAnswer} />
          )}
          {type === 'option_select' && (
            <OptionSelect options={options} onAnswer={onAnswer} />
          )}
        </div>

        {/* ── Back button ──────────────────────────────────── */}
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className={cn(
              'flex items-center gap-1 font-body text-sm text-ink-muted',
              'hover:text-ink transition-colors duration-fast',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus rounded-lg',
            )}
          >
            <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
            Back
          </button>
        )}
      </div>
    </motion.div>
  )
}

// ── Answer layout sub-components ───────────────────────────────────────────

/** Numeric choices 1–5 for "meals eaten today" */
function NumberSelect({ onAnswer }: { onAnswer: (v: number) => void }) {
  const choices = [1, 2, 3, 4, 5]
  return (
    <div className="flex gap-2 justify-between" role="group" aria-label="Number of meals">
      {choices.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onAnswer(n)}
          className={cn(
            'flex-1 h-14 rounded-xl',
            'font-body text-lg font-semibold text-ink',
            'bg-background border-2 border-border',
            'hover:border-primary hover:bg-primary-light hover:text-primary-text',
            'active:scale-95 transition-all duration-fast ease-smooth',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
          )}
          aria-label={`${n} meal${n !== 1 ? 's' : ''}`}
        >
          {n}
        </button>
      ))}
    </div>
  )
}

/** 1–5 rating scale with low/high anchor labels */
function RatingSelect({
  anchors,
  onAnswer,
}: {
  anchors?: { low: string; high: string }
  onAnswer: (v: number) => void
}) {
  const RATING_EMOJI: Record<number, string> = {
    1: '😔', 2: '😕', 3: '😐', 4: '🙂', 5: '😊',
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2 justify-between" role="group" aria-label="Rating 1 to 5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onAnswer(n as 1|2|3|4|5)}
            className={cn(
              'flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl',
              'bg-background border-2 border-border',
              'hover:border-primary hover:bg-primary-light',
              'active:scale-95 transition-all duration-fast ease-smooth',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
            )}
            aria-label={`${n} out of 5`}
          >
            <span className="text-xl select-none" aria-hidden="true">
              {RATING_EMOJI[n]}
            </span>
            <span className="font-body text-xs font-semibold text-ink">{n}</span>
          </button>
        ))}
      </div>

      {anchors && (
        <div className="flex justify-between px-1">
          <span className="font-body text-xs text-ink-muted">{anchors.low}</span>
          <span className="font-body text-xs text-ink-muted">{anchors.high}</span>
        </div>
      )}
    </div>
  )
}

/** Binary Yes / No buttons */
function YesNoSelect({ onAnswer }: { onAnswer: (v: boolean) => void }) {
  return (
    <div className="grid grid-cols-2 gap-3" role="group" aria-label="Yes or No">
      {[
        { label: 'Yes', value: true,  style: 'hover:border-success hover:bg-success-bg hover:text-success' },
        { label: 'No',  value: false, style: 'hover:border-primary hover:bg-primary-light hover:text-primary-text' },
      ].map(({ label, value, style }) => (
        <button
          key={label}
          type="button"
          onClick={() => onAnswer(value)}
          className={cn(
            'h-14 rounded-xl',
            'font-body text-base font-semibold text-ink',
            'bg-background border-2 border-border',
            style,
            'active:scale-95 transition-all duration-fast ease-smooth',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
          )}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

/** Multi-option labelled grid (for steps range) */
function OptionSelect({
  options,
  onAnswer,
}: {
  options: StepOption[]
  onAnswer: (v: string | number | boolean) => void
}) {
  return (
    <div className="grid grid-cols-1 gap-2" role="group" aria-label="Select an option">
      {options.map((opt) => (
        <button
          key={String(opt.value)}
          type="button"
          onClick={() => onAnswer(opt.value)}
          className={cn(
            'w-full text-left px-4 py-3 rounded-xl',
            'bg-background border-2 border-border',
            'hover:border-primary hover:bg-primary-light',
            'active:scale-[0.99] transition-all duration-fast ease-smooth',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
          )}
        >
          <p className="font-body text-sm font-semibold text-ink leading-snug">
            {opt.label}
          </p>
          {opt.sublabel && (
            <p className="font-body text-xs text-ink-muted mt-0.5">
              {opt.sublabel}
            </p>
          )}
        </button>
      ))}
    </div>
  )
}
