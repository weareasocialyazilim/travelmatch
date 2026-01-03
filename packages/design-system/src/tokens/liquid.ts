/**
 * TravelMatch Liquid Design System
 * Cross-Platform Design Tokens
 *
 * This file provides unified "Liquid" design tokens that work across:
 * - React Native (via StyleSheet)
 * - Web (via CSS Variables / Tailwind)
 *
 * The "Liquid" aesthetic is characterized by:
 * - Soft, flowing gradients
 * - Subtle shadows with transparency
 * - Smooth border radius transitions
 * - Glass morphism effects
 * - Organic, fluid animations
 */

// =============================================================================
// LIQUID COLORS
// =============================================================================

export const LIQUID_COLORS = {
  // Primary gradient stops
  primary: {
    start: '#F59E0B', // Amber 500
    end: '#D97706', // Amber 600
    glow: 'rgba(245, 158, 11, 0.3)',
  },

  // Secondary gradient stops
  secondary: {
    start: '#EC4899', // Pink 500
    end: '#DB2777', // Pink 600
    glow: 'rgba(236, 72, 153, 0.3)',
  },

  // Trust gradient (emerald)
  trust: {
    start: '#10B981', // Emerald 500
    end: '#059669', // Emerald 600
    glow: 'rgba(16, 185, 129, 0.3)',
  },

  // Glass effect colors
  glass: {
    background: 'rgba(255, 255, 255, 0.1)',
    backgroundDark: 'rgba(0, 0, 0, 0.2)',
    border: 'rgba(255, 255, 255, 0.2)',
    borderDark: 'rgba(255, 255, 255, 0.1)',
  },

  // Surface colors
  surface: {
    elevated: '#FFFFFF',
    elevatedDark: '#1F2937',
    muted: '#F9FAFB',
    mutedDark: '#111827',
  },
} as const;

// =============================================================================
// LIQUID SHADOWS
// =============================================================================

export const LIQUID_SHADOWS = {
  // Subtle elevation
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  // Standard elevation
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },

  // Prominent elevation
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 6,
  },

  // Floating elevation
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 40,
    elevation: 10,
  },

  // Glow effects (for neon/accent)
  glow: {
    primary: {
      shadowColor: LIQUID_COLORS.primary.start,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 8,
    },
    trust: {
      shadowColor: LIQUID_COLORS.trust.start,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 8,
    },
  },
} as const;

// =============================================================================
// LIQUID BORDER RADIUS
// =============================================================================

export const LIQUID_RADIUS = {
  /** Minimal rounding (4px) */
  xs: 4,
  /** Small rounding (8px) */
  sm: 8,
  /** Medium rounding (12px) - Default for cards */
  md: 12,
  /** Large rounding (16px) - Default for buttons */
  lg: 16,
  /** Extra large (20px) - For modals */
  xl: 20,
  /** 2XL (24px) - For bottom sheets */
  '2xl': 24,
  /** Full rounding (9999px) - For pills/badges */
  full: 9999,
} as const;

// =============================================================================
// LIQUID SPACING (8pt Grid)
// =============================================================================

export const LIQUID_SPACING = {
  /** 0px */
  none: 0,
  /** 4px */
  xs: 4,
  /** 8px */
  sm: 8,
  /** 12px */
  md: 12,
  /** 16px */
  lg: 16,
  /** 24px */
  xl: 24,
  /** 32px */
  '2xl': 32,
  /** 48px */
  '3xl': 48,
  /** 64px */
  '4xl': 64,
} as const;

// =============================================================================
// LIQUID ANIMATION (for web/CSS)
// =============================================================================

export const LIQUID_ANIMATION = {
  // Duration
  duration: {
    instant: '0ms',
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
    slower: '700ms',
  },

  // Easing
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    // Liquid-specific (springy)
    liquid: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    // Smooth deceleration
    smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
  },

  // Spring config (for React Native Reanimated)
  spring: {
    gentle: {
      damping: 20,
      stiffness: 100,
      mass: 1,
    },
    bouncy: {
      damping: 10,
      stiffness: 150,
      mass: 0.8,
    },
    stiff: {
      damping: 25,
      stiffness: 200,
      mass: 1,
    },
  },
} as const;

// =============================================================================
// LIQUID BLUR (Glass morphism)
// =============================================================================

export const LIQUID_BLUR = {
  /** Subtle blur (4px) */
  sm: 4,
  /** Standard blur (8px) */
  md: 8,
  /** Heavy blur (16px) */
  lg: 16,
  /** Maximum blur (24px) */
  xl: 24,
} as const;

// =============================================================================
// CSS VARIABLE EXPORT (for Web/Tailwind)
// =============================================================================

export const LIQUID_CSS_VARS = `
  :root {
    /* Liquid Primary */
    --liquid-primary-start: ${LIQUID_COLORS.primary.start};
    --liquid-primary-end: ${LIQUID_COLORS.primary.end};
    --liquid-primary-glow: ${LIQUID_COLORS.primary.glow};
    
    /* Liquid Secondary */
    --liquid-secondary-start: ${LIQUID_COLORS.secondary.start};
    --liquid-secondary-end: ${LIQUID_COLORS.secondary.end};
    --liquid-secondary-glow: ${LIQUID_COLORS.secondary.glow};
    
    /* Liquid Trust */
    --liquid-trust-start: ${LIQUID_COLORS.trust.start};
    --liquid-trust-end: ${LIQUID_COLORS.trust.end};
    --liquid-trust-glow: ${LIQUID_COLORS.trust.glow};
    
    /* Liquid Glass */
    --liquid-glass-bg: ${LIQUID_COLORS.glass.background};
    --liquid-glass-border: ${LIQUID_COLORS.glass.border};
    
    /* Liquid Animation */
    --liquid-duration-fast: ${LIQUID_ANIMATION.duration.fast};
    --liquid-duration-normal: ${LIQUID_ANIMATION.duration.normal};
    --liquid-easing-liquid: ${LIQUID_ANIMATION.easing.liquid};
    --liquid-easing-smooth: ${LIQUID_ANIMATION.easing.smooth};
    
    /* Liquid Radius */
    --liquid-radius-sm: ${LIQUID_RADIUS.sm}px;
    --liquid-radius-md: ${LIQUID_RADIUS.md}px;
    --liquid-radius-lg: ${LIQUID_RADIUS.lg}px;
    --liquid-radius-xl: ${LIQUID_RADIUS.xl}px;
    --liquid-radius-full: ${LIQUID_RADIUS.full}px;
  }
`;

// =============================================================================
// TAILWIND PLUGIN CONFIG
// =============================================================================

export const liquidTailwindExtension = {
  // Add to theme.extend in tailwind config
  backgroundImage: {
    'liquid-primary': `linear-gradient(135deg, ${LIQUID_COLORS.primary.start}, ${LIQUID_COLORS.primary.end})`,
    'liquid-secondary': `linear-gradient(135deg, ${LIQUID_COLORS.secondary.start}, ${LIQUID_COLORS.secondary.end})`,
    'liquid-trust': `linear-gradient(135deg, ${LIQUID_COLORS.trust.start}, ${LIQUID_COLORS.trust.end})`,
    'liquid-glass': `linear-gradient(135deg, ${LIQUID_COLORS.glass.background}, ${LIQUID_COLORS.glass.backgroundDark})`,
  },
  boxShadow: {
    'liquid-sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
    'liquid-md': '0 4px 8px rgba(0, 0, 0, 0.1)',
    'liquid-lg': '0 10px 20px rgba(0, 0, 0, 0.15)',
    'liquid-glow-primary': `0 0 16px ${LIQUID_COLORS.primary.glow}`,
    'liquid-glow-trust': `0 0 16px ${LIQUID_COLORS.trust.glow}`,
  },
  transitionTimingFunction: {
    liquid: LIQUID_ANIMATION.easing.liquid,
    'liquid-smooth': LIQUID_ANIMATION.easing.smooth,
  },
  backdropBlur: {
    'liquid-sm': `${LIQUID_BLUR.sm}px`,
    'liquid-md': `${LIQUID_BLUR.md}px`,
    'liquid-lg': `${LIQUID_BLUR.lg}px`,
  },
};

// =============================================================================
// EXPORT ALL
// =============================================================================

export const LiquidDesign = {
  colors: LIQUID_COLORS,
  shadows: LIQUID_SHADOWS,
  radius: LIQUID_RADIUS,
  spacing: LIQUID_SPACING,
  animation: LIQUID_ANIMATION,
  blur: LIQUID_BLUR,
  cssVars: LIQUID_CSS_VARS,
  tailwind: liquidTailwindExtension,
};

export default LiquidDesign;
