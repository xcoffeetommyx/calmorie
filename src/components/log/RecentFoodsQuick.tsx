'use client'

/**
 * RecentFoodsQuick
 *
 * Two-speed quick-add strip for rapid food logging.
 *
 * Chip behaviour:
 *   mode='instant'  → logs immediately; chip scales briefly then shows
 *                     ✓ +{cal} kcal for 1.5 s, then resets
 *   mode='prefill'  → opens FoodEntryForm pre-filled with name + calories
 *
 * Chip ordering:
 *   1. Recent items (from useRecentQuickItems)
 *   2. Common foods sorted by time-of-day affinity (not already in recents)
 *   3. "+ Custom" chip at the end
 *
 * Visual separator: faint divider between recents and common foods.
 */

import { useState, useRef, useCallback }             from 'react'
import { motion }                                     from 'framer-motion'
import { Check, Plus }                               from 'lucide-react'
import { cn }                                        from '@/lib/utils/cn'
import { getCommonFoods }                            from '@/data/commonFoods'
import { normalizeFoodName, getTimePeriod, getTimeOfDayScore } from '@/lib/utils/quickAddUtils'
import type { QuickItem, MealType }                  from '@/types/food'

// ── Props ──────────────────────────────────────────────────────────────────

interface RecentFoodsQuickProps {
  /** Persisted recent items from useRecentQuickItems */
  recentItems:   QuickItem[]
  /** Instant-log: add entry immediately, no form opened */
  onInstantLog:  (item: QuickItem) => void
  /** Prefill: open form pre-filled with these values */
  onPrefill:     (item: { name: string; calories: number; meal?: MealType }) => void
  /** Open blank form for manual entry */
  onAddManually: () => void
  className?:    string
}

// ── Constants ──────────────────────────────────────────────────────────────

const JUST_LOGGED_MS  = 1500
const ANIM_DURATION_MS = 350

// ── Helpers ────────────────────────────────────────────────────────────────

function buildCommonChips(recentItems: QuickItem[]): QuickItem[] {
  const recentKeys = new Set(recentItems.map((r) => normalizeFoodName(r.name)))
  const period     = getTimePeriod()

  return getCommonFoods()
    .filter((f) => !recentKeys.has(normalizeFoodName(f.name)))
    .sort((a, b) =>
      getTimeOfDayScore(a.defaultMeal, a.category, period) -
      getTimeOfDayScore(b.defaultMeal, b.category, period)
    )
    .slice(0, Math.max(14 - recentItems.length, 6))
    .map((f): QuickItem => ({
      id:          f.id,
      name:        f.name,
      calories:    f.calories,
      defaultMeal: f.defaultMeal,
      mode:        f.mode ?? 'prefill',
      source:      'common',
    }))
}

// ── Component ──────────────────────────────────────────────────────────────

export function RecentFoodsQuick({
  recentItems,
  onInstantLog,
  onPrefill,
  onAddManually,
  className,
}: RecentFoodsQuickProps) {
  // justLoggedId: which chip is showing ✓ success state
  const [justLoggedId, setJustLoggedId] = useState<string | null>(null)
  // animatingId: which chip is running the scale-pulse animation
  const [animatingId,  setAnimatingId]  = useState<string | null>(null)

  const logTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const animTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const commonChips = buildCommonChips(recentItems)
  const hasRecents  = recentItems.length > 0

  const handleChipClick = useCallback((item: QuickItem) => {
    if (item.mode === 'instant') {
      if (logTimerRef.current)  clearTimeout(logTimerRef.current)
      if (animTimerRef.current) clearTimeout(animTimerRef.current)

      setJustLoggedId(item.id)
      setAnimatingId(item.id)
      onInstantLog(item)

      animTimerRef.current = setTimeout(() => setAnimatingId(null),  ANIM_DURATION_MS)
      logTimerRef.current  = setTimeout(() => setJustLoggedId(null), JUST_LOGGED_MS)
    } else {
      onPrefill({ name: item.name, calories: item.calories, meal: item.defaultMeal })
    }
  }, [onInstantLog, onPrefill])

  // ── Chip renderer ──────────────────────────────────────────────────────

  function renderChip(item: QuickItem, isRecent: boolean) {
    const logged    = justLoggedId === item.id
    const animating = animatingId  === item.id

    return (
      <motion.button
        key={item.id}
        type="button"
        role="listitem"
        onClick={() => handleChipClick(item)}
        disabled={logged}
        animate={animating ? { scale: [1, 1.05, 1] } : { scale: 1 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'flex items-center gap-1.5 shrink-0',
          'h-9 px-3.5 rounded-full',
          'border font-body text-xs font-medium',
          'transition-colors duration-150',
          'active:scale-[0.96]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
          logged
            ? 'bg-success-bg border-success text-success cursor-default'
            : isRecent
              ? 'bg-primary-light border-primary-mid text-primary-text hover:bg-primary-mid'
              : 'bg-surface border-border text-ink-secondary hover:bg-surface-raised hover:border-border-strong',
        )}
        aria-label={
          logged
            ? `${item.name} logged`
            : item.mode === 'instant'
              ? `Log ${item.name}, ${item.calories} kcal`
              : `Pre-fill ${item.name}, ${item.calories} kcal`
        }
      >
        {logged ? (
          // Success state: ✓ + calorie confirmation
          <>
            <Check size={12} strokeWidth={2.5} aria-hidden="true" />
            <span className="shrink-0">+{item.calories} kcal</span>
          </>
        ) : (
          // Default state
          <>
            {isRecent && (
              <span className="text-[10px] text-primary font-bold shrink-0" aria-hidden="true">↩</span>
            )}
            <span className="truncate max-w-[120px]">{item.name}</span>
            <span className={cn('font-normal shrink-0', isRecent ? 'text-primary/60' : 'text-ink-muted')}>
              {item.calories}
            </span>
          </>
        )}
      </motion.button>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      <p className="font-body text-[11px] font-semibold text-ink-muted uppercase tracking-wider px-0.5">
        Quick add
      </p>

      <div
        className="scroll-strip pb-1"
        role="list"
        aria-label="Quick-add foods"
      >
        {/* ── Recent chips ───────────────────────────────────────────── */}
        {recentItems.map((item) => renderChip(item, true))}

        {/* ── Divider between recents and common foods ─────────────── */}
        {hasRecents && commonChips.length > 0 && (
          <div
            className="shrink-0 self-center w-px h-5 bg-border mx-1"
            aria-hidden="true"
          />
        )}

        {/* ── Common food chips ───────────────────────────────────────── */}
        {commonChips.map((item) => renderChip(item, false))}

        {/* ── + Custom chip ───────────────────────────────────────────── */}
        <button
          type="button"
          role="listitem"
          onClick={onAddManually}
          className={cn(
            'flex items-center gap-1 shrink-0',
            'h-9 px-3.5 rounded-full',
            'border border-dashed border-border font-body text-xs font-medium text-ink-muted',
            'transition-all duration-fast ease-smooth',
            'hover:border-border-strong hover:text-ink-secondary',
            'active:scale-[0.96]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
          )}
          aria-label="Add custom food"
        >
          <Plus size={12} strokeWidth={2} aria-hidden="true" />
          Custom
        </button>
      </div>
    </div>
  )
}
