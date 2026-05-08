/**
 * src/stores/lessonStore.ts
 *
 * Zustand store for lesson reading progress.
 *
 * Persistence: IndexedDB via db.lessonProgress (Dexie).
 * Hydration is explicit - AppProviders calls hydrate() after openDB()
 * loads data from IndexedDB. There is no Zustand persist middleware here.
 *
 * "Started" semantics:
 *   A lesson is started when progressMap[slug] exists.
 *   There is no separate `started: boolean` field on LessonProgress.
 *   The existence of the record is the canonical started signal.
 *
 *   started     = progressMap[slug] !== undefined
 *   in-progress = progressMap[slug] exists && !completed
 *   completed   = progressMap[slug]?.completed === true
 *
 * State:
 *   progressMap   - Record<slug, LessonProgress>: one entry per started lesson
 *   isHydrated    - true once AppProviders has loaded data from IndexedDB
 *
 * Actions:
 *   hydrate(records)       - bulk load from DB on app boot
 *   markStarted(slug)      - creates the progress record on first open
 *   markProgress(slug, i)  - advances lastStepIndex when user moves forward
 *   markComplete(slug)     - sets completed: true when takeaway is reached
 *   clearAll()             - resets all progress (dev / testing use)
 *   setHydrated()          - marks store as ready (used on error fallback)
 *
 * Write strategy:
 *   All mutating actions update Zustand state synchronously for instant
 *   UI reactivity, then write to IndexedDB asynchronously (fire-and-forget).
 *   Write failures are logged as warnings but do not affect the UI.
 */

import { create } from 'zustand'
import { db, isDBOpen } from '@/lib/db'
import { nowISO } from '@/lib/utils/date'
import type { LessonProgress } from '@/types/lesson'

// ── Store shape ────────────────────────────────────────────────────────────

interface LessonState {
  /**
   * One entry per lesson that has been opened at least once.
   * The presence of an entry means the lesson has been started.
   * See LessonProgress JSDoc in types/lesson.ts for full semantics.
   */
  progressMap: Record<string, LessonProgress>
  isHydrated:  boolean

  hydrate:      (records: LessonProgress[]) => void
  markStarted:  (slug: string) => void
  markProgress: (slug: string, stepIndex: number) => void
  markComplete: (slug: string) => void
  clearAll:     () => void
  setHydrated:  () => void
}

// ── Store ──────────────────────────────────────────────────────────────────

export const useLessonStore = create<LessonState>()((set, get) => ({
  progressMap: {},
  isHydrated:  false,

  hydrate: (records) => {
    const map: Record<string, LessonProgress> = {}
    for (const r of records) {
      map[r.slug] = r
    }
    set({ progressMap: map, isHydrated: true })
  },

  markStarted: (slug) => {
    // No-op if a record already exists (lesson already started or completed)
    if (get().progressMap[slug]) return

    const progress: LessonProgress = {
      slug,
      completed:     false,
      lastStepIndex: 0,
    }

    set((state) => ({
      progressMap: { ...state.progressMap, [slug]: progress },
    }))

    if (isDBOpen()) {
      db.lessonProgress.put(progress).catch((err) =>
        console.warn('[lessonStore] markStarted write failed:', err)
      )
    }
  },

  markProgress: (slug, stepIndex) => {
    const existing = get().progressMap[slug]
    // Never regress lastStepIndex (user navigating back) or overwrite completion
    if (existing?.completed) return
    if (existing && existing.lastStepIndex >= stepIndex) return

    const progress: LessonProgress = {
      slug,
      completed:     false,
      lastStepIndex: stepIndex,
      completedAt:   existing?.completedAt,
    }

    set((state) => ({
      progressMap: { ...state.progressMap, [slug]: progress },
    }))

    if (isDBOpen()) {
      db.lessonProgress.put(progress).catch((err) =>
        console.warn('[lessonStore] markProgress write failed:', err)
      )
    }
  },

  markComplete: (slug) => {
    const existing = get().progressMap[slug]
    // No-op if already completed
    if (existing?.completed) return

    const progress: LessonProgress = {
      slug,
      completed:     true,
      lastStepIndex: existing?.lastStepIndex ?? 0,
      completedAt:   nowISO(),
    }

    set((state) => ({
      progressMap: { ...state.progressMap, [slug]: progress },
    }))

    if (isDBOpen()) {
      db.lessonProgress.put(progress).catch((err) =>
        console.warn('[lessonStore] markComplete write failed:', err)
      )
    }
  },

  clearAll: () => {
    set({ progressMap: {} })
    if (isDBOpen()) {
      db.lessonProgress.clear().catch((err) =>
        console.warn('[lessonStore] clearAll failed:', err)
      )
    }
  },

  setHydrated: () => set({ isHydrated: true }),
}))

// ── Selectors ──────────────────────────────────────────────────────────────

/** Returns the progress record for a single lesson, or null if not started */
export const selectLessonProgress =
  (slug: string) =>
  (state: LessonState): LessonProgress | null =>
    state.progressMap[slug] ?? null

/** Returns true if a lesson record exists (started or completed) */
export const selectIsStarted =
  (slug: string) =>
  (state: LessonState): boolean =>
    slug in state.progressMap

/** Returns true if a lesson has been fully completed */
export const selectIsCompleted =
  (slug: string) =>
  (state: LessonState): boolean =>
    state.progressMap[slug]?.completed === true

/**
 * Returns the step index to resume from.
 * Returns 0 if the lesson has not been started.
 * Returns lastStepIndex if in-progress.
 * Returns 0 if completed (start from beginning for a re-read).
 */
export const selectResumeStep =
  (slug: string) =>
  (state: LessonState): number => {
    const p = state.progressMap[slug]
    if (!p || p.completed) return 0
    return p.lastStepIndex
  }
