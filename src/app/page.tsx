'use client'

/**
 * Root route — /
 *
 * Gates initial app entry based on hydration and onboarding state.
 *
 * States:
 *   hydrating   — IndexedDB not yet loaded: show branded loading screen
 *   onboarding  — profile incomplete: render OnboardingFlow in place
 *   ready       — onboarded: redirect to /dashboard via router.replace()
 *
 * Why router.replace() instead of rendering <Dashboard /> directly:
 *   Rendering the dashboard page component from this route bypasses the
 *   (main) route-group layout (AppShell / BottomNav / PageTransition).
 *   Redirecting into /dashboard means the page is always rendered through
 *   its correct layout, so the bottom nav is present from first load.
 *
 * No redirect loop:
 *   The useEffect only fires when isHydrated && isOnboarded. After
 *   router.replace('/dashboard') executes, this component unmounts.
 *   The /dashboard route does not redirect back to /.
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Leaf } from 'lucide-react'
import { useUserStore, selectIsOnboarded } from '@/stores/userStore'
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow'

function LoadingScreen() {
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

export default function RootPage() {
  const isHydrated  = useUserStore((s) => s.isHydrated)
  const isOnboarded = useUserStore(selectIsOnboarded)
  const router      = useRouter()

  // Once hydrated and onboarded, hand off to /dashboard so it renders
  // through (main)/layout.tsx and receives AppShell + BottomNav.
  useEffect(() => {
    if (isHydrated && isOnboarded) {
      router.replace('/dashboard')
    }
  }, [isHydrated, isOnboarded, router])

  // Hydrating — keep screen blank-free with branded loading state
  if (!isHydrated) {
    return <LoadingScreen />
  }

  // Not onboarded — render flow in place; on complete, enter /dashboard
  if (!isOnboarded) {
    return (
      <OnboardingFlow onComplete={() => router.replace('/dashboard')} />
    )
  }

  // Onboarded — redirect is in-flight (useEffect above), show loading
  // screen for the one render before navigation completes.
  return <LoadingScreen />
}
