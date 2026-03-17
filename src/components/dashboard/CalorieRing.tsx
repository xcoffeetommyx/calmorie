'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import { formatCalories, clamp } from '@/lib/utils/format'

interface CalorieRingProps {
  caloriesEaten: number
  calorieTarget: number
  className?: string
}

const RING_RADIUS   = 72
const RING_STROKE   = 12
const SVG_SIZE      = (RING_RADIUS + RING_STROKE) * 2 + 4
const CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS

export function CalorieRing({ caloriesEaten, calorieTarget, className }: CalorieRingProps) {
  const ratio     = clamp(caloriesEaten / calorieTarget, 0, 1)
  const remaining = Math.max(calorieTarget - caloriesEaten, 0)
  const isOver    = caloriesEaten > calorieTarget
  const isNearing = ratio >= 0.85 && !isOver

  const dashOffset = CIRCUMFERENCE * (1 - ratio)
  const ringColor  = isOver
    ? 'var(--color-error)'
    : isNearing
      ? 'var(--color-warning)'
      : 'var(--color-primary)'

  const stats = [
    { label: 'Eaten',     value: formatCalories(caloriesEaten, { unit: false }), unit: 'kcal' },
    { label: 'Target',    value: formatCalories(calorieTarget, { unit: false }), unit: 'kcal' },
    { label: 'Remaining', value: isOver ? '—' : formatCalories(remaining, { unit: false }), unit: isOver ? '' : 'kcal' },
  ]

  return (
    <div className={cn('bg-surface rounded-2xl shadow-card px-5 pt-4 pb-5 space-y-4', className)}>
      {/* Section eyebrow */}
      <p className="font-body text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
        Today&rsquo;s calories
      </p>

      <div className="flex flex-col items-center gap-5">
        {/* SVG ring */}
        <div className="relative" style={{ width: SVG_SIZE, height: SVG_SIZE }}>
          <svg
            width={SVG_SIZE} height={SVG_SIZE}
            viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
            aria-hidden="true"
          >
            <circle
              cx={SVG_SIZE / 2} cy={SVG_SIZE / 2} r={RING_RADIUS}
              fill="none" stroke="var(--color-border)" strokeWidth={RING_STROKE}
            />
            <motion.circle
              cx={SVG_SIZE / 2} cy={SVG_SIZE / 2} r={RING_RADIUS}
              fill="none" stroke={ringColor}
              strokeWidth={RING_STROKE} strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              initial={{ strokeDashoffset: CIRCUMFERENCE, opacity: 0 }}
              animate={{ strokeDashoffset: dashOffset, opacity: 1 }}
              transition={{
                strokeDashoffset: { duration: 1.0, ease: [0.22, 1, 0.36, 1], delay: 0.15 },
                opacity: { duration: 0.2 },
              }}
              style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
            />
          </svg>

          {/* Centre label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 pointer-events-none">
            <motion.span
              className={cn(
                'font-display text-4xl font-semibold tracking-tight leading-none',
                isOver ? 'text-error' : 'text-ink',
              )}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
              aria-label={
                isOver
                  ? 'Over calorie target'
                  : `${formatCalories(remaining, { unit: false })} calories remaining`
              }
            >
              {isOver ? '0' : formatCalories(remaining, { unit: false })}
            </motion.span>
            <motion.span
              className="font-body text-xs text-ink-muted leading-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.38 }}
            >
              {isOver ? 'over target' : 'kcal left'}
            </motion.span>
          </div>
        </div>

        {/* Stat row with dividers */}
        <div
          className="w-full grid grid-cols-3 divide-x divide-border text-center"
          role="group"
          aria-label="Calorie summary"
        >
          {stats.map(({ label, value, unit }, i) => (
            <motion.div
              key={label}
              className="flex flex-col gap-0.5 px-1"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: 0.3 + i * 0.07 }}
            >
              <span className="font-body text-[10px] text-ink-muted">{label}</span>
              <span className="font-body text-sm font-semibold text-ink tabular-nums leading-snug">
                {value}
                {unit && (
                  <span className="font-normal text-ink-muted text-[10px] ml-0.5">{unit}</span>
                )}
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {isOver && (
        <motion.p
          className="font-body text-xs text-error text-center leading-relaxed"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          role="alert"
        >
          You&rsquo;ve gone over today — tomorrow is a fresh start.
        </motion.p>
      )}
    </div>
  )
}
