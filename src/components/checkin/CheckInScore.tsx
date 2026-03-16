'use client'

/**
 * CheckInScore
 *
 * Animated result screen shown after a check-in is submitted.
 * Displays:
 *   – Animated score number (spring scale-in)
 *   – Tier label and ring colour
 *   – Score description (supportive, not moralistic)
 *   – Personalised tip
 *   – All generated habit warnings
 *   – CTA to return to dashboard
 *
 * Tier → colour mapping uses semantic tokens:
 *   great   → text-success / bg-success-bg
 *   good    → text-primary / bg-primary-light
 *   average → text-warning / bg-warning-bg
 *   poor    → text-ink-secondary / bg-surface-raised (neutral, not alarming)
 *
 * Props:
 *   record — the completed CheckInRecordFull from checkinStore
 *   onDone — called when user taps "Back to dashboard"
 */

import { motion } from 'framer-motion'
import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { scaleSpring, staggerContainer, staggerItem } from '@/lib/animations/variants'
import { scoreToTier } from '@/lib/utils/format'
import { getScoreDescription } from '@/lib/engine/scoreEngine'
import { HabitWarning } from './HabitWarning'
import type { CheckInRecordFull } from '@/stores/checkinStore'

// ── Tier → visual tokens ───────────────────────────────────────────────────
// All classes verified against tailwind.config.ts

const TIER_STYLES = {
  great:   { ring: 'stroke-success',       number: 'text-success',       badge: 'bg-success-bg text-success' },
  good:    { ring: 'stroke-primary',        number: 'text-primary',       badge: 'bg-primary-light text-primary-text' },
  average: { ring: 'stroke-warning',        number: 'text-warning',       badge: 'bg-warning-bg text-amber-800' },
  poor:    { ring: 'stroke-ink-muted',      number: 'text-ink-secondary', badge: 'bg-surface-raised text-ink-muted' },
} as const

// ── Component ──────────────────────────────────────────────────────────────

interface CheckInScoreProps {
  record: CheckInRecordFull
  onDone?: () => void
}

export function CheckInScore({ record, onDone }: CheckInScoreProps) {
  const { label, tier } = scoreToTier(record.score)
  const styles          = TIER_STYLES[tier]
  const description     = getScoreDescription(record.score)
  const circumference   = 2 * Math.PI * 42  // r=42
  const dashOffset      = circumference * (1 - record.score / 100)

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="enter"
      className="space-y-5"
    >
      {/* ── Hero score card ──────────────────────────────── */}
      <motion.div
        variants={staggerItem}
        className="bg-surface rounded-2xl shadow-card px-5 py-7 flex flex-col items-center gap-4"
      >
        {/* Animated score ring */}
        <div className="relative w-36 h-36">
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full -rotate-90"
            aria-hidden="true"
          >
            {/* Track */}
            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-border)" strokeWidth="8" />
            {/* Progress */}
            <motion.circle
              cx="50" cy="50" r="42"
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              className={styles.ring}
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference, opacity: 0 }}
              animate={{ strokeDashoffset: dashOffset, opacity: 1 }}
              transition={{
                strokeDashoffset: { duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 },
                opacity: { duration: 0.2 },
              }}
            />
          </svg>

          {/* Score number */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
            <motion.span
              variants={scaleSpring}
              className={cn('font-display text-4xl font-semibold tracking-tight leading-none', styles.number)}
              aria-label={`Score: ${record.score} out of 100`}
            >
              {record.score}
            </motion.span>
            <span className="font-body text-xs text-ink-muted">/ 100</span>
          </div>
        </div>

        {/* Tier badge */}
        <span className={cn('px-3.5 py-1.5 rounded-full font-body text-sm font-semibold', styles.badge)}>
          {label}
        </span>

        {/* Description */}
        <p className="font-body text-sm text-ink-secondary text-center leading-relaxed max-w-xs">
          {description}
        </p>
      </motion.div>

      {/* ── Personalised tip ─────────────────────────────── */}
      <motion.div
        variants={staggerItem}
        className="bg-primary-light border border-primary-mid rounded-xl px-4 py-4 space-y-1.5"
      >
        <p className="font-body text-[11px] font-semibold text-primary uppercase tracking-wider">
          Today&rsquo;s tip
        </p>
        <p className="font-body text-sm text-primary-text leading-relaxed">
          {record.tip}
        </p>
      </motion.div>

      {/* ── Habit warnings ────────────────────────────────── */}
      {record.habitWarnings.length > 0 && (
        <motion.div variants={staggerItem} className="space-y-3">
          <p className="font-body text-[11px] font-semibold text-ink-muted uppercase tracking-wider px-0.5">
            Habit insights
          </p>
          {record.habitWarnings.map((warning) => (
            <HabitWarning key={warning.id} warning={warning} />
          ))}
        </motion.div>
      )}

      {/* ── Done CTA ─────────────────────────────────────── */}
      <motion.div variants={staggerItem}>
        <Link
          href="/dashboard"
          onClick={onDone}
          className={cn(
            'flex items-center justify-center w-full h-12 rounded-full',
            'bg-primary text-ink-on-primary',
            'font-body text-sm font-semibold',
            'shadow-sm hover:bg-primary-dark active:scale-[0.97]',
            'transition-all duration-fast ease-smooth',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2',
          )}
        >
          Back to dashboard
        </Link>
      </motion.div>

      {/* Bottom spacer */}
      <div className="h-2" aria-hidden="true" />
    </motion.div>
  )
}
