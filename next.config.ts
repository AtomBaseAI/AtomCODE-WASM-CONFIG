import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Dev-only overlay: keep the indicator out of the sidebar's bottom-left
  // corner, where it covered the settings gear icon.
  devIndicators: {
    position: "bottom-right",
  },
  // Sandbox preview gateway rewrites `x-forwarded-host` (outer fcapp.run host)
  // while the browser `origin` stays the preview-chat domain. Next.js Server
  // Actions reject that mismatch unless the origin is explicitly allowed.
  experimental: {
    serverActions: {
      allowedOrigins: [
        "*.space-z.ai",
        "preview-chat-1945cbd9-55db-4b00-b567-bac737eb3797.space-z.ai",
        "localhost:3000",
        "127.0.0.1:3000",
        "ws-fa-ebff-ceda-mdomjldeyy.cn-hongkong-vpc.fcapp.run",
        "*.cn-hongkong-vpc.fcapp.run",
      ],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        pathname: "**",
      },
      {
        // Wildcard: original student app allowed any https CDN (branding logos
        // may point at arbitrary hosts). Prevents next/image crashes.
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Client-side runtime workers may reference node-oriented packages
      // (fs/path for optional local IO) — never used in the browser, provide
      // empty fallbacks. SQLite wasm / Pyodide / ruby.wasm locate their .wasm
      // assets via runtime URLs (see workers + copy-runtime-assets.mjs).
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    return config;
  },
};

export default nextConfig;
