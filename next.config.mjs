/** @type {import('next').NextConfig} */

const repo = "calmorie"

const nextConfig = {
  output: "export",
  // trailingSlash ensures GitHub Pages can serve sub-routes without a server.
  // Without it, navigating directly to /calmorie/dashboard returns a 404
  // because GitHub Pages looks for dashboard.html, not dashboard/index.html.
  trailingSlash: true,
  basePath: `/${repo}`,
  assetPrefix: `/${repo}/`,
  images: {
    unoptimized: true,
  },
}

export default nextConfig
