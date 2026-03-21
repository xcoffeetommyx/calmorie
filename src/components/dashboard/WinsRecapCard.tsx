'use client'

/**
 * WinsRecapCard
 *
 * A compact strip of "wins" chips that summarises recent progress at a glance.
 * Designed to feel encouraging without being loud or gamified.
 *
 * Chips shown (only when the condition is met):
 *   – Checked in today
 *   – Current streak (when ≥ 2 days)
 *   – Weekly consistency (when ≥ 3 of 7 days)
 *   – Lessons read count (when ≥ 1)
 *
 * Milestone banner (above chips, only at exact thresholds):
 *   – Streak milestones: 3, 7, 14, 30 days
 *   – Lesson milestones: 1, 5, 10 lessons completed
 *
 * Returns null when there are no chips to show (brand-new user with no activity).
 * This prevents an empty card from appearing for first-time users.
 */

import { motion } from 'framer-motion'
import { CheckCircle2, Flame, CalendarDays, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

// ── Lesson milestone thresholds ────────────────────────────────────────────
// Only non-null when completedLessonsCount is EXACTLY at one of these values.
// This gives a brief "achievement unlocked" moment that disappears once you
// move past it — consistent with how StreakData.milestoneReached works.
const LESSON_MILESTONE_VALUES = [1, 5, 10] as const

// ── Props ──────────────────────────────────────────────────────────────────

interface WinsRecapCardProps {
  isCheckedIn:           boolean
  currentStreak:         number
  weeklyCount:           number
  completedLessonsCount: number
  /** Non-null when the current streak is exactly at a milestone (3/7/14/30). */
  streakMilestone:       number | null
  className?:            string
}

// ── Milestone copy ─────────────────────────────────────────────────────────

const MILESTONE_COPY: Record<string, string> = {
  '3':        '3-day streak — a habit is starting to form.',
  '7':        'A full week of check-ins. Consistency adds up.',
  '14':       'Two weeks straight. You\'re building something real.',
  '30':       'Thirty days. That\'s genuine commitment.',
  'lesson-1': 'First lesson done — great start.',
  'lesson-5': 'Five lessons read. You\'re growing.',
  'lesson-10':'Ten lessons. That\'s real dedication.',
}

// ── Component ──────────────────────────────────────────────────────────────

export function WinsRecapCard({
  isCheckedIn,
  currentStreak,
  weeklyCount,
  completedLessonsCount,
  streakMilestone,
  className,
}: WinsRecapCardProps) {
  // Build chips — only include ones with something to show
  const chips: Array<{
    key:   string
    icon:  React.ReactNode
    label: string
    cls:   string
  }> = []

  if (isCheckedIn) {
    chips.push({
      key:   'checkin',
      icon:  <CheckCircle2 size={13} className="text-success shrink-0" strokeWidth={2.25} />,
      label: 'Checked in',
      cls:   'bg-success-bg text-success',
    })
  }

  if (currentStreak >= 2) {
    chips.push({
      key:   'streak',
      icon:  <Flame size={13} className="text-warning shrink-0" strokeWidth={2} />,
      label: `${currentStreak}-day streak`,
      cls:   'bg-warning-bg text-amber-800',
    })
  }

  if (weeklyCount >= 3) {
    chips.push({
      key:   'weekly',
      icon:  <CalendarDays size={13} className="text-ink-muted shrink-0" strokeWidth={1.75} />,
      label: `${weeklyCount}/7 this week`,
      cls:   'bg-surface-raised text-ink-secondary',
    })
  }

  if (completedLessonsCount > 0) {
    chips.push({
      key:   'lessons',
      icon:  <BookOpen size={13} className="text-primary shrink-0" strokeWidth={1.75} />,
      label: `${completedLessonsCount} lesson${completedLessonsCount !== 1 ? 's' : ''} read`,
      cls:   'bg-primary-light text-primary-text',
    })
  }

  // Nothing to show yet — don't render for brand-new users
  if (chips.length === 0) return null

  // Determine if a milestone banner should show
  const lessonMilestone = (LESSON_MILESTONE_VALUES as readonly number[]).includes(completedLessonsCount)
    ? completedLessonsCount
    : null
  const milestoneKey =
    streakMilestone !== null
      ? String(streakMilestone)
      : lessonMilestone !== null
        ? `lesson-${lessonMilestone}`
        : null

  return (
    <div className={cn('space-y-2', className)}>
      {/* Milestone banner — only at exact thresholds */}
      {milestoneKey && MILESTONE_COPY[milestoneKey] && (
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-2.5 bg-primary rounded-xl px-4 py-2.5"
        >
          <span className="text-base select-none shrink-0" aria-hidden="true">🎉</span>
          <p className="font-body text-sm font-medium text-ink-on-primary leading-snug">
            {MILESTONE_COPY[milestoneKey]}
          </p>
        </motion.div>
      )}

      {/* Win chips row */}
      <div className="flex flex-wrap gap-2" role="list" aria-label="Recent wins">
        {chips.map(({ key, icon, label, cls }, i) => (
          <motion.div
            key={key}
            role="listitem"
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1], delay: 0.04 * i }}
            className={cn(
              'inline-flex items-center gap-1.5',
              'px-3 py-1.5 rounded-full',
              'font-body text-xs font-semibold',
              cls,
            )}
          >
            {icon}
            <span>{label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
