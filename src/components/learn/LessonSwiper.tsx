'use client'

/**
 * LessonSwiper
 *
 * Step-by-step lesson content player.
 *
 * Selector stability fix:
 *   selectResumeStep(slug) creates a new closure each render. Memoising it
 *   with useMemo prevents Zustand's useSyncExternalStore from seeing spurious
 *   snapshot changes that could desync currentScreen and isTakeaway.
 *
 * Swipe navigation — v4 fix (touch events replace pointer events):
 *
 *   Root cause of previous failure:
 *     touch-action is evaluated at the hit-tested element, not at ancestors.
 *     The actual touch target is the inner `absolute inset-0 overflow-y-auto`
 *     child (StepScreen's motion.div). That element has no explicit touch-action
 *     so it defaults to 'auto'. Chrome evaluates 'auto' on the scrollable inner
 *     element, decides it owns the gesture, and fires pointercancel on the outer
 *     div before pointerup ever arrives. onPointerUp never runs. Swipe is lost.
 *
 *   Fix: switch to onTouchStart / onTouchEnd.
 *     touchend fires at the end of every touch regardless of whether Chrome
 *     simultaneously handled a scroll gesture. It is NOT replaced by touchcancel
 *     the way pointerup is replaced by pointercancel. This makes swipe detection
 *     reliable even when the inner scrollable div is active.
 *
 *   touch-action:pan-y on the outer container is kept as a supplementary hint
 *   to prevent full-page rubber-band during a clear horizontal swipe.
 *
 * Nav bar height — v4 fix:
 *   LessonReader now sets swiper height = 100dvh - topBar - bottomNav, so the
 *   swiper bottom aligns exactly with the BottomNav top (no overlap).
 *   The old pb-[calc(0.75rem+var(--bottom-nav-height))] = 76px bottom padding
 *   (which pushed buttons above the overlapping BottomNav) is removed.
 *   Nav bar is now py-3 = 69px total (was 133px). Reclaims 64px of dead space.
 *
 * Vertical budget on Galaxy S20 (800px) after both fixes:
 *   TopBar:       56px
 *   Swiper:      680px  (= 800 - 56 - 64)
 *     Progress:   ~36px
 *     Content:   575px  (flex-1 = 680 - 36 - 69)
 *     Nav bar:    69px  (pt-3 + border + h-11 + pb-3)
 *   BottomNav:    64px  (fixed, starts exactly at swiper bottom)
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

  // ── Touch-based swipe detection ───────────────────────────────────────────
  //
  // Uses onTouchStart / onTouchEnd instead of pointer events.
  //
  // WHY: Android Chrome fires pointercancel (not pointerup) when it claims a
  // touch for scroll — even with touch-action:pan-y on an ancestor. This is
  // because touch-action is evaluated at the hit-tested element (the inner
  // overflow-y-auto StepScreen div), not at an ancestor. The inner element
  // defaults to touch-action:auto, so Chrome claims the touch for scroll and
  // pointerup never arrives.
  //
  // touchend does NOT have this problem. It fires at the end of every touch
  // regardless of whether the browser also handled scroll. This makes it
  // reliable for detecting horizontal swipes even inside nested scroll views.
  //
  // touch-action:pan-y on the container is still set as a hint to suppress
  // full-page rubber-band on a clear horizontal swipe, but it is no longer
  // relied upon for swipe detection to work.

  const swipeStartX = useRef<number | null>(null)
  const swipeStartY = useRef<number | null>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0]
    swipeStartX.current = t.clientX
    swipeStartY.current = t.clientY
  }, [])

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (swipeStartX.current === null || swipeStartY.current === null) return

    const t  = e.changedTouches[0]
    const dx = t.clientX - swipeStartX.current
    const dy = t.clientY - swipeStartY.current

    swipeStartX.current = null
    swipeStartY.current = null

    // Vertical-dominant gesture = scroll intent, not a swipe
    if (Math.abs(dy) > Math.abs(dx)) return

    if (dx < -SWIPE_THRESHOLD) goNext()
    else if (dx > SWIPE_THRESHOLD) goPrev()
  }, [goNext, goPrev])

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

      {/* ── Step content — swipe-enabled ─────────────────────────────────────
        *
        * overflow-hidden clips the horizontal slide animation.
        * No px-4 here: absolute inset-0 children fill from the border edge of
        * their containing block; padding on this container is a no-op for them.
        * Horizontal padding lives inside each step's own scroll wrapper instead.
        *
        * touch-action:pan-y (inline): supplementary hint telling Chrome not to
        * rubber-band the page horizontally on a clear horizontal swipe.
        * Swipe detection now uses touch events (above) and no longer depends on
        * this hint to actually fire.
        ───────────────────────────────────────────────────────────────────── */}
      <div
        className="relative flex-1 min-h-0 overflow-hidden"
        style={{ touchAction: 'pan-y' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
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

      {/* ── Navigation buttons ───────────────────────────────────────────────
        *
        * Normal py-3 — no BottomNav compensation needed. LessonReader sets the
        * swiper height to end exactly at the BottomNav top, so these buttons
        * sit flush above it with standard 12px padding on each side.
        ───────────────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-border shrink-0">
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
 * absolute inset-0 is required for the horizontal slide animation.
 * AnimatePresence mode="wait" renders exit then enter sequentially, but
 * both are positioned relative to the same containing block so absolute
 * positioning is needed to prevent them stacking in the layout flow during
 * the exit phase.
 *
 * Horizontal padding (px-4) is on the inner wrapper div, not the outer
 * overflow-hidden container, because absolute inset-0 fills from the border
 * edge of the containing block — padding on the outer container is a no-op.
 *
 * shadow-card is not used: box-shadows are clipped by any ancestor with
 * overflow:hidden. The swipe container must have overflow:hidden to clip the
 * animation. A subtle border provides equivalent visual separation.
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
      <div className="px-4 pt-3 pb-6">
        <div
          className={cn(
            'bg-surface rounded-2xl',
            'border border-border/60',
            'px-5 pt-5 pb-8',
            'space-y-4',
          )}
        >
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

          <h3
            className={cn(
              'font-display font-semibold text-ink',
              'text-[1.6rem] leading-snug tracking-tight',
              'text-balance',
            )}
          >
            {heading}
          </h3>

          <div className="w-8 h-[3px] rounded-full bg-primary/30" />

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
 * Same absolute positioning approach as StepScreen.
 * min-h-full on the inner flex wrapper centres the card vertically on tall
 * screens; on short screens the overflow-y-auto handles scrolling naturally.
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
      <div className="px-4 py-6 flex flex-col justify-center min-h-full">
        <div
          className={cn(
            'bg-primary-light rounded-2xl',
            'border border-primary-mid',
            'px-5 py-8 space-y-6',
          )}
        >
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

          <p
            className={cn(
              'font-display font-semibold text-primary-text',
              'text-[1.5rem] leading-snug tracking-tight',
              'text-balance',
            )}
          >
            {takeaway}
          </p>

          <p className="font-body text-sm text-primary-text/65 leading-relaxed">
            Tap &ldquo;Done&rdquo; to return to the lesson library, or view
            the sources to explore the research behind this lesson.
          </p>
        </div>
      </div>
    </motion.div>
  )
}
