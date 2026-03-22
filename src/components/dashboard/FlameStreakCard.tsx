'use client'

/**
 * FlameStreakCard
 *
 * Streak-first dashboard card with a 6-state flame visual system.
 * States: cold → warm → growing → hot → blazing → legendary
 *
 * Key behaviours:
 *   – brand-new users (bestStreak === 0 && !isCheckedIn): returns null
 *   – grace day: shield indicator + "Check in today — your streak is still alive."
 *   – milestone banner: one-time celebration via localStorage "seen" tracking
 *   – next milestone: subtle progress text ("X days to your next milestone")
 *   – flame breathing: only when checked in today + !prefersReducedMotion
 *   – chips row: weekly / checked-in / lessons completed
 */

import { useState, useEffect }  from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Flame, CalendarDays, CheckCircle2, BookOpen, Trophy, ShieldCheck, Target } from 'lucide-react'
import { cn }                   from '@/lib/utils/cn'
import { scaleSpring }          from '@/lib/animations/variants'
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

// ── Props ──────────────────────────────────────────────────────────────────

interface FlameStreakCardProps {
  currentStreak:         number
  bestStreak:            number
  weeklyCount:           number
  isCheckedIn:           boolean
  completedLessonsCount: number
  streakMilestone:       number | null
  graceActive:           boolean
  className?:            string
}

// ── Component ──────────────────────────────────────────────────────────────

export function FlameStreakCard({
  currentStreak,
  bestStreak,
  weeklyCount,
  isCheckedIn,
  completedLessonsCount,
  streakMilestone,
  graceActive,
  className,
}: FlameStreakCardProps) {
  const prefersReducedMotion = useReducedMotion()

  // One-time milestone banner — check localStorage, mark seen in effect
  const [shownMilestone, setShownMilestone] = useState<number | null>(null)
  useEffect(() => {
    if (streakMilestone !== null && !getSeenMilestones().has(streakMilestone)) {
      setShownMilestone(streakMilestone)
      markMilestoneSeen(streakMilestone)
    }
  }, [streakMilestone])

  // Hide for brand-new users — CheckInCTA handles the first-time prompt
  if (bestStreak === 0 && !isCheckedIn) return null

  const flameState = getFlameState(currentStreak)
  const cfg        = FLAME_CONFIGS[flameState]

  // Breathing: only when checked in today and reduced motion is not preferred
  const breathe = cfg.breathingEnabled && isCheckedIn && !prefersReducedMotion

  const headline     = getStreakHeadline(currentStreak, isCheckedIn, graceActive)
  const subtext      = getStreakSubtext(currentStreak, isCheckedIn, graceActive)
  const nextMilestone = getNextMilestone(currentStreak)

  // Secondary info chips
  const chips: Array<{ key: string; icon: React.ReactNode; label: string }> = []
  if (weeklyCount > 0) {
    chips.push({
      key:   'weekly',
      icon:  <CalendarDays size={12} strokeWidth={1.75} className="text-ink-muted shrink-0" aria-hidden="true" />,
      label: `${weeklyCount}/7 this week`,
    })
  }
  if (isCheckedIn) {
    chips.push({
      key:   'checkin',
      icon:  <CheckCircle2 size={12} strokeWidth={2.25} className="text-success shrink-0" aria-hidden="true" />,
      label: 'Checked in',
    })
  }
  if (graceActive) {
    chips.push({
      key:   'grace',
      icon:  <ShieldCheck size={12} strokeWidth={2} className="text-primary shrink-0" aria-hidden="true" />,
      label: 'Grace day',
    })
  }
  if (completedLessonsCount > 0) {
    chips.push({
      key:   'lessons',
      icon:  <BookOpen size={12} strokeWidth={1.75} className="text-primary shrink-0" aria-hidden="true" />,
      label: `${completedLessonsCount} lesson${completedLessonsCount !== 1 ? 's' : ''}`,
    })
  }

  return (
    <div className={cn('bg-surface rounded-xl shadow-card overflow-hidden', className)}>

      {/* ── Milestone banner — one-time celebration ───── */}
      {shownMilestone !== null && MILESTONE_MESSAGES[shownMilestone as StreakMilestone] && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-2.5 bg-primary px-4 py-2.5"
        >
          <span className="text-base select-none shrink-0" aria-hidden="true">🎉</span>
          <p className="font-body text-sm font-medium text-ink-on-primary leading-snug">
            {MILESTONE_MESSAGES[shownMilestone as StreakMilestone]}
          </p>
        </motion.div>
      )}

      <div className="px-4 py-4">
        {/* ── Eyebrow row: "Streak" label + best streak ─── */}
        <div className="flex items-center justify-between mb-3">
          <p className="font-body text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
            Streak
          </p>
          {bestStreak >= 2 && (
            <div
              className="flex items-center gap-1 text-ink-muted"
              aria-label={`Best streak: ${bestStreak} days`}
            >
              <Trophy size={11} strokeWidth={1.75} aria-hidden="true" />
              <span className="font-body text-[11px]">Best: {bestStreak}</span>
            </div>
          )}
        </div>

        {/* ── Flame icon + headline ─────────────────────── */}
        <div className="flex items-center gap-3.5">
          {/* Flame container — spring mount on appearance, optional breathing */}
          <motion.div
            variants={scaleSpring}
            initial="initial"
            animate="enter"
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
              cfg.bgClass,
            )}
            aria-hidden="true"
          >
            <motion.div
              animate={breathe ? { scale: [1, cfg.breathingScale, 1] } : {}}
              transition={breathe ? {
                repeat:     Infinity,
                repeatType: 'loop' as const,
                duration:   cfg.breathingDuration,
                ease:       'easeInOut',
              } : {}}
            >
              <Flame
                size={cfg.size}
                strokeWidth={1.75}
                className={cfg.colorClass}
                style={{
                  opacity: cfg.opacity,
                  ...(cfg.glowFilter ? { filter: cfg.glowFilter } : {}),
                }}
              />
            </motion.div>
          </motion.div>

          {/* Headline + supportive subtext */}
          <div className="flex-1 min-w-0">
            <p className={cn(
              'font-display text-base font-semibold leading-snug',
              currentStreak >= 1 ? 'text-ink' : 'text-ink-secondary',
            )}>
              {headline}
            </p>
            <p className="font-body text-xs text-ink-secondary leading-snug mt-0.5">
              {subtext}
            </p>
          </div>
        </div>

        {/* ── Next milestone anticipation ───────────────── */}
        {nextMilestone && currentStreak > 0 && (
          <div className="flex items-center gap-1.5 mt-3">
            <Target size={11} strokeWidth={1.75} className="text-ink-muted shrink-0" aria-hidden="true" />
            <p className="font-body text-[11px] text-ink-muted">
              {nextMilestone.daysLeft === 1
                ? `1 day to ${nextMilestone.target}-day milestone`
                : `${nextMilestone.daysLeft} days to ${nextMilestone.target}-day milestone`}
            </p>
          </div>
        )}

        {/* ── Secondary chips ───────────────────────────── */}
        {chips.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-border">
            {chips.map(({ key, icon, label }, i) => (
              <motion.span
                key={key}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 0.25,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.08 + i * 0.04,
                }}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-surface-raised font-body text-[11px] font-medium text-ink-secondary"
              >
                {icon}
                {label}
              </motion.span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
