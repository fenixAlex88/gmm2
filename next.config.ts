
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'optim.tildacdn.biz',
      },
      {
        protocol: 'https',
        hostname: 'static.tildacdn.biz', // если используешь и этот
      },
    ],
  },
};

export default nextConfig;