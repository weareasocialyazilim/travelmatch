/**
 * Color Palette
 * TravelMatch "Liquid Warmth" Design System
 * Design system colors used across all platforms
 */

// Primitive palette for internal use
const primitives = {
  orange: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#F97316',
    600: '#EA580C',
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12',
  },
  rose: {
    50: '#FFF1F2',
    100: '#FFE4E6',
    200: '#FECDD3',
    300: '#FDA4AF',
    400: '#FB7185',
    500: '#F43F5E',
    600: '#E11D48',
    700: '#BE123C',
    800: '#9F1239',
    900: '#881337',
  },
  violet: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D5FF',
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#A855F7',
    600: '#9333EA',
    700: '#7C3AED',
    800: '#6B21A8',
    900: '#581C87',
  },
  emerald: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },
  sky: {
    50: '#F0F9FF',
    100: '#E0F2FE',
    200: '#BAE6FD',
    300: '#7DD3FC',
    400: '#38BDF8',
    500: '#0EA5E9',
    600: '#0284C7',
    700: '#0369A1',
    800: '#075985',
    900: '#0C4A6E',
  },
  red: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },
  stone: {
    0: '#FFFFFF',
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
    950: '#0C0A09',
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

  // Named colors
  coral: primitives.rose[500],
  mint: primitives.emerald[500],
  lavender: primitives.violet[500],
  sky: primitives.sky[500],
  peach: primitives.orange[300],

  // Trust colors
  trust: primitives.emerald[500],
  trustLight: primitives.emerald[400],
  trustDark: primitives.emerald[600],

  // Additional colors
  orange: primitives.orange[500],
  rose: primitives.rose[500],
  violet: primitives.violet[500],
  emerald: primitives.emerald[500],

  // Metallic
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  platinum: '#E5E4E2',
} as const;

export type ColorKey = keyof typeof COLORS;
export type ColorValue = (typeof COLORS)[ColorKey];

// Export primitives for advanced use
export { primitives };
