import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production optimization
  output: 'standalone',
  
  // Environment-specific API URL
  env: {
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:5000/api',
    BACKEND_URL: process.env.BACKEND_URL || 'http://localhost:5000',
  },

  // Security headers
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
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Webpack configuration for development
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

export default nextConfig;
