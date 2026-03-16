'use client'

/**
 * CheckInCTA
 *
 * Prominent call-to-action card for the daily check-in.
 * Shows two states:
 *
 *   pending   — "Check in hasn't been done today" — prominent green button
 *   completed — "Well done, check-in complete" — muted success state
 *
 * The transition between states uses a spring scale so the completion
 * feels rewarding without being excessive.
 *
 * Phase 5: replace `isCompleted` prop with live checkinStore value.
 * The component API stays the same.
 *
 * Props:
 *   isCompleted — whether today's check-in has been submitted
 *   score       — (optional) today's score, shown in the completed state
 */

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { CheckCircle2, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { scaleSpring } from '@/lib/animations/variants'

interface CheckInCTAProps {
  isCompleted: boolean
  score?: number
  className?: string
}

export function CheckInCTA({ isCompleted, score, className }: CheckInCTAProps) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      {isCompleted ? (
        <CompletedState key="completed" score={score} className={className} />
      ) : (
        <PendingState key="pending" className={className} />
      )}
    </AnimatePresence>
  )
}

// ── Pending state ─────────────────────────────────────────────────────────

function PendingState({ className }: { className?: string }) {
  return (
    <motion.div
      key="pending"
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
          'rounded-2xl px-5 py-4 shadow-sm',
          'transition-all duration-fast ease-smooth',
          'hover:bg-primary-dark active:scale-[0.98]',
          'focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-border-focus focus-visible:ring-offset-2',
          className,
        )}
        aria-label="Start today's daily check-in"
      >
        <div className="space-y-0.5">
          <p className="font-body text-sm font-semibold leading-snug">
            Daily check-in
          </p>
          <p className="font-body text-xs opacity-75">
            7 quick questions · about 2 minutes
          </p>
        </div>
        <ChevronRight
          className="w-5 h-5 opacity-80 shrink-0"
          strokeWidth={2}
          aria-hidden="true"
        />
      </Link>
    </motion.div>
  )
}

// ── Completed state ───────────────────────────────────────────────────────

function CompletedState({ score, className }: { score?: number; className?: string }) {
  return (
    <motion.div
      key="completed"
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
      aria-label="Today's check-in is complete"
    >
      <div className="flex items-center gap-3">
        <motion.div variants={scaleSpring} initial="initial" animate="enter">
          <CheckCircle2
            className="w-5 h-5 text-success shrink-0"
            strokeWidth={2}
            aria-hidden="true"
          />
        </motion.div>
        <div className="space-y-0.5">
          <p className="font-body text-sm font-semibold text-ink leading-snug">
            Check-in complete
          </p>
          <p className="font-body text-xs text-ink-muted">
            Come back tomorrow for your next check-in
          </p>
        </div>
      </div>

      {/* Score badge, if available */}
      {score !== undefined && (
        <motion.div
          variants={scaleSpring}
          initial="initial"
          animate="enter"
          className={cn(
            'shrink-0 w-10 h-10 rounded-full',
            'bg-success-bg flex items-center justify-center',
          )}
          aria-label={`Today's score: ${score} out of 100`}
        >
          <span className="font-body text-sm font-bold text-success">
            {score}
          </span>
        </motion.div>
      )}
    </motion.div>
  )
}
