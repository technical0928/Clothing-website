import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
    outputFileTracingRoot: __dirname,
    images: {
        // Serve images without Next's optimizer: uploaded files live behind the
        // /uploads rewrite (API + Neon) which the optimizer rejects with 400
        // (INVALID_IMAGE_OPTIMIZE_REQUEST). Raw <img src="/uploads/..."> goes
        // through the rewrite and is verified working.
        unoptimized: true,
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'placehold.co',
            port: ""
          },
          // Uploaded images are served by the API (via the /uploads rewrite).
          // The image optimizer validates rewritten external hosts against
          // remotePatterns, so the API host(s) must be allowed here.
          {
            protocol: 'https',
            hostname: 'clothing-website-server.vercel.app',
            port: ""
          },
          {
            protocol: 'https',
            hostname: '**.vercel.app',
            port: ""
          },
        ],
      },
    env: {
        NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    },
    async rewrites() {
      // Uploaded images are served by the API (Next.js production only serves
      // files that existed at build time). Proxy /uploads/* to the API so the
      // storefront can render uploads with a plain relative path.
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';
      return [
        {
          source: '/uploads/:path*',
          destination: `${apiBase}/uploads/:path*`,
        },
      ];
    },
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            {
              key: 'X-Frame-Options',
              value: 'DENY',
            },
            {
              key: 'X-Content-Type-Options',
              value: 'nosniff',
            },
            {
              key: 'X-XSS-Protection',
              value: '1; mode=block',
            },
          ],
        },
      ];
    },
};

export default nextConfig;
