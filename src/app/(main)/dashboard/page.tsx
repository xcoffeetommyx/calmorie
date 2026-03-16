'use client'

/**
 * Dashboard page
 *
 * The home screen. All data is live from stores:
 *   – caloriesEaten / calorieTarget from useTodayLog() + useCalorieTarget()
 *   – todayEntries from useTodayLog()
 *   – isCheckedIn / topWarning from checkinStore / useHabitAlerts()
 *   – lessonOfTheDay from useLessons() (first unread or day-rotation)
 *
 * Remaining static placeholder:
 *   – BURN_SUGGESTION is a fixed suggestion until Phase 5 derives it from
 *     userStore.activityLevel and the calorie gap.
 *
 * Loading state: the page shows a skeleton while stores are hydrating.
 * Once isHydrated is true, all real content is shown.
 */

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

import { useCalorieTarget } from '@/hooks/useCalorieTarget'
import { useLessons } from '@/hooks/useLessons'
import { useTodayLog } from '@/hooks/useTodayLog'
import { useHabitAlerts } from '@/hooks/useHabitAlerts'
import { useCheckinStore, selectIsCompletedToday } from '@/stores/checkinStore'

// ── Static fallback / pending data ────────────────────────────────────────

const FALLBACK_TARGET = 2000

// Phase 5: replace with a suggestion derived from userStore.activityLevel
const BURN_SUGGESTION: BurnSuggestion = {
  activity:      'Brisk walk',
  duration:      '20 minutes',
  estimatedKcal: '80–110 kcal',
  tip:           'A short walk after meals can be an easy way to add daily movement and support your energy levels.',
}

// ── Skeleton ───────────────────────────────────────────────────────────────

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

// ── Page ──────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const greeting  = getTimeGreeting()
  const dateLabel = formatDateDisplay(todayISO())

  const { calorieTarget: realTarget, isOnboarded, displayName, isHydrated: profileHydrated } = useCalorieTarget()
  const calorieTarget = realTarget ?? FALLBACK_TARGET

  const { entries: todayEntries, totalCalories: caloriesEaten, isHydrated: logHydrated } = useTodayLog()

  const isCheckedIn    = useCheckinStore(selectIsCompletedToday)
  const { topWarning } = useHabitAlerts()

  const { lessonOfTheDay } = useLessons()

  // Show skeleton until the two most important stores are ready
  const isReady = profileHydrated && logHydrated

  return (
    <div className="flex flex-col min-h-full bg-background">

      {/* ── Custom dashboard header ──────────────────────────── */}
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

      {/* ── Loading skeleton ─────────────────────────────────── */}
      {!isReady ? (
        <DashboardSkeleton />
      ) : (
        /* ── Page body ─────────────────────────────────────── */
        <motion.div
          className="page-container py-5 space-y-4"
          variants={staggerContainer}
          initial="initial"
          animate="enter"
        >
          {/* Greeting */}
          <motion.div variants={staggerItem} className="space-y-0.5">
            <p className="font-body text-sm text-ink-muted">{dateLabel}</p>
            <h1 className="font-display text-2xl font-semibold text-ink tracking-tight">
              {greeting}{isOnboarded ? `, ${displayName}` : ''} 👋
            </h1>
          </motion.div>

          {/* Calorie ring */}
          <motion.div variants={staggerItem}>
            <CalorieRing
              caloriesEaten={caloriesEaten}
              calorieTarget={calorieTarget}
            />
          </motion.div>

          {/* Habit alert — real data from today's check-in */}
          {topWarning && (
            <motion.div variants={staggerItem}>
              <HabitAlertBanner alert={topWarning} />
            </motion.div>
          )}

          {/* Check-in CTA */}
          <motion.div variants={staggerItem}>
            <CheckInCTA isCompleted={isCheckedIn} />
          </motion.div>

          {/* Lesson + burn card row */}
          <motion.div variants={staggerItem} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <LessonOfTheDay lesson={lessonOfTheDay} />
            <DailyBurnCard suggestion={BURN_SUGGESTION} />
          </motion.div>

          {/* Meal summary */}
          <motion.div variants={staggerItem}>
            <MealSummaryCard
              entries={todayEntries}
              calorieTarget={calorieTarget}
            />
          </motion.div>

          <div className="h-2" aria-hidden="true" />
        </motion.div>
      )}
    </div>
  )
}
