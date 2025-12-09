module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@/components': './src/components',
            '@/screens': './src/screens',
            '@/features': './src/features',
            '@/hooks': './src/hooks',
            '@/utils': './src/utils',
            '@/services': './src/services',
            '@/stores': './src/stores',
            '@/constants': './src/constants',
            '@/types': './src/types',
            '@/config': './src/config',
            '@/theme': './src/theme',
            '@/navigation': './src/navigation',
          },
        },
      ],
      '@babel/plugin-transform-export-namespace-from',
      'react-native-reanimated/plugin',
      ['transform-remove-console', { exclude: ['error', 'warn'] }],
    ],
  };
};
