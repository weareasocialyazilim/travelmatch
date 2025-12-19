/**
 * Design Tokens - Colors
 * UNIFIED TravelMatch Brand Colors
 *
 * IMPORTANT: This file is the CANONICAL source of truth for colors.
 * All platforms (mobile, web, admin) should import from here.
 *
 * Brand Identity:
 * - Primary: Coral (#FF6B6B) - Warmth, adventure, passion
 * - Secondary: Mint (#4ECDC4) - Trust, freshness, growth
 * - Accent: Lavender (#9B59B6) - Premium, unique experiences
 */

// ============================================================================
// BASE COLOR PALETTE
// ============================================================================

const palette = {
  // Brand Colors
  coral: '#FF6B6B',
  mint: '#4ECDC4',
  lavender: '#9B59B6',
  sky: '#3498DB',
  peach: '#FFEAA7',

  // Semantic
  warning: '#FFE66D',
  error: '#FF6B6B',
  info: '#4A90E2',

  // Grayscale
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#FAFAFA',
  gray100: '#F5F5F5',
  gray200: '#EEEEEE',
  gray300: '#E0E0E0',
  gray400: '#BDBDBD',
  gray500: '#9E9E9E',
  gray600: '#757575',
  gray700: '#616161',
  gray800: '#424242',
  gray900: '#212121',

  // Backgrounds
  background: '#F8F9FA',
  backgroundDark: '#121212',

  // Text
  text: '#212121',
  textSecondary: '#757575',
  textDisabled: '#9E9E9E',

  // Border
  border: '#E0E0E0',
} as const;

// ============================================================================
// EXPORTED COLORS OBJECT
// ============================================================================

export const colors = {
  // Primary Colors - TravelMatch Coral
  primary: {
    50: '#FFF0F0',
    100: '#FFE0E0',
    200: '#FFC1C1',
    300: '#FFA3A3',
    400: '#FF8A8A',
    500: palette.coral,
    600: '#E85555',
    700: '#D14040',
    800: '#BA2C2C',
    900: '#8B1F1F',
  },

  // Secondary Colors - TravelMatch Mint
  secondary: {
    50: '#E8FAF8',
    100: '#D1F5F1',
    200: '#A3EBE3',
    300: '#75E0D5',
    400: '#5CD9CB',
    500: palette.mint,
    600: '#3EB8B0',
    700: '#2EA39C',
    800: '#1F8E88',
    900: '#106963',
  },

  // Accent Colors - TravelMatch Lavender
  accent: {
    50: '#F5EEFA',
    100: '#EBDDF5',
    200: '#D7BBEB',
    300: '#C39AE0',
    400: '#AF78D6',
    500: palette.lavender,
    600: '#8647A3',
    700: '#713590',
    800: '#5C237D',
    900: '#47116A',
  },

  // Semantic Colors
  success: {
    50: '#E8FAF8',
    100: '#D1F5F1',
    200: '#A3EBE3',
    300: '#75E0D5',
    400: '#5CD9CB',
    500: palette.mint,
    600: '#3EB8B0',
    700: '#2EA39C',
    800: '#1F8E88',
    900: '#106963',
  },

  warning: {
    50: '#FFFEF0',
    100: '#FFFCE0',
    200: '#FFF9C1',
    300: '#FFF6A3',
    400: '#FFF084',
    500: palette.warning,
    600: '#E6CF5A',
    700: '#CCB847',
    800: '#B3A134',
    900: '#998A21',
  },

  error: {
    50: '#FFF0F0',
    100: '#FFE0E0',
    200: '#FFC1C1',
    300: '#FFA3A3',
    400: '#FF8A8A',
    500: palette.error,
    600: '#E85555',
    700: '#D14040',
    800: '#BA2C2C',
    900: '#8B1F1F',
  },

  info: {
    50: '#EBF5FF',
    100: '#D6EBFF',
    200: '#ADD6FF',
    300: '#85C2FF',
    400: '#5CADFF',
    500: palette.info,
    600: '#3A7ACC',
    700: '#2A65B6',
    800: '#1A50A0',
    900: '#0A3B8A',
  },

  // Neutral Colors
  neutral: {
    0: palette.white,
    50: palette.gray50,
    100: palette.gray100,
    200: palette.gray200,
    300: palette.gray300,
    400: palette.gray400,
    500: palette.gray500,
    600: palette.gray600,
    700: palette.gray700,
    800: palette.gray800,
    900: palette.gray900,
    1000: palette.black,
  },

  // Background Colors
  background: {
    primary: palette.white,
    secondary: palette.background,
    tertiary: palette.gray100,
    dark: palette.backgroundDark,
    darkSecondary: '#1E1E1E',
  },

  // Text Colors
  text: {
    primary: palette.text,
    secondary: palette.textSecondary,
    disabled: palette.textDisabled,
    inverse: palette.white,
  },

  // Border Colors
  border: {
    light: palette.gray200,
    medium: palette.border,
    dark: palette.gray600,
  },

  // Overlay Colors
  overlay: {
    light: 'rgba(0, 0, 0, 0.1)',
    medium: 'rgba(0, 0, 0, 0.3)',
    dark: 'rgba(0, 0, 0, 0.6)',
  },

  // Brand accent colors (for quick access)
  brand: {
    coral: palette.coral,
    mint: palette.mint,
    lavender: palette.lavender,
    sky: palette.sky,
    peach: palette.peach,
  },
} as const;

export type Colors = typeof colors;

// Export palette for direct access if needed
export { palette as COLORS };
