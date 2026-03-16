'use client'

/**
 * AppShell
 *
 * Root structural wrapper for all post-onboarding pages.
 * Composes the full-page layout including sidebar (desktop),
 * bottom navigation (mobile), and the main scrolling content area.
 *
 * Layout breakdown:
 *
 *   Mobile (< lg):
 *     ┌──────────────────┐
 *     │   main content   │  ← scrolls naturally, pb-safe-nav clears BottomNav
 *     └──────────────────┘
 *     [  BottomNav fixed  ]
 *
 *   Desktop (lg+):
 *     [SideNav fixed left]┌──────────────────┐
 *                         │   main content   │  ← pl-[sidebar-width], no bottom nav
 *                         └──────────────────┘
 *
 * Safe area notes:
 *   - Top safe area is applied within each page's TopBar (sticky header)
 *   - Bottom safe area is handled by pb-safe-nav (mobile) or SideNav (desktop)
 *   - SideNav and BottomNav apply their own safe area insets internally
 *
 * Token references (all verified):
 *   bg-background              → colors.background.DEFAULT
 *   lg:pl-[var(...)]           → --desktop-sidebar-width = 256px
 *   pb-safe-nav                → globals.css component: 64px + safe-bottom + 1.5rem
 */

import { type ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'
import { BottomNav } from './BottomNav'
import { SideNav } from './SideNav'

interface AppShellProps {
  children: ReactNode
  className?: string
}

export function AppShell({ children, className }: AppShellProps) {
  return (
    <div className={cn('relative min-h-screen-dynamic bg-background', className)}>

      {/* Desktop sidebar — renders itself as fixed; hidden on mobile */}
      <SideNav />

      {/* Main content column */}
      <main
        id="main-content"
        className={cn(
          'flex flex-1 flex-col',
          // Desktop: offset content right to clear the fixed sidebar
          'lg:pl-[var(--desktop-sidebar-width)]',
          // Mobile: pad bottom so content isn't hidden behind the fixed BottomNav
          // lg:pb-0 overrides pb-safe-nav at desktop breakpoint (utilities > components)
          'pb-safe-nav lg:pb-0',
        )}
      >
        {children}
      </main>

      {/* Mobile bottom nav — renders itself as fixed; hidden on desktop */}
      <BottomNav />
    </div>
  )
}
