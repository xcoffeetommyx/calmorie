'use client'

/**
 * LessonReader
 *
 * Full-page lesson layout rendered at /learn/[slug].
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, BookMarked, CheckCircle2, RotateCcw, PlayCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { TopBar } from '@/components/layout/TopBar'
import { LessonSwiper } from './LessonSwiper'
import {
  type Lesson,
  LESSON_CATEGORY_LABELS,
  LESSON_CATEGORY_COLORS,
} from '@/types/lesson'
import { useLessonStore, selectLessonProgress } from '@/stores/lessonStore'

interface LessonReaderProps {
  lesson: Lesson
}

export function LessonReader({ lesson }: LessonReaderProps) {
  const router = useRouter()
  const progress = useLessonStore(selectLessonProgress(lesson.slug))
  const [started, setStarted] = useState(false)

  const categoryLabel = LESSON_CATEGORY_LABELS[lesson.category]
  const categoryColors = LESSON_CATEGORY_COLORS[lesson.category]

  const isInProgress = !!progress && !progress.completed
  const isCompleted = progress?.completed === true
  const resumeStep = isInProgress ? progress.lastStepIndex : 0
  const totalSteps = lesson.steps.length

  function handleDone() {
    router.back()
  }

  return (
    <div className="flex flex-col min-h-screen-dynamic bg-background">
      <TopBar title={started ? lesson.title : 'Lesson'} showBack />

      <AnimatePresence mode="wait" initial={false}>
        {!started ? (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3 }}
            className="page-container py-6 flex flex-col gap-6"
          >
            <h1 className="text-2xl font-semibold">{lesson.title}</h1>

            <button
              onClick={() => setStarted(true)}
              className="bg-primary text-white rounded-xl py-3"
            >
              Start Lesson
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="swiper"
            initial={{ opacity: 0, x: '20%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col overflow-hidden"
            style={{
              height: 'calc(100dvh - var(--top-bar-height) - var(--bottom-nav-height))',
            }}
          >
            <LessonSwiper lesson={lesson} onClose={handleDone} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
