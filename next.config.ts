/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["office.baes.by", '192.168.213.130'],
  experimental: {
    serverActions: {
      allowedOrigins: ["office.baes.by", '192.168.213.130'],
    },
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    qualities: [10, 20, 50, 75, 90],
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
    ],
  },
};

export default nextConfig;