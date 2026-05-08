/**
 * src/lib/content/lessons.ts
 *
 * Content loader and helper utilities for lesson data.
 *
 * This is the single public API for reading lesson content in components,
 * hooks, and pages. Components should never import lesson JSON directly -
 * they should use these functions instead.
 *
 * Design constraints:
 *   – Framework-agnostic: no React, no Next.js, no browser APIs
 *   – No IndexedDB or stores: these functions are pure data access
 *   – Lesson progress (completed, lastStepIndex) is managed separately
 *     by lessonStore + Dexie - not here
 *   – All functions are synchronous (data is static JSON bundled at build)
 */

import type { Lesson, LessonCategory, LessonWithProgress, LessonProgress } from '@/types/lesson'
import { LESSONS, LESSON_MAP } from '@/data/lessons/index'

// ── Basic accessors ────────────────────────────────────────────────────────

/**
 * Returns all lessons in their canonical library order.
 * (Defined by the LESSONS array order in data/lessons/index.ts)
 */
export function getAllLessons(): Lesson[] {
  return LESSONS
}

/**
 * Returns a single lesson by its slug, or null if not found.
 * Uses a pre-built Map for O(1) lookup.
 *
 * @example
 *   const lesson = getLessonBySlug('calories-101')
 *   if (!lesson) return notFound()
 */
export function getLessonBySlug(slug: string): Lesson | null {
  return LESSON_MAP.get(slug) ?? null
}

/**
 * Returns all lessons matching a given category.
 *
 * @example
 *   const sleepLessons = getLessonsByCategory('sleep')
 */
export function getLessonsByCategory(category: LessonCategory): Lesson[] {
  return LESSONS.filter((lesson) => lesson.category === category)
}

/**
 * Returns all unique categories that have at least one lesson.
 * Preserves the order of first appearance in the LESSONS array.
 */
export function getAvailableCategories(): LessonCategory[] {
  const seen = new Set<LessonCategory>()
  const result: LessonCategory[] = []
  for (const lesson of LESSONS) {
    if (!seen.has(lesson.category)) {
      seen.add(lesson.category)
      result.push(lesson.category)
    }
  }
  return result
}

/**
 * Returns the total number of lessons available.
 */
export function getLessonCount(): number {
  return LESSONS.length
}

// ── Progress-aware accessors ───────────────────────────────────────────────

/**
 * Merges lesson data with progress records from the store.
 *
 * progressMap: a Record<slug, LessonProgress> from lessonStore.
 * Returns every lesson enriched with its progress (or null if not started).
 *
 * Phase 6: call this in useLessons() hook with lessonStore progress data.
 *
 * @example
 *   const progress = useLessonStore(s => s.progressMap)
 *   const enriched = getAllLessonsWithProgress(progress)
 */
export function getAllLessonsWithProgress(
  progressMap: Record<string, LessonProgress>
): LessonWithProgress[] {
  return LESSONS.map((lesson) => ({
    ...lesson,
    progress: progressMap[lesson.slug] ?? null,
  }))
}

/**
 * Returns lessons that have not yet been completed.
 * Useful for surfacing new or in-progress content.
 */
export function getIncompleteLessons(
  progressMap: Record<string, LessonProgress>
): LessonWithProgress[] {
  return getAllLessonsWithProgress(progressMap).filter(
    (lesson) => !lesson.progress?.completed
  )
}

// ── Lesson of the day ──────────────────────────────────────────────────────

/**
 * Returns the lesson of the day using a deterministic day-based rotation.
 *
 * Strategy:
 *   1. Prefer the first incomplete lesson (lowest index in LESSONS order)
 *   2. If all lessons are complete, fall back to day-based rotation using
 *      the ISO date string as a seed so the same lesson shows all day
 *
 * This function is pure - it produces the same result for the same inputs
 * and the same date. It does not require a store or hook.
 *
 * @param progressMap - current lesson progress from lessonStore (can be {})
 * @param dateISO     - 'YYYY-MM-DD' string for today (default: today)
 *
 * @example
 *   const lesson = getLessonOfTheDay({})
 *   const lesson = getLessonOfTheDay(progressMap, '2024-03-14')
 */
export function getLessonOfTheDay(
  progressMap: Record<string, LessonProgress> = {},
  dateISO?: string
): Lesson {
  // Step 1: find first lesson not yet completed
  const firstIncomplete = LESSONS.find(
    (lesson) => !progressMap[lesson.slug]?.completed
  )
  if (firstIncomplete) return firstIncomplete

  // Step 2: all complete - rotate by day
  const date = dateISO ?? getTodayISO()
  const dayIndex = getDayIndex(date)
  return LESSONS[dayIndex % LESSONS.length]
}

// ── Internal helpers ───────────────────────────────────────────────────────

/**
 * Returns today's date as 'YYYY-MM-DD' in local time.
 * Duplicated here (vs lib/utils/date.ts) to keep this module self-contained
 * and framework-independent - this file may eventually be used outside Next.js.
 */
function getTodayISO(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * Converts a 'YYYY-MM-DD' date string to a sequential integer day number
 * (days since 2024-01-01) for stable, deterministic lesson rotation.
 *
 * This approach means the lesson-of-the-day changes on a predictable
 * daily cycle regardless of how many lessons exist.
 */
function getDayIndex(dateISO: string): number {
  const EPOCH = new Date('2024-01-01T00:00:00').getTime()
  const target = new Date(`${dateISO}T00:00:00`).getTime()
  return Math.floor((target - EPOCH) / (1000 * 60 * 60 * 24))
}
