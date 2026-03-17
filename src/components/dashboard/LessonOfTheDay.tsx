'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Clock, BookMarked, ArrowRight } from 'lucide-react'
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
          'flex flex-col gap-3',
          'bg-surface rounded-xl shadow-card px-4 py-4',
          'transition-all duration-normal ease-smooth',
          'hover:shadow-card-hover hover:-translate-y-px active:scale-[0.99]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
        )}
        aria-label={`Today's lesson: ${lesson.title}`}
      >
        {/* Eyebrow */}
        <p className="font-body text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
          Lesson of the day
        </p>

        {/* Category badge */}
        <span
          className={cn(
            'self-start inline-flex items-center',
            'px-2.5 py-1 rounded-full',
            'font-body text-[11px] font-semibold',
            categoryColors.bg,
            categoryColors.text,
          )}
        >
          {categoryLabel}
        </span>

        {/* Title */}
        <h3 className="font-display text-base font-semibold text-ink leading-snug tracking-tight">
          {lesson.title}
        </h3>

        {/* Summary */}
        <p className="font-body text-xs text-ink-secondary leading-relaxed line-clamp-2">
          {lesson.summary}
        </p>

        {/* Footer: meta + arrow */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-body text-xs text-ink-muted">
              <Clock className="w-3 h-3 shrink-0" strokeWidth={2} aria-hidden="true" />
              {lesson.readTimeMinutes} min
            </span>
            <span className="flex items-center gap-1 font-body text-xs text-ink-muted">
              <BookMarked className="w-3 h-3 shrink-0" strokeWidth={2} aria-hidden="true" />
              {lesson.sources.length} {lesson.sources.length === 1 ? 'source' : 'sources'}
            </span>
          </div>
          <ArrowRight
            className="w-3.5 h-3.5 text-primary shrink-0 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-fast"
            strokeWidth={2}
            aria-hidden="true"
          />
        </div>
      </Link>
    </motion.div>
  )
}
