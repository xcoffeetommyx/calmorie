'use client'

/**
 * Log page — /log
 *
 * The food log screen, fully wired to real state via useTodayLog().
 *
 * recentNames is computed with useMemo from the raw entries array rather
 * than via a selectRecentFoodNames selector. The old selector created a
 * new string[] on every call, which caused an infinite render loop
 * (React production error #185).
 */

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { staggerContainer, staggerItem } from '@/lib/animations/variants'
import { formatDateDisplay, todayISO } from '@/lib/utils/date'
import { useTodayLog } from '@/hooks/useTodayLog'
import { useLogStore, selectEntries } from '@/stores/logStore'
import { TopBar } from '@/components/layout/TopBar'
import { CalorieTargetBar } from '@/components/log/CalorieTargetBar'
import { RecentFoodsQuick } from '@/components/log/RecentFoodsQuick'
import { FoodLogList } from '@/components/log/FoodLogList'
import { FoodEntryForm } from '@/components/log/FoodEntryForm'
import type { MealType, FoodEntryInput } from '@/types/food'

const RECENT_NAMES_LIMIT = 10

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

  // Read the raw entries reference (stable selector — no new allocation).
  // Derive recent names with useMemo so it only recomputes when entries change.
  const allEntries = useLogStore(selectEntries)
  const recentNames = useMemo(() => {
    const seen   = new Set<string>()
    const result: string[] = []
    for (let i = allEntries.length - 1; i >= 0 && result.length < RECENT_NAMES_LIMIT; i--) {
      const name = allEntries[i].name
      if (!seen.has(name)) {
        seen.add(name)
        result.push(name)
      }
    }
    return result
  }, [allEntries])

  // ── Form state ─────────────────────────────────────────────────────────
  const [isFormOpen,  setIsFormOpen]  = useState(false)
  const [activeMeal,  setActiveMeal]  = useState<MealType>('snack')
  const [prefillName, setPrefillName] = useState('')
  const [prefillCals, setPrefillCals] = useState<number | undefined>(undefined)

  function openForm(meal: MealType = 'snack', name = '', calories?: number) {
    setActiveMeal(meal)
    setPrefillName(name)
    setPrefillCals(calories)
    setIsFormOpen(true)
  }

  function handleAdd(input: FoodEntryInput) {
    addEntry(input)
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
        <motion.div variants={staggerItem}>
          <p className="font-body text-sm text-ink-muted">
            {formatDateDisplay(todayISO())}
          </p>
        </motion.div>

        <motion.div variants={staggerItem}>
          <CalorieTargetBar
            totalCalories={totalCalories}
            calorieTarget={calorieTarget}
          />
        </motion.div>

        <motion.div variants={staggerItem}>
          <RecentFoodsQuick
            recentNames={recentNames}
            onQuickAdd={handleQuickAdd}
          />
        </motion.div>

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

        <div className="h-2" aria-hidden="true" />
      </motion.div>

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
