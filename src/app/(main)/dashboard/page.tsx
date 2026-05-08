'use client'

/**
 * Dashboard page - first impression of the app.
 *
 * Onboarding gate: if profile is not set up, renders OnboardingFlow directly.
 * Loading state: shows a skeleton until both stores have hydrated.
 *
 * Card order:
 *   1. Greeting
 *   2. CalorieRing - hero
 *   3. FlameStreakCard - streak hero + secondary chips (hidden for brand-new users)
 *   4. HabitAlertBanner - conditional, from latest check-in
 *   5. CheckInCTA - pending or completed state
 *   6. DailyFocusCard - shown when checked in today
 *   7. LessonOfTheDay + QuickTipCard - two-column grid
 *   8. MealSummaryCard
 */

import { useEffect, useMemo, useState } from 'react'
import { useRouter }        from 'next/navigation'
import { motion }           from 'framer-motion'
import Link                 from 'next/link'
import { Settings }          from 'lucide-react'
import { AppLogo }           from '@/components/layout/AppLogo'
import { cn }               from '@/lib/utils/cn'
import { staggerContainer, staggerItem } from '@/lib/animations/variants'
import { getTimeGreeting, formatDateDisplay, todayISO } from '@/lib/utils/date'
import { consumeStreakCelebration } from '@/lib/utils/streakUtils'

import { CalorieRing }      from '@/components/dashboard/CalorieRing'
import { MealSummaryCard }  from '@/components/dashboard/MealSummaryCard'
import { LessonOfTheDay }   from '@/components/dashboard/LessonOfTheDay'
import { HabitAlertBanner } from '@/components/dashboard/HabitAlertBanner'
import { CheckInCTA }       from '@/components/dashboard/CheckInCTA'
import { DailyFocusCard }   from '@/components/dashboard/DailyFocusCard'
import { FlameStreakCard }   from '@/components/dashboard/FlameStreakCard'
import { QuickTipCard }     from '@/components/dashboard/QuickTipCard'
import { OnboardingFlow }   from '@/components/onboarding/OnboardingFlow'

import { useCalorieTarget }    from '@/hooks/useCalorieTarget'
import { useLessons }          from '@/hooks/useLessons'
import { useTodayLog }         from '@/hooks/useTodayLog'
import { useHabitAlerts }      from '@/hooks/useHabitAlerts'
import { useStreakData }        from '@/hooks/useStreakData'
import { useContextualLesson } from '@/hooks/useContextualLesson'
import { useCheckinStore, selectIsCompletedToday, selectTodayRecord } from '@/stores/checkinStore'
import { getTipOfTheDay }      from '@/data/dailyTips'

const FALLBACK_TARGET = 2000

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
      <div className="h-9 bg-surface-raised rounded-full animate-pulse-soft" style={{ animationDelay: '120ms' }} />
      <div className="h-16 bg-surface-raised rounded-2xl animate-pulse-soft" style={{ animationDelay: '160ms' }} />
      <div className="h-16 bg-surface-raised rounded-2xl animate-pulse-soft" style={{ animationDelay: '220ms' }} />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-40 bg-surface-raised rounded-xl animate-pulse-soft" style={{ animationDelay: '280ms' }} />
        <div className="h-40 bg-surface-raised rounded-xl animate-pulse-soft" style={{ animationDelay: '340ms' }} />
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
  const isCheckedIn       = useCheckinStore(selectIsCompletedToday)
  const todayRecord       = useCheckinStore(selectTodayRecord)
  const streakData        = useStreakData()
  const { topWarning }    = useHabitAlerts()
  const { progressMap }   = useLessons()
  const contextualLesson  = useContextualLesson()
  const [celebrateStreak, setCelebrateStreak] = useState(false)

  // Completed lessons count - memoized, depends on progressMap reference
  const completedLessonsCount = useMemo(
    () => Object.values(progressMap).filter((p) => p.completed).length,
    [progressMap]
  )

  // FlameStreakCard shows once the user has any check-in history (bestStreak > 0)
  // or has checked in today. Brand-new users see null inside the component.
  const hasStreakHistory = streakData.bestStreak > 0 || isCheckedIn

  // Daily tip - pure lookup, stable reference from static array
  const tipOfDay = getTipOfTheDay(todayISO())

  const greeting  = getTimeGreeting()
  const dateLabel = formatDateDisplay(todayISO())
  const isReady   = profileHydrated && logHydrated

  useEffect(() => {
    if (!isReady || !isCheckedIn) {
      setCelebrateStreak(false)
      return
    }
    setCelebrateStreak(consumeStreakCelebration(todayISO()))
  }, [isReady, isCheckedIn])

  if (!isReady) {
    return (
      <div className="flex flex-col min-h-full bg-background">
        <DashboardHeader />
        <DashboardSkeleton />
      </div>
    )
  }

  if (!isOnboarded) {
    return <OnboardingFlow onComplete={() => router.replace('/checkin?firstRun=1')} />
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

        {/* ── Calorie ring - hero ───────────────────────────── */}
        <motion.div variants={staggerItem}>
          <CalorieRing caloriesEaten={caloriesEaten} calorieTarget={calorieTarget} />
        </motion.div>

        {/* ── Flame streak card (hidden for brand-new users) ───────── */}
        {hasStreakHistory && (
          <motion.div variants={staggerItem}>
            <FlameStreakCard
              currentStreak={streakData.currentStreak}
              bestStreak={streakData.bestStreak}
              weeklyCount={streakData.weeklyCount}
              weeklyTrail={streakData.weeklyTrail}
              isCheckedIn={isCheckedIn}
              completedLessonsCount={completedLessonsCount}
              streakMilestone={streakData.milestoneReached}
              graceActive={streakData.graceActive}
              celebrateToday={celebrateStreak}
            />
          </motion.div>
        )}

        {/* ── Habit alert - only when present ──────────────── */}
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

        {/* ── Daily focus - only when checked in ───────────── */}
        {isCheckedIn && todayRecord && (
          <motion.div variants={staggerItem}>
            <DailyFocusCard focus={todayRecord.answers.dailyFocus} />
          </motion.div>
        )}

        {/* ── Lesson (contextual) + Quick tip ───────────────── */}
        <motion.div variants={staggerItem} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <LessonOfTheDay lesson={contextualLesson} />
          <QuickTipCard tip={tipOfDay} />
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
        aria-label="Calmorie - go to dashboard"
      >
        <AppLogo size={24} className="rounded-md" />
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
