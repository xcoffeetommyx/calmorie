'use client'

/**
 * Dashboard page — first impression of the app.
 *
 * Onboarding gate: if profile is not set up, renders OnboardingFlow directly.
 * Loading state: shows a skeleton until both stores have hydrated.
 */

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Settings, Leaf } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { staggerContainer, staggerItem } from '@/lib/animations/variants'
import { getTimeGreeting, formatDateDisplay, todayISO } from '@/lib/utils/date'

import { CalorieRing }                          from '@/components/dashboard/CalorieRing'
import { DailyBurnCard, type BurnSuggestion }   from '@/components/dashboard/DailyBurnCard'
import { MealSummaryCard }                      from '@/components/dashboard/MealSummaryCard'
import { LessonOfTheDay }                       from '@/components/dashboard/LessonOfTheDay'
import { HabitAlertBanner }                     from '@/components/dashboard/HabitAlertBanner'
import { CheckInCTA }                           from '@/components/dashboard/CheckInCTA'
import { OnboardingFlow }                       from '@/components/onboarding/OnboardingFlow'

import { useCalorieTarget }                     from '@/hooks/useCalorieTarget'
import { useLessons }                           from '@/hooks/useLessons'
import { useTodayLog }                          from '@/hooks/useTodayLog'
import { useHabitAlerts }                       from '@/hooks/useHabitAlerts'
import { useCheckinStore, selectIsCompletedToday, selectTodayRecord } from '@/stores/checkinStore'
import { useStreakData } from '@/hooks/useStreakData'

const FALLBACK_TARGET = 2000

const BURN_SUGGESTION: BurnSuggestion = {
  activity:      'Brisk walk',
  duration:      '20 minutes',
  estimatedKcal: '80–110 kcal',
  tip:           'A short walk after meals can be an easy way to add daily movement and support your energy levels.',
}

// ── Skeleton ──────────────────────────────────────────────────────────────

function DashboardSkeleton() {
  return (
    <div className="page-container py-6 space-y-4">
      {/* Greeting */}
      <div className="space-y-2">
        <div className="h-3 w-20 bg-surface-raised rounded-full animate-pulse-soft" />
        <div className="h-7 w-52 bg-surface-raised rounded-full animate-pulse-soft" />
      </div>
      {/* Cards */}
      <div className="h-56 bg-surface-raised rounded-2xl animate-pulse-soft" style={{ animationDelay: '80ms' }} />
      <div className="h-16 bg-surface-raised rounded-2xl animate-pulse-soft" style={{ animationDelay: '140ms' }} />
      <div className="h-16 bg-surface-raised rounded-2xl animate-pulse-soft" style={{ animationDelay: '200ms' }} />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-40 bg-surface-raised rounded-xl animate-pulse-soft" style={{ animationDelay: '260ms' }} />
        <div className="h-40 bg-surface-raised rounded-xl animate-pulse-soft" style={{ animationDelay: '320ms' }} />
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter()

  const { calorieTarget: realTarget, isOnboarded, displayName, isHydrated: profileHydrated } = useCalorieTarget()
  const calorieTarget = realTarget ?? FALLBACK_TARGET

  const { entries: todayEntries, totalCalories: caloriesEaten, isHydrated: logHydrated } = useTodayLog()
  const isCheckedIn    = useCheckinStore(selectIsCompletedToday)
  const todayRecord    = useCheckinStore(selectTodayRecord)
  const streakData     = useStreakData()
  const { topWarning } = useHabitAlerts()
  const { lessonOfTheDay } = useLessons()

  const greeting  = getTimeGreeting()
  const dateLabel = formatDateDisplay(todayISO())
  const isReady   = profileHydrated && logHydrated

  if (!isReady) {
    return (
      <div className="flex flex-col min-h-full bg-background">
        <DashboardHeader />
        <DashboardSkeleton />
      </div>
    )
  }

  if (!isOnboarded) {
    return <OnboardingFlow onComplete={() => router.replace('/dashboard')} />
  }

  return (
    <div className="flex flex-col min-h-full bg-background">
      <DashboardHeader />

      <motion.div
        className="page-container py-6 space-y-4 pb-safe-nav"
        variants={staggerContainer}
        initial="initial"
        animate="enter"
      >
        {/* ── Greeting ─────────────────────────────────────── */}
        <motion.div variants={staggerItem} className="space-y-0.5 pb-1">
          <p className="font-body text-xs text-ink-muted tracking-wide">{dateLabel}</p>
          <h1 className="font-display text-2xl font-semibold text-ink tracking-tight">
            {greeting}, {displayName} 👋
          </h1>
        </motion.div>

        {/* ── Calorie ring — hero ───────────────────────────── */}
        <motion.div variants={staggerItem}>
          <CalorieRing caloriesEaten={caloriesEaten} calorieTarget={calorieTarget} />
        </motion.div>

        {/* ── Habit alert — only when present ──────────────── */}
        {topWarning && (
          <motion.div variants={staggerItem}>
            <HabitAlertBanner alert={topWarning} />
          </motion.div>
        )}

        {/* ── Check-in CTA ──────────────────────────────────── */}
        <motion.div variants={staggerItem}>
          <CheckInCTA
            isCompleted={isCheckedIn}
            score={todayRecord?.score}
            streak={streakData.currentStreak}
          />
        </motion.div>

        {/* ── Two-card row: lesson + burn ───────────────────── */}
        <motion.div variants={staggerItem} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <LessonOfTheDay lesson={lessonOfTheDay} />
          <DailyBurnCard suggestion={BURN_SUGGESTION} />
        </motion.div>

        {/* ── Meal summary ──────────────────────────────────── */}
        <motion.div variants={staggerItem}>
          <MealSummaryCard entries={todayEntries} calorieTarget={calorieTarget} />
        </motion.div>

        <div className="h-1" aria-hidden="true" />
      </motion.div>
    </div>
  )
}

// ── Header (shown during skeleton too) ────────────────────────────────────

function DashboardHeader() {
  return (
    <header
      className={cn(
        'sticky top-0 z-[200]',
        'h-[var(--top-bar-height)] pt-[env(safe-area-inset-top,0px)]',
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
