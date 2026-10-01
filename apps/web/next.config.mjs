import path from 'node:path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  output: 'export',
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: path.resolve('.'),
  },
};

export default nextConfig;
