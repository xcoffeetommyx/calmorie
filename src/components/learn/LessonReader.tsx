'use client'

/**
 * LessonReader
 *
 * Full-page lesson layout rendered at /learn/[slug].
 *
 * Structure:
 *   ┌─────────────────────────────┐
 *   │  TopBar (back, title)       │  ← sticky, h = var(--top-bar-height) = 56px
 *   ├─────────────────────────────┤
 *   │  Lesson intro screen        │  ← shown before reading starts
 *   │  (or LessonSwiper)          │
 *   └─────────────────────────────┘
 *
 * Swiper height — v3 fix:
 *   The previous design used flex-1 on the swiper motion.div and relied on
 *   min-h-screen-dynamic (min-height: 100dvh) propagating a definite flex
 *   container height down the chain. This is fragile: while Chrome 84+ does
 *   treat min-height as definite for flex in most cases, the behaviour can
 *   break when intermediate elements (AnimatePresence, Next.js page wrappers)
 *   are not flex children in the expected way.
 *
 *   Fix: give the swiper motion.div an EXPLICIT height using CSS calc(),
 *   bypassing the flex chain entirely:
 *     height: calc(100dvh - var(--top-bar-height))
 *   This gives the swiper exactly the viewport below the TopBar regardless
 *   of what any ancestor does.
 *
 *   The BottomNav (64px, position: fixed) sits on top of the viewport bottom.
 *   LessonSwiper's nav-buttons bar compensates with extra bottom padding on
 *   mobile (see LessonSwiper.tsx).
 *
 * Intro screen:
 *   Uses min-h-screen-dynamic and normal block scroll — unchanged from v2.
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

            {/* Title */}
            <h1
              className={cn(
                'font-display font-semibold text-ink',
                'text-[2rem] leading-tight tracking-tight',
                'text-balance',
              )}
            >
              {lesson.title}
            </h1>

            {/* Summary */}
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
                  <strong>section {resumeStep + 1} of {totalSteps}</strong>.
                  {' '}Tap &ldquo;Continue&rdquo; to pick up where you left off.
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

            {/* Sections preview card */}
            <div className="bg-surface rounded-2xl shadow-card overflow-hidden border border-border/50">
              <div className="px-5 py-3 border-b border-border bg-background/50">
                <p className="font-body text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
                  {lesson.steps.length} {lesson.steps.length === 1 ? 'section' : 'sections'}
                </p>
              </div>
              <ul className="divide-y divide-border/60">
                {lesson.steps.map((step, i) => (
                  <li key={i} className="flex items-center gap-4 px-5 py-3.5">
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

            {/* CTA */}
            <button
              type="button"
              onClick={() => setStarted(true)}
              className={cn(
                'w-full rounded-2xl',
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

            <div className="h-2" aria-hidden="true" />
          </motion.div>

        ) : (
          {/* ── Lesson swiper ───────────────────────────────────────
           *
           * Explicit calc() height bypasses the flex chain.
           *
           * WHY: flex-1 on this motion.div relies on all ancestors
           * propagating a definite height (not just min-height). That
           * chain can silently collapse to 0 on some Android Chrome
           * builds, making the content area 0px tall and everything
           * visually cut off.
           *
           * INSTEAD: anchor the swiper to exactly the viewport height
           * minus the TopBar. Combined with overflow-hidden, no content
           * escapes and the internal flex-1/min-h-0 chain inside
           * LessonSwiper now has a concrete height to distribute.
           ──────────────────────────────────────────────────────── */}
          <motion.div
            key="swiper"
            initial={{ opacity: 0, x: '20%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col overflow-hidden"
            style={{ height: 'calc(100dvh - var(--top-bar-height))' }}
          >
            <LessonSwiper key={lesson.slug} lesson={lesson} onClose={handleDone} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
