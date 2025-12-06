/**
 * Storybook Preview Configuration
 * Global decorators, parameters, and theme setup
 */
import type { Preview } from '@storybook/react';
import React from 'react';
import { View, StyleSheet } from 'react-native';

// Global decorators
const withCenteredView = (Story: React.ComponentType) => (
  <View style={styles.container}>
    <Story />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const preview: Preview = {
  decorators: [withCenteredView],
  parameters: {
    // Actions configuration
    actions: { argTypesRegex: '^on[A-Z].*' },

    // Controls configuration
    controls: {
      expanded: true,
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },

    // Background options
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#FFFFFF' },
        { name: 'dark', value: '#1A1A2E' },
        { name: 'gray', value: '#F5F5F5' },
        { name: 'brand', value: '#6366F1' },
      ],
    },

    // Viewport options
    viewport: {
      viewports: {
        iphone14: {
          name: 'iPhone 14',
          styles: {
            width: '390px',
            height: '844px',
          },
        },
        iphone14ProMax: {
          name: 'iPhone 14 Pro Max',
          styles: {
            width: '430px',
            height: '932px',
          },
        },
        pixel7: {
          name: 'Pixel 7',
          styles: {
            width: '412px',
            height: '915px',
          },
        },
        ipadMini: {
          name: 'iPad Mini',
          styles: {
            width: '768px',
            height: '1024px',
          },
        },
      },
      defaultViewport: 'iphone14',
    },

    // Layout configuration
    layout: 'centered',

    // Docs configuration
    docs: {
      toc: true,
    },
  },

  // Global types for toolbar
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: ['light', 'dark'],
        dynamicTitle: true,
      },
    },
    locale: {
      description: 'Internationalization locale',
      defaultValue: 'en',
      toolbar: {
        title: 'Locale',
        icon: 'globe',
        items: [
          { value: 'en', title: 'English' },
          { value: 'tr', title: 'Türkçe' },
          { value: 'de', title: 'Deutsch' },
        ],
        dynamicTitle: true,
      },
    },
  },
};

export default preview;
