'use client'

/**
 * LessonSwiper
 *
 * The interactive step-by-step lesson content player.
 *
 * Manages:
 *   – Current step state (0-indexed through lesson.steps, then takeaway)
 *   – Forward/back navigation via buttons
 *   – LessonProgress dot indicator
 *   – Animated directional step transitions
 *   – Final takeaway screen
 *   – "Sources" button that opens SourcesDrawer
 *
 * Progress tracking:
 *   – markStarted() called on mount
 *   – markProgress() called when currentScreen advances (not when regressing)
 *   – markComplete() called when the takeaway screen is reached
 *
 * All derived values (totalSteps, totalScreens, isTakeaway) are
 * declared before any useEffect that references them.
 *
 * Props:
 *   lesson   — the full Lesson object
 *   onClose  — called when the user taps "Done" on the takeaway screen
 */

import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, BookMarked } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { LessonProgress } from './LessonProgress'
import { SourcesDrawer } from './SourcesDrawer'
import type { Lesson } from '@/types/lesson'
import { useLessonStore, selectResumeStep } from '@/stores/lessonStore'

// ── Step slide variants (directional) ─────────────────────────────────────

const stepVariants = {
  enter: (dir: number) => ({
    x:       dir >= 0 ? '60%' : '-60%',
    opacity: 0,
  }),
  center: {
    x:          0,
    opacity:    1,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
  },
  exit: (dir: number) => ({
    x:          dir >= 0 ? '-35%' : '35%',
    opacity:    0,
    transition: { duration: 0.22, ease: [0.4, 0, 0.2, 1] },
  }),
}

// ── Component ──────────────────────────────────────────────────────────────

interface LessonSwiperProps {
  lesson: Lesson
  onClose?: () => void
}

export function LessonSwiper({ lesson, onClose }: LessonSwiperProps) {
  const resumeStep   = useLessonStore(selectResumeStep(lesson.slug))
  const markStarted  = useLessonStore((s) => s.markStarted)
  const markProgress = useLessonStore((s) => s.markProgress)
  const markComplete = useLessonStore((s) => s.markComplete)

  // Resume from where the user left off (0 for first-time or re-read)
  const [currentScreen, setCurrentScreen] = useState(() => resumeStep)
  const [direction,      setDirection]     = useState(1)
  const [sourcesOpen,    setSourcesOpen]   = useState(false)

  // ── Derived values — declared BEFORE any useEffect that references them ──
  const totalSteps   = lesson.steps.length
  const totalScreens = totalSteps + 1     // steps + takeaway
  const isTakeaway   = currentScreen === totalSteps

  // ── Progress tracking effects ─────────────────────────────────────────────

  // Mark lesson as started on first open (no-op if already started)
  useEffect(() => {
    markStarted(lesson.slug)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Advance progress record when the user moves to a new step
  useEffect(() => {
    if (!isTakeaway) {
      markProgress(lesson.slug, currentScreen)
    }
  }, [currentScreen, isTakeaway]) // eslint-disable-line react-hooks/exhaustive-deps

  // Mark complete when the takeaway screen is reached for the first time
  useEffect(() => {
    if (isTakeaway) {
      markComplete(lesson.slug)
    }
  }, [isTakeaway]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Navigation ─────────────────────────────────────────────────────────────

  function goNext() {
    if (currentScreen < totalScreens - 1) {
      setDirection(1)
      setCurrentScreen((s) => s + 1)
    }
  }

  function goPrev() {
    if (currentScreen > 0) {
      setDirection(-1)
      setCurrentScreen((s) => s - 1)
    }
  }

  const step = !isTakeaway ? lesson.steps[currentScreen] : null

  return (
    <div className="flex flex-col h-full">
      {/* ── Progress + sources bar ─────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3">
        <LessonProgress
          currentStep={currentScreen}
          totalSteps={totalSteps}
          showTakeaway
        />

        <button
          type="button"
          onClick={() => setSourcesOpen(true)}
          className={cn(
            'flex items-center gap-1.5',
            'font-body text-xs font-medium text-ink-muted',
            'hover:text-primary transition-colors duration-fast',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus rounded-lg px-1',
          )}
          aria-label={`View ${lesson.sources.length} sources`}
        >
          <BookMarked className="w-3.5 h-3.5" strokeWidth={2} aria-hidden="true" />
          Sources ({lesson.sources.length})
        </button>
      </div>

      {/* ── Step content ──────────────────────────────────────── */}
      <div className="relative flex-1 overflow-hidden px-5">
        <AnimatePresence mode="wait" custom={direction}>
          {isTakeaway ? (
            <TakeawayScreen
              key="takeaway"
              direction={direction}
              takeaway={lesson.takeaway}
              onDone={onClose}
            />
          ) : step ? (
            <StepScreen
              key={currentScreen}
              direction={direction}
              stepNumber={currentScreen + 1}
              totalSteps={totalSteps}
              heading={step.heading}
              body={step.body}
            />
          ) : null}
        </AnimatePresence>
      </div>

      {/* ── Navigation buttons ─────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-4 border-t border-border shrink-0">
        <button
          type="button"
          onClick={goPrev}
          disabled={currentScreen === 0}
          className={cn(
            'flex items-center gap-1.5',
            'h-10 px-4 rounded-full',
            'font-body text-sm font-medium',
            'border border-border bg-surface text-ink-secondary',
            'hover:bg-surface-raised hover:text-ink',
            'disabled:opacity-30 disabled:pointer-events-none',
            'transition-all duration-fast ease-smooth',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
          )}
          aria-label="Previous step"
        >
          <ChevronLeft size={16} strokeWidth={2} aria-hidden="true" />
          Back
        </button>

        {!isTakeaway ? (
          <button
            type="button"
            onClick={goNext}
            className={cn(
              'flex items-center gap-1.5',
              'h-10 px-5 rounded-full',
              'font-body text-sm font-semibold',
              'bg-primary text-ink-on-primary',
              'shadow-sm hover:bg-primary-dark active:scale-[0.97]',
              'transition-all duration-fast ease-smooth',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-1',
            )}
            aria-label={
              currentScreen === totalSteps - 1 ? 'See takeaway' : 'Next step'
            }
          >
            {currentScreen === totalSteps - 1 ? 'Takeaway' : 'Next'}
            <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className={cn(
              'flex items-center gap-1.5',
              'h-10 px-5 rounded-full',
              'font-body text-sm font-semibold',
              'bg-primary text-ink-on-primary',
              'shadow-sm hover:bg-primary-dark active:scale-[0.97]',
              'transition-all duration-fast ease-smooth',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-1',
            )}
            aria-label="Finish lesson"
          >
            Done
          </button>
        )}
      </div>

      {/* ── Sources drawer ─────────────────────────────────── */}
      <SourcesDrawer
        isOpen={sourcesOpen}
        sources={lesson.sources}
        onClose={() => setSourcesOpen(false)}
      />
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────

function StepScreen({
  direction,
  stepNumber,
  totalSteps,
  heading,
  body,
}: {
  direction: number
  stepNumber: number
  totalSteps: number
  heading: string
  body: string
}) {
  return (
    <motion.div
      custom={direction}
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="absolute inset-0 overflow-y-auto overscroll-contain pb-4"
    >
      <div className="space-y-4 py-2">
        <p className="font-body text-[11px] font-semibold text-ink-muted uppercase tracking-wider">
          {stepNumber} / {totalSteps}
        </p>
        <h3 className="font-display text-xl font-semibold text-ink tracking-tight leading-snug text-balance">
          {heading}
        </h3>
        <div className="space-y-3">
          {body.split('\n\n').map((para, i) => (
            <p
              key={i}
              className="font-body text-[15px] text-ink-secondary leading-relaxed"
            >
              {para}
            </p>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function TakeawayScreen({
  direction,
  takeaway,
  onDone,
}: {
  direction: number
  takeaway: string
  onDone?: () => void
}) {
  return (
    <motion.div
      custom={direction}
      variants={stepVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="absolute inset-0 flex flex-col justify-center overflow-y-auto overscroll-contain pb-4"
    >
      <div
        className={cn(
          'bg-primary-light border border-primary-mid rounded-2xl',
          'px-5 py-7 space-y-4',
        )}
      >
        <p className="font-body text-[11px] font-semibold text-primary uppercase tracking-wider">
          Key takeaway
        </p>
        <p className="font-display text-lg font-semibold text-primary-text leading-snug tracking-tight text-balance">
          {takeaway}
        </p>
        <p className="font-body text-xs text-primary-text/70 leading-relaxed">
          Tap &ldquo;Done&rdquo; to return to the lesson library, or review
          the sources below.
        </p>
      </div>
    </motion.div>
  )
}
