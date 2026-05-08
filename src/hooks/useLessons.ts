/**
 * src/hooks/useLessons.ts
 *
 * Hook combining static lesson content with dynamic reading progress.
 *
 * All derived arrays and objects are wrapped in useMemo so their
 * references are stable between renders when progressMap hasn't changed.
 * Previously these were computed inline (no memo), producing new
 * allocations on every render - causing unnecessary child re-renders
 * and potential render cascades.
 */

import { useMemo, useCallback } from 'react'
import { useLessonStore } from '@/stores/lessonStore'
import {
  getAllLessonsWithProgress,
  getLessonOfTheDay,
} from '@/lib/content/lessons'
import type { LessonWithProgress, LessonProgress } from '@/types/lesson'

export interface UseLessonsReturn {
  lessons:        LessonWithProgress[]
  progressMap:    Record<string, LessonProgress>
  lessonOfTheDay: LessonWithProgress
  isHydrated:     boolean
  getProgress:    (slug: string) => LessonProgress | null
}

export function useLessons(): UseLessonsReturn {
  const progressMap = useLessonStore((s) => s.progressMap)
  const isHydrated  = useLessonStore((s) => s.isHydrated)

  // Memoized - only recomputes when progressMap reference changes
  // (i.e. when a lesson is started, progressed, or completed)
  const lessons = useMemo(
    () => getAllLessonsWithProgress(progressMap),
    [progressMap]
  )

  // Memoized - stable object reference between renders
  const lessonOfTheDay = useMemo(() => {
    const raw = getLessonOfTheDay(progressMap)
    return {
      ...raw,
      progress: progressMap[raw.slug] ?? null,
    } as LessonWithProgress
  }, [progressMap])

  // Stable function reference between renders
  const getProgress = useCallback(
    (slug: string): LessonProgress | null => progressMap[slug] ?? null,
    [progressMap]
  )

  return {
    lessons,
    progressMap,
    lessonOfTheDay,
    isHydrated,
    getProgress,
  }
}
