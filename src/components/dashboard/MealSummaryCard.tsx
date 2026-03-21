'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Plus, UtensilsCrossed } from 'lucide-react'
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

export function MealSummaryCard({ entries, calorieTarget, className }: MealSummaryCardProps) {
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
      {/* Header */}
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
            'flex items-center gap-1',
            'font-body text-xs font-semibold text-primary',
            'hover:text-primary-dark transition-colors duration-fast',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus rounded-sm',
          )}
          aria-label="Open food log"
        >
          <Plus size={13} strokeWidth={2.5} aria-hidden="true" />
          Add food
        </Link>
      </div>

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
              <motion.div key={mealType} variants={staggerItem} className="px-4 py-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base select-none shrink-0" aria-hidden="true">
                      {MEAL_TYPE_EMOJI[mealType]}
                    </span>
                    <span className="font-body text-sm text-ink-secondary truncate">
                      {MEAL_TYPE_LABELS[mealType]}
                    </span>
                  </div>
                  <span className="font-body text-xs font-semibold text-ink shrink-0 tabular-nums">
                    {formatCalories(mealTotal)}
                  </span>
                </div>

                {/* Micro progress bar */}
                <div
                  className="h-1.5 bg-surface-raised rounded-full overflow-hidden"
                  role="presentation"
                  aria-hidden="true"
                >
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${proportion * 100}%` }}
                    transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                  />
                </div>

                {/* Item names */}
                <p className="font-body text-[11px] text-ink-muted leading-relaxed truncate">
                  {mealEntries.map((e) => e.name).join(' · ')}
                </p>
              </motion.div>
            )
          })}
        </motion.div>
      ) : (
        /* Polished empty state */
        <div className="px-4 py-7 flex flex-col items-center gap-3 text-center">
          <div className="w-11 h-11 rounded-full bg-surface-raised flex items-center justify-center">
            <UtensilsCrossed
              className="w-5 h-5 text-ink-muted"
              strokeWidth={1.75}
              aria-hidden="true"
            />
          </div>
          <div className="space-y-1">
            <p className="font-body text-sm font-medium text-ink-secondary">
              Nothing logged yet
            </p>
            <p className="font-body text-xs text-ink-muted leading-relaxed">
              Tap below to start tracking your meals today.
            </p>
          </div>
          <Link
            href="/log"
            className={cn(
              'inline-flex items-center gap-1.5',
              'h-8 px-4 rounded-full',
              'bg-primary-light text-primary',
              'font-body text-xs font-semibold',
              'hover:bg-primary-mid transition-colors duration-fast',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
            )}
            aria-label="Go to food log"
          >
            <Plus size={13} strokeWidth={2.5} aria-hidden="true" />
            Log first meal
          </Link>
        </div>
      )}
    </div>
  )
}
