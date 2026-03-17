import withPWAInit from '@ducanh2912/next-pwa'

/** @type {import('next').NextConfig} */

const repo = 'calmorie'

// Service worker scope must match the GitHub Pages basePath so the SW
// controls all pages under /calmorie/.
const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  cacheOnFrontEndNav: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
    scope: `/${repo}/`,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts',
          expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
        },
      },
      {
        urlPattern: /\.(?:json)$/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'static-data',
          expiration: { maxEntries: 64, maxAgeSeconds: 60 * 60 * 24 * 7 },
        },
      },
    ],
  },
})

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: `/${repo}`,
  assetPrefix: `/${repo}/`,
  images: {
    unoptimized: true,
  },
}

export default withPWA(nextConfig)
