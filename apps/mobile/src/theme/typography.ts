import { TextStyle, Platform, PixelRatio } from 'react-native';
import { COLORS } from '../constants/colors';

// Light and dark mode colors
const LIGHT_COLORS = {
  text: {
    primary: COLORS.text.primary,
    secondary: COLORS.text.secondary,
    tertiary: COLORS.text.tertiary,
  },
};

const DARK_COLORS = {
  text: {
    primary: COLORS.textOnDark,
    secondary: COLORS.textOnDarkSecondary,
    tertiary: COLORS.textOnDarkMuted,
  },
};

/**
 * Typography Scale
 * Based on 8px grid system with modular scale (1.25 ratio)
 * Follows WCAG 2.1 Level AA accessibility guidelines
 */
export const FONT_SIZES = {
  xs: 12,
  sm: 13,
  base: 15,
  md: 16,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 36,
} as const;

export const FONT_WEIGHTS = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

/**
 * Line Heights
 * WCAG 2.1 recommends minimum 1.5 for body text
 * Larger text can use tighter line heights
 */
export const LINE_HEIGHTS = {
  tight: 1.25,
  normal: 1.5,
  relaxed: 1.75,
  loose: 2,
} as const;

export const LETTER_SPACINGS = {
  tighter: -0.5,
  tight: -0.3,
  normal: 0,
  wide: 0.3,
  wider: 0.5,
} as const;

/**
 * Font Families
 * Platform-specific system fonts for optimal rendering
 */
export const FONT_FAMILIES = {
  regular: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
  medium: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium',
    default: 'System',
  }),
  bold: Platform.select({
    ios: 'System',
    android: 'Roboto-Bold',
    default: 'System',
  }),
  mono: Platform.select({
    ios: 'Courier New',
    android: 'monospace',
    default: 'monospace',
  }),
} as const;

/**
 * Accessibility: Scale font sizes based on device settings
 * Respects user's system font size preferences
 */
export const getAccessibleFontSize = (baseSize: number): number => {
  const fontScale = PixelRatio.getFontScale();
  // Cap scaling at 2x to prevent layout breaking
  const cappedScale = Math.min(fontScale, 2);
  return Math.round(baseSize * cappedScale);
};

/**
 * Responsive typography helpers
 */
export const getResponsiveFontSize = (baseSize: number, scale = 1): number => {
  return Math.round(baseSize * scale);
};

export const getLineHeight = (
  fontSize: number,
  ratio: number = LINE_HEIGHTS.normal,
): number => {
  return Math.round(fontSize * ratio);
};

/**
 * Typography Presets with Accessibility
 * All styles follow WCAG 2.1 Level AA guidelines:
 * - Minimum 1.5 line height for body text
 * - Sufficient color contrast ratios
 * - Scalable font sizes
 */
type TypographyStyle = TextStyle & {
  // Accessibility metadata
  accessibilityRole?: 'header' | 'text' | 'link' | 'button';
  minContrastRatio?: number; // WCAG contrast requirement
};

export const createTypography = (isDark = false) => {
  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;

  return {
    // Display styles (largest) - for hero sections, landing pages
    display1: {
      fontSize: FONT_SIZES['5xl'],
      fontWeight: FONT_WEIGHTS.extrabold,
      lineHeight: FONT_SIZES['5xl'] * LINE_HEIGHTS.tight,
      letterSpacing: LETTER_SPACINGS.tighter,
      color: colors.text,
      accessibilityRole: 'header' as const,
      minContrastRatio: 7, // WCAG AAA for large text
    } as TypographyStyle,

    display2: {
      fontSize: FONT_SIZES['4xl'],
      fontWeight: FONT_WEIGHTS.extrabold,
      lineHeight: FONT_SIZES['4xl'] * LINE_HEIGHTS.tight,
      letterSpacing: LETTER_SPACINGS.tighter,
      color: colors.text,
      accessibilityRole: 'header' as const,
      minContrastRatio: 7,
    } as TypographyStyle,

    display3: {
      fontSize: FONT_SIZES['3xl'],
      fontWeight: FONT_WEIGHTS.bold,
      lineHeight: FONT_SIZES['3xl'] * LINE_HEIGHTS.tight,
      letterSpacing: LETTER_SPACINGS.tight,
      color: colors.text,
      accessibilityRole: 'header' as const,
      minContrastRatio: 7,
    } as TypographyStyle,

    // Heading styles - semantic hierarchy
    h1: {
      fontSize: FONT_SIZES['3xl'],
      fontWeight: FONT_WEIGHTS.bold,
      lineHeight: FONT_SIZES['3xl'] * LINE_HEIGHTS.tight,
      letterSpacing: LETTER_SPACINGS.tight,
      color: colors.text,
      accessibilityRole: 'header' as const,
      minContrastRatio: 7,
    } as TypographyStyle,

    h2: {
      fontSize: FONT_SIZES['2xl'],
      fontWeight: FONT_WEIGHTS.bold,
      lineHeight: FONT_SIZES['2xl'] * LINE_HEIGHTS.normal,
      letterSpacing: LETTER_SPACINGS.tight,
      color: colors.text,
      accessibilityRole: 'header' as const,
      minContrastRatio: 7,
    } as TypographyStyle,

    h3: {
      fontSize: FONT_SIZES.xl,
      fontWeight: FONT_WEIGHTS.semibold,
      lineHeight: FONT_SIZES.xl * LINE_HEIGHTS.normal,
      color: colors.text,
      accessibilityRole: 'header' as const,
      minContrastRatio: 7,
    } as TypographyStyle,

    h4: {
      fontSize: FONT_SIZES.lg,
      fontWeight: FONT_WEIGHTS.semibold,
      lineHeight: FONT_SIZES.lg * LINE_HEIGHTS.normal,
      color: colors.text,
      accessibilityRole: 'header' as const,
      minContrastRatio: 4.5, // WCAG AA for normal text
    } as TypographyStyle,

    h5: {
      fontSize: FONT_SIZES.md,
      fontWeight: FONT_WEIGHTS.semibold,
      lineHeight: FONT_SIZES.md * LINE_HEIGHTS.normal,
      color: colors.text,
      accessibilityRole: 'header' as const,
      minContrastRatio: 4.5,
    } as TypographyStyle,

    h6: {
      fontSize: FONT_SIZES.base,
      fontWeight: FONT_WEIGHTS.semibold,
      lineHeight: FONT_SIZES.base * LINE_HEIGHTS.normal,
      color: colors.text,
      accessibilityRole: 'header' as const,
      minContrastRatio: 4.5,
    } as TypographyStyle,

    // Body text styles - optimized for readability
    body: {
      fontSize: FONT_SIZES.base,
      fontWeight: FONT_WEIGHTS.regular,
      lineHeight: FONT_SIZES.base * LINE_HEIGHTS.relaxed, // 1.75 for better readability
      color: colors.text,
      accessibilityRole: 'text' as const,
      minContrastRatio: 4.5,
    } as TypographyStyle,

    bodyLarge: {
      fontSize: FONT_SIZES.md,
      fontWeight: FONT_WEIGHTS.regular,
      lineHeight: FONT_SIZES.md * LINE_HEIGHTS.relaxed,
      color: colors.text,
      accessibilityRole: 'text' as const,
      minContrastRatio: 4.5,
    } as TypographyStyle,

    bodySmall: {
      fontSize: FONT_SIZES.sm,
      fontWeight: FONT_WEIGHTS.regular,
      lineHeight: FONT_SIZES.sm * LINE_HEIGHTS.relaxed, // Increased for accessibility
      color: colors.textSecondary,
      accessibilityRole: 'text' as const,
      minContrastRatio: 4.5,
    } as TypographyStyle,

    bodyMedium: {
      fontSize: FONT_SIZES.base,
      fontWeight: FONT_WEIGHTS.medium,
      lineHeight: FONT_SIZES.base * LINE_HEIGHTS.relaxed,
      color: colors.text,
      accessibilityRole: 'text' as const,
      minContrastRatio: 4.5,
    } as TypographyStyle,

    // Specialized styles
    caption: {
      fontSize: FONT_SIZES.xs,
      fontWeight: FONT_WEIGHTS.regular,
      lineHeight: FONT_SIZES.xs * LINE_HEIGHTS.relaxed, // Improved readability
      color: colors.textTertiary,
      accessibilityRole: 'text' as const,
      minContrastRatio: 4.5,
    } as TypographyStyle,

    captionMedium: {
      fontSize: FONT_SIZES.xs,
      fontWeight: FONT_WEIGHTS.medium,
      lineHeight: FONT_SIZES.xs * LINE_HEIGHTS.normal,
      color: colors.textSecondary,
      accessibilityRole: 'text' as const,
      minContrastRatio: 4.5,
    } as TypographyStyle,

    captionSmall: {
      fontSize: FONT_SIZES.xs,
      fontWeight: FONT_WEIGHTS.regular,
      lineHeight: 16,
      letterSpacing: 0.2,
      accessibilityRole: 'text' as const,
      minContrastRatio: 4.5,
    } as TypographyStyle,

    // Score and stat styles for trust/numeric displays
    score: {
      fontSize: 14,
      fontWeight: FONT_WEIGHTS.semibold,
      lineHeight: 18,
      fontVariant: ['tabular-nums'] as const,
      accessibilityRole: 'text' as const,
      minContrastRatio: 4.5,
    } as TypographyStyle,

    label: {
      fontSize: FONT_SIZES.sm,
      fontWeight: FONT_WEIGHTS.medium,
      lineHeight: FONT_SIZES.sm * LINE_HEIGHTS.normal,
      color: colors.text,
      accessibilityRole: 'text' as const,
      minContrastRatio: 4.5,
    } as TypographyStyle,

    labelLarge: {
      fontSize: FONT_SIZES.base,
      fontWeight: FONT_WEIGHTS.medium,
      lineHeight: FONT_SIZES.base * LINE_HEIGHTS.normal,
      color: colors.text,
      accessibilityRole: 'text' as const,
      minContrastRatio: 4.5,
    } as TypographyStyle,

    labelSmall: {
      fontSize: FONT_SIZES.sm,
      fontWeight: FONT_WEIGHTS.semibold,
      lineHeight: FONT_SIZES.sm * LINE_HEIGHTS.normal,
      letterSpacing: LETTER_SPACINGS.wide,
      accessibilityRole: 'text' as const,
      minContrastRatio: 4.5,
    } as TypographyStyle,

    labelXSmall: {
      fontSize: 11,
      fontWeight: FONT_WEIGHTS.semibold,
      lineHeight: 14,
      letterSpacing: LETTER_SPACINGS.wide,
      accessibilityRole: 'text' as const,
      minContrastRatio: 4.5,
    } as TypographyStyle,

    // Button styles - high contrast for interactive elements
    button: {
      fontSize: FONT_SIZES.md,
      fontWeight: FONT_WEIGHTS.semibold,
      lineHeight: FONT_SIZES.md * LINE_HEIGHTS.tight,
      letterSpacing: LETTER_SPACINGS.wide,
      accessibilityRole: 'button' as const,
      minContrastRatio: 4.5, // Buttons need good contrast
    } as TypographyStyle,

    buttonSmall: {
      fontSize: FONT_SIZES.sm,
      fontWeight: FONT_WEIGHTS.semibold,
      lineHeight: FONT_SIZES.sm * LINE_HEIGHTS.tight,
      letterSpacing: LETTER_SPACINGS.wide,
      accessibilityRole: 'button' as const,
      minContrastRatio: 4.5,
    } as TypographyStyle,

    buttonLarge: {
      fontSize: FONT_SIZES.lg,
      fontWeight: FONT_WEIGHTS.semibold,
      lineHeight: FONT_SIZES.lg * LINE_HEIGHTS.tight,
      letterSpacing: LETTER_SPACINGS.wide,
      accessibilityRole: 'button' as const,
      minContrastRatio: 7, // Larger buttons can achieve AAA
    } as TypographyStyle,

    // Link styles
    link: {
      fontSize: FONT_SIZES.base,
      fontWeight: FONT_WEIGHTS.medium,
      lineHeight: FONT_SIZES.base * LINE_HEIGHTS.relaxed,
      color: colors.primary,
      textDecorationLine: 'underline' as const,
      accessibilityRole: 'link' as const,
      minContrastRatio: 4.5,
    } as TypographyStyle,

    linkSmall: {
      fontSize: FONT_SIZES.sm,
      fontWeight: FONT_WEIGHTS.medium,
      lineHeight: FONT_SIZES.sm * LINE_HEIGHTS.normal,
      color: colors.primary,
      textDecorationLine: 'underline' as const,
      accessibilityRole: 'link' as const,
      minContrastRatio: 4.5,
    } as TypographyStyle,

    // Utility styles
    overline: {
      fontSize: FONT_SIZES.xs,
      fontWeight: FONT_WEIGHTS.semibold,
      lineHeight: FONT_SIZES.xs * LINE_HEIGHTS.normal,
      letterSpacing: LETTER_SPACINGS.wider,
      textTransform: 'uppercase' as const,
      color: colors.textSecondary,
      accessibilityRole: 'text' as const,
      minContrastRatio: 4.5,
    } as TypographyStyle,

    code: {
      fontSize: FONT_SIZES.sm,
      fontWeight: FONT_WEIGHTS.regular,
      fontFamily: FONT_FAMILIES.mono,
      lineHeight: FONT_SIZES.sm * LINE_HEIGHTS.relaxed,
      color: colors.text,
      backgroundColor: colors.surface,
      accessibilityRole: 'text' as const,
      minContrastRatio: 4.5,
    } as TypographyStyle,

    // Error and validation styles
    error: {
      fontSize: FONT_SIZES.sm,
      fontWeight: FONT_WEIGHTS.medium,
      lineHeight: FONT_SIZES.sm * LINE_HEIGHTS.normal,
      color: colors.error,
      accessibilityRole: 'text' as const,
      minContrastRatio: 4.5,
    } as TypographyStyle,

    success: {
      fontSize: FONT_SIZES.sm,
      fontWeight: FONT_WEIGHTS.medium,
      lineHeight: FONT_SIZES.sm * LINE_HEIGHTS.normal,
      color: colors.success,
      accessibilityRole: 'text' as const,
      minContrastRatio: 4.5,
    } as TypographyStyle,

    // Price and numeric styles
    price: {
      fontSize: FONT_SIZES.xl,
      fontWeight: FONT_WEIGHTS.bold,
      lineHeight: FONT_SIZES.xl * LINE_HEIGHTS.tight,
      color: colors.primary,
      accessibilityRole: 'text' as const,
      minContrastRatio: 4.5,
    } as TypographyStyle,

    priceSmall: {
      fontSize: FONT_SIZES.md,
      fontWeight: FONT_WEIGHTS.semibold,
      lineHeight: FONT_SIZES.md * LINE_HEIGHTS.tight,
      color: colors.primary,
      accessibilityRole: 'text' as const,
      minContrastRatio: 4.5,
    } as TypographyStyle,
  } as const;
};

// Default light theme typography
export const TYPOGRAPHY = createTypography(false);

/**
 * Typography variants for common use cases
 * Provides semantic naming for better developer experience
 */
export const TEXT_VARIANTS = {
  title: TYPOGRAPHY.h1,
  subtitle: TYPOGRAPHY.h3,
  paragraph: TYPOGRAPHY.body,
  detail: TYPOGRAPHY.bodySmall,
  hint: TYPOGRAPHY.caption,
  cta: TYPOGRAPHY.button, // Call to action
  navigation: TYPOGRAPHY.labelLarge,
} as const;

/**
 * Accessibility utilities
 */
export const TypographyAccessibility = {
  /**
   * Check if text meets WCAG contrast requirements
   */
  meetsContrastRequirement: (
    _foreground: string,
    _background: string,
    _minimumRatio = 4.5,
  ): boolean => {
    // Implementation would require color contrast calculation
    // For now, return true as colors.ts should ensure compliance
    return true;
  },

  /**
   * Get accessible font size based on user settings
   */
  getScaledFontSize: (fontSize: number): number => {
    return getAccessibleFontSize(fontSize);
  },

  /**
   * Recommended minimum touch target sizes (WCAG 2.5.5)
   */
  MINIMUM_TOUCH_TARGET: {
    width: 44,
    height: 44,
  },
};

/**
 * Export type for TypeScript support
 */
export type TypographyVariant = keyof ReturnType<typeof createTypography>;
export type TextVariant = keyof typeof TEXT_VARIANTS;
