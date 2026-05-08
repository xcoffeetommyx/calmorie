'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { CheckCircle2, ChevronRight, Sun, Flame } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { scaleSpring } from '@/lib/animations/variants'

interface CheckInCTAProps {
  isCompleted: boolean
  score?: number
  /** Current check-in streak - shown in completed state when > 0 */
  streak?: number
  className?: string
}

export function CheckInCTA({ isCompleted, score, streak, className }: CheckInCTAProps) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {isCompleted ? (
        <CompletedState key="completed" score={score} streak={streak} className={className} />
      ) : (
        <PendingState key="pending" className={className} />
      )}
    </AnimatePresence>
  )
}

function PendingState({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href="/checkin"
        className={cn(
          'flex items-center justify-between',
          'bg-primary text-ink-on-primary',
          'rounded-2xl px-5 py-4',
          'shadow-sm hover:shadow-md hover:bg-primary-dark',
          'active:scale-[0.98]',
          'transition-all duration-fast ease-smooth',
          'focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-border-focus focus-visible:ring-offset-2',
          className,
        )}
        aria-label="Start today's morning check-in"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center shrink-0">
            <Sun className="w-4 h-4" strokeWidth={1.75} aria-hidden="true" />
          </div>
          <div className="space-y-0.5">
            <p className="font-body text-sm font-semibold leading-snug">
              Morning Check-In
            </p>
            <p className="font-body text-xs opacity-75">
              7 questions · about 2 minutes
            </p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 opacity-70 shrink-0" strokeWidth={2} aria-hidden="true" />
      </Link>
    </motion.div>
  )
}

function CompletedState({
  score,
  streak,
  className,
}: {
  score?: number
  streak?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'flex items-center justify-between',
        'bg-surface border border-border',
        'rounded-2xl px-5 py-4',
        className,
      )}
      role="status"
      aria-label="Today's morning check-in is complete"
    >
      <div className="flex items-center gap-3">
        <motion.div
          variants={scaleSpring}
          initial="initial"
          animate="enter"
          className="w-8 h-8 rounded-full bg-success-bg flex items-center justify-center shrink-0"
        >
          <CheckCircle2 className="w-4 h-4 text-success" strokeWidth={2.25} aria-hidden="true" />
        </motion.div>
        <div className="space-y-0.5">
          <p className="font-body text-sm font-semibold text-ink leading-snug">
            Check-in done
          </p>
          <p className="font-body text-xs text-ink-muted">
            {streak && streak > 1
              ? `${streak}-day streak`
              : 'See you again tomorrow'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Streak flame - only when streak ≥ 3 */}
        {streak && streak >= 3 && (
          <motion.div
            variants={scaleSpring}
            initial="initial"
            animate="enter"
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-warning-bg"
            aria-label={`${streak}-day streak`}
          >
            <Flame size={13} className="text-warning" strokeWidth={2} aria-hidden="true" />
            <span className="font-body text-xs font-bold text-warning tabular-nums">
              {streak}
            </span>
          </motion.div>
        )}

        {/* Score badge */}
        {score !== undefined && (
          <motion.div
            variants={scaleSpring}
            initial="initial"
            animate="enter"
            className="w-10 h-10 rounded-full bg-success-bg flex items-center justify-center"
            aria-label={`Today's score: ${score} out of 100`}
          >
            <span className="font-body text-sm font-bold text-success tabular-nums">
              {score}
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
