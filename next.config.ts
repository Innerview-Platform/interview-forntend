import type { NextConfig } from "next";

/**
 * User-service origin. Browser uses same-origin paths so:
 * - `Authorization` is visible to fetch (no cross-origin)
 * - `Set-Cookie` with Path=/api/auth matches `/api/auth/*` on this host
 */
const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN ?? "http://localhost:8080";

const nextConfig: NextConfig = {
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
        source: "/api/users/:path*",
        destination: `${BACKEND_ORIGIN}/api/users/:path*`,
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
