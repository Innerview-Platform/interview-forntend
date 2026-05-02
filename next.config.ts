import path from "node:path";
import type { NextConfig } from "next";

/**
 * User-service origin. Browser uses same-origin paths so:
 * - `Authorization` is visible to fetch (no cross-origin)
 * - `Set-Cookie` with Path=/api/auth matches `/api/auth/*` on this host
 */
const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN ?? "http://localhost:8080";

/** Single resolution for yjs (avoids "Yjs was already imported" with Turbopack / split chunks). */
const yjsRoot = path.join(process.cwd(), "node_modules", "yjs");

const nextConfig: NextConfig = {
  /** Consistent CJS/ESM handling for the CRDT package. */
  transpilePackages: ["yjs", "monaco-editor", "y-monaco"],
  turbopack: {
    /** Relative path only — Turbopack does not resolve absolute Windows paths for aliases yet. */
    resolveAlias: {
      yjs: "./node_modules/yjs",
    },
  },
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...config.resolve.alias,
      yjs: yjsRoot,
    };
    return config;
  },
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: `${BACKEND_ORIGIN}/api/auth/:path*`,
      },
      {
        source: "/api/profile",
        destination: `${BACKEND_ORIGIN}/api/profile`,
      },
      {
        source: "/api/profile/:path*",
        destination: `${BACKEND_ORIGIN}/api/profile/:path*`,
      },
      {
        source: "/api/programming-languages",
        destination: `${BACKEND_ORIGIN}/api/programming-languages`,
      },
      {
        source: "/api/programming-languages/:path*",
        destination: `${BACKEND_ORIGIN}/api/programming-languages/:path*`,
      },
      {
        source: "/api/rooms/:path*",
        destination: `${BACKEND_ORIGIN}/api/rooms/:path*`,
      },
      {
        source: "/api/interviews/:path*",
        destination: `${BACKEND_ORIGIN}/api/interviews/:path*`,
      },
      {
        source: "/uploads/:path*",
        destination: `${BACKEND_ORIGIN}/uploads/:path*`,
      },
      {
        source: "/oauth2/:path*",
        destination: `${BACKEND_ORIGIN}/oauth2/:path*`,
      },
      {
        source: "/login/oauth2/:path*",
        destination: `${BACKEND_ORIGIN}/login/oauth2/:path*`,
      },
    ];
  },
};

export default nextConfig;
