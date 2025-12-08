/**
 * Design Tokens - Typography
 * Manually managed typography scale for TravelMatch
 */

export const typography = {
  // Font Families
  fontFamily: {
    primary:
      'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    secondary:
      'SF Pro Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: 'SF Mono, Menlo, Monaco, "Courier New", monospace',
  },

  // Font Sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
  },

  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },

  // Font Weights
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  // Letter Spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    wider: 1,
  },

  // Text Styles (Presets)
  styles: {
    // Headings
    h1: {
      fontSize: 48,
      lineHeight: 1.2,
      fontWeight: '700',
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 36,
      lineHeight: 1.2,
      fontWeight: '700',
      letterSpacing: -0.5,
    },
    h3: {
      fontSize: 30,
      lineHeight: 1.3,
      fontWeight: '600',
      letterSpacing: 0,
    },
    h4: {
      fontSize: 24,
      lineHeight: 1.4,
      fontWeight: '600',
      letterSpacing: 0,
    },
    h5: {
      fontSize: 20,
      lineHeight: 1.4,
      fontWeight: '600',
      letterSpacing: 0,
    },
    h6: {
      fontSize: 18,
      lineHeight: 1.5,
      fontWeight: '600',
      letterSpacing: 0,
    },

    // Body Text
    body1: {
      fontSize: 16,
      lineHeight: 1.5,
      fontWeight: '400',
      letterSpacing: 0,
    },
    body2: {
      fontSize: 14,
      lineHeight: 1.5,
      fontWeight: '400',
      letterSpacing: 0,
    },

    // Caption
    caption: {
      fontSize: 12,
      lineHeight: 1.5,
      fontWeight: '400',
      letterSpacing: 0.5,
    },

    // Button
    button: {
      fontSize: 16,
      lineHeight: 1.5,
      fontWeight: '600',
      letterSpacing: 0.5,
    },
  },
} as const;

export type Typography = typeof typography;
