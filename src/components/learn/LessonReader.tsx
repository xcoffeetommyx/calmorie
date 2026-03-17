'use client'

/**
 * LessonReader
 *
 * Full-page lesson layout rendered at /learn/[slug].
 *
 * Structure:
 *   ┌─────────────────────────────┐
 *   │  TopBar (back, title)       │  ← sticky
 *   ├─────────────────────────────┤
 *   │  Lesson intro screen        │  ← shown before reading starts
 *   │  (or LessonSwiper)          │
 *   └─────────────────────────────┘
 *
 * Progress-aware intro screen:
 *   – No progress (not started): shows "Start lesson" CTA
 *   – In-progress (started, not completed): shows "Continue lesson" CTA
 *     with the step the user reached ("Continue from step 3/6")
 *   – Completed: shows "Read again" CTA
 *
 * Visual design (v2 — premium intro surface):
 *   The intro screen uses a rounded card for the sections list so each
 *   step feels intentional and inviting. The step numbering uses filled
 *   circle badges instead of plain text numerals. The summary text is
 *   slightly larger for comfortable reading. The overall layout has more
 *   breathing room between sections.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, BookMarked, CheckCircle2, RotateCcw, PlayCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { TopBar } from '@/components/layout/TopBar'
import { LessonSwiper } from './LessonSwiper'
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
  const router    = useRouter()
  const progress  = useLessonStore(selectLessonProgress(lesson.slug))
  const [started, setStarted] = useState(false)

  const categoryLabel  = LESSON_CATEGORY_LABELS[lesson.category]
  const categoryColors = LESSON_CATEGORY_COLORS[lesson.category]

  const isInProgress = !!progress && !progress.completed
  const isCompleted  = progress?.completed === true
  const resumeStep   = isInProgress ? progress.lastStepIndex : 0
  const totalSteps   = lesson.steps.length

  function handleDone() {
    router.back()
  }

  return (
    <div className="flex flex-col min-h-screen-dynamic bg-background">
      <TopBar
        title={started ? lesson.title : 'Lesson'}
        showBack
      />

      <AnimatePresence mode="wait" initial={false}>
        {!started ? (
          /* ── Lesson intro / overview ─────────────────────────── */
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="page-container py-6 flex flex-col gap-6"
          >
            {/* Category badge */}
            <span
              className={cn(
                'self-start inline-flex items-center gap-1.5',
                'px-3.5 py-1.5 rounded-full',
                'font-body text-xs font-semibold tracking-wide',
                categoryColors.bg,
                categoryColors.text,
              )}
            >
              {categoryLabel}
            </span>

            {/* Title — large and bold to anchor the page */}
            <h1
              className={cn(
                'font-display font-semibold text-ink',
                'text-[2rem] leading-tight tracking-tight',
                'text-balance',
              )}
            >
              {lesson.title}
            </h1>

            {/* Summary — slightly larger than before for comfortable scanning */}
            <p className="font-body text-[1.0625rem] text-ink leading-[1.8]">
              {lesson.summary}
            </p>

            {/* Meta row */}
            <div className="flex items-center gap-5">
              <span className="flex items-center gap-2 font-body text-sm text-ink-muted">
                <Clock className="w-4 h-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                {lesson.readTimeMinutes} min read
              </span>
              <span className="flex items-center gap-2 font-body text-sm text-ink-muted">
                <BookMarked className="w-4 h-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
                {lesson.sources.length} cited {lesson.sources.length === 1 ? 'source' : 'sources'}
              </span>
            </div>

            {/* In-progress resume indicator */}
            {isInProgress && (
              <div
                className={cn(
                  'flex items-start gap-3 px-4 py-3.5 rounded-2xl',
                  'bg-primary-light border border-primary-mid',
                )}
                role="note"
                aria-label="Lesson in progress"
              >
                <PlayCircle
                  className="w-4 h-4 text-primary shrink-0 mt-0.5"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <p className="font-body text-sm text-primary-text leading-relaxed">
                  You&rsquo;ve read up to{' '}
                  <strong>
                    section {resumeStep + 1} of {totalSteps}
                  </strong>
                  . Tap &ldquo;Continue&rdquo; to pick up where you left off.
                </p>
              </div>
            )}

            {/* Completed indicator */}
            {isCompleted && (
              <div
                className={cn(
                  'flex items-start gap-3 px-4 py-3.5 rounded-2xl',
                  'bg-success-bg border border-success/20',
                )}
                role="note"
                aria-label="Lesson completed"
              >
                <CheckCircle2
                  className="w-4 h-4 text-success shrink-0 mt-0.5"
                  strokeWidth={2}
                  aria-hidden="true"
                />
                <p className="font-body text-sm text-success leading-relaxed">
                  You&rsquo;ve completed this lesson. Tap below to read it again.
                </p>
              </div>
            )}

            {/* Sections preview card — rounded, intentional surface */}
            <div className="bg-surface rounded-2xl shadow-card overflow-hidden border border-border/50">
              {/* Card header */}
              <div className="px-5 py-3 border-b border-border bg-background/50">
                <p className="font-body text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
                  {lesson.steps.length} {lesson.steps.length === 1 ? 'section' : 'sections'}
                </p>
              </div>

              {/* Step list */}
              <ul className="divide-y divide-border/60">
                {lesson.steps.map((step, i) => (
                  <li key={i} className="flex items-center gap-4 px-5 py-3.5">
                    {/* Numbered circle badge */}
                    <span
                      className={cn(
                        'flex items-center justify-center shrink-0',
                        'w-6 h-6 rounded-full',
                        'bg-primary-light text-primary',
                        'font-body text-[11px] font-bold',
                      )}
                      aria-hidden="true"
                    >
                      {i + 1}
                    </span>
                    <p className="font-body text-sm text-ink leading-snug">
                      {step.heading}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA — label changes based on progress state */}
            <button
              type="button"
              onClick={() => setStarted(true)}
              className={cn(
                'w-full h-13 rounded-2xl',
                'font-body text-[0.9375rem] font-semibold',
                'shadow-sm active:scale-[0.97]',
                'transition-all duration-fast ease-smooth',
                'focus-visible:outline-none focus-visible:ring-2',
                'focus-visible:ring-border-focus focus-visible:ring-offset-2',
                isCompleted
                  ? 'bg-surface border border-border text-ink hover:bg-surface-raised'
                  : 'bg-primary text-ink-on-primary hover:bg-primary-dark',
              )}
              style={{ height: '3.25rem' }}
              aria-label={
                isCompleted
                  ? `Read ${lesson.title} again`
                  : isInProgress
                    ? `Continue ${lesson.title} from section ${resumeStep + 1}`
                    : `Start reading ${lesson.title}`
              }
            >
              <span className="flex items-center justify-center gap-2">
                {isCompleted && (
                  <RotateCcw size={15} strokeWidth={2} aria-hidden="true" />
                )}
                {isCompleted
                  ? 'Read again'
                  : isInProgress
                    ? `Continue — section ${resumeStep + 1} of ${totalSteps}`
                    : 'Start lesson'}
              </span>
            </button>

            {/* Bottom breathing room (above bottom nav) */}
            <div className="h-2" aria-hidden="true" />
          </motion.div>
        ) : (
          /* ── Lesson swiper ───────────────────────────────────── */
          <motion.div
            key="swiper"
            initial={{ opacity: 0, x: '20%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 flex flex-col"
          >
            <LessonSwiper key={lesson.slug} lesson={lesson} onClose={handleDone} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
