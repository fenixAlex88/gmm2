/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["office.baes.by"],
  experimental: {
    serverActions: {
      allowedOrigins: ["office.baes.by"],
    },
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [10, 20, 50, 75, 90],
    remotePatterns: [
      { protocol: 'https', hostname: 'optim.tildacdn.biz' },
      { protocol: 'https', hostname: 'static.tildacdn.biz' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
    ],
  },
};

export default nextConfig;