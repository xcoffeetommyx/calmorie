/**
 * src/lib/db/index.ts
 *
 * Creates and exports the single Dexie database instance used by all stores.
 *
 * Usage:
 *   import { db } from '@/lib/db'
 *   await db.foodEntries.add(entry)
 *   await db.userProfile.get('local-user')
 *
 * The `db` export is a module singleton. Dexie handles connection pooling
 * and deduplication internally — importing from multiple files is safe.
 *
 * Initialisation:
 *   `openDB()` must be called once on app boot (in AppProviders) before
 *   any stores attempt to use the db. It opens the IndexedDB connection
 *   and runs the one-time localStorage migration.
 *
 * SSR guard:
 *   IndexedDB is a browser-only API. All db operations are guarded by
 *   `isDBOpen()` checks. The `db` object can be imported in server
 *   components — operations simply won't execute on the server.
 *
 * Hydration flow:
 *   AppProviders calls openDB() → then the four load*() helpers in parallel
 *   → passes results to each Zustand store's hydrate() action.
 *   Stores set isHydrated: true after hydrate() so components can gate
 *   their loading states.
 */

import Dexie, { type Table } from 'dexie'
import { registerVersions, migrateFromLocalStorage } from './migrations'
import type { UserProfileRow, FoodEntryRow, CheckInRow, LessonProgressRow } from './schema'

// ── Database class ─────────────────────────────────────────────────────────

class CalmorieDB extends Dexie {
  // Typed table accessors — TypeScript knows the row shape for each table
  userProfile!:    Table<UserProfileRow,    string>
  foodEntries!:    Table<FoodEntryRow,      string>
  checkIns!:       Table<CheckInRow,        string>
  lessonProgress!: Table<LessonProgressRow, string>

  constructor() {
    super('CalmorieDB')
    // Delegate version/schema declarations to migrations.ts
    registerVersions(this)
  }
}

// ── Singleton instance ─────────────────────────────────────────────────────

export const db = new CalmorieDB()

// ── Initialisation ─────────────────────────────────────────────────────────

let _opened = false

/**
 * Opens the database connection and runs the localStorage migration.
 * Call once in AppProviders on client mount.
 *
 * Safe to call multiple times — subsequent calls are no-ops.
 * Returns a promise that resolves when the db is ready and migration is done.
 */
export async function openDB(): Promise<void> {
  if (typeof window === 'undefined') return
  if (_opened) return

  try {
    await db.open()
    _opened = true
    await migrateFromLocalStorage(db)
  } catch (err) {
    // IndexedDB unavailable (e.g. private browsing in some browsers,
    // storage quota exceeded). The app continues with in-memory Zustand state.
    console.error('[CalmorieDB] Failed to open database:', err)
  }
}

/**
 * Returns true if the database has been opened successfully.
 * Stores use this guard before all db write operations.
 */
export function isDBOpen(): boolean {
  return _opened
}

// ── Hydration helpers ──────────────────────────────────────────────────────

export async function loadUserProfile(): Promise<UserProfileRow | null> {
  if (!isDBOpen()) return null
  return (await db.userProfile.get('local-user')) ?? null
}

export async function loadFoodEntries(): Promise<FoodEntryRow[]> {
  if (!isDBOpen()) return []
  return db.foodEntries.toArray()
}

export async function loadCheckIns(): Promise<CheckInRow[]> {
  if (!isDBOpen()) return []
  return db.checkIns.toArray()
}

export async function loadLessonProgress(): Promise<LessonProgressRow[]> {
  if (!isDBOpen()) return []
  return db.lessonProgress.toArray()
}
