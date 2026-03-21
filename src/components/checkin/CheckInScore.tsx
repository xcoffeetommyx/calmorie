'use client'

/**
 * CheckInScore
 *
 * Animated result screen shown after a Morning Check-In is submitted.
 * Displays:
 *   – Animated score ring with tier label
 *   – Streak summary (current streak + weekly consistency)
 *   – Milestone moment when a streak milestone (3/7/14/30) is hit
 *   – Personalised tip for the weakest area
 *   – Habit warnings (from habitEngine)
 *   – Recommended lesson CTA based on the weakest scoring factor
 *   – Dashboard return button
 *
 * Tier → colour mapping uses semantic tokens:
 *   great   → text-success / bg-success-bg
 *   good    → text-primary / bg-primary-light
 *   average → text-warning / bg-warning-bg
 *   poor    → text-ink-secondary / bg-surface-raised
 */

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Flame, CalendarDays, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { scaleSpring, staggerContainer, staggerItem } from '@/lib/animations/variants'
import { scoreToTier } from '@/lib/utils/format'
import { calculateScore, getScoreDescription, getLessonSlugForFactor } from '@/lib/engine/scoreEngine'
import { getLessonBySlug } from '@/lib/content/lessons'
import { useStreakData } from '@/hooks/useStreakData'
import { HabitWarning } from './HabitWarning'
import type { CheckInRecordFull } from '@/stores/checkinStore'

// ── Tier → visual tokens ───────────────────────────────────────────────────

const TIER_STYLES = {
  great:   { ring: 'stroke-success',   number: 'text-success',       badge: 'bg-success-bg text-success' },
  good:    { ring: 'stroke-primary',   number: 'text-primary',       badge: 'bg-primary-light text-primary-text' },
  average: { ring: 'stroke-warning',   number: 'text-warning',       badge: 'bg-warning-bg text-amber-800' },
  poor:    { ring: 'stroke-ink-muted', number: 'text-ink-secondary', badge: 'bg-surface-raised text-ink-muted' },
} as const

// ── Milestone copy ─────────────────────────────────────────────────────────

const MILESTONE_COPY: Record<number, string> = {
  3:  'Three days in a row — a habit is starting to form.',
  7:  'A full week of check-ins. Consistency like this adds up.',
  14: 'Two weeks straight. You\'re building something real here.',
  30: 'Thirty days. That\'s genuine commitment — well done.',
}

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

  // Streak data — memoized derivation via stable records reference
  const streakData = useStreakData()

  // Lesson recommendation — re-derive weakest factor from the stored answers
  const { weakestFactor } = calculateScore(record.answers)
  const lessonSlug        = getLessonSlugForFactor(weakestFactor)
  const recommendedLesson = lessonSlug ? getLessonBySlug(lessonSlug) : null

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="enter"
      className="space-y-4"
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
            <circle cx="50" cy="50" r="42" fill="none" stroke="var(--color-border)" strokeWidth="8" />
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

        <span className={cn('px-3.5 py-1.5 rounded-full font-body text-sm font-semibold', styles.badge)}>
          {label}
        </span>

        <p className="font-body text-sm text-ink-secondary text-center leading-relaxed max-w-xs">
          {description}
        </p>
      </motion.div>

      {/* ── Streak summary ────────────────────────────────── */}
      {(streakData.currentStreak > 0 || streakData.weeklyCount > 0) && (
        <motion.div variants={staggerItem}>
          {/* Milestone moment */}
          {streakData.milestoneReached && (
            <div className="mb-2 bg-primary rounded-xl px-4 py-3 flex items-center gap-3">
              <span className="text-xl select-none" aria-hidden="true">🎉</span>
              <p className="font-body text-sm font-medium text-ink-on-primary leading-snug">
                {MILESTONE_COPY[streakData.milestoneReached]}
              </p>
            </div>
          )}

          <div className="bg-surface rounded-xl border border-border shadow-xs flex divide-x divide-border overflow-hidden">
            {/* Current streak */}
            <div className="flex-1 px-4 py-3.5 flex items-center gap-2.5">
              <Flame
                size={16}
                className={cn(
                  streakData.currentStreak >= 3 ? 'text-warning' : 'text-ink-muted'
                )}
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <div>
                <p className="font-display text-lg font-semibold text-ink leading-none">
                  {streakData.currentStreak}
                </p>
                <p className="font-body text-[11px] text-ink-muted mt-0.5">
                  {streakData.currentStreak === 1 ? 'day streak' : 'day streak'}
                </p>
              </div>
            </div>

            {/* Weekly consistency */}
            <div className="flex-1 px-4 py-3.5 flex items-center gap-2.5">
              <CalendarDays
                size={16}
                className="text-ink-muted"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <div>
                <p className="font-display text-lg font-semibold text-ink leading-none">
                  {streakData.weeklyCount}
                  <span className="font-body text-sm font-normal text-ink-muted"> / 7</span>
                </p>
                <p className="font-body text-[11px] text-ink-muted mt-0.5">
                  this week
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Personalised tip ─────────────────────────────── */}
      <motion.div
        variants={staggerItem}
        className="bg-primary-light border border-primary-mid rounded-xl px-4 py-4 space-y-1.5"
      >
        <p className="font-body text-[11px] font-semibold text-primary uppercase tracking-wider">
          One thought for today
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

      {/* ── Recommended lesson ───────────────────────────── */}
      {recommendedLesson && (
        <motion.div variants={staggerItem}>
          <Link
            href={`/learn/${recommendedLesson.slug}`}
            className={cn(
              'flex items-center gap-3',
              'bg-surface rounded-xl border border-border shadow-xs',
              'px-4 py-3.5',
              'hover:bg-surface-raised transition-colors duration-fast',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
            )}
          >
            <div className="w-8 h-8 rounded-lg bg-primary-light flex items-center justify-center shrink-0">
              <BookOpen size={15} className="text-primary" strokeWidth={1.75} aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-body text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
                Related lesson
              </p>
              <p className="font-body text-sm font-medium text-ink leading-snug mt-0.5 truncate">
                {recommendedLesson.title}
              </p>
            </div>
            <span className="font-body text-xs text-ink-muted shrink-0">
              {recommendedLesson.readTimeMinutes} min
            </span>
          </Link>
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

      <div className="h-2" aria-hidden="true" />
    </motion.div>
  )
}
