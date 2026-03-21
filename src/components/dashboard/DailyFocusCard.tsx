'use client'

/**
 * DailyFocusCard
 *
 * Shows the user's chosen daily focus from their morning check-in.
 * Rendered only when the user has checked in today.
 *
 * For focus === 'none', the copy is adjusted to feel gentle rather
 * than empty ("Taking today as it comes").
 */

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import { scaleSpring } from '@/lib/animations/variants'
import { DAILY_FOCUS_LABELS, type DailyFocus } from '@/types/checkin'

// ── Focus display data ─────────────────────────────────────────────────────

const FOCUS_EMOJI: Record<DailyFocus, string> = {
  regular_meals:        '🍽️',
  drink_more_water:     '💧',
  walk_more:            '🚶',
  sleep_earlier:        '🌙',
  reduce_sugary_drinks: '🥤',
  none:                 '✨',
}

const FOCUS_HINT: Record<DailyFocus, string> = {
  regular_meals:        'Aim for balanced, timed meals today.',
  drink_more_water:     'Try to reach 6–8 glasses throughout the day.',
  walk_more:            'Even short walks add up — take the stairs.',
  sleep_earlier:        'Try to wind down 30 minutes earlier tonight.',
  reduce_sugary_drinks: 'Swap one sugary drink for water today.',
  none:                 'Taking today as it comes.',
}

// ── Component ──────────────────────────────────────────────────────────────

interface DailyFocusCardProps {
  focus: DailyFocus
  className?: string
}

export function DailyFocusCard({ focus, className }: DailyFocusCardProps) {
  const label = DAILY_FOCUS_LABELS[focus]
  const emoji = FOCUS_EMOJI[focus]
  const hint  = FOCUS_HINT[focus]

  return (
    <div
      className={cn(
        'bg-surface rounded-xl shadow-card',
        'px-4 py-4 flex items-center gap-4',
        className,
      )}
      role="note"
      aria-label={`Today's focus: ${label}`}
    >
      {/* Focus icon */}
      <motion.div
        variants={scaleSpring}
        initial="initial"
        animate="enter"
        className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center shrink-0"
        aria-hidden="true"
      >
        <span className="text-xl select-none">{emoji}</span>
      </motion.div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="font-body text-[11px] font-semibold text-ink-muted uppercase tracking-wider mb-0.5">
          Today&rsquo;s focus
        </p>
        <p className="font-body text-sm font-semibold text-ink leading-snug">
          {label}
        </p>
        <p className="font-body text-xs text-ink-secondary leading-snug mt-0.5">
          {hint}
        </p>
      </div>
    </div>
  )
}
