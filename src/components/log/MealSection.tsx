'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ChevronDown, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { formatCalories } from '@/lib/utils/format'
import type { FoodEntry, MealType } from '@/types/food'
import { MEAL_TYPE_LABELS, MEAL_TYPE_EMOJI } from '@/types/food'

interface MealSectionProps {
  mealType:     MealType
  entries:      FoodEntry[]
  onAddEntry:   (mealType: MealType) => void
  onRemoveEntry:(id: string) => void
}

export function MealSection({ mealType, entries, onAddEntry, onRemoveEntry }: MealSectionProps) {
  const hasEntries = entries.length > 0
  const mealTotal  = entries.reduce((sum, e) => sum + e.calories, 0)
  const [isExpanded, setIsExpanded] = useState(hasEntries)

  return (
    <div className="bg-surface rounded-xl shadow-card overflow-hidden">
      {/* Section header */}
      <div
        className={cn(
          'flex items-center gap-3 px-4',
          hasEntries && isExpanded ? 'py-3.5 border-b border-border' : 'py-3',
        )}
      >
        <button
          type="button"
          onClick={() => { if (hasEntries) setIsExpanded((v) => !v) }}
          className={cn(
            'flex items-center gap-2.5 flex-1 min-w-0 text-left',
            hasEntries ? 'cursor-pointer' : 'cursor-default select-none',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus rounded-lg',
          )}
          aria-expanded={hasEntries ? isExpanded : undefined}
          aria-controls={hasEntries ? `meal-entries-${mealType}` : undefined}
          disabled={!hasEntries}
        >
          <span className="text-lg select-none shrink-0" aria-hidden="true">
            {MEAL_TYPE_EMOJI[mealType]}
          </span>
          <span className="font-body text-sm font-semibold text-ink truncate">
            {MEAL_TYPE_LABELS[mealType]}
          </span>
          <span className={cn(
            'font-body text-xs tabular-nums ml-auto mr-1 shrink-0',
            mealTotal > 0 ? 'text-ink-secondary font-medium' : 'text-ink-muted',
          )}>
            {mealTotal > 0 ? formatCalories(mealTotal) : '0 kcal'}
          </span>
          {hasEntries && (
            <ChevronDown
              className={cn(
                'w-4 h-4 text-ink-muted shrink-0 transition-transform duration-normal',
                isExpanded ? 'rotate-180' : 'rotate-0',
              )}
              strokeWidth={2}
              aria-hidden="true"
            />
          )}
        </button>

        <button
          type="button"
          onClick={() => onAddEntry(mealType)}
          className={cn(
            'flex items-center justify-center w-7 h-7 rounded-full shrink-0',
            'bg-primary-light text-primary',
            'hover:bg-primary-mid active:scale-90',
            'transition-all duration-fast',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
          )}
          aria-label={`Add food to ${MEAL_TYPE_LABELS[mealType]}`}
        >
          <Plus size={15} strokeWidth={2.5} />
        </button>
      </div>

      {/* Entry list */}
      <AnimatePresence initial={false}>
        {isExpanded && hasEntries && (
          <motion.div
            id={`meal-entries-${mealType}`}
            key="entries"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <ul role="list" aria-label={`${MEAL_TYPE_LABELS[mealType]} entries`}>
              {entries.map((entry, index) => (
                <li
                  key={entry.id}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3.5',
                    index < entries.length - 1 && 'border-b border-border',
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-sm text-ink truncate">{entry.name}</p>
                    {entry.notes && (
                      <p className="font-body text-xs text-ink-muted mt-0.5 truncate">
                        {entry.notes}
                      </p>
                    )}
                  </div>

                  <span className="font-body text-sm font-semibold text-ink shrink-0 tabular-nums">
                    {formatCalories(entry.calories)}
                  </span>

                  <button
                    type="button"
                    onClick={() => onRemoveEntry(entry.id)}
                    className={cn(
                      'flex items-center justify-center w-7 h-7 rounded-full shrink-0',
                      'text-ink-muted hover:text-error hover:bg-error-bg',
                      'transition-colors duration-fast',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
                    )}
                    aria-label={`Remove ${entry.name}`}
                  >
                    <Trash2 size={13} strokeWidth={2} />
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
