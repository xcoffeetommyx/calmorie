'use client'

/**
 * Log page — /log
 *
 * Two-speed food logging:
 *   instant chips  → log immediately, no form, ✓ feedback for 1.5 s
 *   prefill chips  → open FoodEntryForm pre-filled, user confirms
 *   + Custom chip  → open blank form
 *
 * Recent items: persisted in localStorage via useRecentQuickItems.
 * Falls back to deriving QuickItems from allEntries on first use.
 */

import { useState, useMemo }        from 'react'
import { motion }                    from 'framer-motion'
import { Plus }                      from 'lucide-react'
import { cn }                        from '@/lib/utils/cn'
import { staggerContainer, staggerItem } from '@/lib/animations/variants'
import { formatDateDisplay, todayISO }   from '@/lib/utils/date'
import { useTodayLog }               from '@/hooks/useTodayLog'
import { useLogStore, selectEntries } from '@/stores/logStore'
import { useRecentQuickItems }       from '@/hooks/useRecentQuickItems'
import { buildRecentQuickItem, getMealByTimeOfDay } from '@/lib/utils/quickAddUtils'
import { TopBar }                    from '@/components/layout/TopBar'
import { CalorieTargetBar }          from '@/components/log/CalorieTargetBar'
import { RecentFoodsQuick }          from '@/components/log/RecentFoodsQuick'
import { FoodLogList }               from '@/components/log/FoodLogList'
import { FoodEntryForm }             from '@/components/log/FoodEntryForm'
import type { MealType, FoodEntryInput, QuickItem } from '@/types/food'

const RECENT_FALLBACK_LIMIT = 8

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

  // Persisted recents from localStorage
  const { recentItems, addRecentItem } = useRecentQuickItems()

  // Raw entries — stable selector, no new allocation per render
  const allEntries = useLogStore(selectEntries)

  // Fallback: build QuickItems from allEntries when localStorage recents are empty
  const derivedRecents = useMemo<QuickItem[]>(() => {
    if (recentItems.length > 0) return []
    const seen   = new Set<string>()
    const result: QuickItem[] = []
    for (let i = allEntries.length - 1; i >= 0 && result.length < RECENT_FALLBACK_LIMIT; i--) {
      const entry = allEntries[i]
      if (!seen.has(entry.name.toLowerCase())) {
        seen.add(entry.name.toLowerCase())
        result.push(buildRecentQuickItem(entry))
      }
    }
    return result
  }, [allEntries, recentItems.length])

  const quickRecents = recentItems.length > 0 ? recentItems : derivedRecents

  // ── Form state ─────────────────────────────────────────────────────────
  const [isFormOpen,  setIsFormOpen]  = useState(false)
  const [activeMeal,  setActiveMeal]  = useState<MealType>('snack')
  const [prefillName, setPrefillName] = useState('')
  const [prefillCals, setPrefillCals] = useState<number | undefined>(undefined)

  function openForm(meal?: MealType, name = '', calories?: number) {
    setActiveMeal(meal ?? getMealByTimeOfDay())
    setPrefillName(name)
    setPrefillCals(calories)
    setIsFormOpen(true)
  }

  // Called when form is submitted
  function handleAdd(input: FoodEntryInput) {
    const entry = addEntry(input)
    if (entry) {
      addRecentItem(buildRecentQuickItem(entry))
    }
  }

  // One-tap instant log: no form
  function handleInstantLog(item: QuickItem) {
    const meal  = item.defaultMeal ?? getMealByTimeOfDay()
    const entry = addEntry({ name: item.name, calories: item.calories, meal })
    if (entry) {
      addRecentItem({ ...item, defaultMeal: meal, lastUsedAt: entry.loggedAt })
    }
  }

  // Prefill: open form with smart meal default
  function handlePrefill({ name, calories, meal }: { name: string; calories: number; meal?: MealType }) {
    openForm(meal, name, calories)
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
            recentItems={quickRecents}
            onInstantLog={handleInstantLog}
            onPrefill={handlePrefill}
            onAddManually={() => openForm()}
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
