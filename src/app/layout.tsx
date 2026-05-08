import type { Metadata, Viewport } from 'next'
import { Fraunces, Plus_Jakarta_Sans } from 'next/font/google'
import { AppProviders } from '@/components/providers/AppProviders'
import { cn } from '@/lib/utils/cn'
import '@/styles/globals.css'

/* ── Fonts ──────────────────────────────────────────────────────────────────
 * next/font self-hosts these at build time - fully offline-capable.
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

/* ── Base path ───────────────────────────────────────────────────────────────
 * This must match basePath in next.config.mjs exactly.
 *
 * We write manifest and icon <link> tags explicitly in <head> rather than
 * using the Next.js metadata.icons / metadata.manifest API, because in
 * output: 'export' (static export) mode Next.js does NOT automatically
 * prepend basePath to those URLs when generating the HTML. The result is
 * <link rel="manifest" href="/manifest.json"> pointing at the GitHub Pages
 * domain root instead of /calmorie/manifest.json, causing a 404.
 *
 * Writing raw <link> tags with the correct prefix sidesteps this entirely.
 */
const BASE = '/calmorie'

/* ── Metadata ───────────────────────────────────────────────────────────── */
// manifest and icons are intentionally omitted here - they are handled
// via explicit <link> tags in RootLayout's <head> below.
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
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Calmorie',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Calmorie',
    title: 'Calmorie - Calm Calorie Awareness',
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
          Manifest - explicit path required for static export + basePath.
          The Next.js metadata API does not prepend basePath to manifest/icon
          URLs in output: 'export' mode, causing 404s on GitHub Pages.
          Using a raw <link> tag with the correct /calmorie/ prefix fixes this.
        */}
        <link rel="manifest" href={`${BASE}/manifest.json`} />

        {/* Favicons */}
        <link rel="icon" type="image/png" sizes="16x16" href={`${BASE}/icons/favicon-16x16.png`} />
        <link rel="icon" type="image/png" sizes="32x32" href={`${BASE}/icons/favicon-32x32.png`} />
        <link rel="icon" type="image/png" sizes="192x192" href={`${BASE}/icons/android-icon-192x192.png`} />
        <link rel="icon" type="image/png" sizes="512x512" href={`${BASE}/icons/android-icon-512x512.png`} />

        {/* Apple touch icon */}
        <link rel="apple-touch-icon" sizes="180x180" href={`${BASE}/icons/apple-touch-icon.png`} />

        {/* PWA / platform meta */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Calmorie" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="msapplication-TileColor" content="#3d7558" />
        <meta name="msapplication-TileImage" content={`${BASE}/icons/icon-144x144.png`} />
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
