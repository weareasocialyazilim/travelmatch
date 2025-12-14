/**
 * Border Radii Constants
 */

export const RADII = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,
} as const;

export type RadiiKey = keyof typeof RADII;
export type RadiiValue = (typeof RADII)[RadiiKey];

export default RADII;
