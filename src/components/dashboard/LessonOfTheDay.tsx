'use client'

/**
 * LessonOfTheDay
 *
 * Displays the lesson of the day using real data from the content loader.
 * Shows category badge, title, summary, read-time, and a source-backed
 * trust cue ("X cited sources") before linking to the lesson reader.
 *
 * The lesson is chosen by getLessonOfTheDay() in lib/content/lessons.ts:
 *   1. First incomplete lesson (once lessonStore exists — Phase 6)
 *   2. Day-based rotation as fallback
 *
 * Phase 6: pass real progressMap from lessonStore so the function returns
 * the first genuinely unread lesson rather than always using rotation.
 *
 * Props:
 *   lesson — a Lesson object from the content loader
 */

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Clock, BookMarked, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { slideUp } from '@/lib/animations/variants'
import { type Lesson, LESSON_CATEGORY_LABELS, LESSON_CATEGORY_COLORS } from '@/types/lesson'

interface LessonOfTheDayProps {
  lesson: Lesson
  className?: string
}

export function LessonOfTheDay({ lesson, className }: LessonOfTheDayProps) {
  const categoryLabel  = LESSON_CATEGORY_LABELS[lesson.category]
  const categoryColors = LESSON_CATEGORY_COLORS[lesson.category]

  return (
    <motion.div variants={slideUp} className={cn('group', className)}>
      <Link
        href={`/learn/${lesson.slug}`}
        className={cn(
          'block bg-surface rounded-xl shadow-card',
          'px-4 py-4 space-y-3',
          'transition-all duration-normal ease-smooth',
          'hover:shadow-card-hover hover:-translate-y-px active:scale-[0.99]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
        )}
        aria-label={`Today's lesson: ${lesson.title}`}
      >
        {/* ── Top row: category badge + chevron ──────────────── */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {/* Eyebrow label */}
            <span className="font-body text-[10px] font-semibold text-ink-muted uppercase tracking-wider">
              Lesson of the day
            </span>
          </div>
          <ChevronRight
            className="w-4 h-4 text-ink-muted opacity-0 group-hover:opacity-100 transition-opacity duration-fast shrink-0"
            strokeWidth={2}
            aria-hidden="true"
          />
        </div>

        {/* ── Category badge ───────────────────────────────────── */}
        <span
          className={cn(
            'inline-flex items-center',
            'px-2.5 py-1 rounded-full',
            'font-body text-[11px] font-semibold',
            categoryColors.bg,
            categoryColors.text,
          )}
        >
          {categoryLabel}
        </span>

        {/* ── Title + summary ──────────────────────────────────── */}
        <div className="space-y-1.5">
          <h3 className="font-display text-base font-semibold text-ink leading-snug tracking-tight">
            {lesson.title}
          </h3>
          <p className="font-body text-sm text-ink-secondary leading-relaxed line-clamp-2">
            {lesson.summary}
          </p>
        </div>

        {/* ── Footer meta ──────────────────────────────────────── */}
        <div className="flex items-center gap-4 pt-0.5">
          <span className="flex items-center gap-1.5 font-body text-xs text-ink-muted">
            <Clock className="w-3.5 h-3.5 shrink-0" strokeWidth={2} aria-hidden="true" />
            {lesson.readTimeMinutes} min read
          </span>

          {/* Trust cue — source count */}
          <span className="flex items-center gap-1.5 font-body text-xs text-ink-muted">
            <BookMarked className="w-3.5 h-3.5 shrink-0" strokeWidth={2} aria-hidden="true" />
            {lesson.sources.length} {lesson.sources.length === 1 ? 'source' : 'sources'}
          </span>
        </div>
      </Link>
    </motion.div>
  )
}
