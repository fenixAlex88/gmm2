/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      allowedOrigins: ["office.baes.by"],
    },
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'optim.tildacdn.biz' },
      { protocol: 'https', hostname: 'static.tildacdn.biz' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
    ],
  },
};

export default nextConfig;