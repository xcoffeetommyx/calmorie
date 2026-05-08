'use client'

import { useMemo, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Award,
  BookMarked,
  CheckCircle2,
  ChevronRight,
  Clock,
  Flame,
  Lock,
  Sparkles,
  Star,
  Trophy,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { TopBar } from '@/components/layout/TopBar'
import { LessonCard } from '@/components/learn/LessonCard'
import { staggerContainer, staggerItem } from '@/lib/animations/variants'
import { getLearningRewards, type LearningBadge } from '@/lib/content/learningRewards'
import { useLessons } from '@/hooks/useLessons'
import {
  type LessonCategory,
  LESSON_CATEGORY_LABELS,
  LESSON_CATEGORY_COLORS,
} from '@/types/lesson'

type LessonFilter = 'all' | LessonCategory

const badgeToneClasses: Record<LearningBadge['tone'], string> = {
  gold:   'bg-amber-100 text-amber-800 border-amber-200',
  green:  'bg-emerald-100 text-emerald-800 border-emerald-200',
  blue:   'bg-sky-100 text-sky-800 border-sky-200',
  rose:   'bg-rose-100 text-rose-800 border-rose-200',
  violet: 'bg-violet-100 text-violet-800 border-violet-200',
}

function LearnSkeleton() {
  return (
    <div className="page-container py-5 space-y-5">
      <div className="space-y-1.5">
        <div className="h-6 w-48 bg-surface-raised rounded-full animate-pulse-soft" />
        <div className="h-3.5 w-64 bg-surface-raised rounded-full animate-pulse-soft" />
      </div>
      <div className="h-40 bg-surface-raised rounded-xl animate-pulse-soft" />
      <div className="grid grid-cols-3 gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-surface-raised rounded-xl animate-pulse-soft" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-32 bg-surface-raised rounded-xl animate-pulse-soft"
            style={{ animationDelay: `${i * 50}ms` }}
          />
        ))}
      </div>
    </div>
  )
}

export default function LearnPage() {
  const { lessons, progressMap, lessonOfTheDay, isHydrated } = useLessons()
  const [filter, setFilter] = useState<LessonFilter>('all')

  const rewards = useMemo(
    () => getLearningRewards(lessons, progressMap),
    [lessons, progressMap]
  )

  const filters = useMemo(() => {
    const categories = Array.from(new Set(lessons.map((lesson) => lesson.category)))
    return ['all', ...categories] as LessonFilter[]
  }, [lessons])

  const visibleLessons = useMemo(
    () => filter === 'all'
      ? lessons
      : lessons.filter((lesson) => lesson.category === filter),
    [filter, lessons]
  )

  return (
    <div className="flex flex-col min-h-full bg-background">
      <TopBar title="Learn" />

      {!isHydrated ? (
        <LearnSkeleton />
      ) : (
        <motion.div
          className="page-container py-5 pb-safe-nav space-y-6"
          variants={staggerContainer}
          initial="initial"
          animate="enter"
        >
          <motion.div variants={staggerItem} className="space-y-1">
            <p className="font-body text-xs font-semibold uppercase tracking-widest text-accent">
              Calmorie Academy
            </p>
            <h2 className="font-display text-2xl font-semibold text-ink tracking-tight">
              Learn your body, one small win at a time
            </h2>
            <p className="font-body text-sm text-ink-secondary leading-relaxed">
              Short reads, real sources, and a little XP for showing up.
            </p>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Link
              href={`/learn/${lessonOfTheDay.slug}`}
              className={cn(
                'block rounded-xl border border-primary-mid bg-primary-light',
                'px-4 py-4 shadow-card transition-all duration-normal ease-smooth',
                'hover:shadow-card-hover hover:-translate-y-px active:scale-[0.99]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
              )}
              aria-label={`Open today's lesson: ${lessonOfTheDay.title}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3 min-w-0">
                  <div className="inline-flex items-center gap-2 rounded-full bg-surface/85 px-3 py-1 text-primary">
                    <Sparkles className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
                    <span className="font-body text-[11px] font-semibold uppercase tracking-wider">
                      Today's lesson
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-display text-xl font-semibold text-primary-text leading-snug tracking-tight">
                      {lessonOfTheDay.title}
                    </h3>
                    <p className="font-body text-sm text-primary-text/75 leading-relaxed line-clamp-2">
                      {lessonOfTheDay.summary}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-primary-text/70">
                    <span className="inline-flex items-center gap-1 font-body text-xs">
                      <Clock className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
                      {lessonOfTheDay.readTimeMinutes} min
                    </span>
                    <span className="inline-flex items-center gap-1 font-body text-xs">
                      <Star className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
                      +50 XP
                    </span>
                    {lessonOfTheDay.progress?.completed && (
                      <span className="inline-flex items-center gap-1 font-body text-xs font-medium text-success">
                        <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
                        Completed
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-ink-on-primary shadow-sm"
                  aria-hidden="true"
                >
                  <ChevronRight className="w-5 h-5" strokeWidth={2.2} />
                </span>
              </div>
            </Link>
          </motion.div>

          <motion.div variants={staggerItem} className="grid grid-cols-3 gap-2">
            <StatTile
              icon={<Trophy className="w-4 h-4" strokeWidth={2} />}
              value={`Lv ${rewards.level}`}
              label={`${rewards.xpIntoLevel}/${rewards.xpForCurrentLevel} XP`}
            />
            <StatTile
              icon={<Flame className="w-4 h-4" strokeWidth={2} />}
              value={`${rewards.totalXp}`}
              label="Total XP"
            />
            <StatTile
              icon={<BookMarked className="w-4 h-4" strokeWidth={2} />}
              value={`${rewards.completedCount}/${rewards.totalLessons}`}
              label="Finished"
            />
          </motion.div>

          <motion.div variants={staggerItem} className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-body text-sm font-semibold text-ink">
                  Badges
                </h3>
                <p className="font-body text-xs text-ink-muted">
                  {rewards.unlockedBadges.length} unlocked
                </p>
              </div>
              {rewards.nextBadge && (
                <p className="font-body text-xs text-ink-muted text-right">
                  Next: <span className="font-medium text-ink-secondary">{rewards.nextBadge.label}</span>
                </p>
              )}
            </div>
            <div className="scroll-strip">
              {rewards.badges.map((badge) => (
                <BadgeChip key={badge.id} badge={badge} />
              ))}
            </div>
          </motion.div>

          <motion.div
            variants={staggerItem}
            className={cn(
              'flex items-start gap-3 px-4 py-3.5 rounded-xl',
              'bg-surface border border-border shadow-card',
            )}
            role="note"
            aria-label="About lesson sources"
          >
            <BookMarked
              className="w-4 h-4 text-primary shrink-0 mt-px"
              strokeWidth={2}
              aria-hidden="true"
            />
            <p className="font-body text-xs text-ink-secondary leading-relaxed">
              Each lesson is written from published research. Tap{' '}
              <strong>Sources</strong> while reading to see exactly where the information comes from.
            </p>
          </motion.div>

          <motion.div variants={staggerItem} className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-body text-sm font-semibold text-ink">
                Lesson library
              </h3>
              <p className="font-body text-xs text-ink-muted">
                {visibleLessons.length} shown
              </p>
            </div>

            <div className="scroll-strip" role="tablist" aria-label="Lesson filters">
              {filters.map((item) => {
                const isActive = filter === item
                const label = item === 'all' ? 'All' : LESSON_CATEGORY_LABELS[item]
                const colors = item === 'all' ? null : LESSON_CATEGORY_COLORS[item]
                return (
                  <button
                    key={item}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setFilter(item)}
                    className={cn(
                      'h-9 px-4 rounded-full border font-body text-xs font-semibold',
                      'transition-all duration-fast ease-smooth',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
                      isActive
                        ? 'bg-ink text-background border-ink shadow-sm'
                        : colors
                          ? `${colors.bg} ${colors.text} border-transparent`
                          : 'bg-surface text-ink-secondary border-border',
                    )}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2"
          >
            {visibleLessons.map((lesson) => (
              <motion.div key={lesson.slug} variants={staggerItem}>
                <LessonCard
                  lesson={lesson}
                  progress={lesson.progress}
                />
              </motion.div>
            ))}
          </motion.div>

          <motion.p
            variants={staggerItem}
            className="font-body text-xs text-ink-muted text-center pb-2"
          >
            {lessons.length} lessons ready. Every completed lesson adds 50 XP.
          </motion.p>
        </motion.div>
      )}
    </div>
  )
}

function StatTile({
  icon,
  value,
  label,
}: {
  icon: ReactNode
  value: string
  label: string
}) {
  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-3 shadow-card">
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-accent-light text-accent">
        {icon}
      </div>
      <p className="font-display text-lg font-semibold text-ink leading-none tracking-tight">
        {value}
      </p>
      <p className="mt-1 font-body text-[11px] font-medium text-ink-muted leading-tight">
        {label}
      </p>
    </div>
  )
}

function BadgeChip({ badge }: { badge: LearningBadge }) {
  return (
    <div
      className={cn(
        'w-[10.5rem] rounded-xl border px-3 py-3 shadow-card',
        badge.unlocked
          ? badgeToneClasses[badge.tone]
          : 'bg-surface text-ink-muted border-border',
      )}
    >
      <div className="flex items-start gap-2.5">
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
            badge.unlocked ? 'bg-white/60' : 'bg-surface-raised',
          )}
          aria-hidden="true"
        >
          {badge.unlocked ? (
            <Award className="w-4 h-4" strokeWidth={2.2} />
          ) : (
            <Lock className="w-4 h-4" strokeWidth={2.2} />
          )}
        </div>
        <div className="min-w-0">
          <p className="font-body text-xs font-semibold leading-tight text-current">
            {badge.label}
          </p>
          <p className="mt-1 font-body text-[11px] leading-snug opacity-75">
            {badge.description}
          </p>
        </div>
      </div>
      {!badge.unlocked && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-raised">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${Math.round(badge.progress * 100)}%` }}
          />
        </div>
      )}
    </div>
  )
}
