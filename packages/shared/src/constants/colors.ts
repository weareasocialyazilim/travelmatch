/**
 * Color Palette V2
 * TravelMatch "Liquid Warmth" Design System
 * Design system colors used across all platforms
 */

// Primitive palette for internal use
const primitives = {
  orange: {
    400: '#FB923C',
    500: '#F97316',
    600: '#EA580C',
  },
  rose: {
    400: '#FB7185',
    500: '#F43F5E',
    600: '#E11D48',
  },
  violet: {
    400: '#C084FC',
    500: '#A855F7',
    600: '#9333EA',
  },
  emerald: {
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
  },
  sky: {
    400: '#38BDF8',
    500: '#0EA5E9',
    600: '#0284C7',
  },
  red: {
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
  },
  stone: {
    50: '#FAFAF9',
    100: '#F5F5F4',
    200: '#E7E5E4',
    300: '#D6D3D1',
    400: '#A8A29E',
    500: '#78716C',
    600: '#57534E',
    700: '#44403C',
    800: '#292524',
    900: '#1C1917',
  },
} as const;

export const COLORS = {
  // Primary (Warm Orange)
  primary: primitives.orange[500],
  primaryDark: primitives.orange[600],
  primaryLight: primitives.orange[400],

  // Secondary (Rose)
  secondary: primitives.rose[500],
  secondaryDark: primitives.rose[600],
  secondaryLight: primitives.rose[400],

  // Accent (Violet)
  accent: primitives.violet[500],
  accentDark: primitives.violet[600],
  accentLight: primitives.violet[400],

  // Semantic
  success: primitives.emerald[500],
  warning: primitives.orange[500],
  error: primitives.red[500],
  info: primitives.sky[500],

  // Text
  text: primitives.stone[900],
  textSecondary: primitives.stone[500],
  textDisabled: primitives.stone[300],

  // Neutral
  white: '#FFFFFF',
  black: '#000000',
  background: '#FFFCF7', // Warm cream
  border: primitives.stone[200],

  // Grayscale
  gray50: primitives.stone[50],
  gray100: primitives.stone[100],
  gray200: primitives.stone[200],
  gray300: primitives.stone[300],
  gray400: primitives.stone[400],
  gray500: primitives.stone[500],
  gray600: primitives.stone[600],
  gray700: primitives.stone[700],
  gray800: primitives.stone[800],
  gray900: primitives.stone[900],

  // Accent colors
  coral: primitives.rose[500],
  mint: primitives.emerald[500],
  lavender: primitives.violet[500],
  sky: primitives.sky[500],
  peach: '#FDBA74', // orange[300]

  // Trust colors
  trust: primitives.emerald[500],
  trustLight: primitives.emerald[400],
  trustDark: primitives.emerald[600],
} as const;

export type ColorKey = keyof typeof COLORS;
export type ColorValue = (typeof COLORS)[ColorKey];
