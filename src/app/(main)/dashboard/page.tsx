'use client'

/**
 * Dashboard page
 *
 * The home screen. All data is live from stores.
 *
 * Onboarding gate:
 *   If the user profile is not yet set up, render OnboardingFlow directly
 *   instead of the dashboard. No router.replace(), no useEffect — just
 *   conditional rendering based on hydrated store state.
 *
 * States:
 *   1. Store not yet hydrated → skeleton (same loading screen as before)
 *   2. Hydrated, not onboarded → OnboardingFlow renders in place
 *   3. Hydrated, onboarded → dashboard renders normally
 */

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Settings, Leaf } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { staggerContainer, staggerItem } from '@/lib/animations/variants'
import { getTimeGreeting, formatDateDisplay, todayISO } from '@/lib/utils/date'

import { CalorieRing } from '@/components/dashboard/CalorieRing'
import { DailyBurnCard, type BurnSuggestion } from '@/components/dashboard/DailyBurnCard'
import { MealSummaryCard } from '@/components/dashboard/MealSummaryCard'
import { LessonOfTheDay } from '@/components/dashboard/LessonOfTheDay'
import { HabitAlertBanner } from '@/components/dashboard/HabitAlertBanner'
import { CheckInCTA } from '@/components/dashboard/CheckInCTA'
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow'

import { useCalorieTarget } from '@/hooks/useCalorieTarget'
import { useLessons } from '@/hooks/useLessons'
import { useTodayLog } from '@/hooks/useTodayLog'
import { useHabitAlerts } from '@/hooks/useHabitAlerts'
import { useCheckinStore, selectIsCompletedToday } from '@/stores/checkinStore'

const FALLBACK_TARGET = 2000

const BURN_SUGGESTION: BurnSuggestion = {
  activity:      'Brisk walk',
  duration:      '20 minutes',
  estimatedKcal: '80–110 kcal',
  tip:           'A short walk after meals can be an easy way to add daily movement and support your energy levels.',
}

function DashboardSkeleton() {
  return (
    <div className="page-container py-5 space-y-4">
      <div className="space-y-1.5">
        <div className="h-3.5 w-24 bg-surface-raised rounded-full animate-pulse-soft" />
        <div className="h-7 w-48 bg-surface-raised rounded-full animate-pulse-soft" />
      </div>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-24 bg-surface-raised rounded-2xl animate-pulse-soft"
          style={{ animationDelay: `${i * 80}ms` }}
        />
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()

  const { calorieTarget: realTarget, isOnboarded, displayName, isHydrated: profileHydrated } = useCalorieTarget()
  const calorieTarget = realTarget ?? FALLBACK_TARGET

  const { entries: todayEntries, totalCalories: caloriesEaten, isHydrated: logHydrated } = useTodayLog()
  const isCheckedIn    = useCheckinStore(selectIsCompletedToday)
  const { topWarning } = useHabitAlerts()
  const { lessonOfTheDay } = useLessons()
  const greeting  = getTimeGreeting()
  const dateLabel = formatDateDisplay(todayISO())

  const isReady = profileHydrated && logHydrated

  // ── Onboarding gate ───────────────────────────────────────────────────────
  // While hydrating, show skeleton (we don't know onboarding state yet).
  // Once hydrated: if profile is missing, render onboarding in place.
  // No router calls — pure conditional render, no loop risk.

  if (!isReady) {
    return (
      <div className="flex flex-col min-h-full bg-background">
        <DashboardHeader />
        <DashboardSkeleton />
      </div>
    )
  }

  if (!isOnboarded) {
    return (
      <OnboardingFlow
        onComplete={() => router.replace('/dashboard')}
      />
    )
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col min-h-full bg-background">
      <DashboardHeader />

      <motion.div
        className="page-container py-5 space-y-4"
        variants={staggerContainer}
        initial="initial"
        animate="enter"
      >
        <motion.div variants={staggerItem} className="space-y-0.5">
          <p className="font-body text-sm text-ink-muted">{dateLabel}</p>
          <h1 className="font-display text-2xl font-semibold text-ink tracking-tight">
            {greeting}, {displayName} 👋
          </h1>
        </motion.div>

        <motion.div variants={staggerItem}>
          <CalorieRing
            caloriesEaten={caloriesEaten}
            calorieTarget={calorieTarget}
          />
        </motion.div>

        {topWarning && (
          <motion.div variants={staggerItem}>
            <HabitAlertBanner alert={topWarning} />
          </motion.div>
        )}

        <motion.div variants={staggerItem}>
          <CheckInCTA isCompleted={isCheckedIn} />
        </motion.div>

        <motion.div variants={staggerItem} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <LessonOfTheDay lesson={lessonOfTheDay} />
          <DailyBurnCard suggestion={BURN_SUGGESTION} />
        </motion.div>

        <motion.div variants={staggerItem}>
          <MealSummaryCard
            entries={todayEntries}
            calorieTarget={calorieTarget}
          />
        </motion.div>

        <div className="h-2" aria-hidden="true" />
      </motion.div>
    </div>
  )
}

// ── Shared header sub-component ───────────────────────────────────────────
// Extracted so it can be shown during the skeleton state too.

function DashboardHeader() {
  return (
    <header
      className={cn(
        'sticky top-0 z-[200]',
        'h-[var(--top-bar-height)]',
        'pt-[env(safe-area-inset-top,0px)]',
        'bg-background/90 backdrop-blur-ios border-b border-border',
        'flex items-center justify-between px-5',
      )}
    >
      <Link
        href="/dashboard"
        className={cn(
          'flex items-center gap-2',
          'focus-visible:outline-none focus-visible:ring-2',
          'focus-visible:ring-border-focus rounded-lg p-0.5',
        )}
        aria-label="Calmorie — go to dashboard"
      >
        <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center" aria-hidden="true">
          <Leaf className="w-3.5 h-3.5 text-white" strokeWidth={2.25} />
        </div>
        <span className="font-display text-[15px] font-semibold text-primary tracking-tight">
          Calmorie
        </span>
      </Link>

      <Link
        href="/settings"
        className={cn(
          'flex items-center justify-center w-9 h-9 rounded-full',
          'text-ink-muted hover:bg-surface-raised hover:text-ink',
          'transition-colors duration-fast',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
        )}
        aria-label="Go to settings"
      >
        <Settings size={18} strokeWidth={1.75} aria-hidden="true" />
      </Link>
    </header>
  )
}
