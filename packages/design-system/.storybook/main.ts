import type { StorybookConfig } from '@storybook/react-vite';
import path from 'path';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  staticDirs: ['../public'],
  async viteFinal(config) {
    return {
      ...config,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          'react-native': 'react-native-web',
          '@expo/vector-icons': path.resolve(
            __dirname,
            '../__mocks__/expo-vector-icons.tsx',
          ),
        },
      },
      optimizeDeps: {
        ...config.optimizeDeps,
        include: [...(config.optimizeDeps?.include || []), 'react-native-web'],
        esbuildOptions: {
          ...config.optimizeDeps?.esbuildOptions,
          loader: {
            ...config.optimizeDeps?.esbuildOptions?.loader,
            '.js': 'jsx',
          },
        },
      },
    };
  },
};

export default config;
