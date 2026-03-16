'use client'

import { type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { pageVariants } from '@/lib/animations/variants'

interface PageTransitionProps {
  children: ReactNode
}

/**
 * PageTransition
 *
 * Wraps each (main) route in an AnimatePresence motion div keyed by pathname.
 * Produces a subtle opacity + y-drift cross-fade when navigating between routes.
 *
 * mode="wait"     — exit finishes before enter begins; prevents overlap flicker
 * initial={false} — suppresses the enter animation on first page load
 *
 * The wrapper is purely dimensional — it does not clip, scroll, or add background.
 * Pages manage their own scrolling and safe-area padding.
 */
export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        variants={pageVariants}
        initial="initial"
        animate="enter"
        exit="exit"
        className="flex flex-1 flex-col"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
