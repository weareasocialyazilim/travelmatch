/**
 * Typography System
 * Font sizes, weights, and line heights
 */

export const TYPOGRAPHY = {
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },

  fontWeights: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

export type FontSize = keyof typeof TYPOGRAPHY.fontSizes;
export type FontWeight = keyof typeof TYPOGRAPHY.fontWeights;
export type LineHeight = keyof typeof TYPOGRAPHY.lineHeights;
