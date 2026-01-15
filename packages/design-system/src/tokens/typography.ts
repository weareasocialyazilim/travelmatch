/**
 * Design Tokens - Typography
 * Lovendo Web Design System 2026
 * "Cinematic Travel + Trust Jewelry"
 */

export const typography = {
  // ═══════════════════════════════════════════
  // FONT FAMILIES
  // ═══════════════════════════════════════════
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"SF Mono", "Fira Code", "Fira Mono", "Roboto Mono", monospace',
  },

  // ═══════════════════════════════════════════
  // FONT SIZES (Desktop)
  // ═══════════════════════════════════════════
  fontSize: {
    hero: 72, // 4.5rem - Landing hero headline
    'hero-mobile': 40, // 2.5rem - Mobile hero
    display: 48, // 3rem - Page titles
    'display-mobile': 32, // 2rem - Mobile page titles
    h1: 48, // 3rem
    h2: 36, // 2.25rem
    h3: 28, // 1.75rem
    h4: 22, // 1.375rem
    h5: 20, // 1.25rem
    h6: 18, // 1.125rem
    'body-lg': 20, // 1.25rem - Lead paragraphs
    body: 16, // 1rem - Body text
    'body-sm': 14, // 0.875rem - Secondary text
    caption: 12, // 0.75rem - Captions, labels
    overline: 11, // 0.6875rem - Overlines (uppercase)
  },

  // ═══════════════════════════════════════════
  // LINE HEIGHTS
  // ═══════════════════════════════════════════
  lineHeight: {
    hero: 1.1,
    'hero-mobile': 1.15,
    h1: 1.2,
    h2: 1.25,
    h3: 1.3,
    h4: 1.35,
    body: 1.6,
    caption: 1.4,
    overline: 1.3,
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.6,
    loose: 2,
  },

  // ═══════════════════════════════════════════
  // FONT WEIGHTS
  // ═══════════════════════════════════════════
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },

  // ═══════════════════════════════════════════
  // LETTER SPACING
  // ═══════════════════════════════════════════
  letterSpacing: {
    tighter: '-0.03em',
    tight: '-0.02em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },

  // ═══════════════════════════════════════════
  // TEXT STYLES (Presets)
  // ═══════════════════════════════════════════
  styles: {
    // Hero (Landing page)
    hero: {
      fontSize: 72,
      lineHeight: 1.1,
      fontWeight: '800',
      letterSpacing: '-0.03em',
    },
    'hero-mobile': {
      fontSize: 40,
      lineHeight: 1.15,
      fontWeight: '800',
      letterSpacing: '-0.02em',
    },

    // Display
    display: {
      fontSize: 48,
      lineHeight: 1.2,
      fontWeight: '700',
      letterSpacing: '-0.02em',
    },
    'display-mobile': {
      fontSize: 32,
      lineHeight: 1.2,
      fontWeight: '700',
      letterSpacing: '-0.02em',
    },

    // Headings
    h1: {
      fontSize: 48,
      lineHeight: 1.2,
      fontWeight: '700',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: 36,
      lineHeight: 1.25,
      fontWeight: '700',
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: 28,
      lineHeight: 1.3,
      fontWeight: '600',
      letterSpacing: '0',
    },
    h4: {
      fontSize: 22,
      lineHeight: 1.35,
      fontWeight: '600',
      letterSpacing: '0',
    },
    h5: {
      fontSize: 20,
      lineHeight: 1.4,
      fontWeight: '600',
      letterSpacing: '0',
    },
    h6: {
      fontSize: 18,
      lineHeight: 1.5,
      fontWeight: '600',
      letterSpacing: '0',
    },

    // Body Text
    'body-lg': {
      fontSize: 20,
      lineHeight: 1.6,
      fontWeight: '400',
      letterSpacing: '0',
    },
    body: {
      fontSize: 16,
      lineHeight: 1.6,
      fontWeight: '400',
      letterSpacing: '0',
    },
    'body-sm': {
      fontSize: 14,
      lineHeight: 1.5,
      fontWeight: '400',
      letterSpacing: '0',
    },

    // Caption & Overline
    caption: {
      fontSize: 12,
      lineHeight: 1.4,
      fontWeight: '400',
      letterSpacing: '0',
    },
    overline: {
      fontSize: 11,
      lineHeight: 1.3,
      fontWeight: '600',
      letterSpacing: '0.1em',
      textTransform: 'uppercase' as const,
    },

    // Button
    button: {
      fontSize: 16,
      lineHeight: 1.5,
      fontWeight: '600',
      letterSpacing: '0.025em',
    },
    'button-sm': {
      fontSize: 14,
      lineHeight: 1.5,
      fontWeight: '600',
      letterSpacing: '0.025em',
    },
    'button-lg': {
      fontSize: 18,
      lineHeight: 1.5,
      fontWeight: '600',
      letterSpacing: '0.025em',
    },
  },
} as const;

export type Typography = typeof typography;
