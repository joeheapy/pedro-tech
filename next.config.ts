import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // This line ignores TypeScript errors during the build process
  // It's useful for development but should be used with caution in production
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        port: '',
        pathname: '/**',
        hostname: 'img.clerk.com',
      },
    ],
  },
}

export default nextConfig
