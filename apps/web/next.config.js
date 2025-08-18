const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // Only proxy to local server in development
    if (process.env.NODE_ENV === 'development') {
      return {
        fallback: [
          {
            source: '/api/:path*',
            destination: 'http://localhost:3001/api/:path*',
          },
        ],
      };
    }
    // In production, let Next.js handle all API routes
    return {
      fallback: [],
    };
  },
  webpack: config => {
    config.resolve.alias['@'] = path.resolve(__dirname, './src');
    return config;
  },
};

module.exports = nextConfig;
