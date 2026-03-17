'use client'

/**
 * Root route — /
 *
 * Shows onboarding if the user has not completed it yet.
 * Shows the dashboard directly once onboarding is complete.
 *
 * Pattern:
 *   - While the store is hydrating, show a minimal branded loading screen.
 *   - Once hydrated: if not onboarded → render OnboardingFlow in place.
 *   - Once hydrated: if onboarded → render the dashboard directly.
 *
 * This avoids any router.replace() calls (which caused the previous
 * React #185 update loop) by rendering the correct component directly
 * rather than navigating imperatively.
 *
 * /onboarding and /dashboard continue to work as their own routes.
 */

import { useRouter } from 'next/navigation'
import { Leaf } from 'lucide-react'
import { useUserStore, selectIsOnboarded } from '@/stores/userStore'
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow'
import Dashboard from './(main)/dashboard/page'

export default function RootPage() {
  const isHydrated  = useUserStore((s) => s.isHydrated)
  const isOnboarded = useUserStore(selectIsOnboarded)
  const router      = useRouter()

  // Loading state while IndexedDB hydrates — keeps screen blank-free
  if (!isHydrated) {
    return (
      <div className="min-h-screen-dynamic bg-background flex items-center justify-center">
        <div className="flex items-center gap-2 animate-pulse-soft">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Leaf className="w-4 h-4 text-white" strokeWidth={2.25} aria-hidden="true" />
          </div>
          <span className="font-display text-lg font-semibold text-primary tracking-tight">
            Calmorie
          </span>
        </div>
      </div>
    )
  }

  // Not onboarded — render OnboardingFlow directly in the root route.
  // On complete, navigate to /dashboard (replaces this entry in history).
  if (!isOnboarded) {
    return (
      <OnboardingFlow
        onComplete={() => router.replace('/dashboard')}
      />
    )
  }

  // Onboarded — render the dashboard component directly
  return <Dashboard />
}
