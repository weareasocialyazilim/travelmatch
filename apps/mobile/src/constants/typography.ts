/**
 * TravelMatch Awwwards Design System 2026 - Typography V2
 * "Sophisticated Typography" - Awwwards projelerinin %70'i tipografidir
 *
 * Premium Typography System featuring:
 * - Display: "Clash Display" - Bold, geometric, modern (for headlines)
 * - Body: "Satoshi" - Clean, readable, warm (for paragraphs)
 * - Mono: "JetBrains Mono" - For prices and numbers
 *
 * Tipografi Stratejisi:
 * - 40 yaş üstü için: Yüksek okunabilirlik (bodyL: 18px, relaxed line-height: 1.7)
 * - GenZ için: Estetik hiyerarşi (tight letter-spacing, bold display fonts)
 *
 * Başlıklar: Modern Serif veya Bold Sans (Prestij hissi)
 * Gövde: Temiz Geometric Sans (Netlik ve GenZ estetiği)
 *
 * All sizes follow 8pt grid system
 * WCAG 2.1 Level AA compliant line heights
 */

import { Platform, TextStyle, PixelRatio } from 'react-native';
import { COLORS } from './colors';

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
  // System fallback
  system: Platform.select({
    ios: 'System',
    android: 'Roboto',
    default: 'System',
  }),
} as const;

// ============================================
// 2. FONT SIZES (8pt grid based)
// ============================================
export const FONT_SIZES_V2 = {
  // Display sizes
  hero: 48, // 6 * 8
  display1: 40, // 5 * 8
  display2: 36,
  display3: 32, // 4 * 8

  // Heading sizes
  h1: 28,
  h2: 24, // 3 * 8
  h3: 22,
  h4: 20,
  h5: 18,
  h6: 16, // 2 * 8

  // Body sizes
  bodyLarge: 18,
  body: 16, // 2 * 8
  bodySmall: 14,
  caption: 12,
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

// ============================================
// 3. LINE HEIGHTS
// ============================================
export const LINE_HEIGHTS_V2 = {
  tight: 1.1, // For large display text
  snug: 1.25, // For headings
  normal: 1.5, // For body text (WCAG compliant)
  relaxed: 1.75, // For long-form text
  loose: 2, // For extra spacing
} as const;

// ============================================
// 4. LETTER SPACING
// ============================================
export const LETTER_SPACING_V2 = {
  tightest: -1.5, // Hero display
  tighter: -1, // Large headings
  tight: -0.5, // Medium headings
  normal: 0, // Body text
  wide: 0.3, // Labels
  wider: 0.5, // Buttons
  widest: 1, // Uppercase labels
} as const;

// ============================================
// 5. TYPE SCALE - Complete Typography Presets
// ============================================
export const TYPE_SCALE = {
  // ----------------------------------------
  // Display Styles - Hero headlines
  // ----------------------------------------
  display: {
    hero: {
      fontFamily: FONTS.display.black,
      fontSize: FONT_SIZES_V2.hero,
      lineHeight: Math.round(FONT_SIZES_V2.hero * LINE_HEIGHTS_V2.tight),
      letterSpacing: LETTER_SPACING_V2.tightest,
      fontWeight: '700',
    } as TextStyle,

    h1: {
      fontFamily: FONTS.display.bold,
      fontSize: FONT_SIZES_V2.display2,
      lineHeight: Math.round(FONT_SIZES_V2.display2 * LINE_HEIGHTS_V2.snug),
      letterSpacing: LETTER_SPACING_V2.tighter,
      fontWeight: '600',
    } as TextStyle,

    h2: {
      fontFamily: FONTS.display.bold,
      fontSize: FONT_SIZES_V2.h1,
      lineHeight: Math.round(FONT_SIZES_V2.h1 * LINE_HEIGHTS_V2.snug),
      letterSpacing: LETTER_SPACING_V2.tight,
      fontWeight: '600',
    } as TextStyle,

    h3: {
      fontFamily: FONTS.display.medium,
      fontSize: FONT_SIZES_V2.h3,
      lineHeight: Math.round(FONT_SIZES_V2.h3 * LINE_HEIGHTS_V2.snug),
      letterSpacing: LETTER_SPACING_V2.tight,
      fontWeight: '500',
    } as TextStyle,

    h4: {
      fontFamily: FONTS.display.medium,
      fontSize: FONT_SIZES_V2.h4,
      lineHeight: Math.round(FONT_SIZES_V2.h4 * LINE_HEIGHTS_V2.snug),
      letterSpacing: LETTER_SPACING_V2.normal,
      fontWeight: '500',
    } as TextStyle,
  },

  // ----------------------------------------
  // Body Styles - Paragraphs and content
  // ----------------------------------------
  body: {
    large: {
      fontFamily: FONTS.body.regular,
      fontSize: FONT_SIZES_V2.bodyLarge,
      lineHeight: Math.round(FONT_SIZES_V2.bodyLarge * LINE_HEIGHTS_V2.relaxed),
      letterSpacing: LETTER_SPACING_V2.normal,
      fontWeight: '400',
    } as TextStyle,

    base: {
      fontFamily: FONTS.body.regular,
      fontSize: FONT_SIZES_V2.body,
      lineHeight: Math.round(FONT_SIZES_V2.body * LINE_HEIGHTS_V2.normal),
      letterSpacing: LETTER_SPACING_V2.normal,
      fontWeight: '400',
    } as TextStyle,

    medium: {
      fontFamily: FONTS.body.semibold,
      fontSize: FONT_SIZES_V2.body,
      lineHeight: Math.round(FONT_SIZES_V2.body * LINE_HEIGHTS_V2.normal),
      letterSpacing: LETTER_SPACING_V2.normal,
      fontWeight: '500',
    } as TextStyle,

    small: {
      fontFamily: FONTS.body.regular,
      fontSize: FONT_SIZES_V2.bodySmall,
      lineHeight: Math.round(FONT_SIZES_V2.bodySmall * LINE_HEIGHTS_V2.normal),
      letterSpacing: LETTER_SPACING_V2.wide,
      fontWeight: '400',
    } as TextStyle,

    caption: {
      fontFamily: FONTS.body.regular,
      fontSize: FONT_SIZES_V2.caption,
      lineHeight: Math.round(FONT_SIZES_V2.caption * LINE_HEIGHTS_V2.normal),
      letterSpacing: LETTER_SPACING_V2.wide,
      fontWeight: '400',
    } as TextStyle,

    tiny: {
      fontFamily: FONTS.body.regular,
      fontSize: FONT_SIZES_V2.tiny,
      lineHeight: Math.round(FONT_SIZES_V2.tiny * LINE_HEIGHTS_V2.normal),
      letterSpacing: LETTER_SPACING_V2.wide,
      fontWeight: '400',
    } as TextStyle,
  },

  // ----------------------------------------
  // Label Styles - Buttons, tags, badges
  // ----------------------------------------
  label: {
    large: {
      fontFamily: FONTS.body.semibold,
      fontSize: FONT_SIZES_V2.labelLarge,
      lineHeight: Math.round(FONT_SIZES_V2.labelLarge * LINE_HEIGHTS_V2.tight),
      letterSpacing: LETTER_SPACING_V2.wider,
      fontWeight: '600',
    } as TextStyle,

    base: {
      fontFamily: FONTS.body.semibold,
      fontSize: FONT_SIZES_V2.label,
      lineHeight: Math.round(FONT_SIZES_V2.label * LINE_HEIGHTS_V2.tight),
      letterSpacing: LETTER_SPACING_V2.wider,
      fontWeight: '600',
    } as TextStyle,

    small: {
      fontFamily: FONTS.body.semibold,
      fontSize: FONT_SIZES_V2.labelSmall,
      lineHeight: Math.round(FONT_SIZES_V2.labelSmall * LINE_HEIGHTS_V2.tight),
      letterSpacing: LETTER_SPACING_V2.widest,
      fontWeight: '600',
      textTransform: 'uppercase',
    } as TextStyle,
  },

  // ----------------------------------------
  // Mono Styles - Prices and numbers
  // ----------------------------------------
  mono: {
    price: {
      fontFamily: FONTS.mono.medium,
      fontSize: FONT_SIZES_V2.price,
      lineHeight: Math.round(FONT_SIZES_V2.price * LINE_HEIGHTS_V2.tight),
      letterSpacing: LETTER_SPACING_V2.tight,
      fontWeight: '500',
    } as TextStyle,

    priceSmall: {
      fontFamily: FONTS.mono.medium,
      fontSize: FONT_SIZES_V2.priceSmall,
      lineHeight: Math.round(FONT_SIZES_V2.priceSmall * LINE_HEIGHTS_V2.tight),
      letterSpacing: LETTER_SPACING_V2.tight,
      fontWeight: '500',
    } as TextStyle,

    stat: {
      fontFamily: FONTS.mono.medium,
      fontSize: FONT_SIZES_V2.stat,
      lineHeight: Math.round(FONT_SIZES_V2.stat * LINE_HEIGHTS_V2.tight),
      letterSpacing: LETTER_SPACING_V2.tighter,
      fontWeight: '500',
    } as TextStyle,

    code: {
      fontFamily: FONTS.mono.regular,
      fontSize: FONT_SIZES_V2.bodySmall,
      lineHeight: Math.round(FONT_SIZES_V2.bodySmall * LINE_HEIGHTS_V2.normal),
      letterSpacing: LETTER_SPACING_V2.normal,
      fontWeight: '400',
    } as TextStyle,
  },

  // ----------------------------------------
  // Button Styles
  // ----------------------------------------
  button: {
    large: {
      fontFamily: FONTS.body.semibold,
      fontSize: FONT_SIZES_V2.bodyLarge,
      lineHeight: Math.round(FONT_SIZES_V2.bodyLarge * LINE_HEIGHTS_V2.tight),
      letterSpacing: LETTER_SPACING_V2.wider,
      fontWeight: '600',
    } as TextStyle,

    base: {
      fontFamily: FONTS.body.semibold,
      fontSize: FONT_SIZES_V2.body,
      lineHeight: Math.round(FONT_SIZES_V2.body * LINE_HEIGHTS_V2.tight),
      letterSpacing: LETTER_SPACING_V2.wider,
      fontWeight: '600',
    } as TextStyle,

    small: {
      fontFamily: FONTS.body.semibold,
      fontSize: FONT_SIZES_V2.bodySmall,
      lineHeight: Math.round(FONT_SIZES_V2.bodySmall * LINE_HEIGHTS_V2.tight),
      letterSpacing: LETTER_SPACING_V2.wider,
      fontWeight: '600',
    } as TextStyle,
  },

  // ----------------------------------------
  // Link Styles
  // ----------------------------------------
  link: {
    base: {
      fontFamily: FONTS.body.semibold,
      fontSize: FONT_SIZES_V2.body,
      lineHeight: Math.round(FONT_SIZES_V2.body * LINE_HEIGHTS_V2.normal),
      letterSpacing: LETTER_SPACING_V2.normal,
      fontWeight: '500',
      textDecorationLine: 'underline',
    } as TextStyle,

    small: {
      fontFamily: FONTS.body.semibold,
      fontSize: FONT_SIZES_V2.bodySmall,
      lineHeight: Math.round(FONT_SIZES_V2.bodySmall * LINE_HEIGHTS_V2.normal),
      letterSpacing: LETTER_SPACING_V2.normal,
      fontWeight: '500',
      textDecorationLine: 'underline',
    } as TextStyle,
  },

  // ----------------------------------------
  // Feedback Styles
  // ----------------------------------------
  feedback: {
    error: {
      fontFamily: FONTS.body.semibold,
      fontSize: FONT_SIZES_V2.bodySmall,
      lineHeight: Math.round(FONT_SIZES_V2.bodySmall * LINE_HEIGHTS_V2.normal),
      letterSpacing: LETTER_SPACING_V2.normal,
      fontWeight: '500',
      color: COLORS.feedback.error,
    } as TextStyle,

    success: {
      fontFamily: FONTS.body.semibold,
      fontSize: FONT_SIZES_V2.bodySmall,
      lineHeight: Math.round(FONT_SIZES_V2.bodySmall * LINE_HEIGHTS_V2.normal),
      letterSpacing: LETTER_SPACING_V2.normal,
      fontWeight: '500',
      color: COLORS.feedback.success,
    } as TextStyle,

    warning: {
      fontFamily: FONTS.body.semibold,
      fontSize: FONT_SIZES_V2.bodySmall,
      lineHeight: Math.round(FONT_SIZES_V2.bodySmall * LINE_HEIGHTS_V2.normal),
      letterSpacing: LETTER_SPACING_V2.normal,
      fontWeight: '500',
      color: COLORS.feedback.warning,
    } as TextStyle,

    info: {
      fontFamily: FONTS.body.semibold,
      fontSize: FONT_SIZES_V2.bodySmall,
      lineHeight: Math.round(FONT_SIZES_V2.bodySmall * LINE_HEIGHTS_V2.normal),
      letterSpacing: LETTER_SPACING_V2.normal,
      fontWeight: '500',
      color: COLORS.feedback.info,
    } as TextStyle,
  },

  // ----------------------------------------
  // Overline/Eyebrow Style
  // ----------------------------------------
  overline: {
    fontFamily: FONTS.body.semibold,
    fontSize: FONT_SIZES_V2.tiny,
    lineHeight: Math.round(FONT_SIZES_V2.tiny * LINE_HEIGHTS_V2.normal),
    letterSpacing: LETTER_SPACING_V2.widest,
    fontWeight: '600',
    textTransform: 'uppercase',
  } as TextStyle,
} as const;

// ============================================
// 6. ACCESSIBILITY UTILITIES
// ============================================

/**
 * Get accessible font size based on user's system settings
 * Caps scaling at 1.5x to prevent layout issues
 */
export const getAccessibleFontSize = (baseSize: number): number => {
  const fontScale = PixelRatio.getFontScale();
  const cappedScale = Math.min(fontScale, 1.5);
  return Math.round(baseSize * cappedScale);
};

/**
 * Get line height for a font size
 */
export const getLineHeight = (
  fontSize: number,
  ratio: number = LINE_HEIGHTS_V2.normal,
): number => {
  return Math.round(fontSize * ratio);
};

/**
 * Create accessible text style with scaled font
 */
export const createAccessibleTextStyle = (
  baseStyle: TextStyle,
  options?: {
    maxScale?: number;
    respectMotion?: boolean;
  },
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
// 7. TEXT VARIANTS (Semantic Aliases)
// ============================================
export const TEXT_VARIANTS_V2 = {
  // Page titles
  pageTitle: TYPE_SCALE.display.h1,
  sectionTitle: TYPE_SCALE.display.h2,
  cardTitle: TYPE_SCALE.display.h3,
  itemTitle: TYPE_SCALE.display.h4,

  // Content
  paragraph: TYPE_SCALE.body.base,
  description: TYPE_SCALE.body.small,
  hint: TYPE_SCALE.body.caption,
  legal: TYPE_SCALE.body.tiny,

  // Interactive
  buttonText: TYPE_SCALE.button.base,
  linkText: TYPE_SCALE.link.base,
  tabLabel: TYPE_SCALE.label.base,
  chipLabel: TYPE_SCALE.label.small,

  // Data
  price: TYPE_SCALE.mono.price,
  statNumber: TYPE_SCALE.mono.stat,

  // Navigation
  navItem: TYPE_SCALE.label.base,
  headerTitle: TYPE_SCALE.display.h3,
} as const;

// ============================================
// 8. MINIMUM TOUCH TARGETS (WCAG 2.5.5)
// ============================================
export const TOUCH_TARGETS = {
  minimum: {
    width: 44,
    height: 44,
  },
  recommended: {
    width: 48,
    height: 48,
  },
  comfortable: {
    width: 56,
    height: 56,
  },
} as const;

// Export types
export type FontFamily = keyof typeof FONTS;
export type FontSize = keyof typeof FONT_SIZES_V2;
export type TypographyCategory = keyof typeof TYPE_SCALE;

// ============================================
// 9. SIMPLIFIED TYPOGRAPHY API (Awwwards Style)
// ============================================

/**
 * Tipografi Stratejisi:
 * - Başlıklar: Modern Serif veya Bold Sans (Prestij hissi)
 * - Gövde: Temiz Geometric Sans (Netlik ve GenZ estetiği)
 *
 * 40+ Okunabilirlik: bodyL (18px) + relaxed line-height (1.7)
 * GenZ Estetik: tight letter-spacing + bold display fonts
 */
export const TYPOGRAPHY_SYSTEM = {
  families: {
    // Heading: Prestij ve modernlik için bold geometric font
    heading: FONTS.display.bold,
    // Body: Temiz, okunabilir geometric sans
    body: FONTS.body.regular,
    // Mono: Fiyatlar ve sayılar için
    mono: FONTS.mono.medium,
  },

  sizes: {
    display: 40, // Büyük kahraman metinler (splash, onboarding)
    h1: 32, // Ana başlıklar
    h2: 24, // Alt başlıklar
    h3: 20, // Bölüm başlıkları
    bodyL: 18, // Geniş okunabilirlik (40 yaş dostu)
    bodyM: 16, // Standart metin
    bodyS: 14, // Küçük açıklamalar
    caption: 12, // Etiketler
  },

  weights: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    black: '900' as const,
  },

  lineHeights: {
    tight: 1.2, // Display ve başlıklar için
    normal: 1.5, // Standart metin (WCAG uyumlu)
    relaxed: 1.7, // 40+ yaş okunabilirlik için
  },

  letterSpacing: {
    tight: -0.5, // Display için prestijli görünüm
    normal: 0, // Body için
    wide: 0.3, // Labels için
  },
} as const;

// ============================================
// 10. BACKWARD COMPATIBILITY (Legacy API Support)
// ============================================

/**
 * Legacy typography export for backward compatibility
 * Maps old API (typography.styles.xxx) to new API (TYPE_SCALE.xxx)
 */
export const typography = {
  // Font sizes (legacy)
  fontSize: {
    xs: FONT_SIZES_V2.tiny,
    sm: FONT_SIZES_V2.caption,
    md: FONT_SIZES_V2.body,
    lg: FONT_SIZES_V2.bodyLarge,
    xl: FONT_SIZES_V2.h4,
  },

  // Font weights (legacy)
  fontWeight: {
    normal: '400',
    medium: '500',
    bold: '700',
  },

  // Line heights (legacy)
  lineHeight: {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 28,
    xl: 32,
    base: 24,
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Styles (legacy) - Maps to TYPE_SCALE
  styles: {
    // Display styles
    hero: TYPE_SCALE.display.hero,
    h1: TYPE_SCALE.display.h1,
    h2: TYPE_SCALE.display.h2,
    h3: TYPE_SCALE.display.h3,
    h4: TYPE_SCALE.display.h4,

    // Body styles
    body1: TYPE_SCALE.body.base,
    body2: TYPE_SCALE.body.small,
    bodyLarge: TYPE_SCALE.body.large,
    bodySmall: TYPE_SCALE.body.small,
    caption: TYPE_SCALE.body.caption,
    tiny: TYPE_SCALE.body.tiny,

    // Button styles
    button: TYPE_SCALE.button.base,
    buttonLarge: TYPE_SCALE.button.large,
    buttonSmall: TYPE_SCALE.button.small,

    // Label styles
    label: TYPE_SCALE.label.base,
    labelLarge: TYPE_SCALE.label.large,
    labelSmall: TYPE_SCALE.label.small,

    // Mono styles
    price: TYPE_SCALE.mono.price,
    priceSmall: TYPE_SCALE.mono.priceSmall,
    stat: TYPE_SCALE.mono.stat,
    code: TYPE_SCALE.mono.code,

    // Link styles
    link: TYPE_SCALE.link.base,
    linkSmall: TYPE_SCALE.link.small,

    // Overline
    overline: TYPE_SCALE.overline,
  },

  // Flat access (legacy) - Direct access without .styles
  // Display styles
  hero: TYPE_SCALE.display.hero,
  display1: TYPE_SCALE.display.hero,
  display2: TYPE_SCALE.display.h1,
  h1: TYPE_SCALE.display.h1,
  h2: TYPE_SCALE.display.h2,
  h3: TYPE_SCALE.display.h3,
  h4: TYPE_SCALE.display.h4,

  // Body styles
  body: TYPE_SCALE.body.base,
  body1: TYPE_SCALE.body.base,
  body2: TYPE_SCALE.body.small,
  bodyLarge: TYPE_SCALE.body.large,
  bodySmall: TYPE_SCALE.body.small,
  bodyMedium: {
    ...TYPE_SCALE.body.base,
    fontWeight: '500',
  } as TextStyle, // Medium weight body text for compliance features
  subtitle: TYPE_SCALE.body.large,
  caption: TYPE_SCALE.body.caption,
  captionSmall: TYPE_SCALE.body.tiny,
  captionMedium: TYPE_SCALE.body.caption,
  tiny: TYPE_SCALE.body.tiny,
  score: TYPE_SCALE.mono.stat,

  // Button styles
  button: TYPE_SCALE.button.base,
  buttonLarge: TYPE_SCALE.button.large,
  buttonSmall: TYPE_SCALE.button.small,

  // Label styles
  label: TYPE_SCALE.label.base,
  labelLarge: TYPE_SCALE.label.large,
  labelSmall: TYPE_SCALE.label.small,
  labelXSmall: TYPE_SCALE.label.small,

  // Mono styles
  price: TYPE_SCALE.mono.price,
  priceSmall: TYPE_SCALE.mono.priceSmall,
  stat: TYPE_SCALE.mono.stat,
  code: TYPE_SCALE.mono.code,

  // Link styles
  link: TYPE_SCALE.link.base,
  linkSmall: TYPE_SCALE.link.small,

  // Overline
  overline: TYPE_SCALE.overline,
} as const;

// TYPOGRAPHY legacy alias - exports the typography object for backward compatibility
export const TYPOGRAPHY = typography;
