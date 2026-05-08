'use client'

import { useMemo, useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Award,
  BookMarked,
  CheckCircle2,
  Clock,
  PlayCircle,
  RotateCcw,
  Sparkles,
  Star,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { TopBar } from '@/components/layout/TopBar'
import { LessonSwiper, type CompletionReward } from './LessonSwiper'
import { getLearningRewards } from '@/lib/content/learningRewards'
import { useLessons } from '@/hooks/useLessons'
import {
  type Lesson,
  LESSON_CATEGORY_LABELS,
  LESSON_CATEGORY_COLORS,
} from '@/types/lesson'
import { useLessonStore, selectLessonProgress } from '@/stores/lessonStore'

interface LessonReaderProps {
  lesson: Lesson
}

export function LessonReader({ lesson }: LessonReaderProps) {
  const router = useRouter()
  const progress = useLessonStore(selectLessonProgress(lesson.slug))
  const { lessons, progressMap } = useLessons()
  const [started, setStarted] = useState(false)
  const [completionReward, setCompletionReward] = useState<CompletionReward | null>(null)

  const categoryLabel = LESSON_CATEGORY_LABELS[lesson.category]
  const categoryColors = LESSON_CATEGORY_COLORS[lesson.category]

  const isInProgress = !!progress && !progress.completed
  const isCompleted = progress?.completed === true
  const resumeStep = isInProgress ? progress.lastStepIndex : 0
  const totalSteps = lesson.steps.length
  const progressPercent = isCompleted
    ? 100
    : isInProgress
      ? Math.round(((resumeStep + 1) / totalSteps) * 100)
      : 0

  const launchLabel = isCompleted
    ? 'Reread Lesson'
    : isInProgress
      ? 'Resume Lesson'
      : 'Start Lesson'

  const launchIcon = isCompleted
    ? <RotateCcw className="w-4 h-4" strokeWidth={2.2} aria-hidden="true" />
    : <PlayCircle className="w-4 h-4" strokeWidth={2.2} aria-hidden="true" />

  const projectedReward = useMemo(() => {
    if (isCompleted) return null

    const before = getLearningRewards(lessons, progressMap)
    const afterMap = {
      ...progressMap,
      [lesson.slug]: {
        slug: lesson.slug,
        completed: true,
        lastStepIndex: totalSteps - 1,
      },
    }
    const after = getLearningRewards(lessons, afterMap)

    return {
      xp: after.totalXp - before.totalXp,
      newBadges: after.badges
        .filter((badge) => badge.unlocked && !before.badges.some(
          (beforeBadge) => beforeBadge.id === badge.id && beforeBadge.unlocked
        ))
        .map((badge) => badge.label),
    }
  }, [isCompleted, lesson.slug, lessons, progressMap, totalSteps])

  function handleStart() {
    setCompletionReward(projectedReward)
    setStarted(true)
  }

  function handleDone() {
    router.back()
  }

  return (
    <div className="flex flex-col min-h-screen-dynamic bg-background">
      <TopBar title={started ? lesson.title : 'Lesson'} showBack />

      <AnimatePresence mode="wait" initial={false}>
        {!started ? (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="page-container py-5 pb-safe-nav space-y-5"
          >
            <div
              className={cn(
                'rounded-2xl border border-primary-mid bg-primary-light',
                'px-5 py-5 shadow-card space-y-5',
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-3 py-1',
                    'font-body text-[11px] font-semibold',
                    categoryColors.bg,
                    categoryColors.text,
                  )}
                >
                  {categoryLabel}
                </span>
                {isCompleted ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-success-bg px-3 py-1 font-body text-[11px] font-semibold text-success">
                    <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
                    Completed
                  </span>
                ) : isInProgress ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-surface/80 px-3 py-1 font-body text-[11px] font-semibold text-primary">
                    <Sparkles className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
                    {progressPercent}% done
                  </span>
                ) : null}
              </div>

              <div className="space-y-3">
                <h1 className="font-display text-[2rem] leading-tight font-semibold tracking-tight text-primary-text text-balance">
                  {lesson.title}
                </h1>
                <p className="font-body text-base leading-relaxed text-primary-text/75">
                  {lesson.summary}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <LessonMeta
                  icon={<Clock className="w-4 h-4" strokeWidth={2} />}
                  value={`${lesson.readTimeMinutes} min`}
                  label="Read"
                />
                <LessonMeta
                  icon={<BookMarked className="w-4 h-4" strokeWidth={2} />}
                  value={`${lesson.sources.length}`}
                  label="Sources"
                />
                <LessonMeta
                  icon={<Star className="w-4 h-4" strokeWidth={2} />}
                  value={isCompleted ? 'Earned' : '+50'}
                  label="XP"
                />
              </div>

              {isInProgress && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between font-body text-xs text-primary-text/65">
                    <span>Resume at step {resumeStep + 1}</span>
                    <span>{totalSteps} steps</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface/80">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-border bg-surface px-4 py-4 shadow-card">
                <Award className="mb-2 h-5 w-5 text-accent" strokeWidth={2} aria-hidden="true" />
                <p className="font-body text-sm font-semibold text-ink">Badge chances</p>
                <p className="mt-1 font-body text-xs leading-relaxed text-ink-muted">
                  Complete lessons to unlock milestones.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-surface px-4 py-4 shadow-card">
                <BookMarked className="mb-2 h-5 w-5 text-primary" strokeWidth={2} aria-hidden="true" />
                <p className="font-body text-sm font-semibold text-ink">Evidence first</p>
                <p className="mt-1 font-body text-xs leading-relaxed text-ink-muted">
                  Sources stay one tap away while reading.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStart}
              className={cn(
                'flex h-12 w-full items-center justify-center gap-2 rounded-full',
                'bg-primary px-6 font-body text-sm font-semibold text-ink-on-primary',
                'shadow-sm transition-all duration-fast ease-smooth',
                'hover:bg-primary-dark active:scale-[0.98]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-1',
              )}
            >
              {launchIcon}
              {launchLabel}
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="swiper"
            initial={{ opacity: 0, x: '20%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col overflow-hidden"
            style={{
              height: 'calc(100dvh - var(--top-bar-height) - var(--bottom-nav-height))',
            }}
          >
            <LessonSwiper
              lesson={lesson}
              onClose={handleDone}
              completionReward={completionReward}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function LessonMeta({
  icon,
  value,
  label,
}: {
  icon: ReactNode
  value: string
  label: string
}) {
  return (
    <div className="rounded-xl bg-surface/80 px-3 py-3 text-primary-text">
      <div className="mb-1.5 text-primary">{icon}</div>
      <p className="font-body text-sm font-semibold leading-tight">{value}</p>
      <p className="font-body text-[11px] font-medium text-primary-text/55">{label}</p>
    </div>
  )
}
