'use client'

/**
 * Onboarding page — /onboarding
 *
 * Entry point for first-run profile setup.
 *
 * Guards against re-entry: if the user has already completed onboarding
 * (profile is in the store), redirect immediately to /dashboard.
 *
 * After OnboardingFlow calls onComplete:
 *   – The profile is already written to the store by useOnboarding.onSubmit()
 *   – We push to /dashboard
 *
 * Hydration note: useUserStore uses skipHydration, so isHydrated starts
 * false on the first render. We wait for hydration before checking the
 * guard, showing a minimal loading state in the meantime.
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Leaf } from 'lucide-react'
import { useUserStore, selectIsOnboarded } from '@/stores/userStore'
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow'

export default function OnboardingPage() {
  const router      = useRouter()
  const isOnboarded = useUserStore(selectIsOnboarded)
  const isHydrated  = useUserStore((s) => s.isHydrated)

  // Guard: already onboarded → skip to dashboard
  useEffect(() => {
    if (isHydrated && isOnboarded) {
      router.replace('/dashboard')
    }
  }, [isHydrated, isOnboarded, router])

  // While store is loading, show a minimal branded screen
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

  // Already onboarded (edge case: hydrated but redirect hasn't fired yet)
  if (isOnboarded) return null

  return (
    <OnboardingFlow
      onComplete={() => router.push('/dashboard')}
    />
  )
}
