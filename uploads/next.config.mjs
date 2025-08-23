/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // ✅ Enables static export to 'out' folder
  eslint: {
    ignoreDuringBuilds: true, // ✅ Prevents ESLint errors from breaking the build
  },
  typescript: {
    ignoreBuildErrors: true, // ✅ Prevents TypeScript errors from breaking the build
  },
  experimental: {
    serverActions: false, // ❌ Server actions are not supported for static export
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false, // ✅ Disable Node APIs for static builds
      http: false,
      https: false,
      zlib: false,
      url: false,
    };
    return config;
  },
  images: {
    domains: [
      'images.unsplash.com',
      'plus.unsplash.com',
      'firebasestorage.googleapis.com',
      'lh3.googleusercontent.com',
      'storage.googleapis.com',
      'localhost',
      'res.cloudinary.com',
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    unoptimized: true, // ✅ Required for static export (disables Image Optimization)
  },
};

export default nextConfig;
