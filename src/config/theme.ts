import { COLORS } from '../constants/colors';

export const colors = {
  // TravelMatch Calm Palette
  primary: COLORS.buttonPrimary,
  secondary: COLORS.secondary,
  success: COLORS.success,
  danger: COLORS.error,
  warning: COLORS.orangeDark,
  info: COLORS.info,
  light: COLORS.gray,
  dark: COLORS.buttonDark,
  white: COLORS.white,
  black: COLORS.black,
  gray: COLORS.softGray,
  text: COLORS.text,
  textSecondary: COLORS.textSecondary,
  border: COLORS.border,
  background: COLORS.background,

  // TravelMatch Brand Colors
  mint: {
    50: COLORS.successLight,
    100: COLORS.mint,
    500: COLORS.primary,
    700: COLORS.success,
  },
  coral: COLORS.coral,
  grayScale: {
    50: COLORS.gray,
    100: COLORS.gray,
    200: COLORS.lightGray,
    300: COLORS.darkGray,
    400: COLORS.softGray,
    500: COLORS.textSecondary,
    600: COLORS.text,
    700: COLORS.text,
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
