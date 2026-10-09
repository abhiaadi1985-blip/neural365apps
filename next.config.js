/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Allow images served from common CDNs and Microsoft domains
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'learn.microsoft.com' },
      { protocol: 'https', hostname: '**.microsoft.com' },
      { protocol: 'https', hostname: 'fonts.gstatic.com' },
      { protocol: 'https', hostname: '**.supabase.co' },
    ],
  },
};

module.exports = nextConfig;
