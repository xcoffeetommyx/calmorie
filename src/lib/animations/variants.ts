/**
 * Calmorie - Framer Motion variants library
 * ─────────────────────────────────────────────────────────────────────────
 * Central source of all named Variants objects.
 *
 * Design intent:
 *  – Page/route transitions are slow, smooth, and barely move.
 *    Premium apps feel grounded - not slideshows.
 *  – Overshoot (snappy/spring) easing is reserved for small,
 *    focused microinteractions: score reveals, completion states,
 *    and individual card entrances that need delight.
 *  – Stagger is short (60–80 ms per child) so lists feel responsive.
 */
import type { Variants } from 'framer-motion'

// ── Easing curves ──────────────────────────────────────────────────────────

export const ease = {
  /**
   * smooth - natural ease-out deceleration.
   * Use for: page transitions, cards sliding in, overlays appearing.
   */
  smooth: [0.22, 1, 0.36, 1] as const,

  /**
   * snappy - overshoot spring.
   * Use ONLY for: score rings, completion badges, individual
   * microinteraction moments. NOT for navigation or large surfaces.
   */
  snappy: [0.34, 1.56, 0.64, 1] as const,

  /**
   * gentle - symmetrical ease-in-out.
   * Use for: exits, fades, and any motion that should feel quiet.
   */
  gentle: [0.4, 0, 0.2, 1] as const,
} as const

// ── Durations (in seconds, as Framer Motion expects) ──────────────────────

export const duration = {
  fast:   0.14,
  normal: 0.25,
  slow:   0.40,
  slower: 0.60,
} as const

// ══════════════════════════════════════════════════════════════════════════
// PAGE-LEVEL TRANSITIONS
// Very subtle vertical drift + opacity. The motion should barely be
// perceptible - just enough to indicate directionality without distraction.
// ══════════════════════════════════════════════════════════════════════════

export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 6,          // ← minimal: was 14. Premium apps feel grounded.
  },
  enter: {
    opacity: 1,
    y: 0,
    transition: {
      duration: duration.slow,
      ease: ease.smooth,   // ← smooth only; no overshoot on page enters
    },
  },
  exit: {
    opacity: 0,
    y: -4,         // ← barely moves upward on exit
    transition: {
      duration: duration.fast,
      ease: ease.gentle,
    },
  },
}

// ══════════════════════════════════════════════════════════════════════════
// GENERAL ENTER / EXIT
// ══════════════════════════════════════════════════════════════════════════

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  enter: {
    opacity: 1,
    transition: { duration: duration.normal, ease: ease.smooth },
  },
  exit: {
    opacity: 0,
    transition: { duration: duration.fast, ease: ease.gentle },
  },
}

/**
 * slideUp - content appearing from below.
 * Use for cards, bottom CTAs, and section reveals.
 * Vertical travel is kept short (16px) so it reads as depth, not drama.
 */
export const slideUp: Variants = {
  initial: { opacity: 0, y: 16 },
  enter: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.slow, ease: ease.smooth },
  },
  exit: {
    opacity: 0,
    y: 10,
    transition: { duration: duration.fast, ease: ease.gentle },
  },
}

/**
 * slideDown - content appearing from above.
 * Use for dropdowns, top bars, pull-to-refresh indicators.
 */
export const slideDown: Variants = {
  initial: { opacity: 0, y: -12 },
  enter: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.normal, ease: ease.smooth },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: duration.fast, ease: ease.gentle },
  },
}

/**
 * scaleIn - for modals and dialogs.
 * Smooth scale, no overshoot - keep large surfaces grounded.
 */
export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  enter: {
    opacity: 1,
    scale: 1,
    transition: { duration: duration.normal, ease: ease.smooth },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    transition: { duration: duration.fast, ease: ease.gentle },
  },
}

// ══════════════════════════════════════════════════════════════════════════
// MICROINTERACTION VARIANTS
// These intentionally use snappy/spring easing because they are focused,
// small, and meant to feel rewarding - not page-scale transitions.
// ══════════════════════════════════════════════════════════════════════════

/**
 * scaleSpring - score ring, completion badge, success state.
 * Snappy spring overshoot is appropriate here because the animation
 * is small, fast, and rewarding. ONLY use on small/focused elements.
 */
export const scaleSpring: Variants = {
  initial: { opacity: 0, scale: 0.72 },
  enter: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 22 },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: duration.fast, ease: ease.gentle },
  },
}

/**
 * popIn - small icon, badge, or notification dot appearing.
 * Short-lived spring with no exit animation needed.
 */
export const popIn: Variants = {
  initial: { opacity: 0, scale: 0.6 },
  enter: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 400, damping: 20, duration: 0.25 },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: { duration: duration.fast },
  },
}

// ══════════════════════════════════════════════════════════════════════════
// STAGGER
// ══════════════════════════════════════════════════════════════════════════

/**
 * staggerContainer - parent wrapper for staggered child animations.
 * Use `staggerItem` as the child variant.
 */
export const staggerContainer: Variants = {
  initial: {},
  enter: {
    transition: {
      staggerChildren: 0.065,
      delayChildren: 0.04,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.04,
      staggerDirection: -1,
    },
  },
}

/**
 * staggerItem - individual item within a stagger list.
 * Pairs with staggerContainer.
 */
export const staggerItem: Variants = {
  initial: { opacity: 0, y: 14 },
  enter: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.slow, ease: ease.smooth },
  },
  exit: {
    opacity: 0,
    y: 8,
    transition: { duration: duration.fast, ease: ease.gentle },
  },
}

// ══════════════════════════════════════════════════════════════════════════
// OVERLAY / SHEET
// ══════════════════════════════════════════════════════════════════════════

/**
 * overlayVariants - backdrop/scrim fade behind modals and bottom sheets.
 */
export const overlayVariants: Variants = {
  initial: { opacity: 0 },
  enter:   { opacity: 1, transition: { duration: duration.normal, ease: ease.gentle } },
  exit:    { opacity: 0, transition: { duration: duration.normal, ease: ease.gentle } },
}

/**
 * bottomSheetVariants - slides up from bottom of screen.
 * Uses a gentle spring (low stiffness, high damping) so it feels
 * weighty and physical - not bouncy.
 */
export const bottomSheetVariants: Variants = {
  initial: { y: '100%' },
  enter: {
    y: 0,
    transition: { type: 'spring', stiffness: 280, damping: 34 },
  },
  exit: {
    y: '100%',
    transition: { duration: duration.normal, ease: ease.gentle },
  },
}

// ══════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ══════════════════════════════════════════════════════════════════════════

/**
 * toastVariants - toast notification sliding down from top.
 */
export const toastVariants: Variants = {
  initial: { opacity: 0, y: -12, scale: 0.96 },
  enter: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: duration.normal, ease: ease.smooth },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.96,
    transition: { duration: duration.fast, ease: ease.gentle },
  },
}

/**
 * alertSlideIn - habit alert banner appearing at top of dashboard.
 * Gentle x-drift so it draws attention without feeling aggressive.
 */
export const alertSlideIn: Variants = {
  initial: { opacity: 0, y: -8, scale: 0.98 },
  enter: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: duration.slow, ease: ease.smooth },
  },
  exit: {
    opacity: 0,
    y: -4,
    scale: 0.98,
    transition: { duration: duration.fast, ease: ease.gentle },
  },
}

// ══════════════════════════════════════════════════════════════════════════
// CHECK-IN WIZARD
// ══════════════════════════════════════════════════════════════════════════

/**
 * checkInStepVariants - directional slide for check-in wizard steps.
 * Pass `custom={direction}` on the motion element:
 *   direction >= 0  = moving forward (next question)
 *   direction <  0  = moving backward (previous question)
 */
export const checkInStepVariants: Variants = {
  initial: (direction: number) => ({
    x: direction >= 0 ? '50%' : '-50%',
    opacity: 0,
  }),
  enter: {
    x: 0,
    opacity: 1,
    transition: { duration: duration.slow, ease: ease.smooth },
  },
  exit: (direction: number) => ({
    x: direction >= 0 ? '-35%' : '35%',
    opacity: 0,
    transition: { duration: duration.normal, ease: ease.gentle },
  }),
}

// ══════════════════════════════════════════════════════════════════════════
// SVG DRAWING
// ══════════════════════════════════════════════════════════════════════════

/**
 * ringDrawVariants - animates an SVG circle path being drawn.
 *
 * Usage on the <circle> or <path> element:
 *   <motion.circle
 *     variants={ringDrawVariants}
 *     initial="initial"
 *     animate="enter"
 *     custom={targetPathLength}   // 0–1
 *   />
 */
export const ringDrawVariants = {
  initial: { pathLength: 0, opacity: 0 },
  enter: (targetLength: number) => ({
    pathLength: targetLength,
    opacity: 1,
    transition: {
      pathLength: {
        duration: duration.slower,
        ease: ease.smooth,
      },
      opacity: { duration: duration.fast },
    },
  }),
}
