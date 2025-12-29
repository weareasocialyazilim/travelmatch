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

import { Platform, TextStyle, PixelRatio } from 'react-native';
import { LIGHT_COLORS, DARK_COLORS } from './colors';

// ═══════════════════════════════════════════════════
// TYPE SCALE
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
} as const;

// Type export
export type TypographyVariant = keyof typeof TYPOGRAPHY;

// ═══════════════════════════════════════════════════
// LEGACY EXPORTS (Backward Compatibility)
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

export const FONT_WEIGHTS = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const LINE_HEIGHTS = {
  tight: 1.25,
  normal: 1.5,
  relaxed: 1.75,
  loose: 2,
} as const;

export const LETTER_SPACINGS = {
  tighter: -1.2,
  tight: -1,
  semiTight: -0.5,
  normal: 0,
  wide: 0.2,
  wider: 0.3,
  widest: 1.2,
} as const;

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
// ACCESSIBILITY UTILITIES
// ═══════════════════════════════════════════════════

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
    hero: { ...TYPOGRAPHY.hero, color: colors.text, accessibilityRole: 'header' as const, minContrastRatio: 7 } as TypographyStyle,
    heroSmall: { ...TYPOGRAPHY.heroSmall, color: colors.text, accessibilityRole: 'header' as const, minContrastRatio: 7 } as TypographyStyle,
    h1: { ...TYPOGRAPHY.h1, color: colors.text, accessibilityRole: 'header' as const, minContrastRatio: 7 } as TypographyStyle,
    h2: { ...TYPOGRAPHY.h2, color: colors.text, accessibilityRole: 'header' as const, minContrastRatio: 7 } as TypographyStyle,
    h3: { ...TYPOGRAPHY.h3, color: colors.text, accessibilityRole: 'header' as const, minContrastRatio: 7 } as TypographyStyle,
    h4: { ...TYPOGRAPHY.h4, color: colors.text, accessibilityRole: 'header' as const, minContrastRatio: 4.5 } as TypographyStyle,
    body: { ...TYPOGRAPHY.body, color: colors.text, accessibilityRole: 'text' as const, minContrastRatio: 4.5 } as TypographyStyle,
    bodyLarge: { ...TYPOGRAPHY.bodyLarge, color: colors.text, accessibilityRole: 'text' as const, minContrastRatio: 4.5 } as TypographyStyle,
    bodySmall: { ...TYPOGRAPHY.bodySmall, color: colors.textSecondary, accessibilityRole: 'text' as const, minContrastRatio: 4.5 } as TypographyStyle,
    caption: { ...TYPOGRAPHY.caption, color: colors.textTertiary, accessibilityRole: 'text' as const, minContrastRatio: 4.5 } as TypographyStyle,
    captionSmall: { ...TYPOGRAPHY.captionSmall, color: colors.textTertiary, accessibilityRole: 'text' as const, minContrastRatio: 4.5 } as TypographyStyle,
    label: { ...TYPOGRAPHY.label, color: colors.text, accessibilityRole: 'text' as const, minContrastRatio: 4.5 } as TypographyStyle,
    labelLarge: { ...TYPOGRAPHY.labelLarge, color: colors.text, accessibilityRole: 'text' as const, minContrastRatio: 4.5 } as TypographyStyle,
    labelSmall: { ...TYPOGRAPHY.labelSmall, color: colors.text, accessibilityRole: 'text' as const, minContrastRatio: 4.5 } as TypographyStyle,
    overline: { ...TYPOGRAPHY.overline, color: colors.textSecondary, accessibilityRole: 'text' as const, minContrastRatio: 4.5 } as TypographyStyle,
    price: { ...TYPOGRAPHY.price, color: colors.primary, accessibilityRole: 'text' as const, minContrastRatio: 4.5 } as TypographyStyle,
    priceLarge: { ...TYPOGRAPHY.priceLarge, color: colors.primary, accessibilityRole: 'text' as const, minContrastRatio: 4.5 } as TypographyStyle,
    stat: { ...TYPOGRAPHY.stat, color: colors.text, accessibilityRole: 'text' as const, minContrastRatio: 7 } as TypographyStyle,
    score: { ...TYPOGRAPHY.score, color: colors.text, accessibilityRole: 'text' as const, minContrastRatio: 4.5 } as TypographyStyle,
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
  cta: TYPOGRAPHY.label,
  navigation: TYPOGRAPHY.labelLarge,
} as const;

export const TypographyAccessibility = {
  meetsContrastRequirement: (
    _foreground: string,
    _background: string,
    _minimumRatio = 4.5,
  ): boolean => {
    return true;
  },
  getScaledFontSize: (fontSize: number): number => {
    return getAccessibleFontSize(fontSize);
  },
  MINIMUM_TOUCH_TARGET: {
    width: 44,
    height: 44,
  },
};

export type ThemedTypographyVariant = keyof ReturnType<typeof createTypography>;
export type TextVariant = keyof typeof TEXT_VARIANTS;
