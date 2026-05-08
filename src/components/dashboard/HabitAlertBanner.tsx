'use client'

/**
 * HabitAlertBanner
 *
 * Displays a single gentle habit alert on the dashboard.
 * Uses the severity level and tone from the habit rule system.
 *
 * Severity theming (colours verified against tailwind.config.ts):
 *   info     - bg-primary-light / text-primary-text (blue-green, informational)
 *   gentle   - bg-primary-light / text-primary-text (default, most common)
 *   moderate - bg-warning-bg / text-amber-800 (warranted attention)
 *
 * Important tone note: messages are written in the rules layer
 * (data/habitRules.ts). This component never rewrites or adds
 * judgement - it only presents what the rule provides.
 *
 * Props:
 *   alert - a HabitAlertDisplay object (either a full HabitWarning or
 *           a shape derived from a HabitRule for static/mock use)
 *
 * Phase 5: replace static mock with live output from habitEngine
 * evaluated against the latest CheckInRecord.
 */

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { X, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils/cn'
import { alertSlideIn } from '@/lib/animations/variants'
import type { HabitSeverity } from '@/types/habit'

// ── Severity → visual mapping ──────────────────────────────────────────────
// Defined here (co-located with the rendering component) per the guidance
// in types/habit.ts - not in the type definitions layer.

const SEVERITY_STYLES: Record<
  HabitSeverity,
  { wrapper: string; icon: string; title: string; body: string; dismiss: string }
> = {
  info: {
    wrapper: 'bg-primary-light border border-primary-mid',
    icon:    '💡',
    title:   'text-primary-text',
    body:    'text-primary-text/80',
    dismiss: 'text-primary-text/60 hover:text-primary-text',
  },
  gentle: {
    wrapper: 'bg-primary-light border border-primary-mid',
    icon:    '🌿',
    title:   'text-primary-text',
    body:    'text-primary-text/80',
    dismiss: 'text-primary-text/60 hover:text-primary-text',
  },
  moderate: {
    wrapper: 'bg-warning-bg border border-amber-200',
    icon:    '💛',
    title:   'text-amber-800',
    body:    'text-amber-700',
    dismiss: 'text-amber-500 hover:text-amber-700',
  },
}

export interface HabitAlertDisplay {
  ruleId: string
  severity: HabitSeverity
  title: string
  message: string
  actionSuggestion: string
  relatedLessonSlug?: string
}

interface HabitAlertBannerProps {
  alert: HabitAlertDisplay
  className?: string
}

export function HabitAlertBanner({ alert, className }: HabitAlertBannerProps) {
  const [dismissed, setDismissed] = useState(false)
  const styles = SEVERITY_STYLES[alert.severity]

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          key={alert.ruleId}
          variants={alertSlideIn}
          initial="initial"
          animate="enter"
          exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.18 } }}
          className={cn(
            'rounded-xl px-4 py-4 relative',
            styles.wrapper,
            className,
          )}
          role="note"
          aria-label={`Habit insight: ${alert.title}`}
        >
          {/* Dismiss button */}
          <button
            onClick={() => setDismissed(true)}
            className={cn(
              'absolute top-3 right-3',
              'w-6 h-6 rounded-full flex items-center justify-center',
              'transition-colors duration-fast',
              styles.dismiss,
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
            )}
            aria-label="Dismiss this insight"
          >
            <X size={14} strokeWidth={2} />
          </button>

          <div className="flex items-start gap-3 pr-6">
            {/* Severity icon */}
            <span className="text-lg mt-px select-none shrink-0" aria-hidden="true">
              {styles.icon}
            </span>

            <div className="min-w-0 space-y-1.5">
              {/* Title */}
              <p className={cn('font-body text-sm font-semibold leading-snug', styles.title)}>
                {alert.title}
              </p>

              {/* Message */}
              <p className={cn('font-body text-xs leading-relaxed', styles.body)}>
                {alert.message}
              </p>

              {/* Action suggestion */}
              <p className={cn('font-body text-xs leading-relaxed font-medium', styles.title)}>
                {alert.actionSuggestion}
              </p>

              {/* Lesson link if available */}
              {alert.relatedLessonSlug && (
                <Link
                  href={`/learn/${alert.relatedLessonSlug}`}
                  className={cn(
                    'inline-flex items-center gap-1 mt-1',
                    'font-body text-xs font-semibold',
                    styles.title,
                    'hover:underline underline-offset-2',
                    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-border-focus rounded-sm',
                  )}
                  aria-label={`Learn more about this topic`}
                >
                  Learn more
                  <ChevronRight size={11} strokeWidth={2.5} aria-hidden="true" />
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
