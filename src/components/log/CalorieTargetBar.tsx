'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import { formatCalories, clamp } from '@/lib/utils/format'

interface CalorieTargetBarProps {
  totalCalories: number
  calorieTarget: number
  className?: string
}

export function CalorieTargetBar({ totalCalories, calorieTarget, className }: CalorieTargetBarProps) {
  const ratio     = clamp(totalCalories / calorieTarget, 0, 1)
  const remaining = Math.max(calorieTarget - totalCalories, 0)
  const isOver    = totalCalories > calorieTarget
  const isNearing = ratio >= 0.85 && !isOver

  const barColor  = isOver ? 'bg-error'   : isNearing ? 'bg-warning'   : 'bg-primary'
  const textColor = isOver ? 'text-error' : isNearing ? 'text-warning' : 'text-primary'

  return (
    <div className={cn('bg-surface rounded-xl shadow-card px-4 py-4 space-y-3', className)}>
      {/* Stat row */}
      <div className="flex items-end justify-between">
        <div>
          <p className="font-body text-[11px] text-ink-muted uppercase tracking-wide">Eaten today</p>
          <p className="font-body text-2xl font-semibold text-ink leading-tight mt-0.5 tabular-nums">
            {formatCalories(totalCalories, { unit: false })}
            <span className="font-normal text-sm text-ink-muted ml-1">kcal</span>
          </p>
        </div>

        <div className="text-right">
          <p className="font-body text-[11px] text-ink-muted uppercase tracking-wide">
            {isOver ? 'Over by' : 'Remaining'}
          </p>
          <p className={cn('font-body text-2xl font-semibold leading-tight mt-0.5 tabular-nums', textColor)}>
            {isOver
              ? formatCalories(totalCalories - calorieTarget, { unit: false })
              : formatCalories(remaining, { unit: false })}
            <span className={cn('font-normal text-sm ml-1', textColor, 'opacity-80')}>kcal</span>
          </p>
        </div>
      </div>

      {/* Progress bar - h-3 for better visual weight */}
      <div
        className="h-3 bg-border rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={Math.round(ratio * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${Math.round(ratio * 100)}% of daily calorie target consumed`}
      >
        <motion.div
          className={cn('h-full rounded-full', barColor)}
          initial={{ width: 0 }}
          animate={{ width: `${ratio * 100}%` }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        />
      </div>

      {/* Label row */}
      <div className="flex items-center justify-between">
        <p className="font-body text-xs text-ink-muted">
          Target:{' '}
          <span className="font-semibold text-ink">{formatCalories(calorieTarget)}</span>
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
