import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Suppress the specific middleware warning if it's a false positive
  // This helps clean up your deployment logs on Vercel
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  
  // 2. Ensure images from external URLs (like site favicons) work if you add them later
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // 3. Recommended for React 19 / Next 16 stability
  reactStrictMode: true,
};

export default nextConfig;