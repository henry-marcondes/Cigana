/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
      {
        source: '/media/:path*',
        destination: 'http://localhost:3001/media/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
