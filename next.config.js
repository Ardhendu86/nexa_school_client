/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['images.unsplash.com'],
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: '/admin/settings',
        destination: '/admin',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
