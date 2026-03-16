'use client'

/**
 * DailyBurnCard
 *
 * A gentle suggestion card recommending one practical movement activity.
 * Tone: encouraging and informational, not prescriptive.
 *
 * The card accepts a `suggestion` object so it is data-driven even with
 * static mock data. Phase 3 can swap in a richer suggestion engine
 * (e.g. based on calories remaining and activity level from the profile).
 *
 * Phase 3: derive suggestion from userStore.activityLevel and today's
 * calorie gap. Current mock is always a 20-minute brisk walk.
 */

import { motion } from 'framer-motion'
import { Footprints } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { slideUp } from '@/lib/animations/variants'

export interface BurnSuggestion {
  activity: string         // e.g. "Brisk walk"
  duration: string         // e.g. "20 minutes"
  estimatedKcal: string    // e.g. "80–110 kcal" — shown as a range, not exact
  tip: string              // 1–2 sentence plain-language note
  icon?: React.ReactNode   // optional override icon
}

interface DailyBurnCardProps {
  suggestion: BurnSuggestion
  className?: string
}

export function DailyBurnCard({ suggestion, className }: DailyBurnCardProps) {
  return (
    <motion.div
      variants={slideUp}
      className={cn(
        'bg-surface rounded-xl shadow-card',
        'px-4 py-4',
        'flex items-start gap-4',
        className,
      )}
      role="note"
      aria-label="Daily movement suggestion"
    >
      {/* Icon badge */}
      <div
        className={cn(
          'shrink-0 w-10 h-10 rounded-xl',
          'bg-green-100 flex items-center justify-center',
        )}
        aria-hidden="true"
      >
        {suggestion.icon ?? (
          <Footprints className="w-5 h-5 text-green-700" strokeWidth={1.75} />
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="font-body text-sm font-semibold text-ink leading-snug">
            {suggestion.activity}
          </p>
          <span
            className={cn(
              'shrink-0 font-body text-xs font-medium',
              'text-green-700 bg-green-100 rounded-full px-2 py-0.5',
            )}
            aria-label={`Estimated ${suggestion.estimatedKcal} burned`}
          >
            ~{suggestion.estimatedKcal}
          </span>
        </div>

        <p className="font-body text-[11px] text-ink-muted">
          {suggestion.duration}
        </p>

        <p className="font-body text-xs text-ink-secondary leading-relaxed pt-0.5">
          {suggestion.tip}
        </p>
      </div>
    </motion.div>
  )
}
