/**
 * Number and unit formatting utilities for Calmorie.
 * All functions are pure - no side effects, no external dependencies.
 */

// ── Calorie formatting ─────────────────────────────────────────────────────

/**
 * Formats a calorie value for display.
 *
 * @param kcal   - The calorie value to format
 * @param opts.unit    - Include the "kcal" suffix (default: true)
 * @param opts.compact - Abbreviate thousands: 1200 → "1.2k kcal",
 *                       1000 → "1k kcal" (not "1.0k kcal")
 *
 * Examples:
 *   formatCalories(1842)                 → "1,842 kcal"
 *   formatCalories(1000, { compact: true }) → "1k kcal"
 *   formatCalories(1500, { compact: true }) → "1.5k kcal"
 *   formatCalories(1842, { unit: false }) → "1,842"
 */
export function formatCalories(
  kcal: number,
  opts?: { unit?: boolean; compact?: boolean }
): string {
  const rounded = Math.round(kcal)
  const suffix  = opts?.unit === false ? '' : ' kcal'

  if (opts?.compact && rounded >= 1000) {
    const k = rounded / 1000
    // Avoid ".0" suffix - "1k" not "1.0k", "1.5k" not "1.50k"
    const kFormatted = Number.isInteger(k) ? `${k}k` : `${parseFloat(k.toFixed(1))}k`
    return `${kFormatted}${suffix}`
  }

  return `${new Intl.NumberFormat('en-US').format(Math.abs(rounded))}${suffix}`
}

/**
 * Formats a calorie delta (signed difference) with a +/− prefix.
 *
 * Uses "−" (minus sign U+2212) for negatives, not a hyphen,
 * for typographic correctness.
 *
 * Examples:
 *   formatCalorieDelta(-300) → "−300 kcal"
 *   formatCalorieDelta(200)  → "+200 kcal"
 */
export function formatCalorieDelta(delta: number): string {
  const abs       = Math.abs(Math.round(delta))
  const formatted = new Intl.NumberFormat('en-US').format(abs)
  const sign      = delta < 0 ? '−' : '+'
  return `${sign}${formatted} kcal`
}

// ── Weight & height formatting ─────────────────────────────────────────────

/**
 * Formats a weight value in kilograms.
 *
 * Examples:
 *   formatWeight(72)   → "72 kg"
 *   formatWeight(72.5) → "72.5 kg"
 */
export function formatWeight(kg: number): string {
  const display = kg % 1 === 0 ? kg.toFixed(0) : kg.toFixed(1)
  return `${display} kg`
}

/**
 * Formats a height value in centimetres.
 *
 * Examples:
 *   formatHeight(175) → "175 cm"
 */
export function formatHeight(cm: number): string {
  return `${Math.round(cm)} cm`
}

/**
 * Formats a height value in imperial feet and inches.
 *
 * Handles carry-over: 11.5 inches rounds to 12, which must
 * become 0 inches + 1 additional foot (e.g. 5′12″ → 6′0″).
 *
 * Examples:
 *   formatHeightImperial(175) → "5′9″"
 *   formatHeightImperial(183) → "6′0″"
 */
export function formatHeightImperial(cm: number): string {
  const totalInches = cm / 2.54
  let   feet        = Math.floor(totalInches / 12)
  let   inches      = Math.round(totalInches % 12)

  // Carry-over: rounding 11.5 → 12 inches
  if (inches === 12) {
    feet   += 1
    inches  = 0
  }

  return `${feet}′${inches}″`
}

// ── Percentage formatting ──────────────────────────────────────────────────

/**
 * Formats a 0–1 ratio as a percentage string.
 *
 * Examples:
 *   formatPercent(0.75)    → "75%"
 *   formatPercent(0.333, 1) → "33.3%"
 */
export function formatPercent(value: number, precision = 0): string {
  return `${(clamp(value, 0, 1) * 100).toFixed(precision)}%`
}

// ── Numeric helpers ────────────────────────────────────────────────────────

/** Clamps a number between min and max (inclusive). */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/** Linearly interpolates between a and b; t is clamped to [0, 1]. */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp(t, 0, 1)
}

// ── Score tier ─────────────────────────────────────────────────────────────

/**
 * Tier key returned by scoreToTier.
 * UI components map these to colours/icons themselves - keeping
 * style decisions out of the utility layer.
 */
export type ScoreTier = 'great' | 'good' | 'average' | 'poor'

/**
 * Converts a 0–100 check-in score into a semantic tier descriptor.
 *
 * Returns a tier key (not Tailwind class names) so each consuming
 * component can apply its own visual mapping.
 *
 * Examples:
 *   scoreToTier(85) → { label: 'Great day',   tier: 'great' }
 *   scoreToTier(65) → { label: 'Good day',    tier: 'good' }
 *   scoreToTier(45) → { label: 'Average day', tier: 'average' }
 *   scoreToTier(20) → { label: 'Needs work',  tier: 'poor' }
 */
export function scoreToTier(score: number): { label: string; tier: ScoreTier } {
  if (score >= 80) return { label: 'Great day',   tier: 'great' }
  if (score >= 60) return { label: 'Good day',    tier: 'good' }
  if (score >= 40) return { label: 'Average day', tier: 'average' }
  return                   { label: 'Needs work', tier: 'poor' }
}
