import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * cn - class name utility
 *
 * Combines clsx (conditional class logic) with tailwind-merge
 * (intelligent Tailwind class deduplication). This is the single
 * import used by every component for constructing className strings.
 *
 * Examples:
 *   cn('px-4 py-2', condition && 'bg-primary')
 *   cn(baseClasses, variantClasses, props.className)
 *   cn('p-4', 'p-6')  → 'p-6'  (tailwind-merge deduplicates)
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
