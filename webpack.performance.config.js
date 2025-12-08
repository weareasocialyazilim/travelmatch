/**
 * Webpack Bundle Analyzer Configuration
 * Analyzes bundle composition and identifies optimization opportunities
 */

const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CompressionPlugin = require('compression-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  plugins: [
    // Bundle analyzer for development
    new BundleAnalyzerPlugin({
      analyzerMode: process.env.ANALYZE === 'true' ? 'server' : 'disabled',
      analyzerPort: 8888,
      openAnalyzer: true,
      generateStatsFile: true,
      statsFilename: 'bundle-stats.json',
      reportFilename: 'bundle-report.html',
      statsOptions: {
        source: false,
        reasons: true,
        modules: true,
        chunks: true,
        children: false,
      },
    }),

    // Gzip compression
    new CompressionPlugin({
      filename: '[path][base].gz',
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 10240, // Only compress files > 10KB
      minRatio: 0.8,
    }),

    // Brotli compression (better than gzip)
    new CompressionPlugin({
      filename: '[path][base].br',
      algorithm: 'brotliCompress',
      test: /\.(js|css|html|svg)$/,
      compressionOptions: {
        level: 11,
      },
      threshold: 10240,
      minRatio: 0.8,
    }),
  ],

  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: process.env.NODE_ENV === 'production',
            drop_debugger: true,
            pure_funcs: ['console.log', 'console.debug'],
          },
          mangle: true,
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),
    ],

    // Split chunks for better caching
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // Vendor chunk (node_modules)
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          priority: 10,
          reuseExistingChunk: true,
        },

        // React vendor chunk
        react: {
          test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/,
          name: 'react-vendor',
          priority: 20,
          reuseExistingChunk: true,
        },

        // Common chunk (shared code)
        common: {
          minChunks: 2,
          priority: 5,
          reuseExistingChunk: true,
          enforce: true,
        },

        // Design system chunk
        designSystem: {
          test: /[\\/]packages[\\/]design-system[\\/]/,
          name: 'design-system',
          priority: 15,
          reuseExistingChunk: true,
        },
      },

      // Budget limits
      maxInitialRequests: 25,
      maxAsyncRequests: 25,
      minSize: 20000, // 20KB minimum
      maxSize: 244000, // 244KB maximum per chunk
    },

    // Runtime chunk for webpack runtime
    runtimeChunk: 'single',
  },

  performance: {
    // Performance budgets
    maxEntrypointSize: 512000, // 500KB
    maxAssetSize: 244000, // 244KB
    hints: 'error',
    assetFilter: function(assetFilename) {
      // Ignore map and media files
      return !(/\.map$/.test(assetFilename)) && !(/\.(png|jpg|jpeg|gif|svg|webp|mp4)$/.test(assetFilename));
    },
  },
};
