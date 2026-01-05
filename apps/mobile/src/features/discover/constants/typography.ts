/**
 * Discover Feature - Typography Constants
 */

import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
});

export const TYPOGRAPHY = {
  // Preset styles
  h1: {
    fontFamily,
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontFamily,
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h3: {
    fontFamily,
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body1: {
    fontFamily,
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  body2: {
    fontFamily,
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontFamily,
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  button: {
    fontFamily,
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
    textTransform: 'uppercase' as const,
  },
  overline: {
    fontFamily,
    fontSize: 10,
    fontWeight: '500' as const,
    lineHeight: 14,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
  // Individual tokens for flexibility
  fontSizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 32,
  },
  fontWeights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;

export type TypographyKey = keyof typeof TYPOGRAPHY;
