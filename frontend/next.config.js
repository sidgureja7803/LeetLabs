/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: [
      'localhost',
      's3.amazonaws.com',
      'thapar-virtual-labs-files.s3.amazonaws.com',
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
        port: '',
        pathname: '**',
      },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_NAME: 'Thapar Virtual Labs',
  },
  // Enable compression
  compress: true,
  // Custom headers for security
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
  // Redirects for better SEO
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/dashboard/student',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig; 