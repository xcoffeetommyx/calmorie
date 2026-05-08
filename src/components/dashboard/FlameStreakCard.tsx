'use client'

/**
 * FlameStreakCard
 *
 * Dashboard streak module for the daily check-in habit.
 * The card handles three visual jobs:
 *   - Show the current streak and supportive state copy.
 *   - Visualize the last seven days as an ember trail.
 *   - Play a one-shot ignition celebration after a fresh check-in.
 */

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Flame,
  ShieldCheck,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { scaleSpring } from '@/lib/animations/variants'
import {
  getFlameState,
  FLAME_CONFIGS,
  getNextMilestone,
  getSeenMilestones,
  markMilestoneSeen,
  getStreakHeadline,
  getStreakSubtext,
  MILESTONE_MESSAGES,
  type StreakMilestone,
} from '@/lib/utils/streakUtils'
import type { StreakTrailDay } from '@/stores/checkinStore'

interface FlameStreakCardProps {
  currentStreak: number
  bestStreak: number
  weeklyCount: number
  weeklyTrail: StreakTrailDay[]
  isCheckedIn: boolean
  completedLessonsCount: number
  streakMilestone: number | null
  graceActive: boolean
  celebrateToday?: boolean
  className?: string
}

const EMBERS = [
  { x: -28, y: -18, delay: 0.02, size: 5 },
  { x: 26, y: -20, delay: 0.08, size: 4 },
  { x: -34, y: 8, delay: 0.12, size: 3 },
  { x: 32, y: 10, delay: 0.16, size: 5 },
  { x: -12, y: 28, delay: 0.20, size: 3 },
  { x: 16, y: 30, delay: 0.24, size: 4 },
] as const

export function FlameStreakCard({
  currentStreak,
  bestStreak,
  weeklyCount,
  weeklyTrail,
  isCheckedIn,
  completedLessonsCount,
  streakMilestone,
  graceActive,
  celebrateToday = false,
  className,
}: FlameStreakCardProps) {
  const prefersReducedMotion = useReducedMotion()
  const [shownMilestone, setShownMilestone] = useState<number | null>(null)
  const [playCelebration, setPlayCelebration] = useState(false)

  useEffect(() => {
    if (streakMilestone !== null && !getSeenMilestones().has(streakMilestone)) {
      setShownMilestone(streakMilestone)
      markMilestoneSeen(streakMilestone)
    }
  }, [streakMilestone])

  useEffect(() => {
    if (celebrateToday && isCheckedIn) {
      setPlayCelebration(true)
      const timer = window.setTimeout(() => setPlayCelebration(false), 1400)
      return () => window.clearTimeout(timer)
    }
    setPlayCelebration(false)
    return undefined
  }, [celebrateToday, isCheckedIn, currentStreak])

  if (bestStreak === 0 && !isCheckedIn) return null

  const flameState = getFlameState(currentStreak)
  const cfg = FLAME_CONFIGS[flameState]
  const shouldCelebrate = playCelebration && !prefersReducedMotion
  const highlightedToday = celebrateToday && isCheckedIn
  const breathe = cfg.breathingEnabled && isCheckedIn && !prefersReducedMotion && !shouldCelebrate
  const headline = getStreakHeadline(currentStreak, isCheckedIn, graceActive)
  const subtext = getStreakSubtext(currentStreak, isCheckedIn, graceActive)
  const nextMilestone = getNextMilestone(currentStreak)

  const chips: Array<{ key: string; icon: React.ReactNode; label: string }> = []
  if (weeklyCount > 0) {
    chips.push({
      key: 'weekly',
      icon: <CalendarDays size={12} strokeWidth={1.75} className="text-ink-muted shrink-0" aria-hidden="true" />,
      label: `${weeklyCount}/7 this week`,
    })
  }
  if (isCheckedIn) {
    chips.push({
      key: 'checkin',
      icon: <CheckCircle2 size={12} strokeWidth={2.25} className="text-success shrink-0" aria-hidden="true" />,
      label: 'Checked in',
    })
  }
  if (graceActive) {
    chips.push({
      key: 'grace',
      icon: <ShieldCheck size={12} strokeWidth={2} className="text-primary shrink-0" aria-hidden="true" />,
      label: 'Grace day',
    })
  }
  if (completedLessonsCount > 0) {
    chips.push({
      key: 'lessons',
      icon: <BookOpen size={12} strokeWidth={1.75} className="text-primary shrink-0" aria-hidden="true" />,
      label: `${completedLessonsCount} lesson${completedLessonsCount !== 1 ? 's' : ''}`,
    })
  }

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-xl border border-border bg-surface shadow-card',
        highlightedToday && 'ring-1 ring-warning/30',
        className,
      )}
      animate={shouldCelebrate ? { boxShadow: '0 10px 30px -18px rgba(192, 140, 26, 0.65)' } : {}}
      transition={{ duration: 0.35 }}
    >
      {shownMilestone !== null && MILESTONE_MESSAGES[shownMilestone as StreakMilestone] && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-2.5 bg-primary px-4 py-2.5"
        >
          <Sparkles size={15} strokeWidth={2} className="shrink-0 text-ink-on-primary" aria-hidden="true" />
          <p className="font-body text-sm font-medium text-ink-on-primary leading-snug">
            {MILESTONE_MESSAGES[shownMilestone as StreakMilestone]}
          </p>
        </motion.div>
      )}

      <div className="px-4 py-4">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-body text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
            Streak
          </p>
          {bestStreak >= 2 && (
            <div className="flex items-center gap-1 text-ink-muted" aria-label={`Best streak: ${bestStreak} days`}>
              <Trophy size={11} strokeWidth={1.75} aria-hidden="true" />
              <span className="font-body text-[11px]">Best: {bestStreak}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            {shouldCelebrate && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
                {EMBERS.map((ember, index) => (
                  <motion.span
                    key={index}
                    className="absolute rounded-full bg-warning"
                    style={{ width: ember.size, height: ember.size }}
                    initial={{ opacity: 0, x: 0, y: 0, scale: 0.5 }}
                    animate={{ opacity: [0, 1, 0], x: ember.x, y: ember.y, scale: [0.5, 1, 0.2] }}
                    transition={{ duration: 0.7, delay: ember.delay, ease: [0.22, 1, 0.36, 1] }}
                  />
                ))}
              </div>
            )}

            <motion.div
              variants={scaleSpring}
              initial="initial"
              animate="enter"
              className={cn(
                'relative flex h-14 w-14 items-center justify-center rounded-xl',
                graceActive ? 'bg-primary-light' : cfg.bgClass,
              )}
              aria-hidden="true"
            >
              {graceActive && (
                <ShieldCheck
                  size={42}
                  strokeWidth={1.35}
                  className="absolute text-primary/30"
                  aria-hidden="true"
                />
              )}
              <motion.div
                animate={
                  shouldCelebrate
                    ? { scale: [0.7, 1.28, 1], rotate: [-5, 5, 0] }
                    : breathe
                      ? { scale: [1, cfg.breathingScale, 1] }
                      : {}
                }
                transition={
                  shouldCelebrate
                    ? { duration: 0.75, ease: [0.34, 1.56, 0.64, 1] }
                    : breathe
                      ? {
                          repeat: Infinity,
                          repeatType: 'loop' as const,
                          duration: cfg.breathingDuration,
                          ease: 'easeInOut',
                        }
                      : {}
                }
              >
                <Flame
                  size={Math.max(cfg.size + 4, 24)}
                  strokeWidth={1.9}
                  className={cfg.colorClass}
                  style={{
                    opacity: Math.max(cfg.opacity, isCheckedIn ? 0.9 : cfg.opacity),
                    ...(cfg.glowFilter ? { filter: cfg.glowFilter } : {}),
                  }}
                />
              </motion.div>
            </motion.div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-baseline gap-2">
              <motion.span
                key={currentStreak}
                initial={shouldCelebrate ? { opacity: 0, y: 8, scale: 0.86 } : false}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 360, damping: 24 }}
                className="font-display text-3xl font-semibold leading-none text-ink tabular-nums"
              >
                {currentStreak}
              </motion.span>
              <p className="font-body text-sm font-semibold text-ink-secondary">
                {currentStreak === 1 ? 'day' : 'days'}
              </p>
            </div>
            <p className="mt-1 font-display text-base font-semibold leading-snug text-ink">
              {headline}
            </p>
            <p className="mt-0.5 font-body text-xs leading-snug text-ink-secondary">
              {subtext}
            </p>
          </div>
        </div>

        <WeekTrail days={weeklyTrail} shouldCelebrate={shouldCelebrate} />

        {nextMilestone && currentStreak > 0 && (
          <div className="mt-3 flex items-center gap-1.5">
            <Target size={11} strokeWidth={1.75} className="shrink-0 text-ink-muted" aria-hidden="true" />
            <p className="font-body text-[11px] text-ink-muted">
              {nextMilestone.daysLeft === 1
                ? `1 day to ${nextMilestone.target}-day milestone`
                : `${nextMilestone.daysLeft} days to ${nextMilestone.target}-day milestone`}
            </p>
          </div>
        )}

        {chips.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5 border-t border-border pt-3">
            {chips.map(({ key, icon, label }, i) => (
              <motion.span
                key={key}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1], delay: 0.08 + i * 0.04 }}
                className="inline-flex items-center gap-1 rounded-full bg-surface-raised px-2 py-1 font-body text-[11px] font-medium text-ink-secondary"
              >
                {icon}
                {label}
              </motion.span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

function WeekTrail({
  days,
  shouldCelebrate,
}: {
  days: StreakTrailDay[]
  shouldCelebrate: boolean
}) {
  return (
    <div className="mt-4 rounded-lg border border-border bg-background/60 px-3 py-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-body text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
          Last 7 days
        </p>
        <p className="font-body text-[11px] text-ink-muted">
          Keep the trail lit
        </p>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((day, index) => {
          const lit = day.checkedIn || day.isGraceBridge
          const status = day.checkedIn
            ? 'checked in'
            : day.isGraceBridge
              ? 'protected by grace'
              : 'not checked in'

          return (
            <div key={day.date} className="flex flex-col items-center gap-1">
              <motion.div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-md border font-body text-[11px] font-semibold',
                  lit
                    ? day.isGraceBridge
                      ? 'border-primary bg-primary-light text-primary'
                      : 'border-warning bg-warning text-white shadow-sm'
                    : 'border-border bg-surface-raised text-ink-muted',
                  day.isToday && 'ring-2 ring-primary/30 ring-offset-1 ring-offset-background',
                )}
                initial={false}
                animate={
                  shouldCelebrate && day.isToday
                    ? { scale: [0.82, 1.2, 1], y: [2, -2, 0] }
                    : { scale: 1, y: 0 }
                }
                transition={{ duration: 0.55, delay: 0.12 + index * 0.04, ease: [0.34, 1.56, 0.64, 1] }}
                aria-label={`${day.date}: ${status}`}
              >
                {day.isGraceBridge ? (
                  <ShieldCheck size={13} strokeWidth={2} aria-hidden="true" />
                ) : lit ? (
                  <Flame size={13} strokeWidth={2} aria-hidden="true" />
                ) : (
                  day.label
                )}
              </motion.div>
              <span className="font-body text-[10px] leading-none text-ink-muted">
                {day.isToday ? 'Today' : day.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
