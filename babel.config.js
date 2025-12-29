module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
<<<<<<< Updated upstream
      // Module resolver for path aliases - MUST come before reanimated
      [
        'module-resolver',
        {
          root: ['./apps/mobile'],
          extensions: ['.ios.ts', '.android.ts', '.ts', '.ios.tsx', '.android.tsx', '.tsx', '.jsx', '.js', '.json'],
          alias: {
            '@': './apps/mobile/src',
            '@/config': './apps/mobile/src/config',
            '@/components': './apps/mobile/src/components',
            '@/screens': './apps/mobile/src/screens',
            '@/features': './apps/mobile/src/features',
            '@/hooks': './apps/mobile/src/hooks',
            '@/utils': './apps/mobile/src/utils',
            '@/services': './apps/mobile/src/services',
            '@/stores': './apps/mobile/src/stores',
            '@/constants': './apps/mobile/src/constants',
            '@/types': './apps/mobile/src/types',
            '@/theme': './apps/mobile/src/theme',
            '@/navigation': './apps/mobile/src/navigation',
            '@/context': './apps/mobile/src/context',
          },
        },
      ],
      // Reanimated MUST be last
=======
>>>>>>> Stashed changes
      'react-native-reanimated/plugin',
    ],
    // Exclude node_modules from root babel config processing
    // React Native's Flow types must be handled by babel-preset-expo in apps/mobile
    ignore: [/node_modules/],
  };
};
