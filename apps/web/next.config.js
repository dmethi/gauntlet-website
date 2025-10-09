const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@gauntlet/lib'],
  webpack: config => {
    config.resolve.alias['@'] = path.resolve(__dirname, './src');
    return config;
  },
  eslint: {
    // Ignore ESLint errors during builds to prevent deployment failures from existing warnings
    ignoreDuringBuilds: true,
  },
  // Ensure Prisma binaries are included in Vercel deployments
  experimental: {
    outputFileTracingIncludes: {
      '/api/cron/live-odds': [
        '../../server/generated/prisma-historical/**/*',
      ],
      '/api/cron/recap-report': [
        '../../server/generated/prisma-historical/**/*',
      ],
    },
  },
  webpack: config => {
    config.resolve.alias['@'] = path.resolve(__dirname, './src');
    return config;
  },
};

module.exports = nextConfig;
