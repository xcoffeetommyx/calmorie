/**
 * src/lib/engine/scoreEngine.ts
 *
 * Calculates a 0–100 daily wellness score from check-in answers.
 *
 * Design intent:
 *   The score represents how consistently supportive today's habits were —
 *   not a moral judgement. A low score is a neutral data point, not a
 *   verdict. Tip language reflects this.
 *
 * Scoring model:
 *   Each factor contributes up to its weight toward a 100-point total.
 *   Factors are positive-framed: more points = more supportive habits today.
 *
 *   Factor               Weight   Notes
 *   ─────────────────    ──────   ─────────────────────────────────────────
 *   Meals eaten (2–4)      20     0 if 0-1, 10 if exactly 5, 20 if 2–4
 *   Sleep quality          20     linear 0–20 from rating 1–5
 *   Steps / activity       20     4 tiers: 4 / 10 / 16 / 20
 *   Stress level (inv.)    20     linear 0–20 inverted from rating 1–5
 *   No sugary drinks       10     binary
 *   No late-night eating   10     binary
 *   No skipped meals        5     binary (overlap with meals, lower weight)
 *   ─────────────────    ──────
 *   Total possible        105     capped at 100
 *
 * A total > 100 is possible in theory and is clamped to 100.
 * The extra 5 points give the score room to reach 100 without
 * requiring perfect performance on every dimension simultaneously.
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
  /** The factor that lost the most points — used to direct the tip */
  weakestFactor: string
}

/**
 * Calculates a 0–100 daily wellness score from check-in answers.
 */
export function calculateScore(answers: CheckInAnswers): ScoreResult {
  const breakdown = getScoreBreakdown(answers)

  // Sum all factor scores and clamp to 100
  const rawTotal = Object.values(breakdown.factors).reduce(
    (sum, f) => sum + f.earned,
    0
  )
  const score = Math.round(clamp(rawTotal, 0, 100))

  // Identify the factor with the largest gap (max - earned)
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
  // Meals eaten (0–1 = 0pts, 2–4 = 20pts, 5 = 10pts)
  const mealsScore =
    a.mealsEaten >= 2 && a.mealsEaten <= 4 ? 20
    : a.mealsEaten === 5 ? 10
    : 0

  // Sleep quality: rating 1–5 → 0–20 linear
  const sleepScore = ((a.sleepQuality - 1) / 4) * 20

  // Steps: 4 tiers
  const stepsScore =
    a.stepsRange === 'over_10k' ? 20
    : a.stepsRange === '5k_10k' ? 16
    : a.stepsRange === '2k_5k'  ? 10
    : 4  // under_2k: not 0 — some movement still counts

  // Stress level: inverted (1 = none → 20pts, 5 = very high → 0pts)
  const stressScore = ((5 - a.stressLevel) / 4) * 20

  return {
    factors: {
      meals:          factor(mealsScore,              20),
      sleep:          factor(sleepScore,              20),
      activity:       factor(stepsScore,              20),
      stress:         factor(stressScore,             20),
      sugaryDrinks:   factor(a.sugaryDrinks ? 0 : 10, 10),
      lateNight:      factor(a.lateNightEating ? 0 : 10, 10),
      skippedMeals:   factor(a.skippedMeals ? 0 : 5,  5),
    },
  }
}

// ── Tip map ────────────────────────────────────────────────────────────────

/**
 * One gentle, actionable tip per factor — directed at the area that
 * lost the most points today.
 * Tone: informational and forward-looking, never critical.
 */
const TIP_MAP: Record<string, string> = {
  meals:
    'Eating 2–4 balanced meals spread across the day tends to support steadier energy and appetite. If time is tight, even a small snack counts.',
  sleep:
    'Sleep is one of the most impactful things for appetite and energy the next day. Even a small improvement — like going to bed 30 minutes earlier — can make a noticeable difference.',
  activity:
    'Regular movement throughout the day supports metabolism and mood. A short walk — even 10 minutes — is a good place to start if you have been mostly sitting.',
  stress:
    'High stress can influence food choices and energy levels. A few minutes of slow breathing or a brief walk can help take the edge off when things feel overwhelming.',
  sugaryDrinks:
    'Sugary drinks add calories without contributing much fullness. Swapping one for water or an unsweetened alternative is one of the easiest changes to try.',
  lateNight:
    'Eating close to bedtime can affect sleep quality and may make it harder to stay within your daily calorie range. A small protein-rich snack is a better option if you are genuinely hungry.',
  skippedMeals:
    'Skipping meals often leads to stronger hunger later in the day. Even a small meal or snack helps maintain steadier energy and appetite throughout the day.',
}

const DEFAULT_TIP =
  'Small, consistent habits tend to add up more than any single perfect day. Keep going.'

// ── Score tier helpers ─────────────────────────────────────────────────────

/**
 * Returns a brief supportive description for a given score range.
 * These supplement the tier label from scoreToTier() in format.ts.
 */
export function getScoreDescription(score: number): string {
  if (score >= 80) return 'Your habits today were well-balanced. That\'s worth acknowledging.'
  if (score >= 60) return 'A solid day overall. There are always small things to build on.'
  if (score >= 40) return 'A mixed day — that\'s normal. One thing to focus on tomorrow can make a difference.'
  return 'Today was tough. Tracking it honestly is itself a useful step forward.'
}
