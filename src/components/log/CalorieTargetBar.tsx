'use client'

/**
 * CalorieTargetBar
 *
 * Horizontal progress bar showing daily calorie consumption vs. target.
 * Used at the top of the log page as the primary daily progress indicator.
 *
 * States:
 *   normal   — 0–84% consumed → brand primary colour
 *   nearing  — 85–99% consumed → warning (semantic token: text-warning / bg-warning)
 *   over     — 100%+ consumed → error (semantic token: text-error / bg-error)
 *
 * All colour tokens are verified against tailwind.config.ts:
 *   bg-primary    → colors.primary.DEFAULT
 *   text-primary  → colors.primary.DEFAULT
 *   bg-warning    → colors.warning.DEFAULT  (maps to --color-warning in tokens.css)
 *   text-warning  → colors.warning.DEFAULT
 *   bg-error      → colors.error.DEFAULT
 *   text-error    → colors.error.DEFAULT
 *
 * Props:
 *   totalCalories — kcal logged today
 *   calorieTarget — daily target in kcal
 *   className     — optional wrapper class
 */

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import { formatCalories, clamp } from '@/lib/utils/format'

interface CalorieTargetBarProps {
  totalCalories: number
  calorieTarget: number
  className?: string
}

export function CalorieTargetBar({
  totalCalories,
  calorieTarget,
  className,
}: CalorieTargetBarProps) {
  const ratio     = clamp(totalCalories / calorieTarget, 0, 1)
  const remaining = Math.max(calorieTarget - totalCalories, 0)
  const isOver    = totalCalories > calorieTarget
  const isNearing = ratio >= 0.85 && !isOver

  // All colours use verified semantic design tokens
  const barColor  = isOver ? 'bg-error'    : isNearing ? 'bg-warning'    : 'bg-primary'
  const textColor = isOver ? 'text-error'  : isNearing ? 'text-warning'  : 'text-primary'

  return (
    <div className={cn('bg-surface rounded-xl shadow-card px-4 py-4 space-y-3', className)}>
      {/* ── Top row: eaten / remaining ──────────────────────── */}
      <div className="flex items-end justify-between">
        <div>
          <p className="font-body text-xs text-ink-muted">Eaten today</p>
          <p className="font-body text-lg font-semibold text-ink leading-tight mt-0.5">
            {formatCalories(totalCalories)}
          </p>
        </div>

        <div className="text-right">
          <p className="font-body text-xs text-ink-muted">
            {isOver ? 'Over by' : 'Remaining'}
          </p>
          <p className={cn('font-body text-lg font-semibold leading-tight mt-0.5', textColor)}>
            {isOver
              ? formatCalories(totalCalories - calorieTarget)
              : formatCalories(remaining)}
          </p>
        </div>
      </div>

      {/* ── Progress bar ────────────────────────────────────── */}
      <div
        className="h-2.5 bg-border rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(ratio * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${Math.round(ratio * 100)}% of daily calorie target consumed`}
      >
        <motion.div
          className={cn('h-full rounded-full transition-colors duration-slow', barColor)}
          initial={{ width: 0 }}
          animate={{ width: `${ratio * 100}%` }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        />
      </div>

      {/* ── Bottom row: target + percentage ─────────────────── */}
      <div className="flex items-center justify-between">
        <p className="font-body text-xs text-ink-muted">
          Daily target:{' '}
          <span className="font-medium text-ink">{formatCalories(calorieTarget)}</span>
        </p>
        <p
          className={cn(
            'font-body text-xs font-medium tabular-nums',
            isOver ? 'text-error' : 'text-ink-muted',
          )}
          role={isOver ? 'alert' : undefined}
        >
          {isOver ? 'Over target' : `${Math.round(ratio * 100)}%`}
        </p>
      </div>
    </div>
  )
}
