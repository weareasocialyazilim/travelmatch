module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./apps/mobile/src'],
          alias: {
            '@': './apps/mobile/src',
            '@/components': './apps/mobile/src/components',
            '@/screens': './apps/mobile/src/screens',
            '@/features': './apps/mobile/src/features',
            '@/hooks': './apps/mobile/src/hooks',
            '@/utils': './apps/mobile/src/utils',
            '@/services': './apps/mobile/src/services',
            '@/stores': './apps/mobile/src/stores',
            '@/constants': './apps/mobile/src/constants',
            '@/types': './apps/mobile/src/types',
            '@/config': './apps/mobile/src/config',
            '@/theme': './apps/mobile/src/theme',
            '@/navigation': './apps/mobile/src/navigation',
          },
        },
      ],
      '@babel/plugin-transform-export-namespace-from',
      'react-native-reanimated/plugin',
      ['transform-remove-console', { exclude: ['error', 'warn'] }],
    ],
  };
};
