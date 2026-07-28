const path = require('path');
const { PrismaPlugin } = require('@prisma/nextjs-monorepo-workaround-plugin');

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@gauntlet/lib'],
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
