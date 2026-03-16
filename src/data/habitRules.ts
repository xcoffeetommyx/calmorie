/**
 * src/data/habitRules.ts
 *
 * Rules-based habit engine data.
 *
 * Each rule has a `trigger` function evaluated against the user's
 * daily check-in answers. When a trigger fires, the habitEngine
 * generates a HabitWarning displayed in the check-in result and
 * on the dashboard.
 *
 * Design principles:
 *   – Gentle and educational, never shame-based or alarmist
 *   – Each warning explains the why, not just the what
 *   – `actionSuggestion` is always specific and achievable
 *   – `relatedLessonSlug` links to relevant educational content
 *   – Severity is conservative — use 'info' liberally, 'moderate' sparingly
 *   – Avoid mechanistic claims stronger than the evidence supports
 *
 * Rule IDs must be stable across app versions (they are stored in
 * CheckInRecord.habitWarningIds). Do not rename existing IDs.
 */

import type { HabitRule } from '@/types/habit'
import type { CheckInAnswers } from '@/types/checkin'

// ── Type re-export for convenience ─────────────────────────────────────────
export type { HabitRule }

// ── Rule definitions ───────────────────────────────────────────────────────

export const HABIT_RULES: HabitRule[] = [
  // ── Late-night eating ────────────────────────────────────────────────────
  {
    id: 'late-night-eating',
    trigger: (answers: CheckInAnswers) => answers.lateNightEating === true,
    severity: 'gentle',
    title: 'Late-night eating noticed',
    message:
      'Eating close to bedtime can interfere with sleep quality and may make it harder to stay within your daily calorie range — partly because hunger in the evening can lead to larger portions. This is common and is worth noticing if it becomes a regular pattern rather than an occasional one.',
    actionSuggestion:
      'If you feel hungry in the evening, a small, protein-rich snack — like plain yogurt or a handful of nuts — is generally more satisfying than sugary or salty snacks and less likely to affect your sleep.',
    relatedLessonSlug: 'sleep-weight',
  },

  // ── Sugary drinks ────────────────────────────────────────────────────────
  {
    id: 'sugary-drinks',
    trigger: (answers: CheckInAnswers) => answers.sugaryDrinks === true,
    severity: 'gentle',
    title: 'Liquid calories are easy to miss',
    message:
      'Sugary drinks — including juice, soft drinks, energy drinks, and sweetened coffee — add calories without triggering the same fullness signals as solid food. A single 330ml can of fizzy drink can contain around 35g of sugar and approximately 140 calories.',
    actionSuggestion:
      'Try swapping one sugary drink today with sparkling water, plain water, or unsweetened tea. Small swaps like this add up meaningfully over a week.',
    relatedLessonSlug: 'calories-101',
  },

  // ── Very low activity ────────────────────────────────────────────────────
  {
    id: 'very-low-activity',
    trigger: (answers: CheckInAnswers) => answers.stepsRange === 'under_2k',
    severity: 'gentle',
    title: 'Very little movement today',
    message:
      'Fewer than 2,000 steps suggests a largely sedentary day. Regular movement throughout the day — even in small amounts — supports metabolism, mood, and cardiovascular health. The goal does not need to be intense exercise.',
    actionSuggestion:
      'A 10-minute walk after a meal is one of the simplest ways to add movement. It also supports digestion and helps build a manageable daily habit.',
    relatedLessonSlug: 'metabolism',
  },

  // ── Moderate activity (positive reinforcement) ───────────────────────────
  {
    id: 'good-activity',
    trigger: (answers: CheckInAnswers) =>
      answers.stepsRange === '5k_10k' || answers.stepsRange === 'over_10k',
    severity: 'info',
    title: 'Good activity level today',
    message:
      'Reaching 5,000 or more steps in a day is genuinely meaningful for metabolic health. Physical activity accounts for the largest variable portion of your daily calorie burn and has benefits well beyond weight management.',
    actionSuggestion:
      'Keep it up. Consistency over weeks and months matters far more than intensity on any single day.',
    relatedLessonSlug: 'metabolism',
  },

  // ── Poor sleep ───────────────────────────────────────────────────────────
  {
    id: 'poor-sleep',
    trigger: (answers: CheckInAnswers) => answers.sleepQuality <= 2,
    severity: 'gentle',
    title: 'Poor sleep can affect eating habits',
    message:
      'When sleep quality is low, research shows the body tends to produce more ghrelin (the hunger hormone) and less leptin (the fullness hormone) the following day. This can make it harder to resist cravings — not because of a lack of willpower, but because of real changes in how hunger signals are regulated.',
    actionSuggestion:
      'Even one step toward better sleep helps: a consistent bedtime, a cooler room, or keeping your phone out of the bedroom. Small improvements compound over time.',
    relatedLessonSlug: 'sleep-weight',
  },

  // ── High stress ──────────────────────────────────────────────────────────
  {
    id: 'high-stress',
    trigger: (answers: CheckInAnswers) => answers.stressLevel >= 4,
    severity: 'gentle',
    title: 'High stress affects food choices',
    message:
      'Elevated stress is associated with increased appetite, particularly for calorie-dense comfort foods. Research links this partly to how stress hormones interact with the brain\'s reward and appetite systems. Recognising the pattern is the first step to working with it rather than against it.',
    actionSuggestion:
      'If stress is contributing to eating today, try a 5-minute breathing exercise or a short walk before reaching for food. This can help the stress response settle before you decide whether you are genuinely hungry.',
    relatedLessonSlug: 'stress-eating',
  },

  // ── Skipped meals ────────────────────────────────────────────────────────
  {
    id: 'skipped-meals',
    trigger: (answers: CheckInAnswers) => answers.skippedMeals === true,
    severity: 'info',
    title: 'Skipping meals can lead to catching up later',
    message:
      'Skipping meals — especially breakfast or lunch — often leads to stronger hunger and less controlled eating later in the day. While occasional skipped meals are not a problem, a regular pattern can make it harder to stay within your calorie range and sustain consistent energy levels.',
    actionSuggestion:
      'If you are short on time, a small but protein-rich meal — eggs, yogurt, nuts with fruit — takes less than 5 minutes and helps maintain steadier energy and appetite through the day.',
    relatedLessonSlug: 'calories-101',
  },

  // ── Very few meals eaten ─────────────────────────────────────────────────
  {
    id: 'very-few-meals',
    trigger: (answers: CheckInAnswers) =>
      answers.mealsEaten <= 1 && !answers.skippedMeals,
    severity: 'info',
    title: 'Only one meal today',
    message:
      'Eating only once in a day can create a large calorie deficit that may lead to stronger hunger and larger portions later, reduce energy and concentration, and make it harder to get adequate nutrients. Most people do well with 2–4 meals spread across the day.',
    actionSuggestion:
      'Try adding a second meal tomorrow, even a small one. Consistent eating patterns tend to produce more stable energy and better appetite regulation than large single meals.',
    relatedLessonSlug: 'metabolism',
  },

  // ── High stress + poor sleep combined ────────────────────────────────────
  {
    id: 'stress-and-poor-sleep',
    trigger: (answers: CheckInAnswers) =>
      answers.stressLevel >= 3 && answers.sleepQuality <= 2,
    severity: 'moderate',
    title: 'Stress and sleep are affecting each other',
    message:
      'Stress and poor sleep tend to reinforce each other: stress can make it harder to sleep, and poor sleep can make everything feel harder the next day, including food choices and appetite regulation. This is a common cycle and recognising it is useful.',
    actionSuggestion:
      'Prioritise one sleep improvement tonight — even just going to bed 30 minutes earlier. This often has an outsized effect on how manageable the following day feels.',
    relatedLessonSlug: 'sleep-weight',
  },

  // ── Sugary drinks + low activity ─────────────────────────────────────────
  {
    id: 'sugary-drinks-low-activity',
    trigger: (answers: CheckInAnswers) =>
      answers.sugaryDrinks === true && answers.stepsRange === 'under_2k',
    severity: 'gentle',
    title: 'Liquid calories with low movement today',
    message:
      'On lower-activity days, the calories from sugary drinks are less easily offset by movement. This combination can quietly contribute to a calorie surplus without feeling like overeating, since drinks do not produce the same fullness signals as food.',
    actionSuggestion:
      'On quieter days, it is especially worth swapping sweetened drinks for water or unsweetened alternatives. Even a short walk adds meaningful movement to an otherwise sedentary day.',
    relatedLessonSlug: 'ultra-processed',
  },
]

/**
 * Returns the HABIT_RULES array.
 * Convenience export for the habitEngine.
 */
export function getHabitRules(): HabitRule[] {
  return HABIT_RULES
}
