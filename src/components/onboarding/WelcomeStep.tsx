'use client'

/**
 * WelcomeStep
 *
 * The opening screen of the onboarding flow (before any form steps).
 * Shown once on first launch — feels like opening a real health app,
 * not starting a form wizard.
 *
 * Layout: full-screen, vertically centred, staggered entrance animation.
 * Uses the existing stagger animation system for sequential item reveals.
 */

import { motion } from 'framer-motion'
import { Leaf } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { staggerContainer, staggerItem } from '@/lib/animations/variants'

interface WelcomeStepProps {
  onStart: () => void
}

export function WelcomeStep({ onStart }: WelcomeStepProps) {
  return (
    <motion.div
      key="welcome-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } }}
      exit={{ opacity: 0, transition: { duration: 0.18, ease: [0.4, 0, 0.2, 1] } }}
      className="flex flex-col min-h-screen-dynamic bg-background"
    >
      {/* Safe-area top */}
      <div className="pt-[env(safe-area-inset-top,0px)]" aria-hidden="true" />

      {/* Main content — grows to fill screen, centres children */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="enter"
        className="flex-1 flex flex-col items-center justify-center px-7 py-10"
      >
        {/* App icon */}
        <motion.div variants={staggerItem} className="mb-7">
          <div
            className={cn(
              'w-[76px] h-[76px]',
              'rounded-[22px] bg-primary',
              'flex items-center justify-center',
              'shadow-[0_8px_24px_-4px_rgba(0,0,0,0.18)]',
            )}
          >
            <Leaf className="w-9 h-9 text-white" strokeWidth={2.25} aria-hidden="true" />
          </div>
        </motion.div>

        {/* App name */}
        <motion.p
          variants={staggerItem}
          className="font-display text-lg font-semibold text-primary tracking-tight mb-5"
        >
          Calmorie
        </motion.p>

        {/* Headline */}
        <motion.h1
          variants={staggerItem}
          className={cn(
            'font-display font-semibold text-ink tracking-tight text-center text-balance',
            'text-[2.25rem] leading-[1.15]',
            'max-w-[260px]',
            'mb-4',
          )}
        >
          Your calorie compass.
        </motion.h1>

        {/* Body */}
        <motion.p
          variants={staggerItem}
          className={cn(
            'font-body text-[1.0625rem] text-ink-secondary',
            'leading-[1.8] text-center',
            'max-w-[300px]',
            'mb-12',
          )}
        >
          Track what you eat, understand your needs, and build habits that actually stick.
        </motion.p>

        {/* Primary CTA */}
        <motion.div variants={staggerItem} className="w-full max-w-[320px]">
          <button
            type="button"
            onClick={onStart}
            className={cn(
              'w-full h-14 rounded-full',
              'bg-primary text-ink-on-primary',
              'font-body text-base font-semibold',
              'shadow-md hover:bg-primary-dark active:scale-[0.97]',
              'transition-all duration-fast ease-smooth',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2',
            )}
          >
            Get Started
          </button>
        </motion.div>
      </motion.div>

      {/* Safe-area bottom */}
      <div className="h-[env(safe-area-inset-bottom,0px)]" aria-hidden="true" />
    </motion.div>
  )
}
