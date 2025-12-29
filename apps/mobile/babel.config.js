module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
    plugins: [
<<<<<<< Updated upstream
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
      // Reanimated MUST be last
      'react-native-reanimated/plugin',
=======
      'react-native-reanimated/plugin',
    ],
    overrides: [
      {
        test: /\.tsx?$/,
        plugins: [
          [
            'module-resolver',
            {
              root: ['.'],
              extensions: ['.ios.ts', '.android.ts', '.ts', '.ios.tsx', '.android.tsx', '.tsx', '.jsx', '.js', '.json'],
              alias: {
                '@': './src',
              },
            },
          ],
        ],
      },
>>>>>>> Stashed changes
    ],
  };
};
