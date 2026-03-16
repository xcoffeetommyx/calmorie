'use client'

/**
 * Root route — /
 *
 * Redirects to /dashboard.
 *
 * This is a client-side redirect instead of Next.js server-side redirect()
 * because server-side redirects are not supported in static exports
 * (output: 'export'). useRouter().replace() achieves the same result
 * with no visible flash because nothing is rendered.
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard')
  }, [router])

  // Render nothing — the redirect fires immediately on mount.
  // The <body> background colour matches the app background so there
  // is no visible flicker while the redirect completes.
  return null
}
