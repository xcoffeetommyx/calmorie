/**
 * src/stores/userStore.ts
 *
 * Zustand store for the user's profile and calorie target.
 *
 * Persistence: IndexedDB via db.userProfile (Dexie).
 * The Zustand persist middleware has been removed. Hydration is explicit:
 * AppProviders calls openDB(), then reads from Dexie and calls hydrate().
 * All mutating actions write through to Dexie asynchronously.
 *
 * The public API (hooks, selectors) is unchanged from the localStorage version.
 * Consumers need no changes.
 */

import { create } from 'zustand'
import { db, isDBOpen } from '@/lib/db'
import type { UserProfile } from '@/types/user'

// ── Store shape ────────────────────────────────────────────────────────────

interface UserState {
  profile:     UserProfile | null
  isHydrated:  boolean

  hydrate:       (profile: UserProfile | null) => void
  setProfile:    (profile: UserProfile) => void
  updateProfile: (partial: Partial<Omit<UserProfile, 'id' | 'createdAt'>>) => void
  clearProfile:  () => void
  setHydrated:   () => void
}

// ── Store ──────────────────────────────────────────────────────────────────

export const useUserStore = create<UserState>()((set, get) => ({
  profile:    null,
  isHydrated: false,

  hydrate: (profile) => set({ profile, isHydrated: true }),

  setProfile: (profile) => {
    set({ profile })
    if (isDBOpen()) {
      db.userProfile.put(profile).catch((err) =>
        console.warn('[userStore] setProfile write failed:', err)
      )
    }
  },

  updateProfile: (partial) => {
    const current = get().profile
    if (!current) return
    const updated: UserProfile = {
      ...current,
      ...partial,
      updatedAt: new Date().toISOString(),
    }
    set({ profile: updated })
    if (isDBOpen()) {
      db.userProfile.put(updated).catch((err) =>
        console.warn('[userStore] updateProfile write failed:', err)
      )
    }
  },

  clearProfile: () => {
    set({ profile: null })
    if (isDBOpen()) {
      db.userProfile.delete('local-user').catch((err) =>
        console.warn('[userStore] clearProfile write failed:', err)
      )
    }
  },

  setHydrated: () => set({ isHydrated: true }),
}))

// ── Selectors ──────────────────────────────────────────────────────────────

export const selectIsOnboarded = (state: UserState): boolean =>
  state.profile?.onboardingComplete === true

export const selectCalorieTarget = (state: UserState): number | null =>
  state.profile?.onboardingComplete ? state.profile.calorieTarget : null

export const selectDisplayName = (state: UserState): string =>
  state.profile?.name?.trim() || 'there'
