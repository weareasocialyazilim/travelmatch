/**
 * TravelMatch Awwwards Design System - Typography V2
 *
 * Font Choices:
 * - Display: "Clash Display" - Bold, geometric, modern headlines
 * - Body: "Satoshi" - Clean, readable, warm body text
 * - Mono: "JetBrains Mono" - For prices, numbers, stats
 *
 * If custom fonts aren't loaded, falls back to system fonts
 */

import { Platform, TextStyle } from 'react-native';
import { COLORS_V2 } from './colors-v2';

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
      default: 'Courier',
    }),
    regular: Platform.select({
      ios: 'JetBrainsMono-Regular',
      android: 'JetBrainsMono-Regular',
      default: 'Courier',
    }),
  },
} as const;


// ============================================
// 2. TYPE SCALE (8pt grid based)
// ============================================
export const TYPE_SCALE = {
  // ----------------------------------------
  // Display - Headlines, Hero Text
  // ----------------------------------------
  display: {
    hero: {
      fontFamily: FONTS.display.black,
      fontSize: 48,
      lineHeight: 52,
      letterSpacing: -1.5,
      fontWeight: '800',
    } as TextStyle,

    h1: {
      fontFamily: FONTS.display.bold,
      fontSize: 36,
      lineHeight: 42,
      letterSpacing: -1,
      fontWeight: '700',
    } as TextStyle,

    h2: {
      fontFamily: FONTS.display.bold,
      fontSize: 28,
      lineHeight: 34,
      letterSpacing: -0.5,
      fontWeight: '700',
    } as TextStyle,

    h3: {
      fontFamily: FONTS.display.medium,
      fontSize: 22,
      lineHeight: 28,
      letterSpacing: -0.3,
      fontWeight: '600',
    } as TextStyle,

    h4: {
      fontFamily: FONTS.display.medium,
      fontSize: 18,
      lineHeight: 24,
      letterSpacing: -0.2,
      fontWeight: '600',
    } as TextStyle,
  },

  // ----------------------------------------
  // Body - Paragraphs, Descriptions
  // ----------------------------------------
  body: {
    xl: {
      fontFamily: FONTS.body.regular,
      fontSize: 20,
      lineHeight: 30,
      letterSpacing: 0,
      fontWeight: '400',
    } as TextStyle,

    large: {
      fontFamily: FONTS.body.regular,
      fontSize: 18,
      lineHeight: 28,
      letterSpacing: 0,
      fontWeight: '400',
    } as TextStyle,

    base: {
      fontFamily: FONTS.body.regular,
      fontSize: 16,
      lineHeight: 24,
      letterSpacing: 0,
      fontWeight: '400',
    } as TextStyle,

    small: {
      fontFamily: FONTS.body.regular,
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0.1,
      fontWeight: '400',
    } as TextStyle,

    caption: {
      fontFamily: FONTS.body.regular,
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 0.2,
      fontWeight: '400',
    } as TextStyle,

    micro: {
      fontFamily: FONTS.body.regular,
      fontSize: 10,
      lineHeight: 14,
      letterSpacing: 0.3,
      fontWeight: '400',
    } as TextStyle,
  },

  // ----------------------------------------
  // Labels - Buttons, Tags, Navigation
  // ----------------------------------------
  label: {
    xl: {
      fontFamily: FONTS.body.semibold,
      fontSize: 18,
      lineHeight: 22,
      letterSpacing: 0.3,
      fontWeight: '600',
    } as TextStyle,

    large: {
      fontFamily: FONTS.body.semibold,
      fontSize: 16,
      lineHeight: 20,
      letterSpacing: 0.3,
      fontWeight: '600',
    } as TextStyle,

    base: {
      fontFamily: FONTS.body.semibold,
      fontSize: 14,
      lineHeight: 18,
      letterSpacing: 0.3,
      fontWeight: '600',
    } as TextStyle,

    small: {
      fontFamily: FONTS.body.semibold,
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 0.4,
      fontWeight: '600',
    } as TextStyle,

    // Uppercase variants
    upperLarge: {
      fontFamily: FONTS.body.semibold,
      fontSize: 14,
      lineHeight: 18,
      letterSpacing: 1,
      fontWeight: '600',
      textTransform: 'uppercase',
    } as TextStyle,

    upperSmall: {
      fontFamily: FONTS.body.semibold,
      fontSize: 11,
      lineHeight: 14,
      letterSpacing: 1.2,
      fontWeight: '600',
      textTransform: 'uppercase',
    } as TextStyle,
  },

  // ----------------------------------------
  // Mono - Prices, Numbers, Stats, Code
  // ----------------------------------------
  mono: {
    hero: {
      fontFamily: FONTS.mono.medium,
      fontSize: 48,
      lineHeight: 52,
      letterSpacing: -2,
      fontWeight: '500',
    } as TextStyle,

    stat: {
      fontFamily: FONTS.mono.medium,
      fontSize: 32,
      lineHeight: 36,
      letterSpacing: -1,
      fontWeight: '500',
    } as TextStyle,

    price: {
      fontFamily: FONTS.mono.medium,
      fontSize: 24,
      lineHeight: 28,
      letterSpacing: -0.5,
      fontWeight: '500',
    } as TextStyle,

    base: {
      fontFamily: FONTS.mono.regular,
      fontSize: 14,
      lineHeight: 20,
      letterSpacing: 0,
      fontWeight: '400',
    } as TextStyle,

    small: {
      fontFamily: FONTS.mono.regular,
      fontSize: 12,
      lineHeight: 16,
      letterSpacing: 0,
      fontWeight: '400',
    } as TextStyle,
  },
} as const;


// ============================================
// 3. SEMANTIC TEXT STYLES
// ============================================
export const TEXT_STYLES = {
  // Screen titles
  screenTitle: {
    ...TYPE_SCALE.display.h2,
    color: COLORS_V2.text.primary,
  } as TextStyle,

  // Section headers
  sectionTitle: {
    ...TYPE_SCALE.display.h3,
    color: COLORS_V2.text.primary,
  } as TextStyle,

  // Card titles
  cardTitle: {
    ...TYPE_SCALE.display.h4,
    color: COLORS_V2.text.primary,
  } as TextStyle,

  // Body text
  bodyPrimary: {
    ...TYPE_SCALE.body.base,
    color: COLORS_V2.text.primary,
  } as TextStyle,

  bodySecondary: {
    ...TYPE_SCALE.body.base,
    color: COLORS_V2.text.secondary,
  } as TextStyle,

  // Caption text
  caption: {
    ...TYPE_SCALE.body.caption,
    color: COLORS_V2.text.tertiary,
  } as TextStyle,

  // Button text
  buttonPrimary: {
    ...TYPE_SCALE.label.large,
    color: COLORS_V2.utility.white,
  } as TextStyle,

  buttonSecondary: {
    ...TYPE_SCALE.label.large,
    color: COLORS_V2.brand.primary,
  } as TextStyle,

  // Price display
  priceTag: {
    ...TYPE_SCALE.mono.price,
    color: COLORS_V2.brand.primary,
  } as TextStyle,

  priceStat: {
    ...TYPE_SCALE.mono.stat,
    color: COLORS_V2.text.primary,
  } as TextStyle,

  // Links
  link: {
    ...TYPE_SCALE.body.base,
    color: COLORS_V2.text.link,
    textDecorationLine: 'underline',
  } as TextStyle,

  // Error text
  error: {
    ...TYPE_SCALE.body.small,
    color: COLORS_V2.feedback.error,
  } as TextStyle,

  // Success text
  success: {
    ...TYPE_SCALE.body.small,
    color: COLORS_V2.feedback.success,
  } as TextStyle,

  // Muted/helper text
  helper: {
    ...TYPE_SCALE.body.caption,
    color: COLORS_V2.text.muted,
  } as TextStyle,

  // Badge/chip text
  badge: {
    ...TYPE_SCALE.label.small,
    color: COLORS_V2.utility.white,
  } as TextStyle,

  // On dark background
  onDarkTitle: {
    ...TYPE_SCALE.display.h2,
    color: COLORS_V2.text.onDark,
  } as TextStyle,

  onDarkBody: {
    ...TYPE_SCALE.body.base,
    color: COLORS_V2.text.onDarkSecondary,
  } as TextStyle,

  onDarkCaption: {
    ...TYPE_SCALE.body.caption,
    color: COLORS_V2.text.onDarkMuted,
  } as TextStyle,
} as const;


// ============================================
// 4. TYPOGRAPHY UTILITIES
// ============================================
export const truncateText = (lines: number = 1): TextStyle => ({
  numberOfLines: lines,
  overflow: 'hidden',
} as unknown as TextStyle);

export const textAlign = {
  left: { textAlign: 'left' } as TextStyle,
  center: { textAlign: 'center' } as TextStyle,
  right: { textAlign: 'right' } as TextStyle,
  justify: { textAlign: 'justify' } as TextStyle,
};

export const textDecoration = {
  underline: { textDecorationLine: 'underline' } as TextStyle,
  lineThrough: { textDecorationLine: 'line-through' } as TextStyle,
  none: { textDecorationLine: 'none' } as TextStyle,
};

export const fontWeight = {
  light: { fontWeight: '300' } as TextStyle,
  regular: { fontWeight: '400' } as TextStyle,
  medium: { fontWeight: '500' } as TextStyle,
  semibold: { fontWeight: '600' } as TextStyle,
  bold: { fontWeight: '700' } as TextStyle,
  black: { fontWeight: '800' } as TextStyle,
};


// ============================================
// 5. TYPE EXPORTS
// ============================================
export type FontFamily = keyof typeof FONTS;
export type DisplayVariant = keyof typeof TYPE_SCALE.display;
export type BodyVariant = keyof typeof TYPE_SCALE.body;
export type LabelVariant = keyof typeof TYPE_SCALE.label;
export type MonoVariant = keyof typeof TYPE_SCALE.mono;
export type TextStyleName = keyof typeof TEXT_STYLES;
