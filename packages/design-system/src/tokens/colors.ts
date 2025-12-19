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

// Import shared colors as the canonical source
import { COLORS as SHARED_COLORS } from '@travelmatch/shared';

export const colors = {
  // Primary Colors - TravelMatch Coral
  primary: {
    50: '#FFF0F0',
    100: '#FFE0E0',
    200: '#FFC1C1',
    300: '#FFA3A3',
    400: '#FF8A8A',
    500: SHARED_COLORS.primary, // #FF6B6B - Main brand color
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
    500: SHARED_COLORS.success, // #4ECDC4 - Main mint
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
    500: SHARED_COLORS.lavender, // #9B59B6 - Main accent
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
    500: SHARED_COLORS.success, // #4ECDC4
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
    500: SHARED_COLORS.warning, // #FFE66D
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
    500: SHARED_COLORS.error, // #FF6B6B
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
    500: SHARED_COLORS.info, // #4A90E2
    600: '#3A7ACC',
    700: '#2A65B6',
    800: '#1A50A0',
    900: '#0A3B8A',
  },

  // Neutral Colors - Using shared grayscale
  neutral: {
    0: SHARED_COLORS.white,
    50: SHARED_COLORS.gray50,
    100: SHARED_COLORS.gray100,
    200: SHARED_COLORS.gray200,
    300: SHARED_COLORS.gray300,
    400: SHARED_COLORS.gray400,
    500: SHARED_COLORS.gray500,
    600: SHARED_COLORS.gray600,
    700: SHARED_COLORS.gray700,
    800: SHARED_COLORS.gray800,
    900: SHARED_COLORS.gray900,
    1000: SHARED_COLORS.black,
  },

  // Background Colors
  background: {
    primary: SHARED_COLORS.white,
    secondary: SHARED_COLORS.background,
    tertiary: SHARED_COLORS.gray100,
    dark: '#121212',
    darkSecondary: '#1E1E1E',
  },

  // Text Colors
  text: {
    primary: SHARED_COLORS.text,
    secondary: SHARED_COLORS.textSecondary,
    disabled: SHARED_COLORS.textDisabled,
    inverse: SHARED_COLORS.white,
  },

  // Border Colors
  border: {
    light: SHARED_COLORS.gray200,
    medium: SHARED_COLORS.border,
    dark: SHARED_COLORS.gray600,
  },

  // Overlay Colors
  overlay: {
    light: 'rgba(0, 0, 0, 0.1)',
    medium: 'rgba(0, 0, 0, 0.3)',
    dark: 'rgba(0, 0, 0, 0.6)',
  },

  // Brand accent colors (for quick access)
  brand: {
    coral: SHARED_COLORS.coral,
    mint: SHARED_COLORS.mint,
    lavender: SHARED_COLORS.lavender,
    sky: SHARED_COLORS.sky,
    peach: SHARED_COLORS.peach,
  },
} as const;

export type Colors = typeof colors;

// Re-export shared colors for convenience
export { SHARED_COLORS as COLORS } from '@travelmatch/shared';
