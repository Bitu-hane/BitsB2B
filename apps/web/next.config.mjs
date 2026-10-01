import path from 'node:path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  devIndicators: false,
  output: 'export',
  images: {
    unoptimized: true,
  },
  experimental: {
    serverSourceMaps: false,
  },
};

export default nextConfig;
