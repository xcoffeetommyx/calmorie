'use client'

/**
 * TopBar
 *
 * Sticky page header used by every (main) page except Dashboard,
 * which has a custom greeting header.
 *
 * Anatomy:
 *   [left: back button or brand]  [center: title]  [right: action slot]
 *
 * The bar is backdrop-blurred and semi-transparent so content scrolls
 * naturally behind it without a hard edge.
 *
 * Token references (all verified against tailwind.config.ts):
 *   h-[var(--top-bar-height)]  → layout spacing token (56px)
 *   bg-background/90           → colors.background.DEFAULT at 90% opacity
 *   border-border              → colors.border.DEFAULT
 *   text-ink / text-ink-secondary → colors.ink
 *   hover:bg-surface-raised    → colors.surface.raised
 *   ring-border-focus          → colors.border.focus
 */

import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

interface TopBarProps {
  title: string
  /** Show a ← back button on the left */
  showBack?: boolean
  /** Arbitrary node rendered on the right (icon button, text, etc.) */
  rightAction?: React.ReactNode
  className?: string
}

export function TopBar({
  title,
  showBack = false,
  rightAction,
  className,
}: TopBarProps) {
  const router = useRouter()

  return (
    <header
      className={cn(
        // Positioning
        'sticky top-0 z-[200]',
        // Dimensions — matches --top-bar-height token
        'h-[var(--top-bar-height)]',
        // Safe area: notch / Dynamic Island
        'pt-[env(safe-area-inset-top,0px)]',
        // Surface
        'bg-background/90 backdrop-blur-ios',
        'border-b border-border',
        // Layout
        'flex items-center justify-between px-4 gap-2',
        className,
      )}
    >
      {/* ── Left slot ── */}
      <div className="w-9 flex items-center shrink-0">
        {showBack && (
          <button
            onClick={() => router.back()}
            className={cn(
              'flex items-center justify-center',
              'w-9 h-9 -ml-2 rounded-full',
              'text-ink-secondary',
              'hover:bg-surface-raised hover:text-ink',
              'transition-colors duration-fast ease-smooth',
              'focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-border-focus focus-visible:ring-offset-1',
            )}
            aria-label="Go back"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={2} />
          </button>
        )}
      </div>

      {/* ── Center: page title ── */}
      <motion.h1
        key={title}
        initial={{ opacity: 0, y: -3 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 text-center font-body text-[15px] font-semibold text-ink tracking-tight"
      >
        {title}
      </motion.h1>

      {/* ── Right slot ── */}
      <div className="w-9 flex items-center justify-end shrink-0">
        {rightAction ?? null}
      </div>
    </header>
  )
}
