module.exports = function (api) {
  api.cache(true);

  const isProduction = process.env.NODE_ENV === 'production';

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Module resolver MUST come before reanimated plugin
      [
        'module-resolver',
        {
          root: ['.'],
          extensions: ['.ios.ts', '.android.ts', '.ts', '.ios.tsx', '.android.tsx', '.tsx', '.jsx', '.js', '.json'],
          alias: {
            '@': './src',
            '@/config': './src/config',
            '@/components': './src/components',
            '@/screens': './src/screens',
            '@/features': './src/features',
            '@/hooks': './src/hooks',
            '@/utils': './src/utils',
            '@/services': './src/services',
            '@/stores': './src/stores',
            '@/constants': './src/constants',
            '@/types': './src/types',
            '@/theme': './src/theme',
            '@/navigation': './src/navigation',
            '@/context': './src/context',
          },
        },
      ],
      // Remove console logs in production for performance
      // Keep console.error and console.warn for production debugging
      ...(isProduction
        ? [
            [
              'transform-remove-console',
              {
                exclude: ['error', 'warn'],
              },
            ],
          ]
        : []),
      // Reanimated MUST be last
      'react-native-reanimated/plugin',
    ],
    // Exclude __mocks__ from production build
    ...(isProduction && {
      ignore: [
        '**/__mocks__/**',
        '**/__tests__/**',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
      ],
    }),
  };
};
