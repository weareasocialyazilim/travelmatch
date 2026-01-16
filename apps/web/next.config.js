/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // Vercel build sırasında ESLint hatalarını ignore et
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  // Vercel optimizations
  poweredByHeader: false,
  compress: true,
};

module.exports = nextConfig;
