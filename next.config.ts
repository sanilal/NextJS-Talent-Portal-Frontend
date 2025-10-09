/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: '*.amazonaws.com',
        pathname: '/**',
      },
    ],
  },
  
  // Enable experimental features if needed
  experimental: {
    // serverActions: true,
  },

  // Environment variables exposed to the browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  },

  // Redirect configuration
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/dashboard/talent',
        permanent: false,
      },
    ];
  },

  // Custom webpack configuration if needed
  webpack: (config) => {
    // Add any custom webpack config here
    return config;
  },
};

module.exports = nextConfig;