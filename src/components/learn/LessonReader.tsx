'use client'

/**
 * LessonReader
 *
 * Full-page lesson layout rendered at /learn/[slug].
 *
 * Swiper height — v4 fix:
 *   Height is now calc(100dvh - top-bar-height - bottom-nav-height).
 *   On Galaxy S20 (800px): 800 - 56 - 64 = 680px.
 *   The swiper bottom aligns exactly with the BottomNav top — no overlap,
 *   no compensating padding needed inside LessonSwiper. The nav-buttons bar
 *   can use normal py-3 padding with no extra bottom clearance.
 *
 *   Previous: calc(100dvh - top-bar) = 744px left the swiper 64px behind the
 *   fixed BottomNav. LessonSwiper compensated with pb-[calc(0.75rem+64px)]=76px
 *   on the nav bar, making it 133px tall — consuming 64px of space for nothing.
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
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="page-container py-6 flex flex-col gap-6"
          >
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

            <h1
              className={cn(
                'font-display font-semibold text-ink',
                'text-[2rem] leading-tight tracking-tight',
                'text-balance',
              )}
            >
              {lesson.title}
            </h1>

            <p className="font-body text-[1.0625rem] text-ink leading-[1.8]">
              {lesson.summary}
            </p>

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
          /* Swiper height = viewport minus TopBar minus BottomNav.
             Galaxy S20: 800 - 56 - 64 = 680px. Swiper bottom aligns exactly
             with BottomNav top. No overlap, so LessonSwiper needs no extra
             bottom padding to clear the BottomNav. */
          <motion.div
            key="swiper"
            initial={{ opacity: 0, x: '20%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col overflow-hidden"
            style={{
              height: 'calc(100dvh - var(--top-bar-height) - var(--bottom-nav-height))',
            }}
          >
            <LessonSwiper key={lesson.slug} lesson={lesson} onClose={handleDone} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
