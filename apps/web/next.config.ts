import type { NextConfig } from 'next';
import { codecovNextJSWebpackPlugin } from '@codecov/nextjs-webpack-plugin';

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  // Production optimizations
  output: 'standalone',

  // Codecov Bundle Analysis
  webpack: (config, options) => {
    // Only add plugin for client-side bundle and when CODECOV_TOKEN is available
    if (!options.isServer && process.env.CODECOV_TOKEN) {
      config.plugins.push(
        codecovNextJSWebpackPlugin({
          enableBundleAnalysis: true,
          bundleName: 'travelmatch-web',
          uploadToken: process.env.CODECOV_TOKEN,
          webpack: options.webpack,
        }),
      );
    }
    return config;
  },
};

export default nextConfig;
