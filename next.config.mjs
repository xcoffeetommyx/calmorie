/** @type {import('next').NextConfig} */

const repo = "calmorie";

const nextConfig = {
  output: "export",
  basePath: `/${repo}`,
  assetPrefix: `/${repo}/`,
  images: {
    unoptimized: true
  }
};

export default nextConfig;
