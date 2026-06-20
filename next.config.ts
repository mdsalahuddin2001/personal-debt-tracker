import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project to avoid Turbopack picking up a
  // stray lockfile in a parent directory.
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
