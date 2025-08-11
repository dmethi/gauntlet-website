const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // Use fallback so real Next.js API routes (e.g., /api/team/[id]) take precedence.
    return {
      fallback: [
        {
          source: '/api/:path*',
          destination: 'http://localhost:3001/api/:path*',
        },
      ],
    };
  },
  webpack: config => {
    config.resolve.alias['@'] = path.resolve(__dirname, './src');
    return config;
  },
};

module.exports = nextConfig;
