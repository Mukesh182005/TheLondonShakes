import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // Hide framework fingerprint
  poweredByHeader: false,

  // Ignore ESLint errors during builds
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Exclude _not-found page from file tracing to avoid Windows lock/ENOENT errors
  outputFileTracingExcludes: {
    '/_not-found': ['**/*'],
    '/404': ['**/*'],
  },

  // Allow images from any domain (since users can paste URLs in admin, or seed data might use external URLs)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
    dangerouslyAllowSVG: true,
  },

  // Production security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ];
  },
};

export default withSerwist(nextConfig);
