/**
 * Spacing System
 * Consistent spacing values across all platforms
 */

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export type SpacingKey = keyof typeof SPACING;
export type SpacingValue = typeof SPACING[SpacingKey];

/**
 * Layout constants
 */
export const LAYOUT = {
  padding: 16,
  margin: 16,
  borderRadius: 12,
  screenPadding: 20,
  cardPadding: 16,
  headerHeight: 60,
  tabBarHeight: 60,
} as const;
