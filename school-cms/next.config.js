/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/proxy/:path*',
        destination: 'http://69.62.77.182:8005/:path*',
      },
    ]
  },
}
module.exports = nextConfig
