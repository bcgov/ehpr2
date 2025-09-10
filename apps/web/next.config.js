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
        headers: createSecureHeaders({
          contentSecurityPolicy: {
            directives: {
              defaultSrc: ["'self'"],
              imgSrc: ["'self'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
              scriptSrc: ["'self'", "'unsafe-eval'"],
              connectSrc: [
                "'self'",
                'http://localhost:4000',
                'http://localhost:8080',
                'https://common-logon-test.hlth.gov.bc.ca',
                process.env.NEXT_PUBLIC_KC_BASE ?? 'https://keycloak.freshworks.club',
              ],
              frameSrc: [
                "'self'",
                'http://localhost:8080',
                'https://common-logon-test.hlth.gov.bc.ca',
              ],
              formAction: "'self'",
              frameAncestors: ["'self'"],
              workerSrc: ["'self'", 'blob:'],
            },
          },
          frameGuard: 'deny',
          noopen: 'noopen',
          nosniff: 'nosniff',
          xssProtection: 'block-rendering',
          forceHTTPSRedirect: [true, { maxAge: 60 * 60 * 24 * 360, includeSubDomains: true }],
          referrerPolicy: 'same-origin',
        }),
      },
    ];
  },
};
