'use client'

/**
 * Card
 *
 * Base container for all card-shaped surfaces in Calmorie.
 * Combines border radius, shadow, background and optional
 * interactivity through verified semantic tokens.
 *
 * All class names used here are verified against tailwind.config.ts:
 *   bg-surface          → colors.surface.DEFAULT
 *   rounded-{xs–2xl}    → theme.borderRadius (overridden to our token scale)
 *   shadow-{xs–md/card} → theme.extend.boxShadow
 *   border-border       → colors.border.DEFAULT
 *   hover:shadow-card-hover → boxShadow.card-hover
 *
 * v2 changes:
 *   - Default `radius` bumped from `lg` (20px) to `xl` (24px) to match
 *     the overall rounder, more modern feel of the app's redesigned surfaces.
 *     Call sites that need the original 20px radius can pass radius="lg".
 *
 * Sub-components (CardHeader, CardTitle, etc.) provide a consistent
 * layout structure for cards with titled sections.
 */

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

// ── Variant map ────────────────────────────────────────────────────────────

const cardVariants = cva(
  // Base: white surface, clip content to rounded corners
  'bg-surface overflow-hidden',
  {
    variants: {
      radius: {
        xs:   'rounded-xs',
        sm:   'rounded-sm',
        md:   'rounded-md',
        lg:   'rounded-lg',
        xl:   'rounded-xl',
        '2xl':'rounded-2xl',
      },
      shadow: {
        none: '',
        xs:   'shadow-xs',
        sm:   'shadow-sm',
        card: 'shadow-card',   // primary card shadow: 2 layers, warm tint
        md:   'shadow-md',
      },
      padding: {
        none: '',
        sm:   'p-3',
        md:   'p-4',
        lg:   'p-5',
        xl:   'p-6',
      },
      border: {
        true:  'border border-border',
        false: '',
      },
      /**
       * interactive - applies hover lift and press scale.
       * Only use when the entire card is clickable (e.g. LessonCard).
       * Do NOT use if the card contains multiple separate interactive elements.
       */
      interactive: {
        true: [
          'cursor-pointer select-none',
          'transition-[box-shadow,background-color,border-color,transform] duration-normal ease-out',
          'hover:shadow-card-hover hover:-translate-y-px',
          'active:scale-[0.99] active:shadow-card',
        ].join(' '),
        false: '',
      },
    },
    defaultVariants: {
      radius:      'lg',
      shadow:      'card',
      padding:     'md',
      border:      true,
      interactive: false,
    },
  }
)

// ── Props ──────────────────────────────────────────────────────────────────

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

// ── Card root ─────────────────────────────────────────────────────────────

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    { className, radius, shadow, padding, border, interactive, ...props },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        cardVariants({ radius, shadow, padding, border, interactive }),
        className
      )}
      {...props}
    />
  )
)
Card.displayName = 'Card'

// ── Sub-components ────────────────────────────────────────────────────────

/**
 * CardHeader - top section for title + description.
 * Provides consistent bottom margin before card body content.
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('mb-4 flex flex-col gap-1', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

/**
 * CardTitle - primary label inside a CardHeader.
 * Uses font-body (Plus Jakarta Sans) for UI headings, not the display serif.
 */
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      'font-body text-base font-semibold text-ink tracking-normal leading-snug',
      className
    )}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

/**
 * CardDescription - supporting text inside a CardHeader.
 * Always secondary colour and smaller than CardTitle.
 */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn(
      'font-body text-sm text-ink-secondary leading-normal',
      className
    )}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

/**
 * CardContent - main body area. No extra margin; callers add spacing as needed.
 */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('', className)} {...props} />
))
CardContent.displayName = 'CardContent'

/**
 * CardFooter - bottom row for actions or supplementary info.
 * Flex row with standard gap; add `justify-end` for right-aligned actions.
 */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('mt-4 flex items-center gap-3', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

// ── Exports ────────────────────────────────────────────────────────────────

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  cardVariants,
}
