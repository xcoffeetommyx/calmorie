/**
 * src/lib/engine/habitEngine.ts
 *
 * Evaluates habit rules against a set of check-in answers and returns
 * the set of triggered HabitWarning objects, sorted by severity priority.
 *
 * Design:
 *   – Pure function - no side effects, no global state
 *   – Rules come from data/habitRules.ts (static, auditable)
 *   – Each triggered rule produces exactly one HabitWarning
 *   – Warnings are sorted: moderate → gentle → info
 *   – ID is generated deterministically from ruleId + date so that
 *     the same check-in always produces the same warning IDs (stable
 *     for storage and deduplication)
 *
 * The engine does not write to any store - the caller (useCheckIn hook)
 * is responsible for persisting the results.
 *
 * All functions are pure - no side effects, no global state.
 */

import type { CheckInAnswers } from '@/types/checkin'
import type { HabitWarning } from '@/types/habit'
import { HABIT_SEVERITY_PRIORITY } from '@/types/habit'
import { HABIT_RULES } from '@/data/habitRules'
import { nowISO } from '@/lib/utils/date'

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Evaluates all habit rules against the provided answers.
 * Returns triggered HabitWarning objects sorted by severity (most
 * important first).
 *
 * @param answers  - the completed check-in answers
 * @param date     - 'YYYY-MM-DD' date used for stable ID generation
 */
export function evaluateHabits(
  answers: CheckInAnswers,
  date: string
): HabitWarning[] {
  const triggeredAt = nowISO()

  const warnings = HABIT_RULES
    .filter((rule) => rule.trigger(answers))
    .map((rule): HabitWarning => ({
      id:               `${rule.id}:${date}`,
      ruleId:           rule.id,
      severity:         rule.severity,
      title:            rule.title,
      message:          rule.message,
      actionSuggestion: rule.actionSuggestion,
      relatedLessonSlug: rule.relatedLessonSlug,
      triggeredAt,
    }))

  // Sort: moderate → gentle → info
  return warnings.sort(
    (a, b) =>
      HABIT_SEVERITY_PRIORITY[a.severity] - HABIT_SEVERITY_PRIORITY[b.severity]
  )
}

/**
 * Returns the single highest-priority warning from a list, or null.
 * Used by the dashboard to show one alert without showing all of them.
 */
export function getTopWarning(warnings: HabitWarning[]): HabitWarning | null {
  return warnings[0] ?? null
}
