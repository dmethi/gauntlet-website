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
      '/api/**/*': [
        '../server/generated/prisma-historical/**/*',
        '../server/node_modules/.prisma/client/**/*',
        '../server/node_modules/@prisma/client/**/*',
      ],
    },
  },
};

module.exports = nextConfig;
