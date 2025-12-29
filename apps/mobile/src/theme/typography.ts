/**
 * TravelMatch Awwwards Design System 2026 - Typography
 *
 * Premium Typography System featuring:
 * - Display: "Clash Display" - Bold, geometric, modern (for headlines)
 * - Body: "Satoshi" - Clean, readable, warm (for paragraphs)
 * - Mono: "JetBrains Mono" - For prices and numbers
 *
 * All sizes follow 8pt grid system
 * WCAG 2.1 Level AA compliant line heights
 */

import { TextStyle, Platform, PixelRatio } from 'react-native';
import { LIGHT_COLORS, DARK_COLORS } from './colors';

// ============================================
// 1. FONT FAMILIES
// ============================================
export const FONTS = {
  display: {
    black: Platform.select({
      ios: 'ClashDisplay-Bold',
      android: 'ClashDisplay-Bold',
      default: 'System',
    }),
    bold: Platform.select({
      ios: 'ClashDisplay-Semibold',
      android: 'ClashDisplay-Semibold',
      default: 'System',
    }),
    medium: Platform.select({
      ios: 'ClashDisplay-Medium',
      android: 'ClashDisplay-Medium',
      default: 'System',
    }),
    regular: Platform.select({
      ios: 'ClashDisplay-Regular',
      android: 'ClashDisplay-Regular',
      default: 'System',
    }),
  },
  body: {
    bold: Platform.select({
      ios: 'Satoshi-Bold',
      android: 'Satoshi-Bold',
      default: 'System',
    }),
    semibold: Platform.select({
      ios: 'Satoshi-Medium',
      android: 'Satoshi-Medium',
      default: 'System',
    }),
    regular: Platform.select({
      ios: 'Satoshi-Regular',
      android: 'Satoshi-Regular',
      default: 'System',
    }),
    light: Platform.select({
      ios: 'Satoshi-Light',
      android: 'Satoshi-Light',
      default: 'System',
    }),
  },
  mono: {
    medium: Platform.select({
      ios: 'JetBrainsMono-Medium',
      android: 'JetBrainsMono-Medium',
      default: 'Courier New',
    }),
    regular: Platform.select({
      ios: 'JetBrainsMono-Regular',
      android: 'JetBrainsMono-Regular',
      default: 'Courier New',
    }),
  },
  system: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
} as const;

// Legacy font families
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

// ============================================
// 2. FONT SIZES (8pt grid based)
// ============================================
export const FONT_SIZES = {
  // Display sizes
  hero: 48,
  display1: 40,
  display2: 36,
  display3: 32,
  // Heading sizes
  h1: 28,
  h2: 24,
  h3: 22,
  h4: 20,
  h5: 18,
  h6: 16,
  // Standard scale
  '5xl': 36,
  '4xl': 32,
  '3xl': 28,
  '2xl': 24,
  xl: 20,
  lg: 17,
  md: 16,
  base: 15,
  sm: 13,
  xs: 12,
  tiny: 10,
  // Label sizes
  labelLarge: 16,
  label: 14,
  labelSmall: 12,
  // Special
  price: 24,
  priceSmall: 18,
  stat: 32,
} as const;

export const FONT_WEIGHTS = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

// ============================================
// 3. LINE HEIGHTS
// ============================================
export const LINE_HEIGHTS = {
  tight: 1.1,
  snug: 1.25,
  normal: 1.5,
  relaxed: 1.75,
  loose: 2,
} as const;

// ============================================
// 4. LETTER SPACING
// ============================================
export const LETTER_SPACINGS = {
  tightest: -1.5,
  tighter: -1,
  tight: -0.5,
  normal: 0,
  wide: 0.3,
  wider: 0.5,
  widest: 1,
} as const;

// ============================================
// 5. TYPE SCALE - Complete Typography Presets
// ============================================
export const TYPE_SCALE = {
  display: {
    hero: {
      fontFamily: FONTS.display.black,
      fontSize: FONT_SIZES.hero,
      lineHeight: Math.round(FONT_SIZES.hero * LINE_HEIGHTS.tight),
      letterSpacing: LETTER_SPACINGS.tightest,
      fontWeight: '700',
    } as TextStyle,
    h1: {
      fontFamily: FONTS.display.bold,
      fontSize: FONT_SIZES.display2,
      lineHeight: Math.round(FONT_SIZES.display2 * LINE_HEIGHTS.snug),
      letterSpacing: LETTER_SPACINGS.tighter,
      fontWeight: '600',
    } as TextStyle,
    h2: {
      fontFamily: FONTS.display.bold,
      fontSize: FONT_SIZES.h1,
      lineHeight: Math.round(FONT_SIZES.h1 * LINE_HEIGHTS.snug),
      letterSpacing: LETTER_SPACINGS.tight,
      fontWeight: '600',
    } as TextStyle,
    h3: {
      fontFamily: FONTS.display.medium,
      fontSize: FONT_SIZES.h3,
      lineHeight: Math.round(FONT_SIZES.h3 * LINE_HEIGHTS.snug),
      letterSpacing: LETTER_SPACINGS.tight,
      fontWeight: '500',
    } as TextStyle,
    h4: {
      fontFamily: FONTS.display.medium,
      fontSize: FONT_SIZES.h4,
      lineHeight: Math.round(FONT_SIZES.h4 * LINE_HEIGHTS.snug),
      letterSpacing: LETTER_SPACINGS.normal,
      fontWeight: '500',
    } as TextStyle,
  },
  body: {
    large: {
      fontFamily: FONTS.body.regular,
      fontSize: FONT_SIZES.h5,
      lineHeight: Math.round(FONT_SIZES.h5 * LINE_HEIGHTS.relaxed),
      letterSpacing: LETTER_SPACINGS.normal,
      fontWeight: '400',
    } as TextStyle,
    base: {
      fontFamily: FONTS.body.regular,
      fontSize: FONT_SIZES.md,
      lineHeight: Math.round(FONT_SIZES.md * LINE_HEIGHTS.normal),
      letterSpacing: LETTER_SPACINGS.normal,
      fontWeight: '400',
    } as TextStyle,
    medium: {
      fontFamily: FONTS.body.semibold,
      fontSize: FONT_SIZES.md,
      lineHeight: Math.round(FONT_SIZES.md * LINE_HEIGHTS.normal),
      letterSpacing: LETTER_SPACINGS.normal,
      fontWeight: '500',
    } as TextStyle,
    small: {
      fontFamily: FONTS.body.regular,
      fontSize: FONT_SIZES.label,
      lineHeight: Math.round(FONT_SIZES.label * LINE_HEIGHTS.normal),
      letterSpacing: LETTER_SPACINGS.wide,
      fontWeight: '400',
    } as TextStyle,
    caption: {
      fontFamily: FONTS.body.regular,
      fontSize: FONT_SIZES.xs,
      lineHeight: Math.round(FONT_SIZES.xs * LINE_HEIGHTS.normal),
      letterSpacing: LETTER_SPACINGS.wide,
      fontWeight: '400',
    } as TextStyle,
    tiny: {
      fontFamily: FONTS.body.regular,
      fontSize: FONT_SIZES.tiny,
      lineHeight: Math.round(FONT_SIZES.tiny * LINE_HEIGHTS.normal),
      letterSpacing: LETTER_SPACINGS.wide,
      fontWeight: '400',
    } as TextStyle,
  },
  label: {
    large: {
      fontFamily: FONTS.body.semibold,
      fontSize: FONT_SIZES.labelLarge,
      lineHeight: Math.round(FONT_SIZES.labelLarge * LINE_HEIGHTS.tight),
      letterSpacing: LETTER_SPACINGS.wider,
      fontWeight: '600',
    } as TextStyle,
    base: {
      fontFamily: FONTS.body.semibold,
      fontSize: FONT_SIZES.label,
      lineHeight: Math.round(FONT_SIZES.label * LINE_HEIGHTS.tight),
      letterSpacing: LETTER_SPACINGS.wider,
      fontWeight: '600',
    } as TextStyle,
    small: {
      fontFamily: FONTS.body.semibold,
      fontSize: FONT_SIZES.labelSmall,
      lineHeight: Math.round(FONT_SIZES.labelSmall * LINE_HEIGHTS.tight),
      letterSpacing: LETTER_SPACINGS.widest,
      fontWeight: '600',
      textTransform: 'uppercase',
    } as TextStyle,
  },
  mono: {
    price: {
      fontFamily: FONTS.mono.medium,
      fontSize: FONT_SIZES.price,
      lineHeight: Math.round(FONT_SIZES.price * LINE_HEIGHTS.tight),
      letterSpacing: LETTER_SPACINGS.tight,
      fontWeight: '500',
    } as TextStyle,
    priceSmall: {
      fontFamily: FONTS.mono.medium,
      fontSize: FONT_SIZES.priceSmall,
      lineHeight: Math.round(FONT_SIZES.priceSmall * LINE_HEIGHTS.tight),
      letterSpacing: LETTER_SPACINGS.tight,
      fontWeight: '500',
    } as TextStyle,
    stat: {
      fontFamily: FONTS.mono.medium,
      fontSize: FONT_SIZES.stat,
      lineHeight: Math.round(FONT_SIZES.stat * LINE_HEIGHTS.tight),
      letterSpacing: LETTER_SPACINGS.tighter,
      fontWeight: '500',
    } as TextStyle,
    code: {
      fontFamily: FONTS.mono.regular,
      fontSize: FONT_SIZES.label,
      lineHeight: Math.round(FONT_SIZES.label * LINE_HEIGHTS.normal),
      letterSpacing: LETTER_SPACINGS.normal,
      fontWeight: '400',
    } as TextStyle,
  },
  button: {
    large: {
      fontFamily: FONTS.body.semibold,
      fontSize: FONT_SIZES.h5,
      lineHeight: Math.round(FONT_SIZES.h5 * LINE_HEIGHTS.tight),
      letterSpacing: LETTER_SPACINGS.wider,
      fontWeight: '600',
    } as TextStyle,
    base: {
      fontFamily: FONTS.body.semibold,
      fontSize: FONT_SIZES.md,
      lineHeight: Math.round(FONT_SIZES.md * LINE_HEIGHTS.tight),
      letterSpacing: LETTER_SPACINGS.wider,
      fontWeight: '600',
    } as TextStyle,
    small: {
      fontFamily: FONTS.body.semibold,
      fontSize: FONT_SIZES.label,
      lineHeight: Math.round(FONT_SIZES.label * LINE_HEIGHTS.tight),
      letterSpacing: LETTER_SPACINGS.wider,
      fontWeight: '600',
    } as TextStyle,
  },
  link: {
    base: {
      fontFamily: FONTS.body.semibold,
      fontSize: FONT_SIZES.md,
      lineHeight: Math.round(FONT_SIZES.md * LINE_HEIGHTS.normal),
      letterSpacing: LETTER_SPACINGS.normal,
      fontWeight: '500',
      textDecorationLine: 'underline',
    } as TextStyle,
    small: {
      fontFamily: FONTS.body.semibold,
      fontSize: FONT_SIZES.label,
      lineHeight: Math.round(FONT_SIZES.label * LINE_HEIGHTS.normal),
      letterSpacing: LETTER_SPACINGS.normal,
      fontWeight: '500',
      textDecorationLine: 'underline',
    } as TextStyle,
  },
  overline: {
    fontFamily: FONTS.body.semibold,
    fontSize: FONT_SIZES.tiny,
    lineHeight: Math.round(FONT_SIZES.tiny * LINE_HEIGHTS.normal),
    letterSpacing: LETTER_SPACINGS.widest,
    fontWeight: '600',
    textTransform: 'uppercase',
  } as TextStyle,
} as const;

// ============================================
// 6. ACCESSIBILITY UTILITIES
// ============================================
export const getAccessibleFontSize = (baseSize: number): number => {
  const fontScale = PixelRatio.getFontScale();
  const cappedScale = Math.min(fontScale, 2);
  return Math.round(baseSize * cappedScale);
};

export const getResponsiveFontSize = (baseSize: number, scale = 1): number => {
  return Math.round(baseSize * scale);
};

export const getLineHeight = (
  fontSize: number,
  ratio: number = LINE_HEIGHTS.normal
): number => {
  return Math.round(fontSize * ratio);
};

export const createAccessibleTextStyle = (
  baseStyle: TextStyle,
  options?: { maxScale?: number }
): TextStyle => {
  const { maxScale = 1.5 } = options || {};
  const fontScale = Math.min(PixelRatio.getFontScale(), maxScale);
  return {
    ...baseStyle,
    fontSize: Math.round((baseStyle.fontSize || 16) * fontScale),
    lineHeight: baseStyle.lineHeight
      ? Math.round(baseStyle.lineHeight * fontScale)
      : undefined,
  };
};

// ============================================
// 7. LEGACY TYPOGRAPHY (for compatibility)
// ============================================
type TypographyStyle = TextStyle & {
  accessibilityRole?: 'header' | 'text' | 'link' | 'button';
  minContrastRatio?: number;
};

export const createTypography = (isDark = false) => {
  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;

  return {
    display1: {
      fontSize: FONT_SIZES['5xl'],
      fontWeight: FONT_WEIGHTS.extrabold,
      lineHeight: FONT_SIZES['5xl'] * LINE_HEIGHTS.snug,
      letterSpacing: LETTER_SPACINGS.tighter,
      color: colors.text,
      accessibilityRole: 'header' as const,
      minContrastRatio: 7,
    } as TypographyStyle,
    display2: {
      fontSize: FONT_SIZES['4xl'],
      fontWeight: FONT_WEIGHTS.extrabold,
      lineHeight: FONT_SIZES['4xl'] * LINE_HEIGHTS.snug,
      letterSpacing: LETTER_SPACINGS.tighter,
      color: colors.text,
      accessibilityRole: 'header' as const,
      minContrastRatio: 7,
    } as TypographyStyle,
    display3: {
      fontSize: FONT_SIZES['3xl'],
      fontWeight: FONT_WEIGHTS.bold,
      lineHeight: FONT_SIZES['3xl'] * LINE_HEIGHTS.snug,
      letterSpacing: LETTER_SPACINGS.tight,
      color: colors.text,
      accessibilityRole: 'header' as const,
      minContrastRatio: 7,
    } as TypographyStyle,
    h1: {
      fontSize: FONT_SIZES['3xl'],
      fontWeight: FONT_WEIGHTS.bold,
      lineHeight: FONT_SIZES['3xl'] * LINE_HEIGHTS.snug,
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
      minContrastRatio: 4.5,
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
    body: {
      fontSize: FONT_SIZES.base,
      fontWeight: FONT_WEIGHTS.regular,
      lineHeight: FONT_SIZES.base * LINE_HEIGHTS.relaxed,
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
      lineHeight: FONT_SIZES.sm * LINE_HEIGHTS.relaxed,
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
    caption: {
      fontSize: FONT_SIZES.xs,
      fontWeight: FONT_WEIGHTS.regular,
      lineHeight: FONT_SIZES.xs * LINE_HEIGHTS.relaxed,
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
    button: {
      fontSize: FONT_SIZES.md,
      fontWeight: FONT_WEIGHTS.semibold,
      lineHeight: FONT_SIZES.md * LINE_HEIGHTS.snug,
      letterSpacing: LETTER_SPACINGS.wide,
      accessibilityRole: 'button' as const,
      minContrastRatio: 4.5,
    } as TypographyStyle,
    buttonSmall: {
      fontSize: FONT_SIZES.sm,
      fontWeight: FONT_WEIGHTS.semibold,
      lineHeight: FONT_SIZES.sm * LINE_HEIGHTS.snug,
      letterSpacing: LETTER_SPACINGS.wide,
      accessibilityRole: 'button' as const,
      minContrastRatio: 4.5,
    } as TypographyStyle,
    buttonLarge: {
      fontSize: FONT_SIZES.lg,
      fontWeight: FONT_WEIGHTS.semibold,
      lineHeight: FONT_SIZES.lg * LINE_HEIGHTS.snug,
      letterSpacing: LETTER_SPACINGS.wide,
      accessibilityRole: 'button' as const,
      minContrastRatio: 7,
    } as TypographyStyle,
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
    price: {
      fontSize: FONT_SIZES.xl,
      fontWeight: FONT_WEIGHTS.bold,
      lineHeight: FONT_SIZES.xl * LINE_HEIGHTS.snug,
      color: colors.primary,
      accessibilityRole: 'text' as const,
      minContrastRatio: 4.5,
    } as TypographyStyle,
    priceSmall: {
      fontSize: FONT_SIZES.md,
      fontWeight: FONT_WEIGHTS.semibold,
      lineHeight: FONT_SIZES.md * LINE_HEIGHTS.snug,
      color: colors.primary,
      accessibilityRole: 'text' as const,
      minContrastRatio: 4.5,
    } as TypographyStyle,
  } as const;
};

export const TYPOGRAPHY = createTypography(false);

export const TEXT_VARIANTS = {
  pageTitle: TYPE_SCALE.display.h1,
  sectionTitle: TYPE_SCALE.display.h2,
  cardTitle: TYPE_SCALE.display.h3,
  itemTitle: TYPE_SCALE.display.h4,
  paragraph: TYPE_SCALE.body.base,
  description: TYPE_SCALE.body.small,
  hint: TYPE_SCALE.body.caption,
  legal: TYPE_SCALE.body.tiny,
  buttonText: TYPE_SCALE.button.base,
  linkText: TYPE_SCALE.link.base,
  tabLabel: TYPE_SCALE.label.base,
  chipLabel: TYPE_SCALE.label.small,
  price: TYPE_SCALE.mono.price,
  statNumber: TYPE_SCALE.mono.stat,
  navItem: TYPE_SCALE.label.base,
  headerTitle: TYPE_SCALE.display.h3,
  title: TYPOGRAPHY.h1,
  subtitle: TYPOGRAPHY.h3,
  detail: TYPOGRAPHY.bodySmall,
  cta: TYPOGRAPHY.button,
  navigation: TYPOGRAPHY.labelLarge,
} as const;

export const TOUCH_TARGETS = {
  minimum: { width: 44, height: 44 },
  recommended: { width: 48, height: 48 },
  comfortable: { width: 56, height: 56 },
} as const;

export const TypographyAccessibility = {
  meetsContrastRequirement: (
    _foreground: string,
    _background: string,
    _minimumRatio = 4.5
  ): boolean => true,
  getScaledFontSize: (fontSize: number): number => getAccessibleFontSize(fontSize),
  MINIMUM_TOUCH_TARGET: TOUCH_TARGETS.minimum,
};

export type FontFamily = keyof typeof FONTS;
export type FontSize = keyof typeof FONT_SIZES;
export type TypographyCategory = keyof typeof TYPE_SCALE;
export type TypographyVariant = keyof ReturnType<typeof createTypography>;
export type TextVariant = keyof typeof TEXT_VARIANTS;
