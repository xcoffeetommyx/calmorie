'use client'

/**
 * LessonSwiper
 *
 * Step-by-step lesson content player.
 *
 * Bug fix (root cause: unstable selector per render):
 *   selectResumeStep(lesson.slug) previously created a new closure on every
 *   render. Passed to Zustand's useSyncExternalStore, this caused React to
 *   see a snapshot value change (lastStepIndex → 0) when markComplete fired
 *   and set completed:true. Under concurrent rendering, this extra re-render
 *   could corrupt the currentScreen/isTakeaway relationship, locking the Next
 *   button. Fix: the selector is memoised with useMemo so the same function
 *   reference is reused, preventing spurious snapshot comparisons.
 *
 * Swipe navigation:
 *   Pointer events on the content wrapper detect horizontal swipes. The
 *   threshold (40px) prevents accidental triggers on taps. Vertical-dominant
 *   gestures are ignored so scrolling inside a step works normally.
 *
 * Visual design (v2 — rounded reading surface):
 *   Step content now sits inside an elevated card surface (bg-surface,
 *   rounded-2xl, shadow-card) rather than bare text on the background.
 *   Body text is larger (text-lg) with a generous line-height for comfortable
 *   mobile reading. The step label is styled as a compact pill badge.
 *   The takeaway screen has a stronger visual hierarchy with a decorative
 *   sparkle icon and larger display-size text.
 */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, BookMarked, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { LessonProgress } from './LessonProgress'
import { SourcesDrawer } from './SourcesDrawer'
import type { Lesson } from '@/types/lesson'
import { useLessonStore, selectResumeStep } from '@/stores/lessonStore'

// ── Constants ──────────────────────────────────────────────────────────────

/** Minimum horizontal distance (px) for a swipe to register */
const SWIPE_THRESHOLD = 40

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
  // ── Stable selector — same function reference across renders ──────────────
  const resumeStepSelector = useMemo(
    () => selectResumeStep(lesson.slug),
    [lesson.slug]
  )
  const resumeStep = useLessonStore(resumeStepSelector)

  const markStarted  = useLessonStore((s) => s.markStarted)
  const markProgress = useLessonStore((s) => s.markProgress)
  const markComplete = useLessonStore((s) => s.markComplete)

  const [currentScreen, setCurrentScreen] = useState(() => resumeStep)
  const [direction,      setDirection]     = useState(1)
  const [sourcesOpen,    setSourcesOpen]   = useState(false)

  // ── Derived values ────────────────────────────────────────────────────────
  const totalSteps   = lesson.steps.length
  const totalScreens = totalSteps + 1   // steps + takeaway
  const isTakeaway   = currentScreen === totalSteps

  // ── Progress tracking ─────────────────────────────────────────────────────

  useEffect(() => {
    markStarted(lesson.slug)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isTakeaway) {
      markProgress(lesson.slug, currentScreen)
    }
  }, [currentScreen, isTakeaway]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isTakeaway) {
      markComplete(lesson.slug)
    }
  }, [isTakeaway]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Navigation ────────────────────────────────────────────────────────────

  const goNext = useCallback(() => {
    if (currentScreen < totalScreens - 1) {
      setDirection(1)
      setCurrentScreen((s) => s + 1)
    }
  }, [currentScreen, totalScreens])

  const goPrev = useCallback(() => {
    if (currentScreen > 0) {
      setDirection(-1)
      setCurrentScreen((s) => s - 1)
    }
  }, [currentScreen])

  // ── Swipe detection ───────────────────────────────────────────────────────

  const swipeStartX = useRef<number | null>(null)
  const swipeStartY = useRef<number | null>(null)

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.buttons !== 1) return
    swipeStartX.current = e.clientX
    swipeStartY.current = e.clientY
  }, [])

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (swipeStartX.current === null || swipeStartY.current === null) return

    const dx = e.clientX - swipeStartX.current
    const dy = e.clientY - swipeStartY.current

    swipeStartX.current = null
    swipeStartY.current = null

    if (Math.abs(dy) > Math.abs(dx)) return

    if (dx < -SWIPE_THRESHOLD) {
      goNext()
    } else if (dx > SWIPE_THRESHOLD) {
      goPrev()
    }
  }, [goNext, goPrev])

  // ── Render ────────────────────────────────────────────────────────────────

  const step = !isTakeaway ? lesson.steps[currentScreen] : null

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* ── Progress + sources bar ─────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-2.5">
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

      {/* ── Step content — swipe-enabled ─────────────────────── */}
      <div
        className="relative flex-1 min-h-0 overflow-hidden px-4"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
      >
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
      <div className="flex items-center justify-between px-4 py-3 border-t border-border shrink-0">
        <button
          type="button"
          onClick={goPrev}
          disabled={currentScreen === 0}
          className={cn(
            'flex items-center gap-1.5',
            'h-11 px-5 rounded-full',
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
              'h-11 px-6 rounded-full',
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
              'h-11 px-6 rounded-full',
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

/**
 * StepScreen
 *
 * Renders a single lesson step inside a rounded reading card.
 * The card gives the text a deliberate, inviting reading surface —
 * distinct from the background — so it feels like a premium content
 * card rather than a plain document page.
 *
 * Typography:
 *   - Heading: text-[1.65rem] / leading-snug — anchors the page without
 *     overwhelming a narrow phone viewport
 *   - Body: text-lg / leading-[1.85] — comfortable for paragraph-heavy
 *     wellness content; wraps well at 360px viewport widths
 */
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
      className="absolute inset-0 overflow-y-auto overscroll-contain"
    >
      {/* Vertical breathing room around the card */}
      <div className="py-2 pb-6">

        {/* ── Reading card surface ─────────────────────────── */}
        <div
          className={cn(
            'bg-surface rounded-2xl shadow-card',
            'border border-border/50',
            'px-6 pt-6 pb-8',
            'space-y-5',
          )}
        >
          {/* Step pill badge */}
          <span
            className={cn(
              'inline-flex items-center',
              'px-3 py-1 rounded-full',
              'bg-primary-light text-primary',
              'font-body text-[11px] font-semibold tracking-wide',
            )}
          >
            {stepNumber} of {totalSteps}
          </span>

          {/* Section heading */}
          <h3
            className={cn(
              'font-display font-semibold text-ink',
              'text-[1.65rem] leading-snug tracking-tight',
              'text-balance',
            )}
          >
            {heading}
          </h3>

          {/* Decorative accent rule */}
          <div className="w-10 h-[3px] rounded-full bg-primary/25" />

          {/* Body paragraphs */}
          <div className="space-y-5">
            {body.split('\n\n').map((para, i) => (
              <p
                key={i}
                className={cn(
                  'font-body text-lg text-ink',
                  'leading-[1.85]',
                )}
              >
                {para}
              </p>
            ))}
          </div>
        </div>

      </div>
    </motion.div>
  )
}

/**
 * TakeawayScreen
 *
 * The final screen after all steps. Styled as a full-bleed accent card
 * with a Sparkles icon to signal "key insight". The takeaway text renders
 * at a large display size so it lands as a memorable closing statement.
 */
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
      className="absolute inset-0 flex flex-col justify-center overflow-y-auto overscroll-contain"
    >
      <div className="py-4">
        <div
          className={cn(
            'bg-primary-light rounded-2xl',
            'border border-primary-mid',
            'px-6 py-9 space-y-6',
          )}
        >
          {/* Icon + label */}
          <div className="flex items-center gap-2.5">
            <span
              className={cn(
                'flex items-center justify-center shrink-0',
                'w-8 h-8 rounded-full bg-primary/15',
              )}
              aria-hidden="true"
            >
              <Sparkles className="w-4 h-4 text-primary" strokeWidth={2} />
            </span>
            <p className="font-body text-[11px] font-semibold text-primary uppercase tracking-widest">
              Key takeaway
            </p>
          </div>

          {/* Takeaway quote — display-weight for impact */}
          <p
            className={cn(
              'font-display font-semibold text-primary-text',
              'text-[1.55rem] leading-snug tracking-tight',
              'text-balance',
            )}
          >
            {takeaway}
          </p>

          {/* Supporting hint */}
          <p className="font-body text-sm text-primary-text/65 leading-relaxed">
            Tap &ldquo;Done&rdquo; to return to the lesson library, or view
            the sources to explore the research behind this lesson.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
