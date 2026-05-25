import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['next-mdx-remote'],
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
