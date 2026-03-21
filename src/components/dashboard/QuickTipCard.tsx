'use client'

/**
 * QuickTipCard
 *
 * A compact daily tip card that shows one practical, science-grounded tip.
 * Tips rotate by day-of-year from the DAILY_TIPS pool in src/data/dailyTips.ts.
 *
 * Sits in the same two-column grid row as LessonOfTheDay on the dashboard,
 * replacing the static DailyBurnCard. Follows the same visual structure as
 * DailyBurnCard so the grid row stays visually balanced.
 */

import { motion } from 'framer-motion'
import { Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { slideUp } from '@/lib/animations/variants'
import type { DailyTip, TipCategory } from '@/data/dailyTips'

// ── Category labels ─────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<TipCategory, string> = {
  hydration: 'Hydration',
  nutrition:  'Nutrition',
  sleep:      'Sleep',
  movement:   'Movement',
  mindset:    'Mindset',
  digestion:  'Digestion',
}

// ── Props ───────────────────────────────────────────────────────────────────

interface QuickTipCardProps {
  tip: DailyTip
  className?: string
}

// ── Component ───────────────────────────────────────────────────────────────

export function QuickTipCard({ tip, className }: QuickTipCardProps) {
  return (
    <motion.div
      variants={slideUp}
      className={cn('bg-surface rounded-xl shadow-card px-4 py-4 space-y-3', className)}
      role="note"
      aria-label="Today's wellness tip"
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-2">
        <p className="font-body text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
          Quick tip
        </p>
        <Lightbulb
          size={14}
          className="text-primary opacity-50 shrink-0"
          strokeWidth={1.75}
          aria-hidden="true"
        />
      </div>

      {/* Tip text */}
      <p className="font-body text-xs text-ink-secondary leading-relaxed">
        {tip.text}
      </p>

      {/* Category label */}
      <p className="font-body text-[10px] font-semibold text-ink-muted uppercase tracking-wide border-t border-border pt-2.5">
        {CATEGORY_LABELS[tip.category]}
      </p>
    </motion.div>
  )
}
