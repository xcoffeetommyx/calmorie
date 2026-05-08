'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { slideUp, staggerContainer, staggerItem } from '@/lib/animations/variants'

/**
 * 404 Not Found
 *
 * Matches the app's visual style - warm background, display font headings,
 * gentle entrance animation.
 * Must be a Client Component because it uses Framer Motion.
 */
export default function NotFound() {
  return (
    <div
      className="min-h-screen-dynamic bg-background flex flex-col items-center justify-center p-6"
      role="main"
    >
      {/* Brand mark */}
      <motion.div
        className="absolute top-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <LeafIcon className="text-primary w-4 h-4" />
        <span className="font-display text-base font-semibold text-primary tracking-tight">
          Calmorie
        </span>
      </motion.div>

      {/* Content */}
      <motion.div
        className="flex flex-col items-center text-center max-w-xs"
        variants={staggerContainer}
        initial="initial"
        animate="enter"
      >
        {/* Illustration */}
        <motion.div
          variants={staggerItem}
          className="w-24 h-24 rounded-full bg-primary-light flex items-center justify-center mb-7"
          aria-hidden="true"
        >
          <span className="text-4xl select-none" role="img" aria-label="Sprouting plant">
            🌱
          </span>
        </motion.div>

        {/* Heading */}
        <motion.h1
          variants={staggerItem}
          className="font-display text-2xl font-semibold text-ink tracking-tight leading-tight mb-2 text-balance"
        >
          Page not found
        </motion.h1>

        {/* Body */}
        <motion.p
          variants={staggerItem}
          className="font-body text-sm text-ink-secondary leading-relaxed mb-8 text-balance"
        >
          This page seems to have wandered off. Let&apos;s guide you back to your
          wellness journey.
        </motion.p>

        {/* CTA */}
        <motion.div variants={staggerItem}>
          <Link
            href="/dashboard"
            className={[
              'inline-flex items-center justify-center gap-2',
              'h-12 px-6 rounded-full',
              'bg-primary text-ink-on-primary',
              'font-body text-sm font-semibold',
              'shadow-sm',
              'transition-all duration-fast ease-smooth',
              'hover:bg-primary-dark active:scale-[0.97]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2',
            ].join(' ')}
          >
            <HomeIcon className="w-4 h-4" aria-hidden="true" />
            Back to home
          </Link>
        </motion.div>

        {/* Error code */}
        <motion.p
          variants={staggerItem}
          className="mt-8 font-body text-xs text-ink-muted"
          aria-label="Error code 404"
        >
          Error 404
        </motion.p>
      </motion.div>
    </div>
  )
}

/* ── Inline SVG icons ────────────────────────────────────────────────────── */

function LeafIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  )
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  )
}
