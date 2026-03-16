'use client'

/**
 * SideNav
 *
 * Fixed left-rail navigation for desktop/tablet (lg+ breakpoints).
 * Hidden on mobile — BottomNav renders instead.
 *
 * Structure:
 *   ┌─────────────┐
 *   │  Brand mark │  ← h-[--top-bar-height], border-b
 *   ├─────────────┤
 *   │  Nav items  │  ← flex-1, scrollable
 *   ├─────────────┤
 *   │  Support    │  ← shrink-0, border-t
 *   │  Version    │
 *   └─────────────┘
 *
 * Active state:
 *   – Full-row background highlight (bg-primary-light)
 *   – Left accent bar (3px, rounded, bg-primary) using layoutId spring
 *   – Heavier icon strokeWidth when active
 *
 * Width: var(--desktop-sidebar-width) = 256px (set in tokens.css)
 *
 * Token references (all verified):
 *   bg-surface, border-border, bg-primary-light, text-primary-text,
 *   text-primary, text-ink-secondary, text-ink-muted,
 *   hover:bg-surface-raised, hover:text-ink
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
  Leaf,
  Heart,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { type LucideIcon } from 'lucide-react'

interface NavItem {
  href: string
  label: string
  Icon: LucideIcon
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', Icon: Home },
  { href: '/learn',     label: 'Learn',     Icon: BookOpen },
  { href: '/log',       label: 'Food Log',  Icon: UtensilsCrossed },
  { href: '/checkin',   label: 'Check in',  Icon: ClipboardList },
  { href: '/settings',  label: 'Settings',  Icon: Settings },
]

export function SideNav({ className }: { className?: string }) {
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        // Position: fixed left column, full height
        'fixed left-0 top-0 bottom-0 z-[200]',
        'w-[var(--desktop-sidebar-width)]',
        // Surface
        'bg-surface border-r border-border',
        // Safe area (notch top, home bar bottom)
        'pt-[env(safe-area-inset-top,0px)]',
        'pb-[env(safe-area-inset-bottom,0px)]',
        // Layout
        'flex flex-col',
        // Hidden on mobile, shown on desktop
        'hidden lg:flex',
        className,
      )}
      aria-label="Site navigation"
    >
      {/* ── Brand mark ──────────────────────────────────────────── */}
      <div
        className={cn(
          'h-[var(--top-bar-height)] shrink-0',
          'flex items-center px-5',
          'border-b border-border',
        )}
      >
        <Link
          href="/dashboard"
          className={cn(
            'flex items-center gap-2.5',
            'rounded-lg',
            'focus-visible:outline-none focus-visible:ring-2',
            'focus-visible:ring-border-focus focus-visible:ring-offset-1',
          )}
          aria-label="Calmorie home"
        >
          <div
            className={cn(
              'w-7 h-7 rounded-lg',
              'bg-primary flex items-center justify-center shrink-0',
            )}
          >
            <Leaf className="w-[15px] h-[15px] text-white" strokeWidth={2.25} />
          </div>
          <span className="font-display text-[15px] font-semibold text-primary tracking-tight">
            Calmorie
          </span>
        </Link>
      </div>

      {/* ── Nav items ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const isActive =
            href === '/dashboard'
              ? pathname === '/dashboard'
              : pathname === href || pathname.startsWith(`${href}/`)

          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'relative flex items-center gap-3',
                'h-10 px-3 rounded-xl',
                'font-body text-sm font-medium',
                'transition-all duration-fast ease-smooth',
                'focus-visible:outline-none focus-visible:ring-2',
                'focus-visible:ring-border-focus focus-visible:ring-inset',
                isActive
                  ? 'bg-primary-light text-primary-text'
                  : 'text-ink-secondary hover:bg-surface-raised hover:text-ink',
              )}
            >
              {/* Active accent bar — slides between items with layoutId */}
              {isActive && (
                <motion.span
                  layoutId="sidenav-accent"
                  className={cn(
                    'absolute left-0 top-1/2 -translate-y-1/2',
                    'w-[3px] h-5 rounded-full bg-primary',
                  )}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  aria-hidden="true"
                />
              )}

              <Icon
                aria-hidden="true"
                className={cn(
                  'shrink-0 transition-colors duration-fast',
                  isActive ? 'text-primary' : 'text-ink-muted',
                )}
                size={18}
                strokeWidth={isActive ? 2.25 : 1.75}
              />

              {label}
            </Link>
          )
        })}
      </div>

      {/* ── Footer: support link + version ───────────────────────── */}
      <div className="shrink-0 border-t border-border px-3 py-3 space-y-0.5">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3',
            'h-10 px-3 rounded-xl',
            'font-body text-sm font-medium text-ink-muted',
            'hover:bg-surface-raised hover:text-ink',
            'transition-all duration-fast ease-smooth',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
          )}
        >
          <Heart
            aria-hidden="true"
            className="shrink-0 text-ink-muted"
            size={18}
            strokeWidth={1.75}
          />
          Support Calmorie
        </Link>

        <p className="px-3 pt-1 font-body text-[11px] text-ink-muted opacity-50 select-none">
          v0.1 · Free, always
        </p>
      </div>
    </nav>
  )
}
