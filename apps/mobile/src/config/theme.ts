import { COLORS, primitives } from '../constants/colors';

export const colors = {
  // TravelMatch Calm Palette
  primary: COLORS.brand.primary,
  secondary: COLORS.brand.secondary,
  success: COLORS.feedback.success,
  danger: COLORS.feedback.error,
  warning: COLORS.orangeDark,
  info: COLORS.feedback.info,
  light: primitives.stone[100],
  dark: COLORS.buttonDark,
  white: COLORS.utility.white,
  black: COLORS.utility.black,
  gray: COLORS.softGray,
  text: COLORS.text.primary,
  textSecondary: COLORS.text.secondary,
  border: COLORS.border.default,
  background: COLORS.bg.primary,

  // TravelMatch Brand Colors
  mint: {
    50: COLORS.successLight,
    100: COLORS.mint,
    500: COLORS.brand.primary,
    700: COLORS.feedback.success,
  },
  coral: COLORS.brand.secondary,
  grayScale: {
    50: primitives.stone[50],
    100: primitives.stone[100],
    200: COLORS.lightGray,
    300: COLORS.darkGray,
    400: COLORS.softGray,
    500: COLORS.text.secondary,
    600: COLORS.text.primary,
    700: COLORS.text.primary,
    900: COLORS.buttonDark,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const typography = {
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 999,
};
