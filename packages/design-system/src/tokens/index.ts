/**
 * Design Tokens - Main Export
 * TravelMatch Web Design System 2026
 * "Cinematic Travel + Trust Jewelry" - Sunset Proof Palette
 */

import { colors, gradients, hslColors } from './colors';
import type { Colors, Gradients, HslColors } from './colors';
import {
  spacing,
  radius,
  shadows,
  containerWidths,
  zIndex,
  durations,
  easings,
} from './spacing';
import type {
  Spacing,
  Radius,
  Shadows,
  ContainerWidths,
  ZIndex,
  Durations,
  Easings,
} from './spacing';
import { typography } from './typography';
import type { Typography } from './typography';

// Re-export all tokens
export { colors, gradients, hslColors } from './colors';
export type { Colors, Gradients, HslColors } from './colors';

export { typography } from './typography';
export type { Typography } from './typography';

export {
  spacing,
  radius,
  shadows,
  containerWidths,
  zIndex,
  durations,
  easings,
} from './spacing';
export type {
  Spacing,
  Radius,
  Shadows,
  ContainerWidths,
  ZIndex,
  Durations,
  Easings,
} from './spacing';

// ═══════════════════════════════════════════
// COMBINED THEME TYPE
// ═══════════════════════════════════════════
export interface Theme {
  colors: Colors;
  gradients: Gradients;
  hslColors: HslColors;
  typography: Typography;
  spacing: Spacing;
  radius: Radius;
  shadows: Shadows;
  containerWidths: ContainerWidths;
  zIndex: ZIndex;
  durations: Durations;
  easings: Easings;
}

// ═══════════════════════════════════════════
// DEFAULT THEME
// ═══════════════════════════════════════════
export const defaultTheme: Theme = {
  colors,
  gradients,
  hslColors,
  typography,
  spacing,
  radius,
  shadows,
  containerWidths,
  zIndex,
  durations,
  easings,
};

// ═══════════════════════════════════════════
// TAILWIND CONFIG EXPORT
// Helper for generating Tailwind config
// ═══════════════════════════════════════════
export const tailwindTokens = {
  colors: {
    primary: colors.primary,
    secondary: colors.secondary,
    accent: colors.accent,
    trust: colors.trust,
    stone: colors.stone,
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    info: colors.info,
    cream: colors.background.cream,
    'cream-dark': colors.background.creamDark,
  },
  backgroundImage: {
    'gradient-hero': gradients.hero,
    'gradient-sunset': gradients.sunset,
    'gradient-trust': gradients.trust,
    'gradient-discover': gradients.discover,
    'gradient-glass': gradients.glass,
    'gradient-dark': gradients.dark,
    'gradient-card-overlay': gradients.cardOverlay,
    'gradient-radial-glow': gradients.radialGlow,
  },
  boxShadow: {
    card: shadows.card,
    'card-hover': shadows.cardHover,
    button: shadows.button,
    'button-secondary': shadows.buttonSecondary,
    'trust-glow': shadows.trustGlow,
    glass: shadows.glass,
    'inner-glow': shadows.innerGlow,
  },
  borderRadius: {
    lg: `${radius.lg}px`,
    xl: `${radius.xl}px`,
    '2xl': `${radius['2xl']}px`,
    '3xl': `${radius['3xl']}px`,
    '4xl': `${radius['4xl']}px`,
  },
};
