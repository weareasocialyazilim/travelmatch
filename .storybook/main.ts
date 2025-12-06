/**
 * Storybook Main Configuration
 * For React Native with web preview support
 */
import type { StorybookConfig } from '@storybook/react-webpack5';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-react-native-web',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  staticDirs: ['../assets'],
  webpackFinal: async (config) => {
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        'react-native$': 'react-native-web',
        '@': require('path').resolve(__dirname, '../src'),
      };

      config.resolve.extensions = [
        '.web.tsx',
        '.web.ts',
        '.tsx',
        '.ts',
        '.web.js',
        '.js',
        '.json',
      ];
    }

    // Handle React Native specific modules
    if (config.module?.rules) {
      config.module.rules.push({
        test: /\.(js|jsx|ts|tsx)$/,
        exclude:
          /node_modules\/(?!(react-native-reanimated|react-native-gesture-handler)\/).*/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
              '@babel/preset-typescript',
            ],
            plugins: ['react-native-web'],
          },
        },
      });
    }

    return config;
  },
};

export default config;
