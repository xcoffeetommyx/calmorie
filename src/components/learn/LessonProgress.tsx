'use client'

/**
 * LessonProgress
 *
 * Step progress indicator for the lesson reader.
 * Renders as a row of animated dots/pills - the current step
 * expands into a wider pill, completed steps show as filled dots,
 * upcoming steps as muted dots.
 *
 * Used inside LessonSwiper to anchor the reading position.
 *
 * Props:
 *   currentStep   - 0-based index of the active step
 *   totalSteps    - total number of steps (not counting takeaway)
 *   showTakeaway  - whether to include a final indicator for the takeaway
 *   className
 */

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

interface LessonProgressProps {
  currentStep: number
  totalSteps: number
  /** Include a final dot for the takeaway/end screen */
  showTakeaway?: boolean
  className?: string
}

export function LessonProgress({
  currentStep,
  totalSteps,
  showTakeaway = true,
  className,
}: LessonProgressProps) {
  const total = totalSteps + (showTakeaway ? 1 : 0)

  return (
    <div
      className={cn('flex items-center gap-1.5', className)}
      role="progressbar"
      aria-valuenow={currentStep + 1}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-label={`Step ${currentStep + 1} of ${total}`}
    >
      {Array.from({ length: total }).map((_, i) => {
        const isActive    = i === currentStep
        const isCompleted = i < currentStep

        return (
          <motion.div
            key={i}
            aria-hidden="true"
            animate={{
              width:           isActive ? 20 : 6,
              backgroundColor: isActive
                ? 'var(--color-primary)'
                : isCompleted
                  ? 'var(--color-primary)'
                  : 'var(--color-border)',
              opacity: isCompleted ? 0.45 : 1,
            }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            style={{ height: 6, borderRadius: 999 }}
          />
        )
      })}
    </div>
  )
}
