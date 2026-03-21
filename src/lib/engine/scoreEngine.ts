/**
 * src/lib/engine/scoreEngine.ts
 *
 * Calculates a 0–100 morning wellness score from check-in answers.
 *
 * Design intent:
 *   The score represents how consistently supportive yesterday's habits and
 *   today's starting state are — not a moral judgement. A low score is a
 *   neutral data point, not a verdict. Tip language reflects this.
 *
 * Scoring model:
 *   Each factor contributes up to its weight toward a 100-point total.
 *   Factors are positive-framed: more points = more supportive habits.
 *
 *   Factor                 Weight   Notes
 *   ─────────────────────  ──────   ──────────────────────────────────────
 *   Sleep quality             25    linear 0–25 from rating 1–5
 *   Meals eaten (2–4)         25    0 if 0-1, 12 if exactly 5, 25 if 2–4
 *   Stress level (inverted)   20    linear 0–20 inverted from rating 1–5
 *   No sugary drinks          15    binary
 *   No late-night eating      10    binary
 *   No skipped meals           5    binary
 *   ─────────────────────  ──────
 *   Total possible            100   exact (no buffer needed)
 *
 * All functions are pure — no side effects, no global state.
 */

import type { CheckInAnswers } from '@/types/checkin'
import { clamp } from '@/lib/utils/format'

// ── Score calculation ──────────────────────────────────────────────────────

export interface ScoreResult {
  /** Final score 0–100 */
  score: number
  /** Personalised plain-language tip based on the weakest area */
  tip: string
  /** The factor that lost the most points — used to direct the tip and lesson CTA */
  weakestFactor: string
}

/**
 * Calculates a 0–100 morning wellness score from check-in answers.
 */
export function calculateScore(answers: CheckInAnswers): ScoreResult {
  const breakdown = getScoreBreakdown(answers)

  const rawTotal = Object.values(breakdown.factors).reduce(
    (sum, f) => sum + f.earned,
    0
  )
  const score = Math.round(clamp(rawTotal, 0, 100))

  const weakest = Object.entries(breakdown.factors).sort(
    ([, a], [, b]) => b.gap - a.gap
  )[0]

  const weakestFactor = weakest?.[0] ?? 'sleep'
  const tip = TIP_MAP[weakestFactor] ?? DEFAULT_TIP

  return { score, tip, weakestFactor }
}

// ── Factor breakdown ───────────────────────────────────────────────────────

interface FactorResult {
  earned: number
  max: number
  gap: number
}

interface ScoreBreakdown {
  factors: Record<string, FactorResult>
}

function factor(earned: number, max: number): FactorResult {
  const clamped = Math.round(clamp(earned, 0, max))
  return { earned: clamped, max, gap: max - clamped }
}

function getScoreBreakdown(a: CheckInAnswers): ScoreBreakdown {
  // Sleep quality: rating 1–5 → 0–25 linear
  const sleepScore = ((a.sleepQuality - 1) / 4) * 25

  // Meals eaten yesterday: 0–1 = 0, 2–4 = 25, 5 = 12
  const mealsScore =
    a.mealsEaten >= 2 && a.mealsEaten <= 4 ? 25
    : a.mealsEaten === 5 ? 12
    : 0

  // Stress level: inverted (1 = none → 20pts, 5 = very high → 0pts)
  const stressScore = ((5 - a.stressLevel) / 4) * 20

  return {
    factors: {
      sleep:        factor(sleepScore,              25),
      meals:        factor(mealsScore,              25),
      stress:       factor(stressScore,             20),
      sugaryDrinks: factor(a.sugaryDrinks ? 0 : 15, 15),
      lateNight:    factor(a.lateNightEating ? 0 : 10, 10),
      skippedMeals: factor(a.skippedMeals ? 0 : 5,  5),
    },
  }
}

// ── Tip map ────────────────────────────────────────────────────────────────

/**
 * One gentle, actionable tip per factor.
 * Tone: forward-looking and informational, never critical.
 */
const TIP_MAP: Record<string, string> = {
  sleep:
    'Sleep is one of the most impactful things for appetite and energy the next day. Even a small improvement — like going to bed 30 minutes earlier — can make a noticeable difference.',
  meals:
    'Eating 2–4 balanced meals spread across the day tends to support steadier energy and appetite. If time is tight, even a small snack counts.',
  stress:
    'High stress can influence food choices and energy levels. A few minutes of slow breathing or a brief walk can help take the edge off when things feel overwhelming.',
  sugaryDrinks:
    'Sugary drinks add calories without contributing much fullness. Swapping one for water or an unsweetened alternative is one of the easiest changes to try.',
  lateNight:
    'Eating close to bedtime can affect sleep quality and may make it harder to stay within your daily calorie range. A small protein-rich snack is a better option if you are genuinely hungry in the evening.',
  skippedMeals:
    'Skipping meals often leads to stronger hunger later in the day. Even a small meal or snack helps maintain steadier energy and appetite throughout the day.',
}

const DEFAULT_TIP =
  'Small, consistent habits tend to add up more than any single perfect day. Keep going.'

// ── Score tier helpers ─────────────────────────────────────────────────────

/**
 * Returns a brief supportive description for a given score range.
 * Morning-framed: references "yesterday" rather than "today".
 */
export function getScoreDescription(score: number): string {
  if (score >= 80) return 'Yesterday\'s habits were well-balanced. That\'s worth acknowledging.'
  if (score >= 60) return 'A solid day overall. There are always small things to build on.'
  if (score >= 40) return 'A mixed day — that\'s normal. One thing to focus on today can make a difference.'
  return 'A tough day. Tracking it honestly is itself a useful step forward.'
}

// ── Lesson recommendation ──────────────────────────────────────────────────

/**
 * Maps the weakest scoring factor to a related lesson slug.
 * Used by the result screen to surface a contextual learning CTA.
 */
export const LESSON_FOR_FACTOR: Record<string, string> = {
  sleep:        'sleep-weight',
  meals:        'metabolism',
  stress:       'stress-eating',
  sugaryDrinks: 'calories-101',
  lateNight:    'sleep-weight',
  skippedMeals: 'calories-101',
}

/**
 * Returns the lesson slug most relevant to the weakest factor, or null.
 */
export function getLessonSlugForFactor(factor: string): string | null {
  return LESSON_FOR_FACTOR[factor] ?? null
}
