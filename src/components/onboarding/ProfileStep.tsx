'use client'

/**
 * ProfileStep
 *
 * Onboarding step 1 of 3.
 * Collects: name (optional), age, biological sex, height, weight.
 *
 * Layout v2:
 *   Fields are grouped into two card sections for visual clarity:
 *     "About you"   — name, age, biological sex
 *     "Your stats"  — height, weight
 *   Navigation row is outside the cards with back (→ welcome) + next buttons.
 *
 * Validation: React Hook Form + Zod (unchanged from v1).
 * All non-name fields are required with practical range limits.
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
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

const SEX_OPTIONS: { value: BiologicalSex; label: string }[] = [
  { value: 'male',   label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other',  label: 'Other' },
]

// ── Component ──────────────────────────────────────────────────────────────

interface ProfileStepProps {
  defaultValues?: Partial<ProfileFormValues>
  onNext: (data: ProfileFormValues) => void
  /** Back goes to the welcome screen */
  onBack: () => void
}

export function ProfileStep({ defaultValues, onNext, onBack }: ProfileStepProps) {
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
      className="space-y-4"
      noValidate
    >
      {/* ── Card: About you ───────────────────────────────────── */}
      <motion.div variants={staggerItem}>
        <SectionCard>
          <SectionLabel>About you</SectionLabel>

          {/* Name */}
          <div className="space-y-1.5">
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
          </div>

          {/* Age */}
          <div className="space-y-1.5">
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
          </div>

          {/* Biological sex */}
          <div className="space-y-1.5">
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
                      : 'bg-background border-border text-ink-secondary hover:bg-surface-raised hover:border-border-strong',
                  )}
                  aria-pressed={selectedSex === value}
                >
                  {label}
                </button>
              ))}
            </div>
            <FieldError message={errors.sex?.message} />
          </div>
        </SectionCard>
      </motion.div>

      {/* ── Card: Your stats ──────────────────────────────────── */}
      <motion.div variants={staggerItem}>
        <SectionCard>
          <SectionLabel>Your stats</SectionLabel>

          {/* Height */}
          <div className="space-y-1.5">
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
          </div>

          {/* Weight */}
          <div className="space-y-1.5">
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
          </div>
        </SectionCard>
      </motion.div>

      {/* ── Navigation ────────────────────────────────────────── */}
      <motion.div variants={staggerItem} className="flex gap-3 pt-1 pb-2">
        <button
          type="button"
          onClick={onBack}
          className={cn(
            'flex items-center justify-center w-12 h-12 rounded-full shrink-0',
            'border border-border text-ink-secondary bg-surface',
            'hover:bg-surface-raised hover:text-ink active:scale-[0.97]',
            'transition-all duration-fast ease-smooth',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
          )}
          aria-label="Go back"
        >
          <ChevronLeft size={18} strokeWidth={2} />
        </button>

        <button
          type="submit"
          className={cn(
            'flex-1 h-12 rounded-full',
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

// ── Sub-components ─────────────────────────────────────────────────────────

/** Card wrapper for a section of related fields */
function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'bg-surface rounded-2xl border border-border/60',
        'px-4 py-4 space-y-4',
        'shadow-xs',
      )}
    >
      {children}
    </div>
  )
}

/** Eyebrow label above a section card */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-body text-xs font-semibold text-ink-muted uppercase tracking-wider -mb-1">
      {children}
    </p>
  )
}

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
    'bg-background border',
    'font-body text-sm text-ink',
    'placeholder:text-ink-muted',
    'transition-all duration-fast ease-smooth',
    'focus:outline-none focus:ring-2 focus:ring-border-focus focus:border-transparent',
    hasError
      ? 'border-error focus:ring-error'
      : 'border-border hover:border-border-strong',
  )
}
