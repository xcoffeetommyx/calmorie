'use client'

/**
 * FoodLogList
 *
 * Renders all four MealSection components in canonical order
 * (breakfast → lunch → dinner → snack).
 *
 * This component is purely compositional - it holds no state of its own.
 * All data flows in from useTodayLog() via the log page.
 *
 * Props:
 *   byMeal        - entries grouped by MealType
 *   onAddEntry    - opens FoodEntryForm for a given meal type
 *   onRemoveEntry - removes an entry by id
 */

import { motion } from 'framer-motion'
import { staggerContainer, staggerItem } from '@/lib/animations/variants'
import { MealSection } from './MealSection'
import type { FoodEntry, MealType } from '@/types/food'
import { MEAL_TYPE_ORDER } from '@/types/food'

interface FoodLogListProps {
  byMeal: Record<MealType, FoodEntry[]>
  onAddEntry: (mealType: MealType) => void
  onRemoveEntry: (id: string) => void
}

export function FoodLogList({
  byMeal,
  onAddEntry,
  onRemoveEntry,
}: FoodLogListProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="enter"
      className="space-y-3"
      role="list"
      aria-label="Today's meals"
    >
      {MEAL_TYPE_ORDER.map((mealType) => (
        <motion.div key={mealType} variants={staggerItem} role="listitem">
          <MealSection
            mealType={mealType}
            entries={byMeal[mealType]}
            onAddEntry={onAddEntry}
            onRemoveEntry={onRemoveEntry}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}
