/**
 * Date utilities for Calmorie.
 *
 * All functions operate on ISO date strings ('YYYY-MM-DD') or
 * ISO datetime strings. No external date library is required.
 * Dates are treated as local calendar dates — not UTC — to avoid
 * the midnight UTC vs local timezone confusion in nutrition apps.
 */

/**
 * Returns today's date as 'YYYY-MM-DD' in local time.
 *
 * Uses local time deliberately — a user logging at 11 PM should
 * have that entry belong to today, not yesterday (UTC).
 */
export function todayISO(): string {
  const d = new Date()
  const year  = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day   = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Returns the current ISO datetime string with timezone offset.
 * Used for `loggedAt`, `completedAt`, `createdAt` fields.
 */
export function nowISO(): string {
  return new Date().toISOString()
}

/**
 * Parses a 'YYYY-MM-DD' string as a local Date object.
 * Appends T00:00:00 to avoid UTC interpretation.
 */
export function parseLocalDate(dateISO: string): Date {
  return new Date(`${dateISO.split('T')[0]}T00:00:00`)
}

/**
 * Formats a 'YYYY-MM-DD' string as a human-readable display string.
 * e.g. "2024-03-14" → "Thursday, March 14"
 */
export function formatDateDisplay(dateISO: string): string {
  const date = parseLocalDate(dateISO)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Formats a 'YYYY-MM-DD' string as a short label.
 * e.g. "2024-03-14" → "Mar 14"
 */
export function formatDateShort(dateISO: string): string {
  const date = parseLocalDate(dateISO)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Returns the weekday name for a date.
 * e.g. "2024-03-14" → "Thursday"
 */
export function formatWeekday(dateISO: string, length: 'long' | 'short' | 'narrow' = 'long'): string {
  const date = parseLocalDate(dateISO)
  return date.toLocaleDateString('en-US', { weekday: length })
}

/**
 * Checks whether two date values represent the same calendar day.
 * Accepts both 'YYYY-MM-DD' and full ISO datetime strings.
 */
export function isSameDay(a: string, b: string): boolean {
  return a.split('T')[0] === b.split('T')[0]
}

/**
 * Checks whether a 'YYYY-MM-DD' string is today.
 */
export function isToday(dateISO: string): boolean {
  return dateISO.split('T')[0] === todayISO()
}

/**
 * Returns how many calendar days ago a date was.
 * 0 = today, 1 = yesterday, 7 = one week ago.
 */
export function daysAgo(dateISO: string): number {
  const today = parseLocalDate(todayISO())
  const date  = parseLocalDate(dateISO.split('T')[0])
  const diffMs = today.getTime() - date.getTime()
  return Math.round(diffMs / (1000 * 60 * 60 * 24))
}

/**
 * Returns a contextual relative label for a date.
 * e.g. "Today", "Yesterday", "2 days ago", "Mar 14"
 */
export function formatRelativeDate(dateISO: string): string {
  const days = daysAgo(dateISO)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days <= 6) return `${days} days ago`
  return formatDateShort(dateISO)
}

/**
 * Returns a greeting appropriate for the current time of day.
 */
export function getTimeGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 5)  return 'Up late'
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  if (hour < 21) return 'Good evening'
  return 'Good night'
}

/**
 * Returns true if the current time is considered "late night"
 * (after 9 PM), used by the habit engine late-night eating check.
 */
export function isLateNight(): boolean {
  const hour = new Date().getHours()
  return hour >= 21 || hour < 4
}

/**
 * Generates a simple UUID-like ID string.
 * Uses crypto.randomUUID() where available, falls back to Math.random().
 * This is sufficient for local-only IndexedDB IDs.
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback — not cryptographically secure but fine for local IDs
  return 'xxxx-xxxx-xxxx'.replace(/x/g, () =>
    Math.floor(Math.random() * 16).toString(16)
  )
}
