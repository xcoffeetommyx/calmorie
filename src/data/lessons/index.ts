/**
 * src/data/lessons/index.ts
 *
 * Barrel file for all lesson JSON data.
 *
 * Imports every lesson JSON file and re-exports them as a single,
 * typed `Lesson[]` array. This is the only place in the codebase that
 * directly imports lesson JSON. All other code goes through
 * `lib/content/lessons.ts` which consumes this array.
 *
 * Adding a new lesson:
 *   1. Create the JSON file in this directory, matching the Lesson schema
 *   2. Import it below and add it to the LESSONS array
 *   3. It will automatically appear in the library and be available by slug
 */

import type { Lesson } from '@/types/lesson'

import calories101      from './calories-101.json'
import metabolism       from './metabolism.json'
import genetics         from './genetics.json'
import sleepWeight      from './sleep-weight.json'
import stressEating     from './stress-eating.json'
import ultraProcessed   from './ultra-processed.json'
import digestion        from './digestion.json'
import proteinFullness  from './protein-fullness.json'
import fiberHunger      from './fiber-hunger.json'
import liquidCalories   from './liquid-calories.json'
import portionSize      from './portion-size.json'
import weightFluctuation from './weight-fluctuation.json'
import hungerCravings   from './hunger-cravings.json'
import balancedPlate    from './balanced-plate.json'
import walkingDailyMovement from './walking-daily-movement.json'
import nutritionLabels  from './nutrition-labels.json'

/**
 * All lessons, in the intended library display order.
 * The lesson-of-the-day logic in lib/content/lessons.ts uses this order
 * as the rotation basis.
 *
 * Cast to `Lesson[]` - TypeScript will validate the JSON structure against
 * the Lesson interface at compile time via `resolveJsonModule: true`.
 */
export const LESSONS: Lesson[] = [
  calories101       as Lesson,
  metabolism        as Lesson,
  sleepWeight       as Lesson,
  stressEating      as Lesson,
  ultraProcessed    as Lesson,
  genetics          as Lesson,
  digestion         as Lesson,
  proteinFullness   as Lesson,
  fiberHunger       as Lesson,
  liquidCalories    as Lesson,
  portionSize       as Lesson,
  weightFluctuation as Lesson,
  hungerCravings    as Lesson,
  balancedPlate     as Lesson,
  walkingDailyMovement as Lesson,
  nutritionLabels   as Lesson,
]

/**
 * Pre-built slug → Lesson lookup map for O(1) retrieval.
 * Used by getLessonBySlug() in lib/content/lessons.ts.
 */
export const LESSON_MAP: Map<string, Lesson> = new Map(
  LESSONS.map((lesson) => [lesson.slug, lesson])
)
