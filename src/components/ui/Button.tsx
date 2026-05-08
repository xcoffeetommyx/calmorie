'use client'

/**
 * Button
 *
 * The primary interactive control for Calmorie. All variants are
 * derived from semantic design tokens defined in tailwind.config.ts
 * and tokens.css - no hardcoded colour values.
 *
 * Variants:
 *   primary      - bg-primary (sage green)  - main CTAs
 *   secondary    - bg-primary-light         - lower-emphasis actions
 *   ghost        - transparent              - icon rows, nav items
 *   outline      - border-border            - secondary with border
 *   destructive  - bg-error                 - delete / remove
 *   link         - text-primary, underline  - inline text links
 *
 * Sizes:
 *   sm / md / lg / xl  - rectangular, radius-full pill shapes
 *   icon / icon-sm     - square, radius-full circle shapes
 */

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

// ── Variant map ────────────────────────────────────────────────────────────

const buttonVariants = cva(
  // Base styles applied to ALL variants
  [
    'inline-flex items-center justify-center gap-2',
    'font-body font-semibold',
    // Transitions - use tokens from tailwind.config.ts transitionDuration
    'transition-[background-color,border-color,color,box-shadow,transform] duration-fast ease-out',
    // Focus - accessible ring using border-focus token
    'focus-visible:outline-none',
    'focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2',
    // Disabled
    'disabled:pointer-events-none disabled:opacity-40',
    // Touch
    'select-none',
    // Press scale - all buttons respond slightly to touch
    'active:scale-[0.97]',
  ].join(' '),
  {
    variants: {
      variant: {
        /**
         * primary - sage green pill. Main page CTAs.
         * Uses: bg-primary, text-ink-on-primary, hover:bg-primary-dark
         * All tokens verified in tailwind.config.ts → colors.primary / colors.ink
         */
        primary:
          'bg-primary text-ink-on-primary rounded-lg shadow-sm hover:bg-primary-dark hover:shadow-md',

        /**
         * secondary - light green pill. Supporting actions.
         * Uses: bg-primary-light, text-primary-text, hover:bg-primary-mid
         */
        secondary:
          'bg-primary-light text-primary-text rounded-lg hover:bg-primary-mid',

        /**
         * ghost - transparent. Icon rows, nav items, low-emphasis.
         * Uses: text-ink-secondary, hover:bg-surface-raised, hover:text-ink
         */
        ghost:
          'text-ink-secondary rounded-lg hover:bg-surface-raised hover:text-ink',

        /**
         * outline - white surface with border. Secondary with visible boundary.
         * Uses: bg-surface, border-border, text-ink
         */
        outline:
          'border border-border bg-surface text-ink rounded-lg hover:bg-surface-raised hover:border-border-strong',

        /**
         * destructive - red. Delete / remove actions only.
         * Uses: bg-error, text-white (literal - error text on red is always white)
         */
        destructive:
          'bg-error text-white rounded-lg hover:opacity-90',

        /**
         * link - inline text link style. No background.
         * Uses: text-primary
         */
        link:
          'text-primary underline-offset-4 hover:underline p-0 h-auto rounded-none active:scale-100',
      },

      size: {
        sm:       'h-8  px-3 text-xs',
        md:       'h-10 px-4 text-sm',
        lg:       'h-12 px-5 text-sm',
        xl:       'h-14 px-7 text-base',
        icon:     'h-10 w-10 rounded-lg p-0',
        'icon-sm':'h-8  w-8  rounded-md p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

// ── Props ──────────────────────────────────────────────────────────────────

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * Shows a spinner and disables the button.
   * The spinner uses `animate-spin-slow` - defined in tailwind.config.ts keyframes.
   */
  isLoading?: boolean
  /** Icon placed before the label */
  leftIcon?: React.ReactNode
  /** Icon placed after the label */
  rightIcon?: React.ReactNode
}

// ── Component ──────────────────────────────────────────────────────────────

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {/* Loading spinner - replaces leftIcon when loading */}
        {isLoading ? (
          <span
            className={cn(
              'h-4 w-4 shrink-0',
              'rounded-full border-2 border-current border-t-transparent',
              'animate-spin-slow',
            )}
            aria-hidden="true"
          />
        ) : leftIcon ? (
          <span className="shrink-0" aria-hidden="true">
            {leftIcon}
          </span>
        ) : null}

        {/* Label - hidden visually when loading (spinner provides feedback) */}
        {children != null && (
          <span className={isLoading ? 'opacity-0 pointer-events-none' : undefined}>
            {children}
          </span>
        )}

        {/* Right icon - never shown while loading */}
        {!isLoading && rightIcon != null ? (
          <span className="shrink-0" aria-hidden="true">
            {rightIcon}
          </span>
        ) : null}
      </button>
    )
  }
)

Button.displayName = 'Button'

// ── Exports ────────────────────────────────────────────────────────────────

export { Button, buttonVariants }
