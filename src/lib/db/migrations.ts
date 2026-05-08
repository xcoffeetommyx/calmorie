/**
 * src/lib/db/migrations.ts
 *
 * Database version upgrades and data migration utilities.
 *
 * Version history:
 *   v1 - Initial schema: userProfile, foodEntries, checkIns, lessonProgress
 *
 * When to bump the version:
 *   – Adding a new table
 *   – Adding or removing an index on an existing table
 *   – Restructuring stored row shapes (use upgrade() callback to transform data)
 *
 * localStorage migration:
 *   Before this DB layer existed, Zustand used localStorage via the persist
 *   middleware. `migrateFromLocalStorage()` runs once after DB initialisation,
 *   reads legacy localStorage keys, writes the data to IndexedDB, and marks
 *   the migration done so it never runs again.
 *
 *   This is safe to call on every app boot - the MIGRATION_DONE_KEY guard
 *   short-circuits immediately if migration has already happened.
 */

import type Dexie from 'dexie'
import { TABLE_SCHEMAS, LEGACY_STORAGE_KEYS, MIGRATION_DONE_KEY } from './schema'
import type { UserProfileRow, FoodEntryRow, CheckInRow } from './schema'

// ── Version declarations ───────────────────────────────────────────────────

/**
 * Registers all Dexie version declarations on the db instance.
 * Call this once before any db operations, immediately after `new Dexie(...)`.
 *
 * To add a new version:
 *   db.version(2).stores({ ...TABLE_SCHEMAS, newTable: 'id, field' })
 *      .upgrade((tx) => tx.table('existingTable').toCollection().modify(...))
 */
export function registerVersions(db: Dexie): void {
  db.version(1).stores(TABLE_SCHEMAS)
  // Future versions go here:
  // db.version(2).stores({ ...TABLE_SCHEMAS, newTable: 'id' }).upgrade(...)
}

// ── localStorage → IndexedDB migration ────────────────────────────────────

/**
 * One-time migration of data from the old localStorage-based Zustand persist
 * stores into IndexedDB.
 *
 * Safe to call on every boot - exits immediately if already done.
 * Should be called after `db.open()` succeeds.
 *
 * @param db - the open Dexie instance
 */
export async function migrateFromLocalStorage(db: Dexie): Promise<void> {
  if (typeof window === 'undefined') return

  // Already migrated - skip
  if (localStorage.getItem(MIGRATION_DONE_KEY) === 'true') return

  // Check whether IndexedDB already has data (e.g. returning user who opened
  // the app after a partial migration attempt)
  const [existingProfile, existingEntryCount, existingCheckins] = await Promise.all([
    db.table('userProfile').count(),
    db.table('foodEntries').count(),
    db.table('checkIns').count(),
  ])

  const dbHasData = existingProfile > 0 || existingEntryCount > 0 || existingCheckins > 0

  if (!dbHasData) {
    // Migrate userProfile
    const rawProfile = localStorage.getItem(LEGACY_STORAGE_KEYS.userProfile)
    if (rawProfile) {
      try {
        const parsed = JSON.parse(rawProfile) as { state?: { profile?: UserProfileRow } }
        const profile = parsed?.state?.profile
        if (profile?.id) {
          await db.table('userProfile').put(profile)
        }
      } catch {
        // Corrupt localStorage data - skip silently
      }
    }

    // Migrate food entries
    const rawLog = localStorage.getItem(LEGACY_STORAGE_KEYS.foodEntries)
    if (rawLog) {
      try {
        const parsed = JSON.parse(rawLog) as { state?: { entries?: FoodEntryRow[] } }
        const entries = parsed?.state?.entries
        if (Array.isArray(entries) && entries.length > 0) {
          await db.table('foodEntries').bulkPut(entries)
        }
      } catch {
        // Corrupt data - skip silently
      }
    }

    // Migrate check-ins
    const rawCheckins = localStorage.getItem(LEGACY_STORAGE_KEYS.checkIns)
    if (rawCheckins) {
      try {
        const parsed = JSON.parse(rawCheckins) as { state?: { records?: Record<string, CheckInRow> } }
        const records = parsed?.state?.records
        if (records && typeof records === 'object') {
          const rows = Object.values(records).filter((r): r is CheckInRow => !!r?.id)
          if (rows.length > 0) {
            await db.table('checkIns').bulkPut(rows)
          }
        }
      } catch {
        // Corrupt data - skip silently
      }
    }
  }

  // Mark migration complete regardless of whether data was found.
  // If localStorage was empty, there's nothing to migrate.
  localStorage.setItem(MIGRATION_DONE_KEY, 'true')
}
