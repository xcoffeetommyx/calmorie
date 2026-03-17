'use client'

import { motion } from 'framer-motion'
import { Footprints } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { slideUp } from '@/lib/animations/variants'

export interface BurnSuggestion {
  activity:      string
  duration:      string
  estimatedKcal: string
  tip:           string
  icon?: React.ReactNode
}

interface DailyBurnCardProps {
  suggestion: BurnSuggestion
  className?: string
}

export function DailyBurnCard({ suggestion, className }: DailyBurnCardProps) {
  return (
    <motion.div
      variants={slideUp}
      className={cn('bg-surface rounded-xl shadow-card px-4 py-4 space-y-3', className)}
      role="note"
      aria-label="Daily movement suggestion"
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <p className="font-body text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
          Move a little
        </p>
        <span
          className="font-body text-xs font-semibold text-primary bg-primary-light rounded-full px-2.5 py-0.5 shrink-0"
          aria-label={`Estimated ${suggestion.estimatedKcal} burned`}
        >
          ~{suggestion.estimatedKcal}
        </span>
      </div>

      {/* Icon + activity */}
      <div className="flex items-center gap-3">
        <div
          className="shrink-0 w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center"
          aria-hidden="true"
        >
          {suggestion.icon ?? (
            <Footprints className="w-5 h-5 text-primary" strokeWidth={1.75} />
          )}
        </div>
        <div>
          <p className="font-body text-sm font-semibold text-ink leading-snug">
            {suggestion.activity}
          </p>
          <p className="font-body text-xs text-ink-muted mt-0.5">
            {suggestion.duration}
          </p>
        </div>
      </div>

      {/* Tip */}
      <p className="font-body text-xs text-ink-secondary leading-relaxed border-t border-border pt-3">
        {suggestion.tip}
      </p>
    </motion.div>
  )
}
