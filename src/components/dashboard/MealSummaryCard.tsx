'use client'

/**
 * MealSummaryCard
 *
 * Shows a compact summary of today's logged meals, grouped by meal type.
 * Each section shows item count, total kcal, and a micro progress bar
 * proportional to that meal's contribution to the daily total.
 *
 * Phase 4: replace `entries` prop with live data from useTodayLog().
 * The component itself stays the same — only the data source changes.
 */

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { staggerContainer, staggerItem } from '@/lib/animations/variants'
import { formatCalories } from '@/lib/utils/format'
import {
  type FoodEntry,
  type MealType,
  MEAL_TYPE_LABELS,
  MEAL_TYPE_EMOJI,
  MEAL_TYPE_ORDER,
} from '@/types/food'

interface MealSummaryCardProps {
  entries: FoodEntry[]
  calorieTarget: number
  className?: string
}

export function MealSummaryCard({
  entries,
  calorieTarget,
  className,
}: MealSummaryCardProps) {
  // Group entries by meal type
  const byMeal = MEAL_TYPE_ORDER.reduce<Record<MealType, FoodEntry[]>>(
    (acc, meal) => {
      acc[meal] = entries.filter((e) => e.meal === meal)
      return acc
    },
    { breakfast: [], lunch: [], dinner: [], snack: [] },
  )

  const totalEaten = entries.reduce((sum, e) => sum + e.calories, 0)
  const hasEntries = entries.length > 0

  return (
    <div className={cn('bg-surface rounded-xl shadow-card overflow-hidden', className)}>
      {/* ── Card header ──────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div>
          <p className="font-body text-sm font-semibold text-ink">Today&rsquo;s meals</p>
          {hasEntries && (
            <p className="font-body text-xs text-ink-muted mt-0.5">
              {formatCalories(totalEaten)} logged
            </p>
          )}
        </div>
        <Link
          href="/log"
          className={cn(
            'flex items-center gap-1 font-body text-xs font-semibold',
            'text-primary hover:text-primary-dark transition-colors duration-fast',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus rounded-sm',
          )}
          aria-label="Open food log"
        >
          <Plus size={13} strokeWidth={2.5} aria-hidden="true" />
          Add food
        </Link>
      </div>

      {/* ── Meal rows ─────────────────────────────────────────── */}
      {hasEntries ? (
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="enter"
          className="divide-y divide-border"
        >
          {MEAL_TYPE_ORDER.map((mealType) => {
            const mealEntries = byMeal[mealType]
            if (mealEntries.length === 0) return null
            const mealTotal  = mealEntries.reduce((s, e) => s + e.calories, 0)
            const proportion = totalEaten > 0 ? mealTotal / totalEaten : 0

            return (
              <motion.div
                key={mealType}
                variants={staggerItem}
                className="px-4 py-3 space-y-2"
              >
                {/* Row header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base select-none shrink-0" aria-hidden="true">
                      {MEAL_TYPE_EMOJI[mealType]}
                    </span>
                    <span className="font-body text-sm text-ink-secondary truncate">
                      {MEAL_TYPE_LABELS[mealType]}
                    </span>
                  </div>
                  <span className="font-body text-xs font-semibold text-ink shrink-0">
                    {formatCalories(mealTotal)}
                  </span>
                </div>

                {/* Micro progress bar */}
                <div
                  className="h-1 bg-border rounded-full overflow-hidden"
                  role="presentation"
                  aria-hidden="true"
                >
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${proportion * 100}%` }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                  />
                </div>

                {/* Item names */}
                <p className="font-body text-[11px] text-ink-muted leading-relaxed">
                  {mealEntries.map((e) => e.name).join(' · ')}
                </p>
              </motion.div>
            )
          })}
        </motion.div>
      ) : (
        /* Empty state */
        <div className="px-4 py-5 flex flex-col items-center gap-2 text-center">
          <span className="text-2xl select-none" aria-hidden="true">🍽️</span>
          <p className="font-body text-sm text-ink-muted leading-relaxed">
            No meals logged yet today.
          </p>
          <Link
            href="/log"
            className={cn(
              'font-body text-xs font-semibold text-primary',
              'hover:underline underline-offset-2',
            )}
          >
            Log your first meal
          </Link>
        </div>
      )}
    </div>
  )
}
