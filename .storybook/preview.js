/**
 * Storybook Preview Configuration
 * Global decorators, parameters, and theme settings
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { addDecorator, addParameters } from '@storybook/react-native';
import { COLORS } from '../src/constants/colors';

// Global decorator for consistent padding
addDecorator((Story) => (
  <View style={styles.decorator}>
    <Story />
  </View>
));

// Global parameters
addParameters({
  backgrounds: {
    default: 'light',
    values: [
      { name: 'light', value: '#ffffff' },
      { name: 'gray', value: '#f5f5f5' },
      { name: 'dark', value: '#1a1a1a' },
    ],
  },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  // Visual regression testing configuration
  chromatic: {
    // Viewports for responsive testing
    viewports: [375, 768, 1024],
    // Delay before snapshot (for animations)
    delay: 300,
    // Disable animations for consistent snapshots
    pauseAnimationAtEnd: true,
  },
});

const styles = StyleSheet.create({
  decorator: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});

export const parameters = {
  options: {
    storySort: {
      order: [
        'Introduction',
        'Design System',
        ['Colors', 'Typography', 'Spacing', 'Icons'],
        'Components',
        ['Button', 'FilterPill', 'SmartImage', 'ErrorState', 'OfflineBanner', 'BottomNav', 'Animated'],
        'Hooks',
        ['usePagination'],
        'Performance',
        'Testing',
      ],
    },
  },
};
