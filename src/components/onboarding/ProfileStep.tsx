'use client'

/**
 * ProfileStep
 *
 * Onboarding step 1 of 3.
 * Collects: name (optional), age, biological sex, height, weight.
 *
 * Unit toggle:
 *   metric   — height in cm, weight in kg
 *   imperial — height in ft + in, weight in lb
 *
 * Conversion happens before calling onNext so the parent always receives
 * canonical metric values (heightCm, weightKg).
 */

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { staggerContainer, staggerItem } from '@/lib/animations/variants'
import { ftInToCm, lbToKg, cmToFtIn, kgToLb } from '@/lib/utils/units'
import type { BiologicalSex, UnitPreference } from '@/types/user'

// ── Schema ─────────────────────────────────────────────────────────────────

const profileSchema = z
  .object({
    name:     z.string().max(40).optional().or(z.literal('')),
    age:      z.coerce.number().int().min(13, 'Must be at least 13').max(100, 'Please enter a valid age'),
    sex:      z.enum(['male', 'female', 'other'] as const, { required_error: 'Please select an option' }),
    unit:     z.enum(['metric', 'imperial'] as const),
    // metric fields
    heightCm: z.coerce.number().optional(),
    weightKg: z.coerce.number().optional(),
    // imperial fields
    heightFt: z.coerce.number().optional(),
    heightIn: z.coerce.number().optional(),
    weightLb: z.coerce.number().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.unit === 'metric') {
      if (!v.heightCm || v.heightCm < 100 || v.heightCm > 250) {
        ctx.addIssue({ code: 'custom', path: ['heightCm'], message: 'Height must be 100–250 cm' })
      }
      if (!v.weightKg || v.weightKg < 30 || v.weightKg > 300) {
        ctx.addIssue({ code: 'custom', path: ['weightKg'], message: 'Weight must be 30–300 kg' })
      }
    } else {
      if (v.heightFt === undefined || v.heightFt < 3 || v.heightFt > 8) {
        ctx.addIssue({ code: 'custom', path: ['heightFt'], message: 'Please enter a valid height' })
      }
      if (v.heightIn === undefined || v.heightIn < 0 || v.heightIn > 11) {
        ctx.addIssue({ code: 'custom', path: ['heightIn'], message: 'Inches must be 0–11' })
      }
      if (!v.weightLb || v.weightLb < 66 || v.weightLb > 660) {
        ctx.addIssue({ code: 'custom', path: ['weightLb'], message: 'Weight must be 66–660 lb' })
      }
    }
  })

type ProfileFormValues = z.infer<typeof profileSchema>

// ── Output type (always metric) ─────────────────────────────────────────────

export interface ProfileStepOutput {
  name?: string
  age: number
  sex: BiologicalSex
  heightCm: number
  weightKg: number
  unitPreference: UnitPreference
}

// ── SEX options ────────────────────────────────────────────────────────────

const SEX_OPTIONS: { value: BiologicalSex; label: string }[] = [
  { value: 'male',   label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other',  label: 'Other' },
]

// ── Component ──────────────────────────────────────────────────────────────

interface ProfileStepProps {
  defaultValues?: {
    name?:           string
    age?:            number
    sex?:            BiologicalSex
    heightCm?:       number
    weightKg?:       number
    unitPreference?: UnitPreference
  }
  onNext: (data: ProfileStepOutput) => void
  onBack: () => void
}

export function ProfileStep({ defaultValues, onNext, onBack }: ProfileStepProps) {
  const defaultUnit = defaultValues?.unitPreference ?? 'metric'

  // When returning to this step with previously saved cm/kg values, convert
  // back to imperial so the fields are pre-filled correctly.
  const defaultImperialHeight = defaultValues?.heightCm
    ? cmToFtIn(defaultValues.heightCm)
    : undefined
  const defaultImperialWeight = defaultValues?.weightKg
    ? kgToLb(defaultValues.weightKg)
    : undefined

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name:     defaultValues?.name ?? '',
      age:      defaultValues?.age ?? undefined,
      sex:      defaultValues?.sex ?? undefined,
      unit:     defaultUnit,
      heightCm: defaultValues?.heightCm ?? undefined,
      weightKg: defaultValues?.weightKg ?? undefined,
      heightFt: defaultImperialHeight?.ft ?? undefined,
      heightIn: defaultImperialHeight?.in ?? undefined,
      weightLb: defaultImperialWeight ?? undefined,
    },
  })

  const selectedSex  = watch('sex')
  const selectedUnit = watch('unit')

  function handleUnitSwitch(unit: UnitPreference) {
    // When switching, convert whatever is already entered so values persist.
    if (unit === 'imperial') {
      const cm = watch('heightCm')
      const kg = watch('weightKg')
      if (cm) {
        const { ft, in: inches } = cmToFtIn(Number(cm))
        setValue('heightFt', ft)
        setValue('heightIn', inches)
      }
      if (kg) setValue('weightLb', kgToLb(Number(kg)))
    } else {
      const ft  = watch('heightFt')
      const ins = watch('heightIn')
      const lb  = watch('weightLb')
      if (ft !== undefined) setValue('heightCm', ftInToCm(Number(ft), Number(ins ?? 0)))
      if (lb) setValue('weightKg', lbToKg(Number(lb)))
    }
    setValue('unit', unit, { shouldValidate: false })
  }

  function onValid(data: ProfileFormValues) {
    const heightCm =
      data.unit === 'imperial'
        ? ftInToCm(data.heightFt!, data.heightIn ?? 0)
        : data.heightCm!

    const weightKg =
      data.unit === 'imperial'
        ? lbToKg(data.weightLb!)
        : data.weightKg!

    onNext({
      name:           data.name || undefined,
      age:            data.age,
      sex:            data.sex,
      heightCm,
      weightKg,
      unitPreference: data.unit,
    })
  }

  return (
    <motion.form
      variants={staggerContainer}
      initial="initial"
      animate="enter"
      onSubmit={handleSubmit(onValid)}
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
          <div className="flex items-center justify-between -mb-1">
            <SectionLabel>Your stats</SectionLabel>

            {/* Unit toggle */}
            <div
              className={cn(
                'flex rounded-lg border border-border bg-background p-0.5 gap-0.5',
              )}
              role="group"
              aria-label="Unit system"
            >
              {(['metric', 'imperial'] as const).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => handleUnitSwitch(u)}
                  className={cn(
                    'px-3 py-1 rounded-md font-body text-xs font-medium',
                    'transition-all duration-fast ease-smooth',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
                    selectedUnit === u
                      ? 'bg-primary text-ink-on-primary shadow-sm'
                      : 'text-ink-muted hover:text-ink',
                  )}
                  aria-pressed={selectedUnit === u}
                >
                  {u === 'metric' ? 'kg / cm' : 'lb / ft'}
                </button>
              ))}
            </div>
          </div>

          {/* ── Metric fields ──────────────────────────────────── */}
          {selectedUnit === 'metric' && (
            <>
              {/* Height cm */}
              <div className="space-y-1.5">
                <FieldLabel htmlFor="heightCm">Height (cm)</FieldLabel>
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

              {/* Weight kg */}
              <div className="space-y-1.5">
                <FieldLabel htmlFor="weightKg">Weight (kg)</FieldLabel>
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
            </>
          )}

          {/* ── Imperial fields ────────────────────────────────── */}
          {selectedUnit === 'imperial' && (
            <>
              {/* Height ft + in */}
              <div className="space-y-1.5">
                <FieldLabel>Height</FieldLabel>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <input
                      id="heightFt"
                      type="number"
                      inputMode="numeric"
                      placeholder="ft"
                      className={fieldClass(!!errors.heightFt)}
                      {...register('heightFt')}
                    />
                    <p className="font-body text-[11px] text-ink-muted text-center">feet</p>
                  </div>
                  <div className="space-y-1">
                    <input
                      id="heightIn"
                      type="number"
                      inputMode="numeric"
                      placeholder="in"
                      className={fieldClass(!!errors.heightIn)}
                      {...register('heightIn')}
                    />
                    <p className="font-body text-[11px] text-ink-muted text-center">inches</p>
                  </div>
                </div>
                <FieldError message={errors.heightFt?.message ?? errors.heightIn?.message} />
              </div>

              {/* Weight lb */}
              <div className="space-y-1.5">
                <FieldLabel htmlFor="weightLb">Weight (lb)</FieldLabel>
                <input
                  id="weightLb"
                  type="number"
                  inputMode="decimal"
                  placeholder="e.g. 160"
                  className={fieldClass(!!errors.weightLb)}
                  {...register('weightLb')}
                />
                <FieldError message={errors.weightLb?.message} />
              </div>
            </>
          )}
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-body text-xs font-semibold text-ink-muted uppercase tracking-wider">
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
