'use client'

import { motion } from 'framer-motion'
import { BookOpen, CheckCircle2, Leaf, Lock, PlusCircle, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { staggerContainer, staggerItem } from '@/lib/animations/variants'

interface WelcomeStepProps {
  onStart: () => void
}

const CORE_LOOPS = [
  {
    icon: <PlusCircle className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />,
    title: 'Log food simply',
    text: 'Track meals without turning every bite into homework.',
  },
  {
    icon: <CheckCircle2 className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />,
    title: 'Check in daily',
    text: 'See how sleep, stress, and routine shape your day.',
  },
  {
    icon: <BookOpen className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />,
    title: 'Learn as you go',
    text: 'Build confidence with short, evidence-based lessons.',
  },
] as const

export function WelcomeStep({ onStart }: WelcomeStepProps) {
  return (
    <motion.div
      key="welcome-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } }}
      exit={{ opacity: 0, transition: { duration: 0.18, ease: [0.4, 0, 0.2, 1] } }}
      className="flex min-h-screen-dynamic flex-col bg-background"
    >
      <div className="pt-[env(safe-area-inset-top,0px)]" aria-hidden="true" />

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="enter"
        className="flex flex-1 flex-col px-6 py-7"
      >
        <motion.div variants={staggerItem} className="mb-7 flex items-center gap-2">
          <div
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-sm',
            )}
          >
            <Leaf className="h-6 w-6 text-white" strokeWidth={2.25} aria-hidden="true" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold tracking-tight text-primary">
              Calmorie
            </p>
            <p className="font-body text-xs font-medium text-ink-muted">
              Your calmer calorie compass
            </p>
          </div>
        </motion.div>

        <div className="flex flex-1 flex-col justify-center">
          <motion.div variants={staggerItem} className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-accent-light px-3 py-1.5 text-accent">
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
            <span className="font-body text-[11px] font-semibold uppercase tracking-wider">
              Built for real life
            </span>
          </motion.div>

          <motion.h1
            variants={staggerItem}
            className={cn(
              'max-w-[19rem] font-display text-[2.4rem] font-semibold leading-[1.08]',
              'tracking-tight text-ink text-balance',
            )}
          >
            Understand food without losing your mind over it.
          </motion.h1>

          <motion.p
            variants={staggerItem}
            className="mt-4 max-w-[21rem] font-body text-base leading-[1.75] text-ink-secondary"
          >
            Calmorie helps you track, check in, and learn what your body is doing, one small decision at a time.
          </motion.p>

          <motion.div variants={staggerItem} className="mt-7 space-y-2.5">
            {CORE_LOOPS.map((item) => (
              <div key={item.title} className="flex items-start gap-3 rounded-xl border border-border bg-surface px-3.5 py-3 shadow-xs">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary">
                  {item.icon}
                </span>
                <div>
                  <p className="font-body text-sm font-semibold text-ink">{item.title}</p>
                  <p className="mt-0.5 font-body text-xs leading-relaxed text-ink-muted">{item.text}</p>
                </div>
              </div>
            ))}
          </motion.div>

          <motion.div variants={staggerItem} className="mt-5 flex items-start gap-2 rounded-xl bg-surface-raised px-3.5 py-3">
            <Lock className="mt-px h-4 w-4 shrink-0 text-ink-muted" strokeWidth={2} aria-hidden="true" />
            <p className="font-body text-xs leading-relaxed text-ink-muted">
              Your data stays on this device. Setup takes about one minute, and you can adjust your target later.
            </p>
          </motion.div>
        </div>

        <motion.div variants={staggerItem} className="pt-6">
          <button
            type="button"
            onClick={onStart}
            className={cn(
              'h-14 w-full rounded-lg',
              'bg-primary text-ink-on-primary',
              'font-body text-base font-semibold',
              'shadow-md transition-[background-color,box-shadow,transform] duration-fast ease-out',
              'hover:bg-primary-dark active:scale-[0.97]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2',
            )}
          >
            Set up my plan
          </button>
        </motion.div>
      </motion.div>

      <div className="h-[env(safe-area-inset-bottom,0px)]" aria-hidden="true" />
    </motion.div>
  )
}
