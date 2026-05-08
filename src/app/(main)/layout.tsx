/**
 * (main) Route Group Layout
 *
 * Shared structural layout for all post-onboarding pages:
 *   /dashboard, /learn, /log, /checkin, /settings
 *
 * Responsibilities:
 *   1. Wraps all main pages in <AppShell> (sidebar + bottom nav + safe areas)
 *   2. Wraps page content in <PageTransition> for smooth route changes
 *
 * Onboarding gate (Phase 2):
 *   When userStore is implemented, add a client-side check here:
 *   if (!profile?.onboardingComplete) redirect('/onboarding')
 *   This must be done in a client component child - Server Components
 *   cannot read from IndexedDB/Zustand stores.
 *
 * This file itself is a Server Component (no 'use client').
 * AppShell and PageTransition are Client Components and are
 * imported and composed correctly here.
 */

import { type ReactNode } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { PageTransition } from '@/components/layout/PageTransition'

interface MainLayoutProps {
  children: ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <AppShell>
      <PageTransition>
        {children}
      </PageTransition>
    </AppShell>
  )
}
