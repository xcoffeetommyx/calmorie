'use client'

/**
 * RecentFoodsQuick
 *
 * A horizontally scrollable strip of food chips for rapid logging.
 *
 * Priority order:
 *   1. Recently logged food names (from logStore history, last 8 unique)
 *   2. Common foods from commonFoods.ts (fallback when history is empty)
 *
 * Tapping a chip opens FoodEntryForm pre-filled with that food's name
 * and (for common foods) its calorie estimate. For recent foods, only
 * the name is pre-filled — calories may have changed.
 *
 * Props:
 *   recentNames   — recent food names from selectRecentFoodNames
 *   onQuickAdd    — opens FoodEntryForm with pre-filled values
 *   className
 */

import { cn } from '@/lib/utils/cn'
import { getCommonFoods } from '@/data/commonFoods'
import type { MealType } from '@/types/food'

interface QuickAddItem {
  name: string
  calories?: number
  isRecent?: boolean
}

interface RecentFoodsQuickProps {
  recentNames: string[]
  /** Called when a chip is tapped; caller opens FoodEntryForm with these values */
  onQuickAdd: (item: { name: string; calories?: number; meal?: MealType }) => void
  className?: string
}

export function RecentFoodsQuick({
  recentNames,
  onQuickAdd,
  className,
}: RecentFoodsQuickProps) {
  // Build chip list: recents first, then common foods to pad out the list
  const recentItems: QuickAddItem[] = recentNames.slice(0, 8).map((name) => ({
    name,
    isRecent: true,
  }))

  // Fill remaining slots with common foods not already in recents
  const recentSet = new Set(recentNames.map((n) => n.toLowerCase()))
  const commonItems: QuickAddItem[] = getCommonFoods()
    .filter((f) => !recentSet.has(f.name.toLowerCase()))
    .slice(0, Math.max(12 - recentItems.length, 6))
    .map((f) => ({
      name:     f.name,
      calories: f.calories,
      isRecent: false,
    }))

  const chips: QuickAddItem[] = [...recentItems, ...commonItems]

  if (chips.length === 0) return null

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between px-0.5">
        <p className="font-body text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
          Quick add
        </p>
        {recentItems.length > 0 && (
          <p className="font-body text-[10px] text-ink-muted">
            {recentItems.length} recent
          </p>
        )}
      </div>

      {/* Horizontal scroll strip — defined in globals.css */}
      <div
        className="scroll-strip pb-1"
        role="list"
        aria-label="Quick-add foods"
      >
        {chips.map((chip, i) => (
          <button
            key={`${chip.name}-${i}`}
            type="button"
            role="listitem"
            onClick={() => onQuickAdd({ name: chip.name, calories: chip.calories })}
            className={cn(
              'flex items-center gap-1.5 shrink-0',
              'h-9 px-3.5 rounded-full',
              'border font-body text-xs font-medium',
              'transition-all duration-fast ease-smooth',
              'active:scale-[0.96]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
              chip.isRecent
                ? 'bg-primary-light border-primary-mid text-primary-text hover:bg-primary-mid'
                : 'bg-surface border-border text-ink-secondary hover:bg-surface-raised hover:border-border-strong',
            )}
            aria-label={
              chip.calories
                ? `Quick add ${chip.name}, ${chip.calories} kcal`
                : `Quick add ${chip.name}`
            }
          >
            {chip.isRecent && (
              <span className="text-[10px] text-primary font-bold" aria-hidden="true">↩</span>
            )}
            <span className="truncate max-w-[120px]">{chip.name}</span>
            {chip.calories && !chip.isRecent && (
              <span className="text-ink-muted font-normal shrink-0">
                {chip.calories}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
