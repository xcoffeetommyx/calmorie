import type { Metadata, Viewport } from 'next'
import { Fraunces, Plus_Jakarta_Sans } from 'next/font/google'
import { AppProviders } from '@/components/providers/AppProviders'
import { cn } from '@/lib/utils/cn'
import '@/styles/globals.css'

/* ── Fonts ──────────────────────────────────────────────────────────────────
 * next/font self-hosts these at build time, making them fully offline-capable.
 * The `variable` option injects CSS custom properties (--font-display,
 * --font-body) that tokens.css and the Tailwind config reference.
 */
const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
})

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
})

/* ── Metadata ───────────────────────────────────────────────────────────── */
export const metadata: Metadata = {
  title: {
    default: 'Calmorie',
    template: '%s · Calmorie',
  },
  description:
    'A calm, science-informed guide to calorie awareness and healthier daily habits. Free, educational, and always gentle.',
  keywords: [
    'calorie tracking',
    'nutrition education',
    'healthy habits',
    'obesity prevention',
    'wellness',
    'food logging',
  ],
  authors: [{ name: 'Calmorie' }],
  creator: 'Calmorie',

  // PWA — Next.js prepends basePath to these paths automatically
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Calmorie',
  },

  // Icons — Next.js prepends basePath when rendering <link> and <meta> tags
  icons: {
    icon: [
      { url: '/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192x192.png',  sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png',  sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      // Windows tile
      { rel: 'msapplication-TileImage', url: '/icons/icon-144x144.png' },
    ],
  },

  // Prevent telephone auto-linking
  formatDetection: {
    telephone: false,
  },

  // Open Graph (for sharing)
  openGraph: {
    type: 'website',
    siteName: 'Calmorie',
    title: 'Calmorie — Calm Calorie Awareness',
    description:
      'Science-backed calorie awareness and healthy habit coaching. Free for everyone.',
  },
}

/* ── Viewport ───────────────────────────────────────────────────────────── */
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf9f7' },
    { media: '(prefers-color-scheme: dark)',  color: '#17130f' },
  ],
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  viewportFit: 'cover',
}

/* ── Root Layout ────────────────────────────────────────────────────────── */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={cn(fraunces.variable, plusJakartaSans.variable)}
      suppressHydrationWarning
    >
      <head>
        {/*
          Windows tile colour — not covered by Next.js metadata API.
          The basePath is NOT prepended to content= values here, but
          msapplication-TileColor is a plain colour, not a path.
        */}
        <meta name="msapplication-TileColor" content="#3d7558" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Calmorie" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>

      <body
        className={cn(
          'font-body antialiased',
          'bg-background text-ink',
          'min-h-screen-dynamic',
          'overflow-x-hidden',
        )}
      >
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  )
}
