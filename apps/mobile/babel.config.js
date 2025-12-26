const path = require('path');

module.exports = function (api) {
  api.cache(true);

  const srcPath = path.resolve(__dirname, 'src');

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          extensions: ['.ios.ts', '.android.ts', '.ts', '.ios.tsx', '.android.tsx', '.tsx', '.jsx', '.js', '.json'],
          alias: {
            '@': srcPath,
          },
        },
      ],
      '@babel/plugin-transform-export-namespace-from',
      'react-native-reanimated/plugin',
      ['transform-remove-console', { exclude: ['error', 'warn'] }],
    ],
  };
};
