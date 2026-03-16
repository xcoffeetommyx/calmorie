'use client'

/**
 * ProfileStep
 *
 * Onboarding step 1 of 3.
 * Collects: name (optional), age, biological sex, height, weight.
 *
 * Validation: React Hook Form + Zod via @hookform/resolvers.
 * All fields except name are required with practical range limits.
 *
 * Height/weight are entered in the user's natural units:
 *   – Height in cm (single field, consistent with our data model)
 *   – Weight in kg
 * The UI uses a simple note for users thinking in imperial — a
 * full unit toggle is a future enhancement, not MVP scope.
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import { staggerContainer, staggerItem } from '@/lib/animations/variants'
import type { BiologicalSex } from '@/types/user'

// ── Schema ─────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  name:     z.string().max(40).optional().or(z.literal('')),
  age:      z.coerce.number().int().min(13, 'Must be at least 13').max(100, 'Please enter a valid age'),
  sex:      z.enum(['male', 'female', 'other'] as const, { required_error: 'Please select an option' }),
  heightCm: z.coerce.number().min(100, 'Height must be at least 100 cm').max(250, 'Please enter a valid height'),
  weightKg: z.coerce.number().min(30, 'Weight must be at least 30 kg').max(300, 'Please enter a valid weight'),
})

type ProfileFormValues = z.infer<typeof profileSchema>

// ── SEX options ────────────────────────────────────────────────────────────

const SEX_OPTIONS: { value: BiologicalSex; label: string; note?: string }[] = [
  { value: 'male',   label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other',  label: 'Other / prefer not to say', note: "We'll use an averaged estimate" },
]

// ── Component ──────────────────────────────────────────────────────────────

interface ProfileStepProps {
  defaultValues?: Partial<ProfileFormValues>
  onNext: (data: ProfileFormValues) => void
}

export function ProfileStep({ defaultValues, onNext }: ProfileStepProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name:     defaultValues?.name     ?? '',
      age:      defaultValues?.age      ?? undefined,
      sex:      defaultValues?.sex      ?? undefined,
      heightCm: defaultValues?.heightCm ?? undefined,
      weightKg: defaultValues?.weightKg ?? undefined,
    },
  })

  const selectedSex = watch('sex')

  return (
    <motion.form
      variants={staggerContainer}
      initial="initial"
      animate="enter"
      onSubmit={handleSubmit(onNext)}
      className="space-y-5"
      noValidate
    >
      {/* ── Name (optional) ───────────────────────────────── */}
      <motion.div variants={staggerItem} className="space-y-1.5">
        <FieldLabel htmlFor="name">
          What should we call you?{' '}
          <span className="font-normal text-ink-muted">(optional)</span>
        </FieldLabel>
        <input
          id="name"
          type="text"
          autoComplete="given-name"
          placeholder="Your first name"
          className={fieldClass()}
          {...register('name')}
        />
      </motion.div>

      {/* ── Age ───────────────────────────────────────────── */}
      <motion.div variants={staggerItem} className="space-y-1.5">
        <FieldLabel htmlFor="age">Age</FieldLabel>
        <input
          id="age"
          type="number"
          inputMode="numeric"
          placeholder="e.g. 32"
          className={fieldClass(!!errors.age)}
          {...register('age')}
        />
        <FieldError message={errors.age?.message} />
      </motion.div>

      {/* ── Biological sex ─────────────────────────────────── */}
      <motion.div variants={staggerItem} className="space-y-1.5">
        <FieldLabel>Biological sex</FieldLabel>
        <p className="font-body text-xs text-ink-muted -mt-0.5">
          Used only for the calorie estimate formula — not stored or shared.
        </p>
        <div className="grid grid-cols-3 gap-2 mt-1">
          {SEX_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setValue('sex', value, { shouldValidate: true })}
              className={cn(
                'py-2.5 px-2 rounded-xl text-center',
                'font-body text-sm font-medium',
                'border transition-all duration-fast ease-smooth',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
                selectedSex === value
                  ? 'bg-primary text-ink-on-primary border-primary shadow-sm'
                  : 'bg-surface border-border text-ink-secondary hover:bg-surface-raised hover:border-border-strong',
              )}
              aria-pressed={selectedSex === value}
            >
              {label}
            </button>
          ))}
        </div>
        <FieldError message={errors.sex?.message} />
      </motion.div>

      {/* ── Height ────────────────────────────────────────── */}
      <motion.div variants={staggerItem} className="space-y-1.5">
        <FieldLabel htmlFor="heightCm">Height (cm)</FieldLabel>
        <p className="font-body text-xs text-ink-muted -mt-0.5">
          Not sure in cm? 5&rsquo;7&rdquo; ≈ 170 cm &nbsp;·&nbsp; 5&rsquo;10&rdquo; ≈ 178 cm
        </p>
        <input
          id="heightCm"
          type="number"
          inputMode="decimal"
          placeholder="e.g. 170"
          className={fieldClass(!!errors.heightCm)}
          {...register('heightCm')}
        />
        <FieldError message={errors.heightCm?.message} />
      </motion.div>

      {/* ── Weight ────────────────────────────────────────── */}
      <motion.div variants={staggerItem} className="space-y-1.5">
        <FieldLabel htmlFor="weightKg">Weight (kg)</FieldLabel>
        <p className="font-body text-xs text-ink-muted -mt-0.5">
          Not sure in kg? 150 lbs ≈ 68 kg &nbsp;·&nbsp; 180 lbs ≈ 82 kg
        </p>
        <input
          id="weightKg"
          type="number"
          inputMode="decimal"
          placeholder="e.g. 72"
          className={fieldClass(!!errors.weightKg)}
          {...register('weightKg')}
        />
        <FieldError message={errors.weightKg?.message} />
      </motion.div>

      {/* ── Submit ─────────────────────────────────────────── */}
      <motion.div variants={staggerItem} className="pt-2">
        <button
          type="submit"
          className={cn(
            'w-full h-12 rounded-full',
            'bg-primary text-ink-on-primary',
            'font-body text-sm font-semibold',
            'shadow-sm hover:bg-primary-dark active:scale-[0.97]',
            'transition-all duration-fast ease-smooth',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2',
          )}
        >
          Continue
        </button>
      </motion.div>
    </motion.form>
  )
}

// ── Small sub-components ───────────────────────────────────────────────────

function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block font-body text-sm font-medium text-ink"
    >
      {children}
    </label>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="font-body text-xs text-error" role="alert">
      {message}
    </p>
  )
}

function fieldClass(hasError = false) {
  return cn(
    'w-full h-11 px-3.5 rounded-xl',
    'bg-surface border',
    'font-body text-sm text-ink',
    'placeholder:text-ink-muted',
    'transition-all duration-fast ease-smooth',
    'focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-transparent',
    hasError
      ? 'border-error focus:ring-error'
      : 'border-border hover:border-border-strong',
  )
}
