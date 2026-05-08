/**
 * Typography
 *
 * A unified text component that maps a `variant` prop to the correct
 * HTML element and Tailwind classes. All text in the app should use
 * this component (or reference its classes directly) for consistency.
 *
 * Variants map to:
 *   Display: h1, h2, h3 - Fraunces (--font-display), tight tracking
 *   UI text: h4, h5, h6 - Plus Jakarta Sans (--font-body), slightly tight
 *   Body:    body, body-sm - Plus Jakarta Sans, relaxed line height
 *   Labels:  label, label-sm - Plus Jakarta Sans, medium weight
 *   Small:   caption - Plus Jakarta Sans, muted colour
 *
 * v2 changes:
 *   - `body` line-height bumped to leading-[1.8] for comfortable
 *     paragraph reading on mobile (was leading-relaxed / ~1.625)
 *   - `body` font-size bumped to text-[1.0625rem] (17px) for improved
 *     legibility on small screens (was text-base / 16px)
 *   - `body-sm` line-height bumped to leading-[1.75] for consistency
 *
 * Usage:
 *   <Typography variant="h1">Welcome to Calmorie</Typography>
 *   <Typography variant="body-sm" as="span" className="mt-1">Subtitle</Typography>
 *   <Typography variant="label-sm">SECTION HEADER</Typography>
 */

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

// ── Variant definitions ────────────────────────────────────────────────────

const typographyVariants = cva('', {
  variants: {
    variant: {
      // ── Display headings - Fraunces serif ────────────────────────────
      h1: [
        'font-display',
        'text-4xl font-semibold',
        'tracking-tight leading-tight',
        'text-ink',
        'text-balance',
      ].join(' '),

      h2: [
        'font-display',
        'text-3xl font-semibold',
        'tracking-tight leading-tight',
        'text-ink',
        'text-balance',
      ].join(' '),

      h3: [
        'font-display',
        'text-2xl font-semibold',
        'tracking-tight leading-snug',
        'text-ink',
      ].join(' '),

      // ── UI headings - Plus Jakarta Sans ──────────────────────────────
      h4: [
        'font-body',
        'text-xl font-semibold',
        'tracking-tight leading-snug',
        'text-ink',
      ].join(' '),

      h5: [
        'font-body',
        'text-lg font-semibold',
        'tracking-tight leading-snug',
        'text-ink',
      ].join(' '),

      h6: [
        'font-body',
        'text-base font-semibold',
        'tracking-tight',
        'text-ink',
      ].join(' '),

      // ── Body text ─────────────────────────────────────────────────────
      // Bumped from text-base (16px) → 17px and leading-relaxed → 1.8
      // for improved mobile legibility across paragraph-heavy content.
      body: [
        'font-body',
        'text-[1.0625rem] font-normal',
        'leading-[1.8]',
        'text-ink-secondary',
      ].join(' '),

      'body-sm': [
        'font-body',
        'text-sm font-normal',
        'leading-[1.75]',
        'text-ink-secondary',
      ].join(' '),

      // ── UI Labels ─────────────────────────────────────────────────────
      label: [
        'font-body',
        'text-sm font-medium',
        'leading-normal',
        'text-ink',
      ].join(' '),

      /**
       * label-sm - eyebrow / section header style.
       * Uppercased and letter-spaced to act as a divider or category label.
       * Use sparingly; too many create visual noise.
       */
      'label-sm': [
        'font-body',
        'text-xs font-semibold',
        'uppercase tracking-wider',
        'leading-normal',
        'text-ink-muted',
      ].join(' '),

      // ── Caption / meta text ───────────────────────────────────────────
      caption: [
        'font-body',
        'text-xs font-normal',
        'leading-normal',
        'text-ink-muted',
      ].join(' '),
    },
  },
  defaultVariants: {
    variant: 'body',
  },
})

// ── Default HTML element per variant ──────────────────────────────────────

type TypographyVariant = NonNullable<
  VariantProps<typeof typographyVariants>['variant']
>

const DEFAULT_TAG: Record<TypographyVariant, React.ElementType> = {
  h1:         'h1',
  h2:         'h2',
  h3:         'h3',
  h4:         'h4',
  h5:         'h5',
  h6:         'h6',
  body:       'p',
  'body-sm':  'p',
  label:      'span',
  'label-sm': 'span',
  caption:    'span',
}

// ── Component ─────────────────────────────────────────────────────────────

export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  /**
   * Override the rendered HTML element.
   * Useful when semantics differ from visuals:
   *   <Typography variant="h3" as="p">  (looks like h3, renders as p)
   *   <Typography variant="label" as="label">
   */
  as?: React.ElementType
}

/**
 * Typography - core text rendering component.
 *
 * @example
 * // Heading rendered as an <h1>
 * <Typography variant="h1">Welcome back</Typography>
 *
 * @example
 * // Body copy rendered as a <p> (default)
 * <Typography variant="body">Your progress today is looking great.</Typography>
 *
 * @example
 * // Section label - rendered as a <span> by default
 * <Typography variant="label-sm">TODAY'S MEALS</Typography>
 *
 * @example
 * // Semantic override - looks like a body paragraph, renders as a <span>
 * <Typography variant="body-sm" as="span">Note: estimated calories.</Typography>
 */
function Typography({
  variant = 'body',
  as,
  className,
  children,
  ...props
}: TypographyProps) {
  const resolvedVariant = variant as TypographyVariant
  const Element = as ?? DEFAULT_TAG[resolvedVariant] ?? 'p'

  return (
    <Element
      className={cn(typographyVariants({ variant }), className)}
      {...props}
    >
      {children}
    </Element>
  )
}

// ── Exports ────────────────────────────────────────────────────────────────

export { Typography, typographyVariants }
export type { TypographyVariant }
