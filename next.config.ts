import path from "node:path";
import type { NextConfig } from "next";

/**
 * User-service origin. Browser uses same-origin paths so `Set-Cookie` from the
 * backend is associated with this host. Prefer returning the access JWT in the
 * login JSON body — proxied responses may omit the `Authorization` header from JS.
 */
const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN ?? "http://localhost:8080";

/** Comma-separated extra hosts for `next dev` when tunnelling (e.g. exact ngrok URL). */
const extraDevOrigins = (process.env.NEXT_EXTRA_DEV_ORIGINS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

/** Single resolution for yjs (avoids "Yjs was already imported" with Turbopack / split chunks). */
const yjsRoot = path.join(process.cwd(), "node_modules", "yjs");

const nextConfig: NextConfig = {
  /**
   * Next blocks non-localhost dev origins by default. Without this, pages loaded via
   * ngrok often hang or show no response because `/_next/*` requests are rejected.
   */
  allowedDevOrigins: [
    "*.ngrok-free.app",
    "*.ngrok-free.dev",
    "*.ngrok.io",
    ...extraDevOrigins,
  ],
  /** Consistent CJS/ESM handling for the CRDT package. */
  transpilePackages: ["yjs", "monaco-editor", "y-monaco"],
  turbopack: {
    /** Relative path only - Turbopack does not resolve absolute Windows paths for aliases yet. */
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
