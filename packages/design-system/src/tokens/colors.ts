/**
 * Design Tokens - Colors V2
 * TravelMatch "Liquid Warmth" Design System
 *
 * Design Philosophy:
 * - Gift-giving = warmth, emotion, connection
 * - Travel = discovery, adventure, freedom
 * - Trust = reliability, transparency
 */

// ============================================
// PRIMITIVE PALETTE
// ============================================
export const primitives = {
  // Primary: Warm Orange (Gift warmth)
  orange: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#F97316', // Main
    600: '#EA580C',
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12',
  },

  // Secondary: Rose (Emotional connection)
  rose: {
    50: '#FFF1F2',
    100: '#FFE4E6',
    200: '#FECDD3',
    300: '#FDA4AF',
    400: '#FB7185',
    500: '#F43F5E', // Main
    600: '#E11D48',
    700: '#BE123C',
    800: '#9F1239',
    900: '#881337',
  },

  // Accent: Aurora Violet (Premium feel)
  violet: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D5FF',
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#A855F7', // Main
    600: '#9333EA',
    700: '#7C3AED',
    800: '#6B21A8',
    900: '#581C87',
  },

  // Trust: Emerald (Reliability)
  emerald: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981', // Main
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },

  // Info: Sky Blue
  sky: {
    50: '#F0F9FF',
    100: '#E0F2FE',
    200: '#BAE6FD',
    300: '#7DD3FC',
    400: '#38BDF8',
    500: '#0EA5E9', // Main
    600: '#0284C7',
    700: '#0369A1',
    800: '#075985',
    900: '#0C4A6E',
  },

  // Error: Red
  red: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444', // Main
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },

  // Neutral: Warm Stone
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

// ============================================
// SEMANTIC COLORS
// ============================================
export const colors = {
  // Primary Colors (Orange)
  primary: {
    50: primitives.orange[50],
    100: primitives.orange[100],
    200: primitives.orange[200],
    300: primitives.orange[300],
    400: primitives.orange[400],
    500: primitives.orange[500], // Main primary
    600: primitives.orange[600],
    700: primitives.orange[700],
    800: primitives.orange[800],
    900: primitives.orange[900],
  },

  // Secondary Colors (Rose)
  secondary: {
    50: primitives.rose[50],
    100: primitives.rose[100],
    200: primitives.rose[200],
    300: primitives.rose[300],
    400: primitives.rose[400],
    500: primitives.rose[500], // Main secondary
    600: primitives.rose[600],
    700: primitives.rose[700],
    800: primitives.rose[800],
    900: primitives.rose[900],
  },

  // Accent Colors (Violet)
  accent: {
    50: primitives.violet[50],
    100: primitives.violet[100],
    200: primitives.violet[200],
    300: primitives.violet[300],
    400: primitives.violet[400],
    500: primitives.violet[500], // Main accent
    600: primitives.violet[600],
    700: primitives.violet[700],
    800: primitives.violet[800],
    900: primitives.violet[900],
  },

  // Semantic Colors
  success: {
    50: primitives.emerald[50],
    100: primitives.emerald[100],
    200: primitives.emerald[200],
    300: primitives.emerald[300],
    400: primitives.emerald[400],
    500: primitives.emerald[500], // Main success
    600: primitives.emerald[600],
    700: primitives.emerald[700],
    800: primitives.emerald[800],
    900: primitives.emerald[900],
  },

  warning: {
    50: primitives.orange[50],
    100: primitives.orange[100],
    200: primitives.orange[200],
    300: primitives.orange[300],
    400: primitives.orange[400],
    500: primitives.orange[500], // Main warning
    600: primitives.orange[600],
    700: primitives.orange[700],
    800: primitives.orange[800],
    900: primitives.orange[900],
  },

  error: {
    50: primitives.red[50],
    100: primitives.red[100],
    200: primitives.red[200],
    300: primitives.red[300],
    400: primitives.red[400],
    500: primitives.red[500], // Main error
    600: primitives.red[600],
    700: primitives.red[700],
    800: primitives.red[800],
    900: primitives.red[900],
  },

  info: {
    50: primitives.sky[50],
    100: primitives.sky[100],
    200: primitives.sky[200],
    300: primitives.sky[300],
    400: primitives.sky[400],
    500: primitives.sky[500], // Main info
    600: primitives.sky[600],
    700: primitives.sky[700],
    800: primitives.sky[800],
    900: primitives.sky[900],
  },

  // Neutral Colors (Warm Stone)
  neutral: {
    0: primitives.stone[0],
    50: primitives.stone[50],
    100: primitives.stone[100],
    200: primitives.stone[200],
    300: primitives.stone[300],
    400: primitives.stone[400],
    500: primitives.stone[500],
    600: primitives.stone[600],
    700: primitives.stone[700],
    800: primitives.stone[800],
    900: primitives.stone[900],
    950: primitives.stone[950],
  },

  // Background Colors
  background: {
    primary: '#FFFCF7', // Warm cream
    secondary: '#FFF9F0', // Slightly warmer
    tertiary: '#FFF5E6', // Warm tint
    elevated: '#FFFFFF', // Pure white for cards
    dark: primitives.stone[950],
    darkSecondary: primitives.stone[900],
  },

  // Text Colors
  text: {
    primary: primitives.stone[900],
    secondary: primitives.stone[500],
    tertiary: primitives.stone[400],
    disabled: primitives.stone[300],
    inverse: '#FFFFFF',
  },

  // Border Colors
  border: {
    light: primitives.stone[100],
    medium: primitives.stone[200],
    dark: primitives.stone[300],
  },

  // Overlay Colors
  overlay: {
    light: 'rgba(0, 0, 0, 0.04)',
    medium: 'rgba(0, 0, 0, 0.3)',
    dark: 'rgba(0, 0, 0, 0.6)',
    backdrop: 'rgba(0, 0, 0, 0.4)',
  },

  // Trust Colors
  trust: {
    primary: primitives.emerald[500],
    light: primitives.emerald[400],
    dark: primitives.emerald[600],
    platinum: '#E5E4E2',
    gold: '#FFD700',
    silver: '#C0C0C0',
    bronze: '#CD7F32',
  },

  // Social Colors
  social: {
    apple: '#000000',
    google: '#4285F4',
    facebook: '#1877F2',
    twitter: '#1DA1F2',
    instagram: '#E4405F',
    whatsapp: '#25D366',
  },
} as const;

export type Colors = typeof colors;
