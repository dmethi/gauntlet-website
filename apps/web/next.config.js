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
};

module.exports = nextConfig;
