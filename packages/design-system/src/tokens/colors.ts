/**
 * Design Tokens - Colors
 * TravelMatch Web Design System 2026
 * "Cinematic Travel + Trust Jewelry" - Sunset Proof Palette
 */

export const colors = {
  // ═══════════════════════════════════════════
  // PRIMARY - Amber (Actions: Gift, Create, CTA)
  // ═══════════════════════════════════════════
  primary: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B', // Main primary
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
    DEFAULT: '#F59E0B',
  },

  // ═══════════════════════════════════════════
  // SECONDARY - Magenta (Emotion, Proof, Highlight)
  // ═══════════════════════════════════════════
  secondary: {
    50: '#FDF2F8',
    100: '#FCE7F3',
    200: '#FBCFE8',
    300: '#F9A8D4',
    400: '#F472B6',
    500: '#EC4899', // Main secondary
    600: '#DB2777',
    700: '#BE185D',
    800: '#9D174D',
    900: '#831843',
    DEFAULT: '#EC4899',
  },

  // ═══════════════════════════════════════════
  // ACCENT - Seafoam (Discovery, Map, Filter)
  // ═══════════════════════════════════════════
  accent: {
    50: '#F0FDFA',
    100: '#CCFBF1',
    200: '#99F6E4',
    300: '#5EEAD4',
    400: '#2DD4BF',
    500: '#14B8A6', // Main accent
    600: '#0D9488',
    700: '#0F766E',
    800: '#115E59',
    900: '#134E4A',
    DEFAULT: '#14B8A6',
  },

  // ═══════════════════════════════════════════
  // TRUST - Emerald (Score, Verified, Proof)
  // ═══════════════════════════════════════════
  trust: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981', // Main trust
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
    DEFAULT: '#10B981',
  },

  // ═══════════════════════════════════════════
  // NEUTRAL - Warm Stone
  // ═══════════════════════════════════════════
  stone: {
    50: '#FAFAF9',
    100: '#F5F5F4',
    200: '#E7E5E4',
    300: '#D6D3D1',
    400: '#A8A29E',
    500: '#78716C',
    600: '#57534E',
    700: '#44403C',
    800: '#292524',
    900: '#1C1917',
    950: '#0C0A09',
  },

  // ═══════════════════════════════════════════
  // SEMANTIC COLORS
  // ═══════════════════════════════════════════
  success: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
    DEFAULT: '#10B981',
  },

  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
    DEFAULT: '#F59E0B',
  },

  error: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
    DEFAULT: '#EF4444',
  },

  info: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
    DEFAULT: '#3B82F6',
  },

  // ═══════════════════════════════════════════
  // BACKGROUND COLORS
  // ═══════════════════════════════════════════
  background: {
    cream: '#FFFCF8',
    creamDark: '#FFF9F2',
    light: '#FFFFFF',
    dark: '#0C0A09',
    darkSecondary: '#1C1917',
  },

  // ═══════════════════════════════════════════
  // TEXT COLORS
  // ═══════════════════════════════════════════
  text: {
    primary: '#1C1917',
    secondary: '#78716C',
    muted: '#A8A29E',
    disabled: '#D6D3D1',
    inverse: '#FFFFFF',
  },

  // ═══════════════════════════════════════════
  // BORDER COLORS
  // ═══════════════════════════════════════════
  border: {
    light: '#E7E5E4',
    medium: '#D6D3D1',
    dark: '#A8A29E',
    hairline: 'rgba(0, 0, 0, 0.1)',
    hairlineLight: 'rgba(255, 255, 255, 0.1)',
  },

  // ═══════════════════════════════════════════
  // OVERLAY COLORS
  // ═══════════════════════════════════════════
  overlay: {
    light: 'rgba(0, 0, 0, 0.1)',
    medium: 'rgba(0, 0, 0, 0.3)',
    dark: 'rgba(0, 0, 0, 0.6)',
    card: 'rgba(0, 0, 0, 0.75)',
  },
} as const;

// ═══════════════════════════════════════════
// GRADIENTS
// ═══════════════════════════════════════════
export const gradients = {
  // Hero Gradient - Landing page hero, splash
  hero: 'linear-gradient(135deg, #F59E0B 0%, #EC4899 100%)',

  // Sunset Gradient - Onboarding, cards
  sunset: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 50%, #EC4899 100%)',

  // Trust Gradient - Trust rings, badges
  trust: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',

  // Discover Gradient - Discovery features
  discover: 'linear-gradient(135deg, #2DD4BF 0%, #14B8A6 100%)',

  // Glass Gradient - Cards, overlays
  glass: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',

  // Dark Gradient - Dark mode backgrounds
  dark: 'linear-gradient(135deg, #1C1917 0%, #0C0A09 100%)',

  // Card Overlay - Image cards
  cardOverlay:
    'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.75) 100%)',

  // Radial Glow - Decorative
  radialGlow: 'radial-gradient(circle at center, rgba(245, 158, 11, 0.15) 0%, transparent 70%)',
} as const;

// ═══════════════════════════════════════════
// HSL VALUES (for CSS variables)
// ═══════════════════════════════════════════
export const hslColors = {
  // Light mode
  light: {
    background: '40 33% 99%', // #FFFCF8 warm cream
    foreground: '20 14% 10%', // #1C1917
    card: '0 0% 100%',
    cardForeground: '20 14% 10%',
    popover: '0 0% 100%',
    popoverForeground: '20 14% 10%',
    primary: '38 92% 50%', // #F59E0B
    primaryForeground: '0 0% 100%',
    secondary: '330 81% 60%', // #EC4899
    secondaryForeground: '0 0% 100%',
    accent: '173 58% 39%', // #14B8A6
    accentForeground: '0 0% 100%',
    trust: '160 84% 39%', // #10B981
    muted: '30 6% 96%', // #F5F5F4
    mutedForeground: '25 5% 45%', // #78716C
    border: '30 6% 90%', // #E7E5E4
    input: '30 6% 90%',
    ring: '38 92% 50%',
    destructive: '0 84% 60%',
    destructiveForeground: '0 0% 100%',
  },
  // Dark mode
  dark: {
    background: '20 14% 4%', // #0C0A09
    foreground: '0 0% 100%',
    card: '20 14% 10%', // #1C1917
    cardForeground: '0 0% 100%',
    popover: '20 14% 10%',
    popoverForeground: '0 0% 100%',
    primary: '38 92% 50%',
    primaryForeground: '0 0% 100%',
    secondary: '330 81% 60%',
    secondaryForeground: '0 0% 100%',
    accent: '173 58% 39%',
    accentForeground: '0 0% 100%',
    trust: '160 84% 39%',
    muted: '20 14% 14%',
    mutedForeground: '30 6% 63%',
    border: '20 14% 18%',
    input: '20 14% 18%',
    ring: '38 92% 50%',
    destructive: '0 84% 60%',
    destructiveForeground: '0 0% 100%',
  },
} as const;

export type Colors = typeof colors;
export type Gradients = typeof gradients;
export type HslColors = typeof hslColors;
