import type { CheckInAnswers } from './checkin'

// ── Severity ───────────────────────────────────────────────────────────────

export type HabitSeverity = 'info' | 'gentle' | 'moderate'

// ── Core models ───────────────────────────────────────────────────────────

/**
 * A static rule definition (lives in data/habitRules.ts).
 *
 * The `trigger` function is evaluated against the user's check-in answers.
 * Rules are pure — they have no side effects and receive no global state.
 */
export interface HabitRule {
  id: string
  trigger: (answers: CheckInAnswers) => boolean
  severity: HabitSeverity
  title: string
  message: string             // Plain language — never judgemental
  actionSuggestion: string    // Concrete, gentle next step
  relatedLessonSlug?: string  // Links to a lesson in data/lessons/
}

/**
 * A warning generated when a HabitRule's trigger fires.
 * Stored inside a CheckInRecord after a check-in is submitted.
 */
export interface HabitWarning {
  id: string
  ruleId: string
  severity: HabitSeverity
  title: string
  message: string
  actionSuggestion: string
  relatedLessonSlug?: string
  triggeredAt: string         // ISO datetime
}

// ── Severity metadata (UI-agnostic) ───────────────────────────────────────

/**
 * Semantic description of each severity level.
 * Does NOT contain Tailwind class names — those live in the
 * HabitWarning component where they can reference verified tokens.
 *
 * Components use this to derive accessible labels and aria descriptions.
 */
export const HABIT_SEVERITY_LABELS: Record<HabitSeverity, string> = {
  info:     'Information',
  gentle:   'Gentle nudge',
  moderate: 'Worth your attention',
}

/**
 * Short human-readable description of each severity level.
 * Used in check-in summaries and accessibility announcements.
 */
export const HABIT_SEVERITY_DESCRIPTIONS: Record<HabitSeverity, string> = {
  info:
    'A general tip to help you build awareness.',
  gentle:
    'A small habit to be mindful of — no action needed right now.',
  moderate:
    'A pattern that may be worth adjusting over time.',
}

/**
 * Sort order for displaying multiple warnings: moderate first, info last.
 */
export const HABIT_SEVERITY_PRIORITY: Record<HabitSeverity, number> = {
  moderate: 0,
  gentle:   1,
  info:     2,
}

/*
 * NOTE: Visual style mapping (colours, icons, background classes)
 * for HabitSeverity is intentionally NOT defined here.
 *
 * Tailwind utility classes that reference our custom token names
 * (e.g. bg-primary-light, text-primary-text) must be verified against
 * tailwind.config.ts before use and belong in the UI component:
 *
 *   src/components/checkin/HabitWarning.tsx
 *
 * Define a `SEVERITY_STYLES` map there, colocated with the JSX
 * that renders it, so the mapping stays close to its usage and
 * can be visually tested directly.
 */
