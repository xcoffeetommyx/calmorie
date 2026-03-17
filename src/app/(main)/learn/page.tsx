'use client'

/**
 * Learn page — /learn
 *
 * Lesson library. Loads all lessons and real reading progress from
 * useLessons(). Shows completion state on each card once hydrated.
 */

import { motion } from 'framer-motion'
import { BookMarked } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { TopBar } from '@/components/layout/TopBar'
import { LessonCard } from '@/components/learn/LessonCard'
import { staggerContainer, staggerItem } from '@/lib/animations/variants'
import { useLessons } from '@/hooks/useLessons'

// ── Skeleton ───────────────────────────────────────────────────────────────

function LearnSkeleton() {
  return (
    <div className="page-container py-5 space-y-5">
      <div className="space-y-1.5">
        <div className="h-6 w-48 bg-surface-raised rounded-full animate-pulse-soft" />
        <div className="h-3.5 w-64 bg-surface-raised rounded-full animate-pulse-soft" />
      </div>
      <div className="h-14 bg-surface-raised rounded-xl animate-pulse-soft" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div
            key={i}
            className="h-32 bg-surface-raised rounded-xl animate-pulse-soft"
            style={{ animationDelay: `${i * 50}ms` }}
          />
        ))}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function LearnPage() {
  const { lessons, isHydrated } = useLessons()

  return (
    <div className="flex flex-col min-h-full bg-background">
      <TopBar title="Learn" />

      {!isHydrated ? (
        <LearnSkeleton />
      ) : (
        <motion.div
          className="page-container py-5 space-y-5"
          variants={staggerContainer}
          initial="initial"
          animate="enter"
        >
          {/* ── Page header ─────────────────────────────────── */}
          <motion.div variants={staggerItem} className="space-y-1">
            <h2 className="font-display text-xl font-semibold text-ink tracking-tight">
              Learn how your body works
            </h2>
            <p className="font-body text-sm text-ink-secondary leading-relaxed">
              Short, evidence-based reads on calories, metabolism, sleep, and habits.
            </p>
          </motion.div>

          {/* ── Source trust banner ──────────────────────────── */}
          <motion.div
            variants={staggerItem}
            className={cn(
              'flex items-start gap-3 px-4 py-3.5 rounded-xl',
              'bg-primary-light border border-primary-mid',
            )}
            role="note"
            aria-label="About lesson sources"
          >
            <BookMarked
              className="w-4 h-4 text-primary shrink-0 mt-px"
              strokeWidth={2}
              aria-hidden="true"
            />
            <p className="font-body text-xs text-primary-text leading-relaxed">
              Each lesson is written from published research. Tap{' '}
              <strong>Sources</strong> while reading to see exactly where the information comes from.
            </p>
          </motion.div>

          {/* ── Lesson grid ─────────────────────────────────── */}
          <motion.div
            variants={staggerContainer}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2"
          >
            {lessons.map((lesson) => (
              <motion.div key={lesson.slug} variants={staggerItem}>
                <LessonCard
                  lesson={lesson}
                  progress={lesson.progress}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* ── Footer note ─────────────────────────────────── */}
          <motion.p
            variants={staggerItem}
            className="font-body text-xs text-ink-muted text-center pb-2"
          >
            {lessons.length} lessons · More coming soon
          </motion.p>

        </motion.div>
      )}
    </div>
  )
}
