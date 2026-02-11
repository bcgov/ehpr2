/** @type {import('next').NextConfig} */

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { createSecureHeaders } = require('next-secure-headers');

module.exports = {
  output: 'export',
  experimental: {
    scrollRestoration: true,
    forceSwcTransforms: true,
  },
  reactStrictMode: true,
  poweredByHeader: false,
  generateBuildId: () => 'build', // Static build ID to prevent timestamp disclosure
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Minimize timestamp exposure in production builds
    if (!dev) {
      config.optimization.moduleIds = 'deterministic';
      config.optimization.chunkIds = 'deterministic';
    }
    return config;
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/submission/1',
        permanent: true,
      },
    ];
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          ...createSecureHeaders({
            contentSecurityPolicy: {
              directives: {
                defaultSrc: ["'self'"],
                imgSrc: ["'self'", 'data:', 'https:'],
                styleSrc: ["'self'", "'unsafe-inline'"], // Required for Tailwind and Next.js
                scriptSrc: ["'self'", "'unsafe-eval'"], // Required for Next.js development
                scriptSrcAttr: ["'none'"],
                connectSrc: [
                  "'self'",
                  'http://localhost:4000',
                  'http://localhost:8080',
                  process.env.NEXT_PUBLIC_KC_BASE ?? 'https://keycloak.freshworks.club',
                ],
                frameSrc: [
                  "'self'",
                  'http://localhost:8080',
                  process.env.NEXT_PUBLIC_KC_BASE ?? 'https://keycloak.freshworks.club',
                ],
                formAction: "'self'",
                frameAncestors: ["'self'"],
                workerSrc: ["'self'", 'blob:'],
                objectSrc: ["'none'"],
                baseUri: ["'self'"],
                upgradeInsecureRequests: [],
              },
            },
            frameGuard: 'deny',
            noopen: 'noopen',
            nosniff: 'nosniff',
            xssProtection: 'block-rendering',
            forceHTTPSRedirect: [true, { maxAge: 60 * 60 * 24 * 360, includeSubDomains: true }],
            referrerPolicy: 'same-origin',
          }),
          // Additional headers for Spectre protection and security
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none' // More permissive than require-corp
          },
          {
            key: 'Cross-Origin-Opener-Policy', 
            value: 'same-origin-allow-popups' // Allows popups for auth flows
          },
          {
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin' // More permissive for resources
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()'
          }
        ],
      },
    ];
  },
};
