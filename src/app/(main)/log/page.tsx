'use client'

/**
 * Log page — /log
 *
 * The food log screen. Now fully wired to real state via useTodayLog().
 * Replaces the previous placeholder with a fully functional logging UI.
 *
 * Features:
 *   – Calorie progress bar (consumed / target / remaining)
 *   – Quick-add chips from recent + common foods
 *   – Four meal sections with add/remove
 *   – FoodEntryForm bottom sheet (shared across all add triggers)
 *
 * State management:
 *   – All food data from useTodayLog() (reads logStore + useCalorieTarget)
 *   – Form open state and pre-fill values are local to this page
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { staggerContainer, staggerItem } from '@/lib/animations/variants'
import { formatDateDisplay, todayISO } from '@/lib/utils/date'
import { useTodayLog } from '@/hooks/useTodayLog'
import { useLogStore, selectRecentFoodNames } from '@/stores/logStore'
import { TopBar } from '@/components/layout/TopBar'
import { CalorieTargetBar } from '@/components/log/CalorieTargetBar'
import { RecentFoodsQuick } from '@/components/log/RecentFoodsQuick'
import { FoodLogList } from '@/components/log/FoodLogList'
import { FoodEntryForm } from '@/components/log/FoodEntryForm'
import type { MealType, FoodEntryInput } from '@/types/food'

// ── Skeleton ──────────────────────────────────────────────────────────────

function LogSkeleton() {
  return (
    <div className="page-container py-5 space-y-5">
      <div className="h-3 w-28 bg-surface-raised rounded-full animate-pulse-soft" />
      <div className="h-20 bg-surface-raised rounded-xl animate-pulse-soft" />
      <div className="h-10 bg-surface-raised rounded-full animate-pulse-soft" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-16 bg-surface-raised rounded-xl animate-pulse-soft"
          style={{ animationDelay: `${i * 60}ms` }} />
      ))}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function LogPage() {
  const {
    byMeal,
    totalCalories,
    calorieTarget,
    addEntry,
    removeEntry,
    isHydrated,
  } = useTodayLog()

  const recentNames = useLogStore(selectRecentFoodNames)

  // ── Form state ─────────────────────────────────────────────────────────
  const [isFormOpen,    setIsFormOpen]    = useState(false)
  const [activeMeal,    setActiveMeal]    = useState<MealType>('snack')
  // Pre-fill values from quick-add chip taps
  const [prefillName,   setPrefillName]   = useState('')
  const [prefillCals,   setPrefillCals]   = useState<number | undefined>(undefined)

  function openForm(meal: MealType = 'snack', name = '', calories?: number) {
    setActiveMeal(meal)
    setPrefillName(name)
    setPrefillCals(calories)
    setIsFormOpen(true)
  }

  function handleAdd(input: FoodEntryInput) {
    addEntry(input)
    // Keep sheet open for rapid logging; user closes manually
  }

  function handleQuickAdd({ name, calories }: { name: string; calories?: number }) {
    openForm('snack', name, calories)
  }

  if (!isHydrated) {
    return (
      <div className="flex flex-col min-h-full bg-background">
        <TopBar title="Food Log" />
        <LogSkeleton />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full bg-background">
      <TopBar
        title="Food Log"
        rightAction={
          <button
            onClick={() => openForm()}
            className={cn(
              'flex items-center justify-center w-9 h-9 rounded-full',
              'bg-primary text-white',
              'hover:bg-primary-dark active:scale-95',
              'transition-all duration-fast',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
            )}
            aria-label="Add food entry"
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>
        }
      />

      <motion.div
        className="page-container py-5 space-y-5"
        variants={staggerContainer}
        initial="initial"
        animate="enter"
      >
        {/* ── Date header ─────────────────────────────────── */}
        <motion.div variants={staggerItem}>
          <p className="font-body text-sm text-ink-muted">
            {formatDateDisplay(todayISO())}
          </p>
        </motion.div>

        {/* ── Calorie progress bar ─────────────────────────── */}
        <motion.div variants={staggerItem}>
          <CalorieTargetBar
            totalCalories={totalCalories}
            calorieTarget={calorieTarget}
          />
        </motion.div>

        {/* ── Quick-add chips ──────────────────────────────── */}
        <motion.div variants={staggerItem}>
          <RecentFoodsQuick
            recentNames={recentNames}
            onQuickAdd={handleQuickAdd}
          />
        </motion.div>

        {/* ── Meal sections ────────────────────────────────── */}
        <motion.div variants={staggerItem}>
          <p className="font-body text-[11px] font-semibold text-ink-muted uppercase tracking-wider mb-3 px-0.5">
            Today&rsquo;s meals
          </p>
          <FoodLogList
            byMeal={byMeal}
            onAddEntry={(meal) => openForm(meal)}
            onRemoveEntry={removeEntry}
          />
        </motion.div>

        {/* ── Main add CTA ─────────────────────────────────── */}
        <motion.div variants={staggerItem}>
          <button
            onClick={() => openForm()}
            className={cn(
              'w-full flex items-center justify-center gap-2',
              'h-12 rounded-full',
              'bg-primary text-ink-on-primary',
              'font-body text-sm font-semibold',
              'shadow-sm hover:bg-primary-dark active:scale-[0.97]',
              'transition-all duration-fast ease-smooth',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2',
            )}
          >
            <Plus size={18} strokeWidth={2.5} aria-hidden="true" />
            Add food
          </button>
        </motion.div>

        {/* Bottom spacer for nav */}
        <div className="h-2" aria-hidden="true" />
      </motion.div>

      {/* ── Food entry form (bottom sheet) ────────────────── */}
      <FoodEntryForm
        isOpen={isFormOpen}
        initialMeal={activeMeal}
        initialName={prefillName}
        initialCalories={prefillCals}
        onAdd={handleAdd}
        onClose={() => setIsFormOpen(false)}
      />
    </div>
  )
}
