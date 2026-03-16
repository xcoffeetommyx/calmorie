'use client'

/**
 * Check-in page — /checkin
 *
 * Entry point for the daily check-in.
 *
 * States:
 *   loading    — checkinStore not yet rehydrated (brief, shows skeleton)
 *   completed  — today's check-in is already done (shows result card)
 *   pending    — check-in hasn't been done yet (shows intro or wizard)
 *
 * The intro screen is shown first; tapping "Start" launches CheckInFlow.
 * This keeps the check-in gate clear: users land here and consciously
 * decide to start rather than being dropped mid-wizard.
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  CheckCircle2,
  ChevronRight,
  RotateCcw,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { TopBar } from '@/components/layout/TopBar'
import { CheckInFlow } from '@/components/checkin/CheckInFlow'
import { CheckInScore } from '@/components/checkin/CheckInScore'
import {
  useCheckinStore,
  selectIsCompletedToday,
  selectTodayRecord,
} from '@/stores/checkinStore'
import { staggerContainer, staggerItem, scaleSpring } from '@/lib/animations/variants'
import { formatDateDisplay, todayISO } from '@/lib/utils/date'

export default function CheckInPage() {
  const isCompleted  = useCheckinStore(selectIsCompletedToday)
  const todayRecord  = useCheckinStore(selectTodayRecord)
  const isHydrated   = useCheckinStore((s) => s.isHydrated)
  const [started,    setStarted]  = useState(false)

  const dateLabel = formatDateDisplay(todayISO())

  // ── Loading (brief skeleton while store rehydrates) ─────────────────────
  if (!isHydrated) {
    return (
      <div className="flex flex-col min-h-full bg-background">
        <TopBar title="Daily Check-in" />
        <div className="page-container py-8 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface-raised rounded-xl h-20 animate-pulse-soft" />
          ))}
        </div>
      </div>
    )
  }

  // ── Already completed today ──────────────────────────────────────────────
  if (isCompleted && todayRecord) {
    return (
      <div className="flex flex-col min-h-full bg-background">
        <TopBar title="Daily Check-in" />
        <div className="page-container py-5">
          {/* Completion header */}
          <motion.div
            className="flex items-center gap-3 mb-5"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div variants={scaleSpring} initial="initial" animate="enter">
              <CheckCircle2
                className="w-5 h-5 text-success shrink-0"
                strokeWidth={2}
                aria-hidden="true"
              />
            </motion.div>
            <div>
              <p className="font-body text-sm font-semibold text-ink">
                Check-in complete
              </p>
              <p className="font-body text-xs text-ink-muted">{dateLabel}</p>
            </div>
          </motion.div>

          {/* Show today's result */}
          <CheckInScore record={todayRecord} />
        </div>
      </div>
    )
  }

  // ── Intro screen (not yet started) ──────────────────────────────────────
  if (!started) {
    return (
      <div className="flex flex-col min-h-full bg-background">
        <TopBar title="Daily Check-in" />
        <motion.div
          className="page-container py-5 space-y-5"
          variants={staggerContainer}
          initial="initial"
          animate="enter"
        >
          {/* Hero card */}
          <motion.div
            variants={staggerItem}
            className="bg-surface rounded-2xl shadow-card p-6 flex flex-col items-center gap-4 text-center"
          >
            <motion.div
              variants={scaleSpring}
              className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center"
            >
              <CheckCircle2
                className="w-8 h-8 text-primary"
                strokeWidth={1.75}
              />
            </motion.div>

            <div className="space-y-1.5">
              <p className="font-body text-xs text-ink-muted">{dateLabel}</p>
              <h2 className="font-display text-xl font-semibold text-ink tracking-tight">
                Ready for your check-in?
              </h2>
              <p className="font-body text-sm text-ink-secondary leading-relaxed max-w-xs mx-auto">
                Seven quick questions about your day. You&rsquo;ll get a wellness
                score and a personalised tip at the end.
              </p>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-surface-raised">
              <span className="text-sm select-none" aria-hidden="true">⏱️</span>
              <span className="font-body text-xs font-medium text-ink-secondary">
                Takes about 2 minutes
              </span>
            </div>
          </motion.div>

          {/* Question preview */}
          <motion.div
            variants={staggerItem}
            className="bg-surface rounded-xl shadow-card divide-y divide-border overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-border">
              <p className="font-body text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
                What we&rsquo;ll ask about
              </p>
            </div>
            {QUESTION_PREVIEWS.map(({ emoji, text }, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <span className="text-base select-none w-6 text-center shrink-0" aria-hidden="true">
                  {emoji}
                </span>
                <p className="font-body text-sm text-ink-secondary leading-snug flex-1 min-w-0">
                  {text}
                </p>
                <span className="font-body text-[11px] font-semibold text-ink-muted shrink-0 tabular-nums">
                  {i + 1}/7
                </span>
              </div>
            ))}
          </motion.div>

          {/* Start CTA */}
          <motion.div variants={staggerItem}>
            <button
              onClick={() => setStarted(true)}
              className={cn(
                'w-full flex items-center justify-center gap-2',
                'h-14 rounded-full',
                'bg-primary text-ink-on-primary',
                'font-body text-base font-semibold',
                'shadow-sm hover:bg-primary-dark active:scale-[0.97]',
                'transition-all duration-fast ease-smooth',
                'focus-visible:outline-none focus-visible:ring-2',
                'focus-visible:ring-border-focus focus-visible:ring-offset-2',
              )}
              aria-label="Start today's check-in"
            >
              Start today&rsquo;s check-in
              <ChevronRight size={18} strokeWidth={2.25} aria-hidden="true" />
            </button>
          </motion.div>

          {/* Privacy note */}
          <motion.p
            variants={staggerItem}
            className="font-body text-xs text-ink-muted text-center leading-relaxed"
          >
            Check-ins are private and stored only on your device.
          </motion.p>
        </motion.div>
      </div>
    )
  }

  // ── Wizard ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-full bg-background">
      <TopBar title="Daily Check-in" />
      <div className="page-container py-5">
        <CheckInFlow onComplete={() => setStarted(false)} />
      </div>
    </div>
  )
}

// ── Static preview data ────────────────────────────────────────────────────

const QUESTION_PREVIEWS = [
  { emoji: '🍽️', text: 'How many meals did you eat today?' },
  { emoji: '⏭️', text: 'Did you skip any meals?' },
  { emoji: '🥤', text: 'Did you have any sugary drinks?' },
  { emoji: '🚶', text: 'How active were you?' },
  { emoji: '😴', text: 'How well did you sleep last night?' },
  { emoji: '😤', text: 'How stressed are you feeling?' },
  { emoji: '🌙', text: 'Did you eat after 9 PM?' },
] as const
