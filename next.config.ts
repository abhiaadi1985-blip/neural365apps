import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow images served from common CDNs and Microsoft domains
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'learn.microsoft.com' },
      { protocol: 'https', hostname: '**.microsoft.com' },
      { protocol: 'https', hostname: 'fonts.gstatic.com' },
    ],
  },
};

export default nextConfig;
