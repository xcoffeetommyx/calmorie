'use client'

/**
 * FoodEntryForm
 *
 * A lightweight bottom sheet form for adding a single food entry.
 *
 * Fields:
 *   meal     - pill selector (controlled via RHF Controller)
 *   name     - text input (required, max 80 chars)
 *   calories - numeric text input (required, 1–9999)
 *   notes    - text input (optional)
 *
 * Pre-fill support:
 *   initialMeal / initialName / initialCalories come from the caller.
 *   Applied via reset() whenever isOpen or any initial value changes.
 *
 * Meal selection fix:
 *   The previous implementation used hidden radio inputs inside wrapping
 *   <label> elements spread with {...register('meal')}. Tapping the label
 *   on mobile fired a click that bubbled to the <form>, triggering an
 *   early submit attempt before the radio value was committed to RHF state.
 *   This caused validation to fail silently when a meal was manually selected.
 *
 *   Fix: replaced with Controller + explicit styled <button type="button">
 *   pills. setValue('meal', meal) updates RHF state directly; no radio input,
 *   no label-click-to-form propagation.
 */

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { bottomSheetVariants, overlayVariants } from '@/lib/animations/variants'
import type { FoodEntryInput, MealType } from '@/types/food'
import { MEAL_TYPE_LABELS, MEAL_TYPE_ORDER } from '@/types/food'

// ── Schema ─────────────────────────────────────────────────────────────────

const entrySchema = z.object({
  meal:     z.enum(['breakfast', 'lunch', 'dinner', 'snack'] as const),
  name:     z.string().min(1, 'Please enter a food name').max(80),
  calories: z.coerce.number()
    .int('Calories must be a whole number')
    .min(1, 'Enter at least 1 kcal')
    .max(9999, 'Please check this value'),
  notes:    z.string().max(120).optional().or(z.literal('')),
})

type EntryFormValues = z.infer<typeof entrySchema>

// ── Constants ────────────────────────────────────────────────────────────────
// Empty string keeps the calories input controlled while representing
// "no value yet". z.coerce.number()('') = NaN → fails .min(1) correctly.
const EMPTY_CALORIES = '' as unknown as number

// ── Component ──────────────────────────────────────────────────────────────

interface FoodEntryFormProps {
  isOpen: boolean
  initialMeal?: MealType
  initialName?: string
  initialCalories?: number
  onAdd: (input: FoodEntryInput) => void
  onClose: () => void
}

export function FoodEntryForm({
  isOpen,
  initialMeal     = 'snack',
  initialName     = '',
  initialCalories = undefined,
  onAdd,
  onClose,
}: FoodEntryFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<EntryFormValues>({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      meal:     initialMeal,
      name:     initialName,
      calories: initialCalories ?? EMPTY_CALORIES,
      notes:    '',
    },
  })

  useEffect(() => {
    if (isOpen) {
      reset({
        meal:     initialMeal,
        name:     initialName,
        calories: initialCalories ?? EMPTY_CALORIES,
        notes:    '',
      })
    } else {
      reset({
        meal:     initialMeal,
        name:     '',
        calories: EMPTY_CALORIES,
        notes:    '',
      })
    }
  }, [isOpen, initialMeal, initialName, initialCalories, reset]) // eslint-disable-line

  function onSubmit(data: EntryFormValues) {
    onAdd({
      meal:     data.meal,
      name:     data.name,
      calories: data.calories,
      notes:    data.notes || undefined,
    })
    // Keep meal; clear name + calories for rapid logging
    reset({
      meal:     data.meal,
      name:     '',
      calories: EMPTY_CALORIES,
      notes:    '',
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            variants={overlayVariants}
            initial="initial"
            animate="enter"
            exit="exit"
            className="fixed inset-0 z-[300] bg-black/40"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            variants={bottomSheetVariants}
            initial="initial"
            animate="enter"
            exit="exit"
            className={cn(
              'fixed inset-x-0 bottom-0 z-[310]',
              'bg-surface rounded-t-2xl shadow-xl',
              'pb-[env(safe-area-inset-bottom,0px)]',
            )}
            role="dialog"
            aria-modal="true"
            aria-label="Add food entry"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1" aria-hidden="true">
              <div className="w-10 h-1 bg-border rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <h2 className="font-body text-base font-semibold text-ink">
                Add food
              </h2>
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center',
                  'text-ink-muted hover:bg-surface-raised hover:text-ink',
                  'transition-colors duration-fast',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
                )}
                aria-label="Close"
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="px-5 py-4 space-y-4"
              noValidate
            >
              {/* Meal selector - Controller pattern avoids label-click-to-submit bug */}
              <div className="space-y-1.5">
                <p className="font-body text-sm font-medium text-ink">
                  Meal
                </p>
                <Controller
                  name="meal"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-4 gap-1.5" role="radiogroup" aria-label="Select meal">
                      {MEAL_TYPE_ORDER.map((meal) => (
                        <button
                          key={meal}
                          type="button"
                          role="radio"
                          aria-checked={field.value === meal}
                          onClick={() => field.onChange(meal)}
                          className={cn(
                            'flex flex-col items-center justify-center gap-0.5',
                            'h-14 rounded-xl border text-center',
                            'font-body text-xs font-medium',
                            'transition-all duration-fast ease-smooth',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
                            field.value === meal
                              ? 'bg-primary-light border-primary-mid text-primary-text'
                              : 'border-border text-ink-secondary hover:bg-surface-raised',
                          )}
                        >
                          <span className="text-base select-none leading-none" aria-hidden="true">
                            {MEAL_EMOJI[meal]}
                          </span>
                          <span>{MEAL_TYPE_LABELS[meal]}</span>
                        </button>
                      ))}
                    </div>
                  )}
                />
              </div>

              {/* Food name */}
              <div className="space-y-1.5">
                <label htmlFor="food-name" className="block font-body text-sm font-medium text-ink">
                  Food name
                </label>
                <input
                  id="food-name"
                  type="text"
                  placeholder="e.g. Porridge with milk"
                  autoComplete="off"
                  className={inputClass(!!errors.name)}
                  {...register('name')}
                />
                {errors.name && <FieldError message={errors.name.message} />}
              </div>

              {/* Calories */}
              <div className="space-y-1.5">
                <label htmlFor="calories" className="block font-body text-sm font-medium text-ink">
                  Calories (kcal)
                </label>
                <input
                  id="calories"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="e.g. 320"
                  className={inputClass(!!errors.calories)}
                  {...register('calories')}
                />
                {errors.calories && <FieldError message={errors.calories.message} />}
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label htmlFor="notes" className="block font-body text-sm font-medium text-ink">
                  Notes{' '}
                  <span className="font-normal text-ink-muted">(optional)</span>
                </label>
                <input
                  id="notes"
                  type="text"
                  placeholder="e.g. with oat milk, large portion"
                  className={inputClass(false)}
                  {...register('notes')}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  'w-full h-12 rounded-full',
                  'bg-primary text-ink-on-primary',
                  'font-body text-sm font-semibold',
                  'shadow-sm hover:bg-primary-dark active:scale-[0.97]',
                  'disabled:opacity-50 disabled:pointer-events-none',
                  'transition-all duration-fast ease-smooth',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2',
                )}
              >
                Add to log
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────

const MEAL_EMOJI: Record<MealType, string> = {
  breakfast: '🌅',
  lunch:     '☀️',
  dinner:    '🌙',
  snack:     '🍎',
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="font-body text-xs text-error" role="alert">
      {message}
    </p>
  )
}

function inputClass(hasError: boolean) {
  return cn(
    'w-full h-11 px-3.5 rounded-xl',
    'bg-surface border',
    'font-body text-sm text-ink placeholder:text-ink-muted',
    'transition-all duration-fast',
    'focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-transparent',
    hasError
      ? 'border-error focus:ring-error'
      : 'border-border hover:border-border-strong',
  )
}
