const path = require('path');
const { PrismaPlugin } = require('@prisma/nextjs-monorepo-workaround-plugin');

/**
 * Baseline security headers applied to every response.
 *
 * Deliberately limited to directives that cannot break a working page:
 * they restrict what a *browser* is allowed to do with our response, not what
 * our own code may load.
 *
 * Content-Security-Policy is deliberately absent. It is the one header here
 * that can break the app - Vercel Analytics, Speed Insights, the `next-themes`
 * inline script, and Framer Motion's injected styles all need explicit
 * allowances - and getting it right needs production measurement via a
 * report-only rollout. Tracked as a follow-up brief, not shipped blind.
 */
const BASELINE_SECURITY_HEADERS = [
  // Stop browsers from MIME-sniffing a response into a different content type.
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Send the full URL to our own origin, only the origin cross-site.
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Legacy clickjacking defence. The site is never framed by design.
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // No route requests these; deny them so an injected script cannot either.
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

/**
 * HSTS is only meaningful over HTTPS and is actively unhelpful on a local
 * `next start`, where it would pin `localhost` to HTTPS in the developer's
 * browser for two years. `VERCEL_ENV` is set on every Vercel deployment
 * (production, preview, and development) and on nothing else, so it is the
 * cleanest available "am I deployed" signal.
 *
 * Vercel already sets HSTS on `*.vercel.app`; declaring it here keeps the
 * guarantee if a custom domain is added later.
 */
const securityHeaders = () =>
  process.env.VERCEL_ENV
    ? [
        ...BASELINE_SECURITY_HEADERS,
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
      ]
    : BASELINE_SECURITY_HEADERS;

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@gauntlet/lib'],
  // Next sets `X-Powered-By: Next.js` by default, which tells an attacker which
  // framework's advisories to try without telling a user anything.
  poweredByHeader: false,
  webpack: (config, { isServer }) => {
    config.resolve.alias['@'] = path.resolve(__dirname, './src');

    if (isServer) {
      // Add Prisma plugin to handle monorepo setup
      config.plugins = [...config.plugins, new PrismaPlugin()];
    }

    return config;
  },
  eslint: {
    // Ignore ESLint errors during builds to prevent deployment failures from existing warnings
    ignoreDuringBuilds: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders(),
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/matchup/:matchupId',
        has: [
          { type: 'query', key: 'leagueId', value: '(?<leagueId>.*)' },
          { type: 'query', key: 'week', value: '(?<week>.*)' },
        ],
        destination: '/matchups/:leagueId/:week/:matchupId',
        permanent: true,
      },
      {
        // Old route defaulted to the Gauntlet AFC league when leagueId was omitted.
        source: '/matchup/:matchupId',
        has: [{ type: 'query', key: 'week', value: '(?<week>.*)' }],
        missing: [{ type: 'query', key: 'leagueId' }],
        destination: '/matchups/1263744209295245312/:week/:matchupId',
        permanent: true,
      },
      {
        // Old route defaulted to week 1 when the week query param was omitted.
        source: '/matchup/:matchupId',
        missing: [{ type: 'query', key: 'week' }],
        destination: '/matchups/1263744209295245312/1/:matchupId',
        permanent: true,
      },
      {
        // Hall of Fame data was never season-scoped (it always spans every
        // registered season), so the "2025 archive" was just a duplicate of
        // the live page under a different URL. Redirect instead of
        // maintaining two copies of the same view.
        source: '/archive/2025/hall-of-fame',
        destination: '/hall-of-fame-enhanced',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
