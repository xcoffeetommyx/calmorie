'use client'

/**
 * src/hooks/useRecentQuickItems.ts
 *
 * Manages the persisted list of recently logged quick-add items.
 * Stored in localStorage under `calmorie_quick_recents` as a JSON array.
 *
 * Items are QuickItem objects (name, calories, defaultMeal, lastUsedAt).
 * Deduplication is by normalised food name; max 10 items.
 */

import { useState, useCallback } from 'react'
import type { QuickItem }         from '@/types/food'
import { mergeRecentQuickItems }  from '@/lib/utils/quickAddUtils'

const STORAGE_KEY = 'calmorie_quick_recents'
const MAX_RECENTS = 10

function loadFromStorage(): QuickItem[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveToStorage(items: QuickItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Quota exceeded or private browsing — silently ignore
  }
}

interface UseRecentQuickItemsReturn {
  recentItems:    QuickItem[]
  addRecentItem:  (item: QuickItem) => void
  clearRecents:   () => void
}

export function useRecentQuickItems(): UseRecentQuickItemsReturn {
  const [recentItems, setRecentItems] = useState<QuickItem[]>(() => loadFromStorage())

  const addRecentItem = useCallback((item: QuickItem) => {
    setRecentItems((prev) => {
      const next = mergeRecentQuickItems(prev, item, MAX_RECENTS)
      saveToStorage(next)
      return next
    })
  }, [])

  const clearRecents = useCallback(() => {
    setRecentItems([])
    try { localStorage.removeItem(STORAGE_KEY) } catch { /* ignore */ }
  }, [])

  return { recentItems, addRecentItem, clearRecents }
}
