'use client'

import { type ReactNode, useEffect } from 'react'
import { MotionConfig } from 'framer-motion'
import {
  openDB,
  loadUserProfile,
  loadFoodEntries,
  loadCheckIns,
  loadLessonProgress,
} from '@/lib/db'
import { useUserStore } from '@/stores/userStore'
import { useLogStore } from '@/stores/logStore'
import { useCheckinStore } from '@/stores/checkinStore'
import { useLessonStore } from '@/stores/lessonStore'

interface AppProvidersProps {
  children: ReactNode
}

/**
 * AppProviders - single composition root for all React context providers.
 *
 * On client mount:
 *   1. Wraps the app in Framer Motion's MotionConfig with reducedMotion="user"
 *      so all animations respect the OS-level reduced-motion preference.
 *   2. Opens the IndexedDB connection (db.open() + localStorage migration)
 *   3. Reads all persisted data from IndexedDB in parallel
 *   4. Hydrates each Zustand store with its persisted state
 *
 * If IndexedDB is unavailable (private browsing, storage quota exceeded),
 * openDB() catches the error silently. Stores fall back to in-memory state
 * and set isHydrated: true via the error-path setHydrated() calls.
 */
export function AppProviders({ children }: AppProvidersProps) {
  useEffect(() => {
    async function hydrateAll() {
      await openDB()

      const [profile, entries, checkins, lessonProgress] = await Promise.all([
        loadUserProfile(),
        loadFoodEntries(),
        loadCheckIns(),
        loadLessonProgress(),
      ])

      useUserStore.getState().hydrate(profile)
      useLogStore.getState().hydrate(entries)
      // CheckInRow (from DB) and CheckInRecordFull (store) are structurally
      // identical - both extend CheckInRecord with habitWarnings: HabitWarning[]
      useCheckinStore.getState().hydrate(checkins)
      useLessonStore.getState().hydrate(lessonProgress)
    }

    hydrateAll().catch((err) => {
      console.warn('[AppProviders] Hydration error:', err)
      useUserStore.getState().setHydrated()
      useLogStore.getState().setHydrated()
      useCheckinStore.getState().setHydrated()
      useLessonStore.getState().setHydrated()
    })
  }, [])

  return (
    <MotionConfig reducedMotion="user">
      {children}
    </MotionConfig>
  )
}
