'use client'

/**
 * CalorieTargetStep
 *
 * Onboarding step 3 of 3 — read-only result screen.
 *
 * Shows:
 *   – Maintenance calories (TDEE)
 *   – Goal-adjusted daily target
 *   – Plain-language explanation of how the number was derived
 *   – A brief, honest disclaimer about formula accuracy
 *
 * Layout v2:
 *   The hero result card and breakdown table are unchanged in content.
 *   Bottom nav uses the same back-circle + primary-pill pattern as other steps,
 *   with a small `pb-2` added so the buttons sit comfortably above the safe area.
 *
 * Logic is unchanged from v1.
 */

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, Info } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { scaleSpring, staggerContainer, staggerItem } from '@/lib/animations/variants'
import { calculateFromProfile, explainCalorieTarget } from '@/lib/engine/tdee'
import { GOAL_LABELS } from '@/types/user'
import type { UserProfileInput } from '@/types/user'

interface CalorieTargetStepProps {
  profileInput: UserProfileInput
  onSubmit: () => void
  onBack: () => void
}

export function CalorieTargetStep({
  profileInput,
  onSubmit,
  onBack,
}: CalorieTargetStepProps) {
  const result      = useMemo(() => calculateFromProfile(profileInput), [profileInput])
  const explanation = explainCalorieTarget(result, profileInput.goal)
  const isEducate   = profileInput.goal === 'educate'

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="enter"
      className="space-y-4"
    >
      {/* ── Hero result card ─────────────────────────────────── */}
      <motion.div
        variants={staggerItem}
        className="bg-primary-light border border-primary-mid rounded-xl px-5 py-7 text-center space-y-3"
      >
        {isEducate ? (
          <>
            <p className="font-body text-xs font-semibold text-primary uppercase tracking-wider">
              Your estimate
            </p>
            <motion.p
              variants={scaleSpring}
              className="font-display text-5xl font-semibold text-primary tracking-normal"
              aria-label={`Estimated maintenance: ${result.tdee.toLocaleString()} kilocalories per day`}
            >
              {result.tdee.toLocaleString()}
            </motion.p>
            <p className="font-body text-sm text-primary-text/80">
              estimated maintenance kcal / day
            </p>
          </>
        ) : (
          <>
            <p className="font-body text-xs font-semibold text-primary uppercase tracking-wider">
              Your daily target
            </p>
            <motion.p
              variants={scaleSpring}
              className="font-display text-5xl font-semibold text-primary tracking-normal"
              aria-label={`Daily calorie target: ${result.calorieTarget.toLocaleString()} kilocalories`}
            >
              {result.calorieTarget.toLocaleString()}
            </motion.p>
            <p className="font-body text-sm text-primary-text/80">
              kcal per day
            </p>
          </>
        )}
      </motion.div>

      {/* ── Breakdown ────────────────────────────────────────── */}
      {!isEducate && (
        <motion.div
          variants={staggerItem}
          className="bg-surface rounded-xl border border-border shadow-xs divide-y divide-border overflow-hidden"
        >
          <ResultRow label="Maintenance (TDEE)"  value={`${result.tdee.toLocaleString()} kcal`} />
          <ResultRow label="Goal"                value={GOAL_LABELS[profileInput.goal]} />
          <ResultRow
            label="Adjustment"
            value={
              result.adjustment === 0
                ? 'None'
                : `${result.adjustment > 0 ? '+' : ''}${result.adjustment} kcal/day`
            }
          />
          <ResultRow
            label="Daily target"
            value={`${result.calorieTarget.toLocaleString()} kcal`}
            highlight
          />
        </motion.div>
      )}

      {/* ── Plain-language explanation ────────────────────────── */}
      <motion.p
        variants={staggerItem}
        className="font-body text-sm text-ink-secondary leading-relaxed"
      >
        {explanation}
      </motion.p>

      {/* ── Honest disclaimer ────────────────────────────────── */}
      <motion.div
        variants={staggerItem}
        className={cn(
          'flex items-start gap-2.5',
          'rounded-xl px-3.5 py-3',
          'bg-surface-raised border border-border',
        )}
        role="note"
      >
        <Info
          className="w-4 h-4 text-ink-muted shrink-0 mt-px"
          strokeWidth={1.75}
          aria-hidden="true"
        />
        <p className="font-body text-xs text-ink-muted leading-relaxed">
          This estimate uses the Mifflin-St Jeor formula — a standard
          reference tool, not a clinical measurement. Actual needs vary
          between individuals. Adjust if the target feels too high or low
          after a few weeks.
        </p>
      </motion.div>

      {/* ── Navigation ───────────────────────────────────────── */}
      <motion.div variants={staggerItem} className="flex gap-3 pt-1 pb-2">
        <button
          type="button"
          onClick={onBack}
          className={cn(
            'flex items-center justify-center w-12 h-12 rounded-lg shrink-0',
            'border border-border text-ink-secondary bg-surface',
            'hover:bg-surface-raised hover:text-ink active:scale-[0.97]',
            'transition-all duration-fast ease-smooth',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
          )}
          aria-label="Go back"
        >
          <ChevronLeft size={18} strokeWidth={2} />
        </button>

        <button
          type="button"
          onClick={onSubmit}
          className={cn(
            'flex-1 h-12 rounded-lg',
            'bg-primary text-ink-on-primary',
            'font-body text-sm font-semibold',
            'shadow-sm hover:bg-primary-dark active:scale-[0.97]',
            'transition-[background-color,box-shadow,transform] duration-fast ease-out',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2',
          )}
        >
          {isEducate ? 'Start learning' : 'Start tracking'}
        </button>
      </motion.div>
    </motion.div>
  )
}

// ── Sub-component ──────────────────────────────────────────────────────────

function ResultRow({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-between px-4 py-3',
        highlight && 'bg-primary-light',
      )}
    >
      <span
        className={cn(
          'font-body text-sm',
          highlight ? 'font-semibold text-primary-text' : 'text-ink-secondary',
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          'font-body text-sm',
          highlight ? 'font-semibold text-primary' : 'text-ink font-medium',
        )}
      >
        {value}
      </span>
    </div>
  )
}
