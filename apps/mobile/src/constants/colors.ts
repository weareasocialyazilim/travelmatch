/**
 * TravelMatch Awwwards Design System - Colors
 *
 * "Liquid Warmth" aesthetic - Organic Luxury meets Playful Warmth
 *
 * Design Philosophy:
 * - Gift-giving = warmth, emotion, connection
 * - Travel = discovery, adventure, freedom
 * - Trust = reliability, transparency
 *
 * Architecture:
 * 1. PRIMITIVES - Raw color values (internal use only)
 * 2. COLORS - Semantic colors (use these in components)
 * 3. GRADIENTS - Gradient presets for common use cases
 * 4. SHADOWS - Shadow presets for elevation
 */

// ============================================
// 1. PRIMITIVE COLORS (Raw values - DO NOT use directly)
// ============================================
const primitives = {
  // Primary: Warm Orange (Gift warmth)
  orange: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#F97316', // ← Main
    600: '#EA580C',
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12',
  },

  // Secondary: Rose (Emotional connection)
  rose: {
    50: '#FFF1F2',
    100: '#FFE4E6',
    200: '#FECDD3',
    300: '#FDA4AF',
    400: '#FB7185',
    500: '#F43F5E', // ← Main
    600: '#E11D48',
    700: '#BE123C',
    800: '#9F1239',
    900: '#881337',
  },

  // Accent: Aurora Violet (Premium feel)
  violet: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D5FF',
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#A855F7', // ← Main
    600: '#9333EA',
    700: '#7C3AED',
    800: '#6B21A8',
    900: '#581C87',
  },

  // Trust: Emerald (Reliability)
  emerald: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981', // ← Main
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },

  // Info: Sky Blue
  sky: {
    50: '#F0F9FF',
    100: '#E0F2FE',
    200: '#BAE6FD',
    300: '#7DD3FC',
    400: '#38BDF8',
    500: '#0EA5E9', // ← Main
    600: '#0284C7',
    700: '#0369A1',
    800: '#075985',
    900: '#0C4A6E',
  },

  // Error: Red
  red: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444', // ← Main
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },

  // Neutral: Warm Stone
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

  white: '#FFFFFF',
  black: '#000000',
} as const;

// ============================================
// 2. SEMANTIC COLORS (Use these in components)
// ============================================
export const COLORS = {
  // --------------------------------------------
  // Brand - Primary (Warm Orange)
  // --------------------------------------------
  primary: primitives.orange[500],
  primaryLight: primitives.orange[400],
  primaryDark: primitives.orange[600],
  primaryMuted: 'rgba(249, 115, 22, 0.12)',

  // --------------------------------------------
  // Brand - Secondary (Rose)
  // --------------------------------------------
  secondary: primitives.rose[500],
  secondaryLight: primitives.rose[400],
  secondaryDark: primitives.rose[600],
  secondaryMuted: 'rgba(244, 63, 94, 0.12)',

  // --------------------------------------------
  // Brand - Accent (Aurora Violet)
  // --------------------------------------------
  accent: primitives.violet[500],
  accentLight: primitives.violet[400],
  accentDark: primitives.violet[600],
  accentMuted: 'rgba(168, 85, 247, 0.12)',

  // --------------------------------------------
  // Trust System
  // --------------------------------------------
  trust: primitives.emerald[500],
  trustLight: primitives.emerald[400],
  trustDark: primitives.emerald[600],
  trustMuted: 'rgba(16, 185, 129, 0.12)',

  // Trust Score Ring Levels
  trustLow: primitives.stone[400],
  trustMedium: primitives.orange[500],
  trustHigh: primitives.emerald[500],
  trustPlatinum: '#E5E4E2',

  // KYC Badge Colors
  kycBronze: '#CD7F32',
  kycSilver: '#C0C0C0',
  kycGold: '#FFD700',
  kycPlatinum: '#E5E4E2',

  // --------------------------------------------
  // Semantic Feedback
  // --------------------------------------------
  success: primitives.emerald[500],
  successLight: primitives.emerald[50],
  successDark: primitives.emerald[600],
  successMuted: 'rgba(16, 185, 129, 0.12)',
  successBorder: primitives.emerald[200],

  error: primitives.red[500],
  errorLight: primitives.red[50],
  errorDark: primitives.red[600],
  errorBorder: primitives.red[200],
  danger: primitives.red[500],
  destructive: primitives.red[600],

  warning: primitives.orange[500],
  warningLight: primitives.orange[50],
  warningDark: primitives.orange[600],
  warningBorder: primitives.orange[200],

  info: primitives.sky[500],
  infoLight: primitives.sky[50],
  infoDark: primitives.sky[600],
  infoBorder: primitives.sky[200],

  // --------------------------------------------
  // Text
  // --------------------------------------------
  text: primitives.stone[900],
  textPrimary: primitives.stone[900],
  textSecondary: primitives.stone[500],
  textTertiary: primitives.stone[400],
  textMuted: primitives.stone[400],
  textDisabled: primitives.stone[300],
  textInverse: primitives.white,
  textAccent: primitives.orange[600],
  textLink: primitives.sky[600],
  subtitle: 'rgba(255, 255, 255, 0.9)',

  // Text on dark backgrounds
  textOnDark: primitives.white,
  textOnDarkSecondary: 'rgba(255, 255, 255, 0.7)',
  textOnDarkMuted: 'rgba(255, 255, 255, 0.5)',

  // --------------------------------------------
  // Background
  // --------------------------------------------
  background: '#FFFCF7',           // Warm cream
  backgroundSecondary: '#FFF9F0',  // Slightly warmer
  backgroundTertiary: '#FFF5E6',   // Warm tint
  backgroundLight: primitives.white,
  backgroundDark: primitives.stone[950],
  backgroundDarkSecondary: primitives.stone[900],
  backgroundElevated: primitives.white,

  // --------------------------------------------
  // Surface
  // --------------------------------------------
  surface: primitives.white,
  surfaceLight: primitives.white,
  surfaceMuted: primitives.stone[50],
  surfaceSubtle: primitives.stone[100],
  surfaceDark: primitives.stone[800],

  // --------------------------------------------
  // Border
  // --------------------------------------------
  border: primitives.stone[200],
  borderLight: primitives.stone[100],
  borderStrong: primitives.stone[300],
  borderFocus: primitives.orange[500],
  borderError: primitives.red[500],
  borderDark: primitives.stone[700],
  borderDarkSubtle: primitives.stone[800],

  // --------------------------------------------
  // Interactive
  // --------------------------------------------
  interactive: primitives.orange[500],
  interactiveHover: primitives.orange[600],
  interactivePressed: primitives.orange[700],

  // --------------------------------------------
  // Glass Effects (iOS Liquid Glass)
  // --------------------------------------------
  glass: 'rgba(255, 252, 247, 0.75)',
  glassBorder: 'rgba(255, 255, 255, 0.25)',
  glassLight: 'rgba(255, 255, 255, 0.9)',
  glassDark: 'rgba(28, 25, 23, 0.85)',
  glassDarkBorder: 'rgba(255, 255, 255, 0.1)',

  // --------------------------------------------
  // Overlay
  // --------------------------------------------
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.04)',
  overlayMedium: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',
  modalBackdrop: 'rgba(0, 0, 0, 0.4)',

  // --------------------------------------------
  // Gray Scale (Warm Stone)
  // --------------------------------------------
  gray: primitives.stone,

  // --------------------------------------------
  // UI Essentials
  // --------------------------------------------
  white: primitives.white,
  black: primitives.black,
  transparent: 'transparent',
  disabled: primitives.stone[300],
  shadow: primitives.stone[950],
  shadowColor: primitives.stone[950],

  // --------------------------------------------
  // Card
  // --------------------------------------------
  card: primitives.white,
  cardBackground: primitives.white,
  cardDark: primitives.stone[800],

  // --------------------------------------------
  // Input
  // --------------------------------------------
  inputBackground: primitives.stone[50],

  // --------------------------------------------
  // Button
  // --------------------------------------------
  buttonPrimary: primitives.orange[500],
  buttonSecondary: primitives.rose[500],
  buttonDark: primitives.stone[800],
  buttonDisabled: primitives.stone[300],

  // --------------------------------------------
  // Social/Brand Colors
  // --------------------------------------------
  facebook: '#1877F2',
  google: '#4285F4',
  apple: primitives.black,
  twitter: '#1DA1F2',
  whatsapp: '#25D366',
  instagram: '#E4405F',
  telegram: '#0088CC',
  linkedin: '#0A66C2',
  tiktok: primitives.black,
  visa: '#1A1F71',
  mastercard: '#EB001B',

  // --------------------------------------------
  // Additional Named Colors
  // --------------------------------------------
  orange: primitives.orange[500],
  orangeLight: primitives.orange[400],
  orangeDark: primitives.orange[600],
  orangeBright: primitives.orange[300],

  rose: primitives.rose[500],
  roseLight: primitives.rose[400],
  roseDark: primitives.rose[600],

  violet: primitives.violet[500],
  violetLight: primitives.violet[400],
  violetDark: primitives.violet[600],

  emerald: primitives.emerald[500],
  emeraldLight: primitives.emerald[400],
  emeraldDark: primitives.emerald[600],

  sky: primitives.sky[500],
  skyLight: primitives.sky[400],
  skyDark: primitives.sky[600],

  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  platinum: '#E5E4E2',

  teal: '#14B8A6',
  indigo: '#6366F1',
  coral: primitives.rose[500],
  mint: primitives.emerald[500],
  purple: primitives.violet[500],
  pink: primitives.rose[400],
  blue: primitives.sky[500],

  // ============================================
  // LEGACY ALIASES (Deprecated - use semantic names)
  // These are kept for backwards compatibility only
  // ============================================

  // Legacy overlay variants
  overlay30: 'rgba(0, 0, 0, 0.3)',
  overlay40: 'rgba(0, 0, 0, 0.4)',
  overlay50: 'rgba(0, 0, 0, 0.5)',
  overlay60: 'rgba(0, 0, 0, 0.6)',
  overlay70: 'rgba(0, 0, 0, 0.7)',
  overlay75: 'rgba(0, 0, 0, 0.75)',
  darkOverlay: 'rgba(20, 20, 20, 0.4)',

  // Legacy text variants
  textWhite70: 'rgba(255, 255, 255, 0.7)',
  textWhite80: 'rgba(255, 255, 255, 0.8)',

  // Legacy white transparency
  whiteTransparent: 'rgba(255, 255, 255, 0.18)',
  transparentWhite: 'rgba(255, 255, 255, 0.18)',
  whiteTransparentLight: 'rgba(255, 255, 255, 0.3)',
  whiteTransparentDark: 'rgba(255, 255, 255, 0.2)',
  whiteTransparentDarker: 'rgba(255, 255, 255, 0.1)',
  whiteTransparentDarkest: 'rgba(255, 255, 255, 0.05)',
  whiteOverlay20: 'rgba(255, 255, 255, 0.2)',
  whiteOverlay30: 'rgba(255, 255, 255, 0.3)',
  whiteOverlay70: 'rgba(255, 255, 255, 0.7)',
  whiteOverlay80: 'rgba(255, 255, 255, 0.8)',

  // Legacy black transparency
  blackTransparent: 'rgba(0, 0, 0, 0.5)',
  blackTransparentLight: 'rgba(0, 0, 0, 0.3)',
  blackTransparentDark: 'rgba(0, 0, 0, 0.1)',
  blackTransparentDarker: 'rgba(0, 0, 0, 0.08)',

  // Legacy mint colors (use trust/emerald/success)
  mintDark: primitives.emerald[600],
  mintTransparent: 'rgba(16, 185, 129, 0.12)',
  mintTransparentLight: 'rgba(16, 185, 129, 0.15)',
  mintTransparentDark: 'rgba(16, 185, 129, 0.2)',
  mintBorder: primitives.emerald[200],
  mintBackground: primitives.emerald[100],

  // Legacy error variants
  errorRed: primitives.red[500],
  errorRedLight: primitives.red[100],
  errorBackground: primitives.red[50],

  // Legacy color transparency
  primaryTransparent: 'rgba(249, 115, 22, 0.15)',
  secondaryTransparent: 'rgba(244, 63, 94, 0.15)',
  coralTransparent: 'rgba(244, 63, 94, 0.15)',
  coralTransparentLight: 'rgba(244, 63, 94, 0.1)',
  softOrangeTransparent: 'rgba(251, 146, 60, 0.15)',
  purpleTransparent: 'rgba(168, 85, 247, 0.15)',
  softGrayTransparent: 'rgba(168, 162, 158, 0.15)',
  successTransparent: 'rgba(16, 185, 129, 0.15)',
  errorTransparent10: 'rgba(239, 68, 68, 0.1)',
  errorTransparent20: 'rgba(239, 68, 68, 0.2)',
  tealTransparent20: 'rgba(20, 184, 166, 0.2)',
  warningTransparent20: 'rgba(249, 115, 22, 0.2)',
  successTransparent33: 'rgba(16, 185, 129, 0.33)',
  infoTransparent33: 'rgba(14, 165, 233, 0.33)',
  warningTransparent33: 'rgba(249, 115, 22, 0.33)',
  emeraldTransparent20: 'rgba(16, 185, 129, 0.2)',
  whatsappTransparent20: 'rgba(37, 211, 102, 0.2)',
  instagramTransparent20: 'rgba(228, 64, 95, 0.2)',

  // Legacy filter/pill
  filterPillActive: 'rgba(249, 115, 22, 0.2)',
  filterPillActiveBorder: 'rgba(249, 115, 22, 0.5)',

  // Legacy misc
  backgroundGradient: '#FFFCF7',
  glassBackground: 'rgba(255, 252, 247, 0.85)',
  mapHeader: 'rgba(255, 252, 247, 0.95)',
  beige: '#E8D9CE',
  beigeLight: '#F4ECE7',
  brown: '#9C6C49',
  brownDark: '#221710',
  brownGray: primitives.stone[400],
  greenSuccess: primitives.emerald[500],
  greenBright: primitives.emerald[400],
  greenDark: primitives.emerald[700],
  orangeAlt: primitives.orange[500],
  softOrange: primitives.orange[300],
  softRed: primitives.red[300],
  softGray: primitives.stone[400],
  grayMedium: primitives.stone[500],
  grayLight: primitives.stone[400],
  darkGray: primitives.stone[300],
  lightGray: primitives.stone[200],

  // Legacy amber aliases (now using orange)
  amber: primitives.orange[500],
  amberLight: primitives.orange[100],
  amberDark: primitives.orange[600],
  amberBright: primitives.orange[400],
} as const;

// ============================================
// 3. GRADIENT PRESETS
// ============================================
export const GRADIENTS = {
  // Hero gradients
  hero: [primitives.orange[500], primitives.rose[500], primitives.violet[500]] as const,
  heroVertical: ['#F97316', '#F43F5E', '#0C0A09'] as const,

  // Primary gradients
  primary: [primitives.orange[500], primitives.orange[400]] as const,
  secondary: [primitives.rose[500], primitives.rose[400]] as const,

  // Gift-moment specific
  gift: [primitives.orange[500], primitives.rose[500]] as const,
  giftButton: [primitives.orange[500], primitives.rose[500]] as const,
  giftVertical: [primitives.orange[400], primitives.rose[600]] as const,

  // Trust/Success
  trust: [primitives.emerald[400], primitives.emerald[600]] as const,

  // Decorative
  sunset: [primitives.orange[500], primitives.red[500]] as const,
  aurora: [primitives.violet[500], primitives.rose[500], primitives.orange[500]] as const,
  celebration: [primitives.rose[500], primitives.violet[500], primitives.sky[500]] as const,

  // Card overlay (for image cards)
  cardOverlay: ['transparent', 'rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0.8)'] as const,
  cardOverlayLight: ['transparent', 'rgba(0, 0, 0, 0.2)', 'rgba(0, 0, 0, 0.5)'] as const,
  hero: ['transparent', 'rgba(0, 0, 0, 0.7)'] as const,
  heroLight: ['transparent', 'rgba(0, 0, 0, 0.5)'] as const,

  // Glass
  glassLight: ['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)'] as const,
  glassDark: ['rgba(28, 25, 23, 0.9)', 'rgba(28, 25, 23, 0.7)'] as const,

  // Button states
  buttonDisabled: [primitives.stone[300], primitives.stone[400]] as const,
} as const;

// ============================================
// 4. SHADOW PRESETS
// ============================================
export const SHADOWS = {
  xs: {
    shadowColor: primitives.stone[950],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: primitives.stone[950],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: primitives.stone[950],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: primitives.stone[950],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: primitives.stone[950],
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },
  glow: {
    shadowColor: primitives.orange[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  glowRose: {
    shadowColor: primitives.rose[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
} as const;

// Legacy shadow exports for backwards compatibility
export const CARD_SHADOW = SHADOWS.md;
export const CARD_SHADOW_LIGHT = SHADOWS.sm;
export const CARD_SHADOW_HEAVY = SHADOWS.lg;

// Export primitives for advanced use cases (theme generation, etc.)
export { primitives };
