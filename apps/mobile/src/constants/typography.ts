// constants/typography.ts
// TravelMatch Design System - "Premium Editorial" Typography
// Motto: "Give a moment. See it happen."

import { Platform, TextStyle } from 'react-native';

// ═══════════════════════════════════════════════════════════════════
// FONT FAMILY - System fonts with correct weights
// ═══════════════════════════════════════════════════════════════════
export const FONTS = {
  // iOS: SF Pro, Android: Roboto (system default)
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
  semibold: Platform.select({
    ios: 'System',
    android: 'Roboto-Medium', // Android'de semibold = medium
    default: 'System',
  }),
  bold: Platform.select({
    ios: 'System',
    android: 'Roboto-Bold',
    default: 'System',
  }),
} as const;

// ═══════════════════════════════════════════════════════════════════
// FONT WEIGHTS - Cross-platform weight mapping
// ═══════════════════════════════════════════════════════════════════
export const FONT_WEIGHTS = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
} as const;

// ═══════════════════════════════════════════════════════════════════
// TYPE SCALE - 8pt grid, premium spacing
// ═══════════════════════════════════════════════════════════════════
export const TYPOGRAPHY = {
  // ─────────────────────────────────────────────
  // HERO - Splash, Onboarding hero text
  // 34-40px, bold, tight tracking
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

  // Display aliases for backward compatibility
  display1: {
    fontSize: 40,
    lineHeight: 46,
    fontWeight: '800' as const,
    letterSpacing: -1.2,
  } as TextStyle,

  display2: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700' as const,
    letterSpacing: -1,
  } as TextStyle,

  // ─────────────────────────────────────────────
  // DISPLAY - Screen titles, section headers
  // 20-28px, semibold/bold
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
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600' as const,
    letterSpacing: 0,
  } as TextStyle,

  h6: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600' as const,
    letterSpacing: 0.1,
  } as TextStyle,

  // ─────────────────────────────────────────────
  // BODY - Paragraphs, descriptions
  // 15-16px, comfortable line height
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
  // CAPTION - Secondary info, timestamps
  // 12-13px
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
  // LABEL - Buttons, chips, navigation
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

  labelXSmall: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600' as const,
    letterSpacing: 0.3,
  } as TextStyle,

  // ─────────────────────────────────────────────
  // OVERLINE - Category labels, section markers
  // Uppercase, small, spaced
  // ─────────────────────────────────────────────
  overline: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '600' as const,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
  } as TextStyle,

  overlineLarge: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600' as const,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  } as TextStyle,

  // ─────────────────────────────────────────────
  // MONO - Prices, scores, stats
  // Tabular numbers for alignment
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

  statSmall: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'] as const,
  } as TextStyle,

  score: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600' as const,
    letterSpacing: 0,
    fontVariant: ['tabular-nums'] as const,
  } as TextStyle,

  scoreLarge: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
    fontVariant: ['tabular-nums'] as const,
  } as TextStyle,

  // ─────────────────────────────────────────────
  // LINK - Clickable text
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
    letterSpacing: 0.1,
    textDecorationLine: 'underline' as const,
  } as TextStyle,

  // ─────────────────────────────────────────────
  // BUTTON - Button text styles
  // ─────────────────────────────────────────────
  button: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
  } as TextStyle,

  buttonSmall: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
  } as TextStyle,

  buttonLarge: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as const,
    letterSpacing: 0.1,
  } as TextStyle,
} as const;

// ═══════════════════════════════════════════════════════════════════
// FONT SIZE SCALE - Raw values for custom usage
// ═══════════════════════════════════════════════════════════════════
export const FONT_SIZES = {
  xs: 11,
  sm: 12,
  base: 13,
  md: 15,
  lg: 16,
  xl: 17,
  '2xl': 20,
  '3xl': 24,
  '4xl': 28,
  '5xl': 32,
  '6xl': 34,
  '7xl': 40,
} as const;

// ═══════════════════════════════════════════════════════════════════
// LINE HEIGHT SCALE - Raw values for custom usage
// ═══════════════════════════════════════════════════════════════════
export const LINE_HEIGHTS = {
  none: 1,
  tight: 1.15,
  snug: 1.25,
  normal: 1.4,
  relaxed: 1.5,
  loose: 1.625,
} as const;

// ═══════════════════════════════════════════════════════════════════
// LETTER SPACING SCALE - Raw values for custom usage
// ═══════════════════════════════════════════════════════════════════
export const LETTER_SPACING = {
  tighter: -1.2,
  tight: -0.5,
  normal: 0,
  wide: 0.2,
  wider: 0.5,
  widest: 1.2,
} as const;

// Type exports for TypeScript
export type TypographyKey = keyof typeof TYPOGRAPHY;
export type FontSizeKey = keyof typeof FONT_SIZES;
export type FontWeightKey = keyof typeof FONT_WEIGHTS;
