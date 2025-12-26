module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
    ],
    overrides: [
      {
        // Only apply module-resolver to source files, not node_modules
        exclude: /node_modules/,
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
    ],
  };
};
