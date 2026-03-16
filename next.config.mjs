const isGitHubPages = process.env.GITHUB_PAGES === 'true'
const repo = 'calmorie'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: isGitHubPages ? 'export' : undefined,
  trailingSlash: isGitHubPages,
  basePath: isGitHubPages ? `/${repo}` : '',
  assetPrefix: isGitHubPages ? `/${repo}/` : '',
  images: {
    unoptimized: true,
  },
}

export default nextConfig