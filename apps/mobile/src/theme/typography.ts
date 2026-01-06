/**
 * TravelMatch Typography - Unified Entry Point
 *
 * @deprecated theme/typography.ts is deprecated. Use constants/typography.ts instead.
 *
 * This file re-exports from constants/typography.ts and adds theme-specific helpers.
 * Migration guide: Replace `from '../theme/typography'` with `from '../constants/typography'`
 */

import type { TextStyle } from 'react-native';
import { COLORS } from '../constants/colors';

// ============================================
// RE-EXPORT FROM CONSTANTS (PRIMARY SOURCE)
// ============================================
export {
  FONTS,
  FONT_SIZES_V2 as FONT_SIZES,
  LINE_HEIGHTS_V2 as LINE_HEIGHTS,
  LETTER_SPACING_V2 as LETTER_SPACING,
  TYPE_SCALE,
  typography,
  TYPOGRAPHY,
  getAccessibleFontSize,
  TEXT_VARIANTS_V2 as TEXT_VARIANTS_SOURCE,
  TYPOGRAPHY_SYSTEM,
} from '../constants/typography';

// Also export with original names for backward compatibility
export {
  FONT_SIZES_V2,
  LINE_HEIGHTS_V2,
  LETTER_SPACING_V2,
} from '../constants/typography';

// Font families alias for legacy imports (flat structure for backward compatibility)
import { FONTS as FontsSource } from '../constants/typography';

// Legacy FONT_FAMILIES format (flat strings)
export const FONT_FAMILIES = {
  regular: FontsSource.body.regular,
  medium: FontsSource.body.medium,
  semibold: FontsSource.body.semibold,
  bold: FontsSource.body.bold,
  mono: FontsSource.mono.regular,
  display: FontsSource.display.regular,
  displayBold: FontsSource.display.bold,
  system: FontsSource.system,
} as const;

// Font weights from constants
export const FONT_WEIGHTS = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

// ============================================
// THEME-SPECIFIC ADDITIONS
// ============================================

// Light mode text colors
export const LIGHT_TEXT_COLORS = {
  primary: COLORS.text.primary,
  secondary: COLORS.text.secondary,
  tertiary: COLORS.text.tertiary,
  accent: COLORS.primary,
  error: COLORS.error,
  success: COLORS.success,
};

// Dark mode text colors
export const DARK_TEXT_COLORS = {
  primary: COLORS.textOnDark,
  secondary: COLORS.textOnDarkSecondary,
  tertiary: COLORS.textOnDarkMuted,
  accent: COLORS.primary,
  error: COLORS.error,
  success: COLORS.success,
};

/**
 * Creates a themed typography style
 * @param style Base text style
 * @param colorScheme 'light' or 'dark'
 * @returns TextStyle with appropriate color
 */
export function createThemedStyle(
  style: TextStyle,
  colorScheme: 'light' | 'dark' = 'light',
): TextStyle {
  const colors = colorScheme === 'dark' ? DARK_TEXT_COLORS : LIGHT_TEXT_COLORS;
  return {
    ...style,
    color: style.color || colors.primary,
  };
}

/**
 * @deprecated Use TYPOGRAPHY from constants/typography instead
 */
export const TEXT_VARIANTS = {
  // Re-export for backward compatibility
  display: {
    hero: true,
    h1: true,
    h2: true,
    h3: true,
  },
  body: {
    large: true,
    medium: true,
    small: true,
    caption: true,
  },
  label: {
    large: true,
    small: true,
  },
  button: {
    large: true,
    small: true,
  },
  mono: {
    price: true,
    stat: true,
  },
} as const;

export type TextVariant = keyof typeof TEXT_VARIANTS;
export type TypographyVariant = keyof typeof TEXT_VARIANTS;

// ============================================
// COMPATIBILITY EXPORTS
// ============================================

// These are for backward compatibility with existing imports
// New code should import directly from constants/typography

/**
 * @deprecated Import from constants/typography instead
 */
export const createTypography = (colorScheme: 'light' | 'dark' = 'light') => {
  const { TYPOGRAPHY } = require('../constants/typography');
  const colors = colorScheme === 'dark' ? DARK_TEXT_COLORS : LIGHT_TEXT_COLORS;

  return {
    hero: { ...TYPOGRAPHY.hero, color: colors.primary },
    h1: { ...TYPOGRAPHY.h1, color: colors.primary },
    h2: { ...TYPOGRAPHY.h2, color: colors.primary },
    h3: { ...TYPOGRAPHY.h3, color: colors.primary },
    h4: { ...TYPOGRAPHY.h4, color: colors.primary },
    body: { ...TYPOGRAPHY.body, color: colors.primary },
    bodyLarge: { ...TYPOGRAPHY.bodyLarge, color: colors.primary },
    bodySmall: { ...TYPOGRAPHY.bodySmall, color: colors.primary },
    bodyMedium: { ...TYPOGRAPHY.bodyMedium, color: colors.primary },
    caption: { ...TYPOGRAPHY.caption, color: colors.secondary },
    button: { ...TYPOGRAPHY.button, color: colors.primary },
    label: { ...TYPOGRAPHY.label, color: colors.secondary },
    price: { ...TYPOGRAPHY.price, color: colors.primary },
    link: { ...TYPOGRAPHY.link, color: colors.accent },
  };
};

// Default export for modules expecting the typography object
export default createTypography;
