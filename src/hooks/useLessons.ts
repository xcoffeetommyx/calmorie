/**
 * src/hooks/useLessons.ts
 *
 * Hook that combines static lesson content (from lib/content/lessons.ts)
 * with dynamic reading progress (from lessonStore).
 *
 * Returns:
 *   lessons         — all LessonWithProgress[], merged with real progress
 *   progressMap     — raw Record<slug, LessonProgress> from lessonStore
 *   lessonOfTheDay  — first unread lesson, or day-rotation fallback
 *   isHydrated      — true once lessonStore has loaded from IndexedDB
 *   getProgress     — helper to get progress for a single slug
 *
 * Components that previously used `getAllLessons()` directly should switch
 * to this hook to get real completion state.
 *
 * The learn page and dashboard LessonOfTheDay both use this hook.
 */

import { useLessonStore } from '@/stores/lessonStore'
import {
  getAllLessonsWithProgress,
  getLessonOfTheDay,
} from '@/lib/content/lessons'
import type { LessonWithProgress, LessonProgress } from '@/types/lesson'

export interface UseLessonsReturn {
  /** All lessons merged with reading progress */
  lessons: LessonWithProgress[]
  /** Raw progress map — Record<slug, LessonProgress> */
  progressMap: Record<string, LessonProgress>
  /** Best lesson to feature on the dashboard today */
  lessonOfTheDay: LessonWithProgress
  /** True once the store has hydrated from IndexedDB */
  isHydrated: boolean
  /** Get progress for a single lesson slug */
  getProgress: (slug: string) => LessonProgress | null
}

export function useLessons(): UseLessonsReturn {
  const progressMap = useLessonStore((s) => s.progressMap)
  const isHydrated  = useLessonStore((s) => s.isHydrated)

  const lessons        = getAllLessonsWithProgress(progressMap)
  const rawLoTD        = getLessonOfTheDay(progressMap)

  // Enrich the lesson-of-the-day with its progress
  const lessonOfTheDay: LessonWithProgress = {
    ...rawLoTD,
    progress: progressMap[rawLoTD.slug] ?? null,
  }

  function getProgress(slug: string): LessonProgress | null {
    return progressMap[slug] ?? null
  }

  return {
    lessons,
    progressMap,
    lessonOfTheDay,
    isHydrated,
    getProgress,
  }
}
