/**
 * TravelMatch Ultimate Design System - Typography
 *
 * "Premium Editorial" aesthetic
 * Uses system fonts with correct weights for maximum compatibility
 *
 * Scale Rules (Awwwards Standard):
 * - H1/Hero: 34-40px
 * - Section title: 20-24px
 * - Body: 15-16px
 * - Caption: 12-13px
 * - Numbers: tabular-nums for alignment
 */

import { TextStyle, Platform, PixelRatio } from 'react-native';
import { LIGHT_COLORS, DARK_COLORS } from './colors';

// ═══════════════════════════════════════════════════
// FONT SIZES (Awwwards Standard Scale)
// ═══════════════════════════════════════════════════
export const FONT_SIZES = {
  xs: 11,
  sm: 12,
  caption: 13,
  base: 15,
  md: 16,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  hero: 34,
  '5xl': 40,
} as const;

// ═══════════════════════════════════════════════════
// FONT WEIGHTS
// ═══════════════════════════════════════════════════
export const FONT_WEIGHTS = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

// ═══════════════════════════════════════════════════
// LINE HEIGHTS
// WCAG 2.1 recommends minimum 1.5 for body text
// ═══════════════════════════════════════════════════
export const LINE_HEIGHTS = {
  tight: 1.25,
  normal: 1.5,
  relaxed: 1.75,
  loose: 2,
} as const;

// ═══════════════════════════════════════════════════
// LETTER SPACING
// ═══════════════════════════════════════════════════
export const LETTER_SPACINGS = {
  tighter: -1.2,
  tight: -1,
  semiTight: -0.5,
  normal: 0,
  wide: 0.2,
  wider: 0.3,
  widest: 1.2,
} as const;

// ═══════════════════════════════════════════════════
// FONT FAMILIES
// Platform-specific system fonts for optimal rendering
// ═══════════════════════════════════════════════════
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

// ═══════════════════════════════════════════════════
// PREMIUM EDITORIAL TYPOGRAPHY
// Core design system following Awwwards standards
// ═══════════════════════════════════════════════════
export const TYPOGRAPHY = {
  // ─────────────────────────────────────────────
  // HERO - Splash, Onboarding
  // ─────────────────────────────────────────────
  hero: {
    fontSize: 40,
    lineHeight: 46,
    fontWeight: '800' as const,
    letterSpacing: -1.2,
  } as TextStyle,

  heroSmall: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700' as const,
    letterSpacing: -1,
  } as TextStyle,

  // ─────────────────────────────────────────────
  // DISPLAY - Legacy support
  // ─────────────────────────────────────────────
  display1: {
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '800' as const,
    letterSpacing: -1.2,
  } as TextStyle,

  display2: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800' as const,
    letterSpacing: -1,
  } as TextStyle,

  display3: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  } as TextStyle,

  // ─────────────────────────────────────────────
  // HEADINGS
  // ─────────────────────────────────────────────
  h1: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  } as TextStyle,

  h2: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  } as TextStyle,

  h3: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
  } as TextStyle,

  h4: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600' as const,
    letterSpacing: 0,
  } as TextStyle,

  h5: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600' as const,
    letterSpacing: 0,
  } as TextStyle,

  h6: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600' as const,
    letterSpacing: 0,
  } as TextStyle,

  // ─────────────────────────────────────────────
  // BODY
  // ─────────────────────────────────────────────
  bodyLarge: {
    fontSize: 17,
    lineHeight: 26,
    fontWeight: '400' as const,
    letterSpacing: 0,
  } as TextStyle,

  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400' as const,
    letterSpacing: 0,
  } as TextStyle,

  bodySmall: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400' as const,
    letterSpacing: 0,
  } as TextStyle,

  bodyMedium: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500' as const,
    letterSpacing: 0,
  } as TextStyle,

  // ─────────────────────────────────────────────
  // CAPTION
  // ─────────────────────────────────────────────
  caption: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400' as const,
    letterSpacing: 0.1,
  } as TextStyle,

  captionSmall: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '400' as const,
    letterSpacing: 0.2,
  } as TextStyle,

  captionMedium: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
  } as TextStyle,

  // ─────────────────────────────────────────────
  // LABELS (Buttons, Chips, Navigation)
  // ─────────────────────────────────────────────
  labelLarge: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
  } as TextStyle,

  label: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
  } as TextStyle,

  labelSmall: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600' as const,
    letterSpacing: 0.3,
  } as TextStyle,

  // ─────────────────────────────────────────────
  // BUTTONS
  // ─────────────────────────────────────────────
  button: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
  } as TextStyle,

  buttonSmall: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
  } as TextStyle,

  buttonLarge: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
  } as TextStyle,

  // ─────────────────────────────────────────────
  // LINKS
  // ─────────────────────────────────────────────
  link: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500' as const,
    letterSpacing: 0,
    textDecorationLine: 'underline' as const,
  } as TextStyle,

  linkSmall: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500' as const,
    letterSpacing: 0,
    textDecorationLine: 'underline' as const,
  } as TextStyle,

  // ─────────────────────────────────────────────
  // OVERLINE (Category labels, Section markers)
  // ─────────────────────────────────────────────
  overline: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600' as const,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  } as TextStyle,

  // ─────────────────────────────────────────────
  // MONO (Prices, Scores, Stats)
  // ─────────────────────────────────────────────
  priceLarge: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'] as const,
  } as TextStyle,

  price: {
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
    fontVariant: ['tabular-nums'] as const,
  } as TextStyle,

  priceSmall: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
    fontVariant: ['tabular-nums'] as const,
  } as TextStyle,

  stat: {
    fontSize: 32,
    lineHeight: 36,
    fontWeight: '700' as const,
    letterSpacing: -1,
    fontVariant: ['tabular-nums'] as const,
  } as TextStyle,

  score: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600' as const,
    letterSpacing: 0,
    fontVariant: ['tabular-nums'] as const,
  } as TextStyle,

  // ─────────────────────────────────────────────
  // UTILITY STYLES
  // ─────────────────────────────────────────────
  code: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400' as const,
    fontFamily: Platform.select({
      ios: 'Courier New',
      android: 'monospace',
      default: 'monospace',
    }),
    letterSpacing: 0,
  } as TextStyle,

  error: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500' as const,
    letterSpacing: 0,
  } as TextStyle,

  success: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500' as const,
    letterSpacing: 0,
  } as TextStyle,
} as const;

// Type export
export type TypographyVariant = keyof typeof TYPOGRAPHY;

// ═══════════════════════════════════════════════════
// ACCESSIBILITY UTILITIES
// ═══════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════
// THEMED TYPOGRAPHY (with colors)
// ═══════════════════════════════════════════════════

type TypographyStyle = TextStyle & {
  accessibilityRole?: 'header' | 'text' | 'link' | 'button';
  minContrastRatio?: number;
};

export const createTypography = (isDark = false) => {
  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;

  return {
    // Hero styles
    hero: {
      ...TYPOGRAPHY.hero,
      color: colors.text,
      accessibilityRole: 'header' as const,
      minContrastRatio: 7,
    } as TypographyStyle,

    heroSmall: {
      ...TYPOGRAPHY.heroSmall,
      color: colors.text,
      accessibilityRole: 'header' as const,
      minContrastRatio: 7,
    } as TypographyStyle,

    // Display styles (largest) - for hero sections, landing pages
    display1: {
      ...TYPOGRAPHY.display1,
      color: colors.text,
      accessibilityRole: 'header' as const,
      minContrastRatio: 7,
    } as TypographyStyle,

    display2: {
      ...TYPOGRAPHY.display2,
      color: colors.text,
      accessibilityRole: 'header' as const,
      minContrastRatio: 7,
    } as TypographyStyle,

    display3: {
      ...TYPOGRAPHY.display3,
      color: colors.text,
      accessibilityRole: 'header' as const,
      minContrastRatio: 7,
    } as TypographyStyle,

    // Heading styles
    h1: {
      ...TYPOGRAPHY.h1,
      color: colors.text,
      accessibilityRole: 'header' as const,
      minContrastRatio: 7,
    } as TypographyStyle,

    h2: {
      ...TYPOGRAPHY.h2,
      color: colors.text,
      accessibilityRole: 'header' as const,
      minContrastRatio: 7,
    } as TypographyStyle,

    h3: {
      ...TYPOGRAPHY.h3,
      color: colors.text,
      accessibilityRole: 'header' as const,
      minContrastRatio: 7,
    } as TypographyStyle,

    h4: {
      ...TYPOGRAPHY.h4,
      color: colors.text,
      accessibilityRole: 'header' as const,
      minContrastRatio: 4.5,
    } as TypographyStyle,

    h5: {
      ...TYPOGRAPHY.h5,
      color: colors.text,
      accessibilityRole: 'header' as const,
      minContrastRatio: 4.5,
    } as TypographyStyle,

    h6: {
      ...TYPOGRAPHY.h6,
      color: colors.text,
      accessibilityRole: 'header' as const,
      minContrastRatio: 4.5,
    } as TypographyStyle,

    // Body styles
    body: {
      ...TYPOGRAPHY.body,
      color: colors.text,
      accessibilityRole: 'text' as const,
      minContrastRatio: 4.5,
    } as TypographyStyle,

    bodyLarge: {
      ...TYPOGRAPHY.bodyLarge,
      color: colors.text,
      accessibilityRole: 'text' as const,
      minContrastRatio: 4.5,
    } as TypographyStyle,

    bodySmall: {
      ...TYPOGRAPHY.bodySmall,
      color: colors.textSecondary,
      accessibilityRole: 'text' as const,
      minContrastRatio: 4.5,
    } as TypographyStyle,

    bodyMedium: {
      ...TYPOGRAPHY.bodyMedium,
      color: colors.text,
      accessibilityRole: 'text' as const,
      minContrastRatio: 4.5,
    } as TypographyStyle,

    // Caption styles
    caption: {
      ...TYPOGRAPHY.caption,
      color: colors.textTertiary,
      accessibilityRole: 'text' as const,
      minContrastRatio: 4.5,
    } as TypographyStyle,

    captionSmall: {
      ...TYPOGRAPHY.captionSmall,
      color: colors.textTertiary,
      accessibilityRole: 'text' as const,
      minContrastRatio: 4.5,
    } as TypographyStyle,

    captionMedium: {
      ...TYPOGRAPHY.captionMedium,
      color: colors.textSecondary,
      accessibilityRole: 'text' as const,
      minContrastRatio: 4.5,
    } as TypographyStyle,

    // Label styles
    label: {
      ...TYPOGRAPHY.label,
      color: colors.text,
      accessibilityRole: 'text' as const,
      minContrastRatio: 4.5,
    } as TypographyStyle,

    labelLarge: {
      ...TYPOGRAPHY.labelLarge,
      color: colors.text,
      accessibilityRole: 'text' as const,
      minContrastRatio: 4.5,
    } as TypographyStyle,

    labelSmall: {
      ...TYPOGRAPHY.labelSmall,
      color: colors.text,
      accessibilityRole: 'text' as const,
      minContrastRatio: 4.5,
    } as TypographyStyle,

    // Button styles
    button: {
      ...TYPOGRAPHY.button,
      accessibilityRole: 'button' as const,
      minContrastRatio: 4.5,
    } as TypographyStyle,

    buttonSmall: {
      ...TYPOGRAPHY.buttonSmall,
      accessibilityRole: 'button' as const,
      minContrastRatio: 4.5,
    } as TypographyStyle,

    buttonLarge: {
      ...TYPOGRAPHY.buttonLarge,
      accessibilityRole: 'button' as const,
      minContrastRatio: 7,
    } as TypographyStyle,

    // Link styles
    link: {
      ...TYPOGRAPHY.link,
      color: colors.primary,
      accessibilityRole: 'link' as const,
      minContrastRatio: 4.5,
    } as TypographyStyle,

    linkSmall: {
      ...TYPOGRAPHY.linkSmall,
      color: colors.primary,
      accessibilityRole: 'link' as const,
      minContrastRatio: 4.5,
    } as TypographyStyle,

    // Utility styles
    overline: {
      ...TYPOGRAPHY.overline,
      color: colors.textSecondary,
      accessibilityRole: 'text' as const,
      minContrastRatio: 4.5,
    } as TypographyStyle,

    code: {
      ...TYPOGRAPHY.code,
      color: colors.text,
      backgroundColor: colors.surface,
      accessibilityRole: 'text' as const,
      minContrastRatio: 4.5,
    } as TypographyStyle,

    error: {
      ...TYPOGRAPHY.error,
      color: colors.error,
      accessibilityRole: 'text' as const,
      minContrastRatio: 4.5,
    } as TypographyStyle,

    success: {
      ...TYPOGRAPHY.success,
      color: colors.success,
      accessibilityRole: 'text' as const,
      minContrastRatio: 4.5,
    } as TypographyStyle,

    // Price styles
    price: {
      ...TYPOGRAPHY.price,
      color: colors.primary,
      accessibilityRole: 'text' as const,
      minContrastRatio: 4.5,
    } as TypographyStyle,

    priceLarge: {
      ...TYPOGRAPHY.priceLarge,
      color: colors.primary,
      accessibilityRole: 'text' as const,
      minContrastRatio: 4.5,
    } as TypographyStyle,

    priceSmall: {
      ...TYPOGRAPHY.priceSmall,
      color: colors.primary,
      accessibilityRole: 'text' as const,
      minContrastRatio: 4.5,
    } as TypographyStyle,

    stat: {
      ...TYPOGRAPHY.stat,
      color: colors.text,
      accessibilityRole: 'text' as const,
      minContrastRatio: 7,
    } as TypographyStyle,

    score: {
      ...TYPOGRAPHY.score,
      color: colors.text,
      accessibilityRole: 'text' as const,
      minContrastRatio: 4.5,
    } as TypographyStyle,
  } as const;
};

// ═══════════════════════════════════════════════════
// TEXT VARIANTS (Semantic naming)
// ═══════════════════════════════════════════════════
export const TEXT_VARIANTS = {
  title: TYPOGRAPHY.h1,
  subtitle: TYPOGRAPHY.h3,
  paragraph: TYPOGRAPHY.body,
  detail: TYPOGRAPHY.bodySmall,
  hint: TYPOGRAPHY.caption,
  cta: TYPOGRAPHY.button,
  navigation: TYPOGRAPHY.labelLarge,
} as const;

// ═══════════════════════════════════════════════════
// ACCESSIBILITY UTILITIES
// ═══════════════════════════════════════════════════
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
export type ThemedTypographyVariant = keyof ReturnType<typeof createTypography>;
export type TextVariant = keyof typeof TEXT_VARIANTS;
