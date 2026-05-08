'use client'

/**
 * BottomNav
 *
 * Fixed 5-tab navigation bar rendered at the bottom of the screen on mobile.
 * Hidden on desktop (lg+) where SideNav takes over.
 *
 * Active state:
 *   – A pill background slides between tabs using Framer Motion layoutId.
 *     This creates a smooth, app-native feel without JavaScript scroll tracking.
 *   – Active icon uses slightly heavier strokeWidth for visual emphasis.
 *
 * Safe area:
 *   – Uses env(safe-area-inset-bottom) so the bar clears the iOS home indicator.
 *   – Total visual height = --bottom-nav-height (64px) + safe-area-inset-bottom.
 *
 * Token references (all verified against tailwind.config.ts):
 *   bg-surface/95         → colors.surface.DEFAULT at 95% opacity
 *   border-border         → colors.border.DEFAULT
 *   shadow-bottom-nav     → boxShadow.bottom-nav
 *   bg-primary-light      → colors.primary.light
 *   text-primary          → colors.primary.DEFAULT
 *   text-ink-muted        → colors.ink.muted
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Home,
  BookOpen,
  UtensilsCrossed,
  ClipboardList,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { type LucideIcon } from 'lucide-react'

interface NavItem {
  href: string
  label: string
  Icon: LucideIcon
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Home',     Icon: Home },
  { href: '/learn',     label: 'Learn',    Icon: BookOpen },
  { href: '/log',       label: 'Log',      Icon: UtensilsCrossed },
  { href: '/checkin',   label: 'Check in', Icon: ClipboardList },
  { href: '/settings',  label: 'More',     Icon: Settings },
]

export function BottomNav() {
  const pathname = usePathname()
  const normalizedPath = pathname?.replace(/\/$/, '') || '/'

  return (
    <nav
      className={cn(
        // Position - fixed, full width, bottom
        'fixed bottom-0 inset-x-0 z-[200]',
        // Height includes safe area for home indicator
        'pb-[env(safe-area-inset-bottom,0px)]',
        'h-auto min-h-[var(--bottom-nav-height)]',
        // Surface - /98 keeps the glass look while preventing content bleed-through
        'bg-surface/[0.98] backdrop-blur-ios',
        'border-t border-border/80 shadow-bottom-nav',
        // Layout
        'flex items-stretch px-1',
        // Hidden on desktop - SideNav takes over at lg breakpoint
        'lg:hidden',
      )}
      aria-label="Main navigation"
    >
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        // Mark /learn, /log, /checkin, /settings as active for all child routes
        const isActive =
          href === '/dashboard'
            ? normalizedPath === '/' ||
              normalizedPath === '/dashboard' ||
              normalizedPath.startsWith('/dashboard/')
            : normalizedPath === href || normalizedPath.startsWith(`${href}/`)

        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'relative flex flex-1 flex-col items-center justify-center',
              'gap-[3px] py-2 rounded-xl',
              // Focus ring
              'focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-border-focus focus-visible:ring-inset',
            )}
          >
            {/* Sliding background indicator - shared layoutId moves it between tabs */}
            {isActive && (
              <motion.span
                layoutId="bottom-nav-pill"
                className="absolute inset-x-1.5 inset-y-1 rounded-[10px] bg-primary-light"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                aria-hidden="true"
              />
            )}

            <Icon
              aria-hidden="true"
              className={cn(
                'relative z-10 transition-colors duration-fast',
                isActive ? 'text-primary' : 'text-ink-muted',
              )}
              size={22}
              strokeWidth={isActive ? 2.25 : 1.75}
            />

            <span
              className={cn(
                'relative z-10',
                'font-body text-[10px] font-medium leading-none',
                'transition-colors duration-fast',
                isActive ? 'text-primary' : 'text-ink-muted',
              )}
            >
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
