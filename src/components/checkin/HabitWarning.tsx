'use client'

/**
 * HabitWarning (check-in result variant)
 *
 * Renders a single generated HabitWarning from the habit engine.
 * Used on the check-in result screen to show all triggered warnings.
 *
 * This is different from HabitAlertBanner (dashboard):
 *   – Not dismissible (it's part of the check-in result, not an ongoing alert)
 *   – Slightly more compact - designed to stack with others
 *   – Shows both message and actionSuggestion
 *
 * Severity → visual mapping is defined here (co-located with the JSX),
 * per the guidance in types/habit.ts. All tokens verified against
 * tailwind.config.ts.
 *
 * Tokens used:
 *   bg-primary-light, border-primary-mid, text-primary-text   - gentle/info
 *   bg-warning-bg, border (amber-200), text-amber-800         - moderate
 *   text-primary                                               - lesson link
 */

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { HabitWarning as HabitWarningType } from '@/types/habit'
import type { HabitSeverity } from '@/types/habit'

// ── Severity styles (co-located per types/habit.ts guidance) ──────────────
// All token classes verified against tailwind.config.ts

const SEVERITY_STYLES: Record<
  HabitSeverity,
  { wrapper: string; icon: string; title: string; body: string }
> = {
  info: {
    wrapper: 'bg-primary-light border border-primary-mid',
    icon:    '💡',
    title:   'text-primary-text',
    body:    'text-primary-text/75',
  },
  gentle: {
    wrapper: 'bg-primary-light border border-primary-mid',
    icon:    '🌿',
    title:   'text-primary-text',
    body:    'text-primary-text/75',
  },
  moderate: {
    wrapper: 'bg-warning-bg border border-amber-200',
    icon:    '💛',
    title:   'text-amber-800',
    body:    'text-amber-700',
  },
}

interface HabitWarningProps {
  warning: HabitWarningType
  className?: string
}

export function HabitWarning({ warning, className }: HabitWarningProps) {
  const styles = SEVERITY_STYLES[warning.severity]

  return (
    <div
      className={cn('rounded-xl px-4 py-4 space-y-2', styles.wrapper, className)}
      role="note"
      aria-label={`Habit insight: ${warning.title}`}
    >
      {/* Title row */}
      <div className="flex items-start gap-2.5">
        <span className="text-lg shrink-0 select-none mt-px" aria-hidden="true">
          {styles.icon}
        </span>
        <p className={cn('font-body text-sm font-semibold leading-snug', styles.title)}>
          {warning.title}
        </p>
      </div>

      {/* Message */}
      <p className={cn('font-body text-xs leading-relaxed pl-8', styles.body)}>
        {warning.message}
      </p>

      {/* Action suggestion */}
      <p className={cn('font-body text-xs leading-relaxed font-medium pl-8', styles.title)}>
        {warning.actionSuggestion}
      </p>

      {/* Related lesson CTA */}
      {warning.relatedLessonSlug && (
        <div className="pl-8 pt-0.5">
          <Link
            href={`/learn/${warning.relatedLessonSlug}`}
            className={cn(
              'inline-flex items-center gap-1',
              'font-body text-xs font-semibold text-primary',
              'hover:underline underline-offset-2',
              'focus-visible:outline-none focus-visible:ring-1',
              'focus-visible:ring-border-focus rounded-sm',
            )}
          >
            Learn more
            <ChevronRight size={11} strokeWidth={2.5} aria-hidden="true" />
          </Link>
        </div>
      )}
    </div>
  )
}
