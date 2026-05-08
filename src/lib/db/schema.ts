/**
 * src/lib/db/schema.ts
 *
 * IndexedDB table definitions for Calmorie.
 *
 * This file defines:
 *   1. The TypeScript types for each stored row
 *   2. The Dexie index strings for each table
 *
 * Keep types in sync with the domain types in src/types/*.
 * Dexie stores rows as plain JSON objects - no class instances.
 *
 * Tables:
 *   userProfile    - single row (id: 'local-user'), the user's profile and TDEE
 *   foodEntries    - one row per logged food item, indexed by date and meal
 *   checkIns       - one row per completed daily check-in, keyed by date
 *   lessonProgress - one row per lesson, keyed by slug
 *
 * Index string format: 'primaryKey, index1, index2'
 * Compound indexes: '[field1+field2]'
 * Non-indexed fields need not appear in the string.
 */

import type { UserProfile } from '@/types/user'
import type { FoodEntry } from '@/types/food'
import type { LessonProgress } from '@/types/lesson'
/**
 * CheckInRow mirrors CheckInRecordFull from checkinStore.
 * Defined locally here (not imported from the store) to avoid a
 * circular dependency: checkinStore → db/index → db/schema → checkinStore.
 */
import type { CheckInRecord } from '@/types/checkin'
import type { HabitWarning } from '@/types/habit'
export interface CheckInRow extends Omit<CheckInRecord, 'habitWarningIds'> {
  habitWarnings: HabitWarning[]
}

// ── Re-export for convenience ──────────────────────────────────────────────
// These are the exact types Dexie will store and return.
// Re-exporting avoids consumers needing separate imports.

export type { UserProfile  as UserProfileRow }
export type { FoodEntry    as FoodEntryRow   }
// CheckInRow is defined directly above - no re-export needed
export type { LessonProgress as LessonProgressRow }

// ── Dexie index strings ────────────────────────────────────────────────────

/**
 * Dexie table index definitions.
 * Value format: `primaryKey, [index1], [index2], ...`
 *
 * Only indexed fields appear here; all other fields are stored but not indexed.
 * Adding an index to an existing table requires a version upgrade in migrations.ts.
 */
export const TABLE_SCHEMAS = {
  /**
   * userProfile - single-row table.
   * id is always 'local-user'. The table holds exactly one record.
   */
  userProfile:    'id',

  /**
   * foodEntries - indexed by date (for "get today's entries" queries)
   * and by [date+meal] for grouped meal lookups.
   */
  foodEntries:    'id, date, [date+meal], loggedAt',

  /**
   * checkIns - keyed by date string ('YYYY-MM-DD').
   * One record per calendar day.
   */
  checkIns:       'id, date',

  /**
   * lessonProgress - keyed by lesson slug.
   * Indexed by completed for "get all completed" queries.
   */
  lessonProgress: 'slug, completed',
} as const

/** Current database version. Increment this when changing TABLE_SCHEMAS. */
export const DB_VERSION = 1

/** The localStorage keys used by the old persist middleware - used for migration. */
export const LEGACY_STORAGE_KEYS = {
  userProfile: 'calmorie-user-profile',
  foodEntries: 'calmorie-food-log',
  checkIns:    'calmorie-checkins',
} as const

/** Key stored in localStorage to mark that migration has completed. */
export const MIGRATION_DONE_KEY = 'calmorie-idb-migrated-v1'
