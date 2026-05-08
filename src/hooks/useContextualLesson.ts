/**
 * src/hooks/useContextualLesson.ts
 *
 * Returns the most relevant lesson to surface on the dashboard.
 *
 * Strategy:
 *   1. If the user has checked in today, derive the weakest scoring factor
 *      from their answers and return the lesson mapped to that factor.
 *   2. Otherwise (no check-in, or no lesson found for the factor),
 *      fall back to getLessonOfTheDay() - which prioritises incomplete lessons.
 *
 * This is a pure computation wrapped in useMemo. Both inputs (todayRecord
 * and progressMap) are stable store references that only change when
 * actual data changes, so no render loop risk.
 */

import { useMemo } from 'react'
import { useCheckinStore, selectTodayRecord } from '@/stores/checkinStore'
import { useLessons } from '@/hooks/useLessons'
import { calculateScore, getLessonSlugForFactor } from '@/lib/engine/scoreEngine'
import { getLessonBySlug, getLessonOfTheDay } from '@/lib/content/lessons'
import type { Lesson } from '@/types/lesson'

export function useContextualLesson(): Lesson {
  const todayRecord = useCheckinStore(selectTodayRecord)
  const { progressMap } = useLessons()

  return useMemo(() => {
    if (todayRecord) {
      const { weakestFactor } = calculateScore(todayRecord.answers)
      const slug = getLessonSlugForFactor(weakestFactor)
      if (slug) {
        const lesson = getLessonBySlug(slug)
        if (lesson) return lesson
      }
    }
    return getLessonOfTheDay(progressMap)
  }, [todayRecord, progressMap])
}
