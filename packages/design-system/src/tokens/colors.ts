/**
 * TravelMatch Ultimate Design System - Colors
 *
 * "Cinematic Travel + Trust Jewelry"
 * Palette A: Sunset Proof
 *
 * Usage:
 * - Primary (Amber): Actions - Gift, Create, Continue
 * - Secondary (Magenta): Emotion - Reactions, Highlights, Proof
 * - Accent (Seafoam): Discovery - Map, Location, Filters
 * - Trust (Emerald): Reliability - Scores, Verification
 */

// ═══════════════════════════════════════════════════
// PRIMITIVES
// ═══════════════════════════════════════════════════
const primitives = {
  amber: {
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
  },
  magenta: {
    50: '#FDF2F8',
    100: '#FCE7F3',
    200: '#FBCFE8',
    300: '#F9A8D4',
    400: '#F472B6',
    500: '#EC4899',
    600: '#DB2777',
    700: '#BE185D',
    800: '#9D174D',
    900: '#831843',
  },
  seafoam: {
    50: '#F0FDFA',
    100: '#CCFBF1',
    200: '#99F6E4',
    300: '#5EEAD4',
    400: '#2DD4BF',
    500: '#14B8A6',
    600: '#0D9488',
    700: '#0F766E',
    800: '#115E59',
    900: '#134E4A',
  },
  emerald: {
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
  },
  stone: {
    0: '#FFFFFF',
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
  red: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    500: '#EF4444',
    600: '#DC2626',
  },
  blue: {
    50: '#EFF6FF',
    500: '#3B82F6',
    600: '#2563EB',
  },
} as const;


// ═══════════════════════════════════════════════════
// SEMANTIC COLORS
// ═══════════════════════════════════════════════════
export const COLORS = {
  // Primary (Actions)
  primary: primitives.amber[500],
  primaryLight: primitives.amber[400],
  primaryDark: primitives.amber[600],
  primaryMuted: 'rgba(245, 158, 11, 0.12)',
  primarySurface: primitives.amber[50],

  // Secondary (Emotion)
  secondary: primitives.magenta[500],
  secondaryLight: primitives.magenta[400],
  secondaryDark: primitives.magenta[600],
  secondaryMuted: 'rgba(236, 72, 153, 0.12)',
  secondarySurface: primitives.magenta[50],

  // Accent (Discovery)
  accent: primitives.seafoam[500],
  accentLight: primitives.seafoam[400],
  accentDark: primitives.seafoam[600],
  accentMuted: 'rgba(20, 184, 166, 0.12)',
  accentSurface: primitives.seafoam[50],

  // Trust (Reliability)
  trust: primitives.emerald[500],
  trustLight: primitives.emerald[400],
  trustDark: primitives.emerald[600],
  trustMuted: 'rgba(16, 185, 129, 0.15)',
  trustSurface: primitives.emerald[50],

  // Trust Levels (Jewelry Tiers)
  trustPlatinum: '#E5E4E2',
  trustGold: '#FFD700',
  trustSilver: '#C0C0C0',
  trustBronze: '#CD7F32',

  // Background
  background: '#FFFCF8',
  backgroundSecondary: '#FFF9F2',
  backgroundTertiary: '#FFF5E8',
  backgroundDark: '#0C0A09',
  backgroundDarkSecondary: '#1C1917',
  backgroundDarkTertiary: '#292524',

  // Surface
  surface: '#FFFFFF',
  surfaceMuted: primitives.stone[50],
  surfaceSubtle: primitives.stone[100],

  // Glass
  glass: 'rgba(255, 252, 248, 0.78)',
  glassBorder: 'rgba(255, 255, 255, 0.2)',
  glassLight: 'rgba(255, 255, 255, 0.92)',
  glassDark: 'rgba(28, 25, 23, 0.88)',
  glassDarkBorder: 'rgba(255, 255, 255, 0.08)',

  // Text
  text: primitives.stone[900],
  textSecondary: primitives.stone[500],
  textTertiary: primitives.stone[400],
  textMuted: primitives.stone[400],
  textDisabled: primitives.stone[300],
  textInverse: '#FFFFFF',
  textOnDark: '#FFFFFF',
  textOnDarkSecondary: 'rgba(255, 255, 255, 0.72)',
  textOnDarkMuted: 'rgba(255, 255, 255, 0.48)',

  // Border
  border: primitives.stone[200],
  borderLight: primitives.stone[100],
  borderStrong: primitives.stone[300],
  borderFocus: primitives.amber[500],
  hairline: 'rgba(0, 0, 0, 0.1)',
  hairlineLight: 'rgba(255, 255, 255, 0.1)',

  // Feedback
  success: primitives.emerald[500],
  successLight: primitives.emerald[50],
  error: primitives.red[500],
  errorLight: primitives.red[50],
  warning: primitives.amber[500],
  warningLight: primitives.amber[50],
  info: primitives.blue[500],
  infoLight: primitives.blue[50],

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',
  backdrop: 'rgba(0, 0, 0, 0.4)',

  // Social
  apple: '#000000',
  google: '#4285F4',

  // Utility
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Card (alias)
  card: '#FFFFFF',
  cardBackground: '#FFFFFF',
  inputBackground: primitives.stone[50],
} as const;


// ═══════════════════════════════════════════════════
// GRADIENTS
// ═══════════════════════════════════════════════════
export const GRADIENTS = {
  // Hero/Splash
  hero: [primitives.amber[500], primitives.magenta[500]] as const,
  heroVertical: ['#F59E0B', '#EC4899', '#0C0A09'] as const,

  // Gift CTA
  gift: [primitives.amber[500], primitives.magenta[500]] as const,
  giftSoft: [primitives.amber[400], primitives.magenta[400]] as const,
  giftButton: [primitives.amber[500], primitives.magenta[500]] as const,

  // Trust
  trust: [primitives.emerald[400], primitives.emerald[600]] as const,
  trustShimmer: ['#34D399', '#10B981', '#34D399'] as const,

  // Discovery
  discover: [primitives.seafoam[400], primitives.seafoam[600]] as const,

  // Sunset (Onboarding)
  sunset: ['#FCD34D', '#F59E0B', '#EC4899'] as const,
  sunsetSoft: ['rgba(252, 211, 77, 0.3)', 'rgba(236, 72, 153, 0.2)'] as const,
  aurora: [primitives.magenta[500], primitives.amber[500]] as const,
  celebration: [primitives.magenta[500], primitives.amber[400]] as const,

  // Card Overlays
  cardOverlay: ['transparent', 'rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0.75)'] as const,
  cardOverlayLight: ['transparent', 'rgba(0, 0, 0, 0.2)', 'rgba(0, 0, 0, 0.5)'] as const,

  // Glass
  glassLight: ['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)'] as const,
  glassDark: ['rgba(28, 25, 23, 0.9)', 'rgba(28, 25, 23, 0.7)'] as const,

  // Map
  mapPeek: ['rgba(255, 252, 248, 0)', 'rgba(255, 252, 248, 1)'] as const,

  // Disabled
  disabled: [primitives.stone[300], primitives.stone[400]] as const,
} as const;


// ═══════════════════════════════════════════════════
// SHADOWS
// ═══════════════════════════════════════════════════
export const SHADOWS = {
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHover: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  button: {
    shadowColor: primitives.amber[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonPressed: {
    shadowColor: primitives.amber[500],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  trustGlow: {
    shadowColor: primitives.emerald[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  elevated: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  subtle: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  // Legacy compatibility
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
} as const;

export { primitives };

// Type exports
export type ColorName = keyof typeof COLORS;
export type GradientName = keyof typeof GRADIENTS;
export type ShadowName = keyof typeof SHADOWS;
