const isProd = process.env.GITHUB_PAGES === "true";

const nextConfig = {
  output: "export",
  basePath: isProd ? "/calmorie" : "",
  assetPrefix: isProd ? "/calmorie/" : "",
};

export default nextConfig;
