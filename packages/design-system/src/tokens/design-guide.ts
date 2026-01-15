/**
 * Lovendo Design System - Typography & Spacing Guide
 * "Cinematic Travel + Trust Jewelry"
 *
 * Based on design reference (Visual 4):
 * - Clear Font Hierarchy
 * - Balanced Button Text
 * - Keep It Readable
 * - Use Consistent Scaling
 *
 * Mobile Typography Scale (based on 24px desktop headline):
 * - Headline: 20-24px (mobile), 24px (tablet), 28-32px (desktop)
 * - Subheadline: 14-16px (mobile), 16px (tablet), 18px (desktop)
 * - Body: 14px (mobile), 14-16px (tablet), 16px (desktop)
 * - Caption: 11-12px (all)
 * - Button: 14-16px (all)
 */

// ═══════════════════════════════════════════════════════════════════
// TYPOGRAPHY SCALE - Mobile First
// ═══════════════════════════════════════════════════════════════════

export const TYPOGRAPHY_SCALE = {
  // Display - Hero sections
  display: {
    '2xl': {
      fontSize: 32,
      lineHeight: 40,
      fontWeight: '800' as const,
      letterSpacing: -0.8,
    },
    xl: {
      fontSize: 28,
      lineHeight: 36,
      fontWeight: '700' as const,
      letterSpacing: -0.6,
    },
    lg: {
      fontSize: 24,
      lineHeight: 32,
      fontWeight: '700' as const,
      letterSpacing: -0.4,
    },
  },

  // Headline - Card titles, section headers
  headline: {
    lg: {
      fontSize: 20,
      lineHeight: 28,
      fontWeight: '600' as const,
      letterSpacing: -0.3,
    },
    md: {
      fontSize: 18,
      lineHeight: 26,
      fontWeight: '600' as const,
      letterSpacing: -0.2,
    },
    sm: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '600' as const,
      letterSpacing: -0.1,
    },
  },

  // Subheadline - Descriptions, secondary titles
  subheadline: {
    lg: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '500' as const,
      letterSpacing: 0,
    },
    md: {
      fontSize: 15,
      lineHeight: 22,
      fontWeight: '500' as const,
      letterSpacing: 0,
    },
    sm: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '500' as const,
      letterSpacing: 0,
    },
  },

  // Body - Main content
  body: {
    lg: {
      fontSize: 16,
      lineHeight: 26,
      fontWeight: '400' as const,
      letterSpacing: 0,
    },
    md: {
      fontSize: 14,
      lineHeight: 22,
      fontWeight: '400' as const,
      letterSpacing: 0,
    },
    sm: {
      fontSize: 13,
      lineHeight: 20,
      fontWeight: '400' as const,
      letterSpacing: 0,
    },
  },

  // Caption - Labels, timestamps
  caption: {
    md: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '400' as const,
      letterSpacing: 0.1,
    },
    sm: {
      fontSize: 11,
      lineHeight: 14,
      fontWeight: '400' as const,
      letterSpacing: 0.2,
    },
  },

  // Button text
  button: {
    lg: {
      fontSize: 16,
      lineHeight: 24,
      fontWeight: '600' as const,
      letterSpacing: 0.3,
    },
    md: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '600' as const,
      letterSpacing: 0.2,
    },
    sm: {
      fontSize: 12,
      lineHeight: 16,
      fontWeight: '600' as const,
      letterSpacing: 0.2,
    },
  },

  // Label - Form labels, tags
  label: {
    lg: {
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '500' as const,
      letterSpacing: 0,
    },
    md: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '500' as const,
      letterSpacing: 0,
    },
    sm: {
      fontSize: 11,
      lineHeight: 14,
      fontWeight: '600' as const,
      letterSpacing: 0.3,
    },
  },

  // Overline - Section labels (uppercase)
  overline: {
    md: {
      fontSize: 11,
      lineHeight: 14,
      fontWeight: '600' as const,
      letterSpacing: 1,
    },
    sm: {
      fontSize: 10,
      lineHeight: 12,
      fontWeight: '600' as const,
      letterSpacing: 1.2,
    },
  },

  // Mono - Prices, numbers
  mono: {
    lg: {
      fontSize: 18,
      lineHeight: 24,
      fontWeight: '700' as const,
      letterSpacing: 0,
    },
    md: {
      fontSize: 15,
      lineHeight: 20,
      fontWeight: '600' as const,
      letterSpacing: 0,
    },
    sm: {
      fontSize: 13,
      lineHeight: 16,
      fontWeight: '600' as const,
      letterSpacing: 0,
    },
  },
} as const;

// ═══════════════════════════════════════════════════════════════════
// SPACING SCALE - 4px Base Grid
// ═══════════════════════════════════════════════════════════════════

export const SPACING = {
  // Micro spacing
  '0.5': 2, // Border widths, small gaps
  '1': 4, // Icon-text gap
  '1.5': 6, // Badge padding
  '2': 8, // Inline element spacing

  // Component spacing
  '3': 12, // Card padding (compact)
  '4': 16, // Card padding (default)
  '5': 20, // Section padding
  '6': 24, // Large component padding

  // Layout spacing
  '8': 32, // Section gaps
  '10': 40, // Major section gaps
  '12': 48, // Page padding
  '16': 64, // Hero sections
  '20': 80, // Large spacing
  '24': 96, // Maximum spacing
} as const;

// ═══════════════════════════════════════════════════════════════════
// BORDER RADIUS - Consistent rounded corners
// ═══════════════════════════════════════════════════════════════════

export const RADII = {
  none: 0,
  xs: 4, // Small badges, tags
  sm: 8, // Buttons, inputs
  md: 12, // Cards (compact)
  lg: 16, // Cards (default), modals
  xl: 20, // Large cards
  '2xl': 24, // Hero cards
  '3xl': 32, // Special containers
  full: 9999, // Pills, avatars
} as const;

// ═══════════════════════════════════════════════════════════════════
// COMPONENT SIZE PRESETS
// ═══════════════════════════════════════════════════════════════════

export const COMPONENT_SIZES = {
  // Touch targets (WCAG 2.5.5 minimum: 44x44)
  touchTarget: {
    min: 44,
    comfortable: 48,
    large: 56,
  },

  // Avatar sizes
  avatar: {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
    '2xl': 80,
  },

  // Icon sizes
  icon: {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 32,
  },

  // Button heights
  button: {
    sm: 32,
    md: 40,
    lg: 48,
    xl: 56,
  },

  // Input heights
  input: {
    sm: 36,
    md: 44,
    lg: 52,
  },

  // Card dimensions
  card: {
    minHeight: 120,
    imageHeight: {
      compact: 120,
      default: 180,
      large: 240,
      hero: 320,
    },
  },
} as const;

// ═══════════════════════════════════════════════════════════════════
// TYPOGRAPHY USAGE GUIDE
// ═══════════════════════════════════════════════════════════════════

/**
 * CARD TYPOGRAPHY HIERARCHY (Mobile):
 *
 * ┌────────────────────────────────┐
 * │ Badge Label (11px/600)         │  ← TYPOGRAPHY_SCALE.label.sm
 * │                                │
 * │ ┌──────────────────────────┐   │
 * │ │    IMAGE (160-220px)     │   │
 * │ │                          │   │
 * │ │  Price Badge (15px/700)  │   │  ← TYPOGRAPHY_SCALE.mono.md
 * │ └──────────────────────────┘   │
 * │                                │
 * │ Card Title (18px/600)          │  ← TYPOGRAPHY_SCALE.headline.md
 * │ Location (13px/400)            │  ← TYPOGRAPHY_SCALE.body.sm
 * │                                │
 * │ [──── Gift Button ────]        │  ← TYPOGRAPHY_SCALE.button.md
 * │      (15px/600)                │
 * └────────────────────────────────┘
 *
 * NOTIFICATION TYPOGRAPHY:
 *
 * ┌────────────────────────────────┐
 * │ ○ │ Title (15px/600)       ●  │  ← TYPOGRAPHY_SCALE.subheadline.md
 * │   │ Message (14px/400)         │  ← TYPOGRAPHY_SCALE.body.md
 * │   │ Timestamp (12px/400)       │  ← TYPOGRAPHY_SCALE.caption.md
 * └────────────────────────────────┘
 *
 * DASHBOARD TYPOGRAPHY (Admin):
 *
 * Column Title: 14px/600 (label.lg)
 * Card Title: 14px/500 (body.md + medium weight)
 * Card Subtitle: 12px/400 (caption.md)
 * Tags: 11px/500 (label.sm)
 * Count Badge: 12px/500 (caption.md + medium weight)
 */

// ═══════════════════════════════════════════════════════════════════
// RESPONSIVE BREAKPOINTS
// ═══════════════════════════════════════════════════════════════════

export const BREAKPOINTS = {
  // Mobile first
  sm: 375, // Small phones
  md: 414, // Standard phones
  lg: 768, // Tablets
  xl: 1024, // Small laptops
  '2xl': 1280, // Desktops
} as const;

// ═══════════════════════════════════════════════════════════════════
// DESIGN TOKENS EXPORT
// ═══════════════════════════════════════════════════════════════════

export const DESIGN_TOKENS = {
  typography: TYPOGRAPHY_SCALE,
  spacing: SPACING,
  radii: RADII,
  sizes: COMPONENT_SIZES,
  breakpoints: BREAKPOINTS,
} as const;

export type TypographyScale = typeof TYPOGRAPHY_SCALE;
export type SpacingScale = typeof SPACING;
export type RadiiScale = typeof RADII;
export type ComponentSizes = typeof COMPONENT_SIZES;
