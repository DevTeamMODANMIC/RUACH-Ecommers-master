/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: true,
  },
  webpack: (config) => {
    // Handle the fs module which is used by the Cloudinary Node.js SDK
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      http: false,
      https: false,
      zlib: false,
      url: false,
      stream: false,
      crypto: false,
      buffer: false,
      util: false,
      querystring: false,
      events: false,
      string_decoder: false,
      path: false,
      os: false,
      assert: false,
      constants: false,
      domain: false,
      punycode: false,
    };
    return config;
  },
  images: {
    domains: [
      'images.unsplash.com',
      'firebasestorage.googleapis.com',
      'lh3.googleusercontent.com',
      'storage.googleapis.com',
      'localhost',
      'res.cloudinary.com'
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  }
}

export default nextConfig
