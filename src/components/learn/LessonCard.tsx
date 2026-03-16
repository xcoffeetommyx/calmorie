'use client'

/**
 * LessonCard
 *
 * Library card linking to a lesson reader page.
 * Shows category badge, title, summary, read-time, and a source-count
 * trust cue ("X cited sources").
 *
 * The card is fully interactive — the whole surface links to the lesson.
 *
 * Phase 7: add progress state (completed checkmark, "continue" label)
 * once lessonStore is wired.
 *
 * Props:
 *   lesson    — the full Lesson object from getAllLessons()
 *   progress  — optional LessonProgress (null until store is wired)
 *   className
 */

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Clock, BookMarked, ChevronRight, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { slideUp } from '@/lib/animations/variants'
import {
  type Lesson,
  type LessonProgress,
  LESSON_CATEGORY_LABELS,
  LESSON_CATEGORY_COLORS,
} from '@/types/lesson'

interface LessonCardProps {
  lesson: Lesson
  progress?: LessonProgress | null
  className?: string
}

export function LessonCard({ lesson, progress, className }: LessonCardProps) {
  const categoryLabel  = LESSON_CATEGORY_LABELS[lesson.category]
  const categoryColors = LESSON_CATEGORY_COLORS[lesson.category]
  const isCompleted    = progress?.completed === true

  return (
    <motion.div variants={slideUp} className={cn('group', className)}>
      <Link
        href={`/learn/${lesson.slug}`}
        className={cn(
          'flex flex-col gap-3',
          'bg-surface rounded-xl shadow-card p-4',
          'transition-all duration-normal ease-smooth',
          'hover:shadow-card-hover hover:-translate-y-px',
          'active:scale-[0.99]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
          'relative overflow-hidden',
          className,
        )}
        aria-label={`Read lesson: ${lesson.title}`}
      >
        {/* ── Top row: badge + status + chevron ────────────── */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1.5',
              'px-2.5 py-1 rounded-full',
              'font-body text-[11px] font-semibold',
              categoryColors.bg,
              categoryColors.text,
            )}
          >
            <span
              className={cn(
                'w-1.5 h-1.5 rounded-full shrink-0',
                categoryColors.text.replace('text-', 'bg-'),
              )}
              aria-hidden="true"
            />
            {categoryLabel}
          </span>

          <div className="flex items-center gap-2 shrink-0">
            {/* Completion indicator — shown when progress store is wired */}
            {isCompleted && (
              <CheckCircle2
                className="w-4 h-4 text-success"
                strokeWidth={2}
                aria-label="Completed"
              />
            )}
            <ChevronRight
              className="w-4 h-4 text-ink-muted opacity-0 group-hover:opacity-100 transition-opacity duration-fast"
              strokeWidth={2}
              aria-hidden="true"
            />
          </div>
        </div>

        {/* ── Content ───────────────────────────────────────── */}
        <div className="space-y-1.5">
          <h3 className="font-display text-base font-semibold text-ink leading-snug tracking-tight">
            {lesson.title}
          </h3>
          <p className="font-body text-sm text-ink-secondary leading-relaxed line-clamp-2">
            {lesson.summary}
          </p>
        </div>

        {/* ── Footer meta ───────────────────────────────────── */}
        <div className="flex items-center gap-4 pt-0.5">
          <span className="flex items-center gap-1.5 font-body text-xs text-ink-muted">
            <Clock className="w-3 h-3 shrink-0" strokeWidth={2} aria-hidden="true" />
            {lesson.readTimeMinutes} min
          </span>
          <span className="flex items-center gap-1.5 font-body text-xs text-ink-muted">
            <BookMarked className="w-3 h-3 shrink-0" strokeWidth={2} aria-hidden="true" />
            {lesson.sources.length} {lesson.sources.length === 1 ? 'source' : 'sources'}
          </span>
          {isCompleted && (
            <span className="font-body text-xs text-success font-medium ml-auto">
              Completed
            </span>
          )}
        </div>
      </Link>
    </motion.div>
  )
}
