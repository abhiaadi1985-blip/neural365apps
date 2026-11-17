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
  async redirects() {
    return [
      {
        source: '/guides/copilot-studio-autonomous-agents-architecture',
        destination: '/guides/copilot-studio-autonomous-agents-triggers',
        permanent: true,
      },
      {
        source: '/blog/copilot-studio-autonomous-agents-architecture',
        destination: '/blog/copilot-studio-autonomous-agents-triggers',
        permanent: true,
      },
      {
        source: '/guides/d365-finance-autonomous-reconciliation-architecture',
        destination: '/guides/advanced-bank-reconciliation-engine',
        permanent: true,
      },
      {
        source: '/blog/d365-finance-autonomous-reconciliation-architecture',
        destination: '/blog/advanced-bank-reconciliation-engine',
        permanent: true,
      },
      {
        source: '/guides/dataverse-fabric-direct-lake-unified-analytics',
        destination: '/guides/dataverse-fabric-link-architecture',
        permanent: true,
      },
      {
        source: '/blog/dataverse-fabric-direct-lake-unified-analytics',
        destination: '/blog/dataverse-fabric-link-architecture',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
