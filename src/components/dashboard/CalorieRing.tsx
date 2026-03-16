'use client'

/**
 * CalorieRing
 *
 * Hero dashboard card. Shows daily calorie progress as an animated
 * SVG arc ring with a three-stat row (eaten, target, remaining) below.
 *
 * The ring draws in on mount using ringDrawVariants from the animation
 * library. Colour transitions from brand-primary through warning-amber
 * as the user approaches or exceeds their target.
 *
 * Props:
 *   caloriesEaten   — number of kcal logged today
 *   calorieTarget   — daily target in kcal
 *
 * Phase 4: replace static props with live values from useCalorieTarget()
 * and useTodayLog() hooks once stores are wired.
 */

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import { formatCalories, clamp } from '@/lib/utils/format'

interface CalorieRingProps {
  caloriesEaten: number
  calorieTarget: number
  className?: string
}

// Ring geometry — all values in SVG user units
const RING_RADIUS      = 72          // radius of the progress circle
const RING_STROKE      = 13          // stroke thickness
const SVG_SIZE         = (RING_RADIUS + RING_STROKE) * 2 + 4   // 174px
const CIRCUMFERENCE    = 2 * Math.PI * RING_RADIUS              // ~452px

export function CalorieRing({
  caloriesEaten,
  calorieTarget,
  className,
}: CalorieRingProps) {
  const ratio      = clamp(caloriesEaten / calorieTarget, 0, 1)
  const remaining  = Math.max(calorieTarget - caloriesEaten, 0)
  const isOver     = caloriesEaten > calorieTarget
  const isNearing  = ratio >= 0.85 && !isOver  // within 15% of limit

  // Stroke dashoffset: full = circumference (empty ring), 0 = full ring
  const dashOffset = CIRCUMFERENCE * (1 - ratio)

  // Ring colour: primary → warning amber → red when over
  const ringColor = isOver
    ? 'var(--color-error)'
    : isNearing
      ? '#c08c1a'    // --status-warning-500
      : 'var(--color-primary)'

  const stats = [
    { label: 'Eaten',     value: formatCalories(caloriesEaten, { unit: false }), unit: 'kcal' },
    { label: 'Target',    value: formatCalories(calorieTarget, { unit: false }), unit: 'kcal' },
    { label: 'Remaining', value: isOver ? '0' : formatCalories(remaining, { unit: false }), unit: 'kcal' },
  ]

  return (
    <div
      className={cn(
        'bg-surface rounded-2xl shadow-card',
        'px-5 pt-6 pb-5',
        'flex flex-col items-center gap-5',
        className,
      )}
    >
      {/* ── SVG ring ─────────────────────────────────────────── */}
      <div className="relative" style={{ width: SVG_SIZE, height: SVG_SIZE }}>
        <svg
          width={SVG_SIZE}
          height={SVG_SIZE}
          viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
          aria-hidden="true"
        >
          {/* Track ring (background) */}
          <circle
            cx={SVG_SIZE / 2}
            cy={SVG_SIZE / 2}
            r={RING_RADIUS}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth={RING_STROKE}
          />

          {/* Progress arc — rotated so it starts at 12 o'clock */}
          <motion.circle
            cx={SVG_SIZE / 2}
            cy={SVG_SIZE / 2}
            r={RING_RADIUS}
            fill="none"
            stroke={ringColor}
            strokeWidth={RING_STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE, opacity: 0 }}
            animate={{
              strokeDashoffset: dashOffset,
              opacity: 1,
            }}
            transition={{
              strokeDashoffset: { duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.15 },
              opacity: { duration: 0.2 },
            }}
            style={{
              // Rotate so arc starts at top-center
              transformOrigin: 'center',
              transform: 'rotate(-90deg)',
            }}
          />
        </svg>

        {/* ── Centre label ────────────────────────────────────── */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 pointer-events-none">
          <motion.span
            className={cn(
              'font-display text-3xl font-semibold tracking-tight leading-none',
              isOver ? 'text-error' : 'text-ink',
            )}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
          >
            {isOver ? '0' : formatCalories(remaining, { unit: false })}
          </motion.span>
          <motion.span
            className="font-body text-xs text-ink-muted leading-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.35 }}
          >
            {isOver ? 'over target' : 'kcal left'}
          </motion.span>
        </div>
      </div>

      {/* ── Stat row ─────────────────────────────────────────── */}
      <div
        className="w-full grid grid-cols-3 gap-1 text-center"
        role="group"
        aria-label="Calorie summary"
      >
        {stats.map(({ label, value, unit }, i) => (
          <motion.div
            key={label}
            className="flex flex-col gap-0.5"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1], delay: 0.3 + i * 0.06 }}
          >
            <span className="font-body text-[11px] text-ink-muted">{label}</span>
            <span className="font-body text-sm font-semibold text-ink leading-snug">
              {value}
              <span className="font-normal text-ink-muted text-[10px] ml-0.5">{unit}</span>
            </span>
          </motion.div>
        ))}
      </div>

      {/* Over-budget warning banner */}
      {isOver && (
        <motion.p
          className="font-body text-xs text-error text-center leading-relaxed"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          role="alert"
        >
          You&rsquo;ve gone over your target today — that&rsquo;s okay, tomorrow is a fresh start.
        </motion.p>
      )}
    </div>
  )
}
