'use client'

/**
 * InstallPrompt
 *
 * Non-intrusive PWA install prompt. Two surfaces:
 *
 * 1. Android / Chrome / Edge - listens for `beforeinstallprompt`.
 *    Shows a small bottom banner after a 4-second delay.
 *    Tapping "Install" calls prompt() for the native install dialog.
 *
 * 2. iOS Safari - `beforeinstallprompt` never fires on iOS.
 *    Shows a one-time hint card explaining Share > Add to Home Screen.
 *    Only shown on iOS Safari in non-standalone mode.
 *
 * Both prompts:
 *   – Are shown only once (dismissed state persisted in localStorage)
 *   – Appear after SHOW_DELAY_MS so they don't interrupt first load
 *   – Are fully dismissible via the �- button
 *   – Render nothing if the app is already installed (standalone mode)
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Share, Download } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const DISMISS_KEY_NATIVE = 'calmorie-install-dismissed'
const DISMISS_KEY_IOS    = 'calmorie-ios-hint-dismissed'
const SHOW_DELAY_MS      = 4000

function isIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

function isInStandaloneMode(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window.navigator as any).standalone === true
  )
}

export function InstallPrompt() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [nativeEvent, setNativeEvent] = useState<any>(null)
  const [showNative,  setShowNative]  = useState(false)
  const [showIOS,     setShowIOS]     = useState(false)

  useEffect(() => {
    if (isInStandaloneMode()) return

    if (!isIOS()) {
      if (localStorage.getItem(DISMISS_KEY_NATIVE)) return
      const handler = (e: Event) => {
        e.preventDefault()
        setNativeEvent(e)
        setTimeout(() => setShowNative(true), SHOW_DELAY_MS)
      }
      window.addEventListener('beforeinstallprompt', handler)
      return () => window.removeEventListener('beforeinstallprompt', handler)
    }

    if (isIOS() && !localStorage.getItem(DISMISS_KEY_IOS)) {
      setTimeout(() => setShowIOS(true), SHOW_DELAY_MS)
    }
  }, [])

  function handleInstall() {
    nativeEvent?.prompt()
    setShowNative(false)
    localStorage.setItem(DISMISS_KEY_NATIVE, 'true')
  }

  function dismissNative() {
    setShowNative(false)
    localStorage.setItem(DISMISS_KEY_NATIVE, 'true')
  }

  function dismissIOS() {
    setShowIOS(false)
    localStorage.setItem(DISMISS_KEY_IOS, 'true')
  }

  const bannerClass = cn(
    'fixed z-[300] left-4 right-4',
    'bottom-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom,0px)+0.75rem)]',
    'lg:bottom-6 lg:left-auto lg:right-6 lg:w-80',
  )

  return (
    <>
      {/* Android / Chrome install banner */}
      <AnimatePresence>
        {showNative && (
          <motion.div
            key="native"
            className={bannerClass}
            initial={{ opacity: 0, y: 72 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 72 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="bg-surface rounded-2xl shadow-card border border-border px-4 py-3.5 flex items-center gap-3"
              role="banner"
              aria-label="Install Calmorie as an app"
            >
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0" aria-hidden="true">
                <Download className="w-5 h-5 text-white" strokeWidth={2} />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-body text-sm font-semibold text-ink leading-snug">
                  Add to home screen
                </p>
                <p className="font-body text-xs text-ink-muted mt-0.5">
                  Works offline once installed.
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={handleInstall}
                  className={cn(
                    'h-8 px-3 rounded-full',
                    'bg-primary text-ink-on-primary font-body text-xs font-semibold',
                    'hover:bg-primary-dark transition-colors duration-fast',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
                  )}
                >
                  Install
                </button>
                <button
                  type="button"
                  onClick={dismissNative}
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center',
                    'text-ink-muted hover:text-ink hover:bg-surface-raised',
                    'transition-colors duration-fast',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
                  )}
                  aria-label="Dismiss"
                >
                  <X size={14} strokeWidth={2} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* iOS Safari hint */}
      <AnimatePresence>
        {showIOS && (
          <motion.div
            key="ios"
            className={bannerClass}
            initial={{ opacity: 0, y: 72 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 72 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="bg-surface rounded-2xl shadow-card border border-border px-4 py-4 space-y-2.5"
              role="note"
              aria-label="How to install on iOS"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0" aria-hidden="true">
                    <Share className="w-4 h-4 text-white" strokeWidth={2} />
                  </div>
                  <p className="font-body text-sm font-semibold text-ink">Add to Home Screen</p>
                </div>
                <button
                  type="button"
                  onClick={dismissIOS}
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center',
                    'text-ink-muted hover:text-ink hover:bg-surface-raised',
                    'transition-colors duration-fast',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
                  )}
                  aria-label="Dismiss"
                >
                  <X size={14} strokeWidth={2} />
                </button>
              </div>

              <p className="font-body text-xs text-ink-secondary leading-relaxed">
                In Safari, tap the{' '}
                <span className="inline-flex items-center gap-0.5 align-middle text-primary font-semibold">
                  <Share size={11} strokeWidth={2.5} aria-hidden="true" />
                  {' '}Share
                </span>
                {' '}button, then choose{' '}
                <strong className="text-ink">Add to Home Screen</strong>.
                Calmorie works offline once added.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
