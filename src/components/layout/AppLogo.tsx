/**
 * AppLogo
 *
 * Renders the Calmorie app icon PNG asset.
 * Used wherever the brand mark appears next to the "Calmorie" wordmark:
 *   – Dashboard top bar
 *   – Side nav brand row
 *   – Onboarding flow header
 *   – Loading screens
 *   – Settings About section
 *
 * Props:
 *   size      — width & height in px (default 24)
 *   className — additional Tailwind classes, typically a rounded-* utility
 *               to match the surrounding context
 */

import Image from 'next/image'
import { cn } from '@/lib/utils/cn'
import logoSrc from '../../../public/icons/calmorie-app-icon.png'

interface AppLogoProps {
  /** Width and height in pixels. Default 24. */
  size?: number
  /** Additional classes (e.g. rounded-md, rounded-lg, shrink-0). */
  className?: string
}

export function AppLogo({ size = 24, className }: AppLogoProps) {
  return (
    <Image
      src={logoSrc}
      alt="Calmorie icon"
      width={size}
      height={size}
      className={cn('object-contain', className)}
      priority
    />
  )
}
