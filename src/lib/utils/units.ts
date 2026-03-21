/**
 * src/lib/utils/units.ts
 *
 * Conversion utilities between metric and imperial body measurements.
 * All stored values remain metric (cm, kg). These functions are used only
 * for display and for converting user input before saving.
 */

import type { UnitPreference } from '@/types/user'

// ── Weight ─────────────────────────────────────────────────────────────────

/** Convert kilograms to pounds, rounded to 1 decimal place */
export function kgToLb(kg: number): number {
  return Math.round(kg * 2.20462 * 10) / 10
}

/** Convert pounds to kilograms, rounded to 1 decimal place */
export function lbToKg(lb: number): number {
  return Math.round((lb / 2.20462) * 10) / 10
}

// ── Height ─────────────────────────────────────────────────────────────────

/** Convert centimetres to feet + whole inches */
export function cmToFtIn(cm: number): { ft: number; in: number } {
  const totalInches = cm / 2.54
  const ft = Math.floor(totalInches / 12)
  const inches = Math.round(totalInches % 12)
  // Guard: rounding can push inches to 12
  if (inches === 12) return { ft: ft + 1, in: 0 }
  return { ft, in: inches }
}

/** Convert feet + inches to centimetres, rounded to the nearest whole cm */
export function ftInToCm(ft: number, inches: number): number {
  return Math.round((ft * 12 + inches) * 2.54)
}

// ── Display formatters ─────────────────────────────────────────────────────

/** Format a stored height (cm) for display in the preferred unit */
export function formatHeight(heightCm: number, unit: UnitPreference): string {
  if (unit === 'imperial') {
    const { ft, in: inches } = cmToFtIn(heightCm)
    return `${ft}′${inches}″`
  }
  return `${heightCm} cm`
}

/** Format a stored weight (kg) for display in the preferred unit */
export function formatWeight(weightKg: number, unit: UnitPreference): string {
  if (unit === 'imperial') {
    return `${kgToLb(weightKg)} lb`
  }
  return `${weightKg} kg`
}
