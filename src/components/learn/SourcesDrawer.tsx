'use client'

/**
 * SourcesDrawer
 *
 * A bottom sheet listing all sources cited in a lesson.
 * Appears when the user taps "Sources" in the lesson reader.
 *
 * Design intent:
 *   – Trust-building, not intimidating. Sources are presented as
 *     readable references, not academic bibliography dumps.
 *   – Each source shows: organization, title, year (if available),
 *     and an optional note explaining its relevance.
 *   – External links open in a new tab.
 *
 * The drawer uses the same spring-physics pattern as FoodEntryForm:
 * backdrop → overlay variants, sheet → bottomSheetVariants.
 *
 * Props:
 *   isOpen   — whether the drawer is visible
 *   sources  — array of LessonSource objects from the lesson
 *   onClose  — called when the backdrop or close button is tapped
 */

import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { bottomSheetVariants, overlayVariants } from '@/lib/animations/variants'
import type { LessonSource } from '@/types/lesson'

interface SourcesDrawerProps {
  isOpen: boolean
  sources: LessonSource[]
  onClose: () => void
}

export function SourcesDrawer({ isOpen, sources, onClose }: SourcesDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ──────────────────────────────────────── */}
          <motion.div
            key="sources-backdrop"
            variants={overlayVariants}
            initial="initial"
            animate="enter"
            exit="exit"
            className="fixed inset-0 z-[300] bg-black/40"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* ── Sheet ─────────────────────────────────────────── */}
          <motion.div
            key="sources-sheet"
            variants={bottomSheetVariants}
            initial="initial"
            animate="enter"
            exit="exit"
            className={cn(
              'fixed inset-x-0 bottom-0 z-[310]',
              'bg-surface rounded-t-2xl shadow-xl',
              'pb-[env(safe-area-inset-bottom,0px)]',
              'max-h-[75dvh] flex flex-col',
            )}
            role="dialog"
            aria-modal="true"
            aria-label="Lesson sources"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 shrink-0" aria-hidden="true">
              <div className="w-10 h-1 bg-border rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border shrink-0">
              <div>
                <h2 className="font-body text-base font-semibold text-ink">
                  Sources
                </h2>
                <p className="font-body text-xs text-ink-muted mt-0.5">
                  {sources.length} {sources.length === 1 ? 'source' : 'sources'} this lesson draws from
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center',
                  'text-ink-muted hover:bg-surface-raised hover:text-ink',
                  'transition-colors duration-fast',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
                )}
                aria-label="Close sources"
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>

            {/* Source list — scrollable */}
            <div className="overflow-y-auto overscroll-contain flex-1">
              <ul
                className="px-5 py-4 space-y-4"
                role="list"
                aria-label="Source list"
              >
                {sources.map((source, i) => (
                  <li
                    key={i}
                    className="flex flex-col gap-1.5"
                  >
                    {/* Organization — prominent */}
                    <p className="font-body text-xs font-semibold text-ink-muted uppercase tracking-wider">
                      {source.organization}
                      {source.year && (
                        <span className="font-normal normal-case tracking-normal ml-1.5 text-ink-muted">
                          · {source.year}
                        </span>
                      )}
                    </p>

                    {/* Title with link */}
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        'flex items-start gap-2 group/link',
                        'font-body text-sm text-ink leading-snug',
                        'hover:text-primary transition-colors duration-fast',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus rounded-sm',
                      )}
                      aria-label={`${source.title} — opens in new tab`}
                    >
                      <span className="flex-1 min-w-0">{source.title}</span>
                      <ExternalLink
                        className="w-3.5 h-3.5 shrink-0 mt-0.5 text-ink-muted group-hover/link:text-primary transition-colors duration-fast"
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                    </a>

                    {/* Optional relevance note */}
                    {source.note && (
                      <p className="font-body text-xs text-ink-muted leading-relaxed">
                        {source.note}
                      </p>
                    )}

                    {/* Divider (not after last item) */}
                    {i < sources.length - 1 && (
                      <hr className="border-border mt-1" />
                    )}
                  </li>
                ))}
              </ul>

              {/* Footer note */}
              <div className="px-5 pb-5 pt-1">
                <p className="font-body text-[11px] text-ink-muted text-center leading-relaxed">
                  These are the original research sources this lesson is based on. Calmorie is an independent app and is not affiliated with any of these organisations.
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
