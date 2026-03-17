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
 *   and set completed:true. Fix: selector is memoised with useMemo.
 *
 * Swipe navigation — v3 fix (Android Chrome pointer event reliability):
 *   onPointerDown/Up registered on the outer container did not reliably fire
 *   on Android Chrome because the inner overflow-y-auto div caused the
 *   browser to claim the touch for scroll handling, dispatching pointercancel
 *   instead of pointerup. Fixes applied:
 *     1. touch-action: pan-y on the swipe container — tells Chrome to handle
 *        vertical panning natively and pass horizontal gestures to JS.
 *     2. onPointerCancel clears the start-position refs so a cancelled touch
 *        does not leave stale state that blocks the next gesture.
 *
 * Layout clipping — v3 fix:
 *   absolute inset-0 children fill from the border edge of their containing
 *   block, not the content edge, so px-4 on the outer "relative overflow-hidden"
 *   container did nothing for the card inside. The card spanned full width.
 *   Its shadow-card extended past the container edge and was hard-clipped by
 *   overflow-hidden, making the card look cut off.
 *   Fixes:
 *     1. Removed px-4 from the outer container (it was a no-op for absolute children).
 *     2. Moved horizontal padding into a wrapper div INSIDE the absolute scroll child.
 *     3. Replaced shadow-card with border border-border/60 (shadow cannot show through
 *        overflow-hidden on the container that clips the animation slides).
 *
 * Bottom-nav safe area — v3 fix:
 *   The swiper motion.div in LessonReader is now given an explicit calc() height,
 *   so its bottom aligns with the viewport bottom. The fixed BottomNav (64px) sits
 *   over that. The nav-buttons bar now carries enough bottom padding on mobile to
 *   keep the Back/Next buttons above the BottomNav.
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

const SWIPE_THRESHOLD = 40

// ── Step slide variants ────────────────────────────────────────────────────

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

  const totalSteps   = lesson.steps.length
  const totalScreens = totalSteps + 1
  const isTakeaway   = currentScreen === totalSteps

  // ── Progress tracking ─────────────────────────────────────────────────────

  useEffect(() => {
    markStarted(lesson.slug)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isTakeaway) markProgress(lesson.slug, currentScreen)
  }, [currentScreen, isTakeaway]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (isTakeaway) markComplete(lesson.slug)
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
  //
  // touch-action: pan-y is set on the container (via inline style — Tailwind's
  // touch-pan-y utility is not configured in this project). This tells Android
  // Chrome: "handle vertical scroll natively; pass horizontal gestures to JS."
  // Without this hint the browser may claim the entire touch for scroll and
  // dispatch pointercancel instead of pointerup, silently swallowing swipes.
  //
  // onPointerCancel resets refs so a scroll-cancelled touch does not leave
  // stale state that would misfire on the next legitimate swipe.

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

    // Ignore vertical-dominant gestures (native scroll)
    if (Math.abs(dy) > Math.abs(dx)) return

    if (dx < -SWIPE_THRESHOLD) goNext()
    else if (dx > SWIPE_THRESHOLD) goPrev()
  }, [goNext, goPrev])

  // Clears stale refs when the browser cancels the pointer (e.g. to handle scroll)
  const handlePointerCancel = useCallback(() => {
    swipeStartX.current = null
    swipeStartY.current = null
  }, [])

  // ── Render ────────────────────────────────────────────────────────────────

  const step = !isTakeaway ? lesson.steps[currentScreen] : null

  return (
    <div className="flex flex-col flex-1 min-h-0">

      {/* ── Progress + sources bar ─────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-2.5 shrink-0">
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

      {/* ── Step content — swipe-enabled ─────────────────────
        *
        * overflow-hidden: clips the entering/exiting slide during animation.
        * px-4 is intentionally ABSENT here — absolute inset-0 children fill
        * from the border edge of their containing block, not the content edge,
        * so padding on this container has no effect on them. Horizontal padding
        * is applied inside each step's inner wrapper instead.
        *
        * touch-action: pan-y (inline) — the key swipe fix. Without this hint,
        * Android Chrome claims the entire touch for scroll handling and fires
        * pointercancel before pointerup, silently dropping horizontal swipes.
        ──────────────────────────────────────────────────── */}
      <div
        className="relative flex-1 min-h-0 overflow-hidden"
        style={{ touchAction: 'pan-y' }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
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

      {/* ── Navigation buttons ─────────────────────────────────
        *
        * Bottom padding:
        *   On mobile the swiper container's bottom aligns with the viewport
        *   bottom (see LessonReader for the calc() height). The app's fixed
        *   BottomNav (64px) sits on top of that. pb-[calc(…)] pushes the
        *   buttons above the BottomNav so they remain tappable. lg:pb-3
        *   resets to normal padding on desktop where BottomNav is hidden.
        ────────────────────────────────────────────────────── */}
      <div
        className={cn(
          'flex items-center justify-between px-5 pt-3 border-t border-border shrink-0',
          // Clear the fixed BottomNav (64px) plus the original 12px bottom padding
          'pb-[calc(0.75rem+var(--bottom-nav-height))]',
          // Desktop: BottomNav is hidden, reset to normal padding
          'lg:pb-3',
        )}
      >
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
 * Key layout notes (v3 fix):
 *
 *   The motion.div uses absolute inset-0 to fill the swipe container and
 *   enable overflow-y-auto scrolling within a bounded area. It also drives
 *   the horizontal slide animation.
 *
 *   Horizontal padding lives on the inner wrapper div (px-4), NOT on the
 *   outer "relative overflow-hidden" container. This is important because
 *   absolute inset-0 elements fill from the border edge of their containing
 *   block — px-4 on the outer container would have zero effect on them.
 *
 *   The reading card uses border border-border/60 instead of shadow-card.
 *   Box-shadows are clipped by any ancestor with overflow:hidden, and the
 *   swipe container must use overflow-hidden to clip the animation. A subtle
 *   border gives visual separation without the hard-cut appearance.
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
      {/* px-4: horizontal card inset (cannot live on the outer container — see notes above) */}
      <div className="px-4 pt-3 pb-6">

        {/* Reading card surface
          * border-only (no shadow) — shadows are clipped by ancestor overflow-hidden.
          * rounded-2xl gives the modern, bubbly feel without needing elevation. */}
        <div
          className={cn(
            'bg-surface rounded-2xl',
            'border border-border/60',
            'px-5 pt-5 pb-8',
            'space-y-4',
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
              'text-[1.6rem] leading-snug tracking-tight',
              'text-balance',
            )}
          >
            {heading}
          </h3>

          {/* Thin accent rule */}
          <div className="w-8 h-[3px] rounded-full bg-primary/30" />

          {/* Body paragraphs — text-lg for comfortable mobile reading */}
          <div className="space-y-5">
            {body.split('\n\n').map((para, i) => (
              <p
                key={i}
                className="font-body text-lg text-ink leading-[1.8]"
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
 * Final step. Same horizontal padding approach as StepScreen.
 * Uses a centered flex layout to push the card to mid-screen on tall
 * viewports; on short viewports it falls back to top-aligned scroll.
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
      className="absolute inset-0 overflow-y-auto overscroll-contain"
    >
      {/* Use flex + justify-center for vertical centering on tall screens */}
      <div className="px-4 py-6 flex flex-col justify-center min-h-full">
        <div
          className={cn(
            'bg-primary-light rounded-2xl',
            'border border-primary-mid',
            'px-5 py-8 space-y-6',
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

          {/* Takeaway — large display text for impact */}
          <p
            className={cn(
              'font-display font-semibold text-primary-text',
              'text-[1.5rem] leading-snug tracking-tight',
              'text-balance',
            )}
          >
            {takeaway}
          </p>

          {/* Hint */}
          <p className="font-body text-sm text-primary-text/65 leading-relaxed">
            Tap &ldquo;Done&rdquo; to return to the lesson library, or view
            the sources to explore the research behind this lesson.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
