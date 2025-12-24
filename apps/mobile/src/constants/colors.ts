/**
 * TravelMatch iOS 26.3 Design System Colors
 *
 * Semantic Color System for gift-moment experience
 * - Warm amber/pink palette for celebration and emotional connection
 * - Designed with 8pt grid system and WCAG accessibility standards
 *
 * Architecture:
 * 1. PRIMITIVES - Raw color values (internal use only)
 * 2. COLORS - Semantic colors (use these in components)
 * 3. GRADIENTS - Gradient presets for common use cases
 * 4. LEGACY_ALIASES - Backwards compatibility (deprecated)
 */

// ============================================
// 1. PRIMITIVE COLORS (Raw values - DO NOT use directly)
// ============================================
const primitives = {
  amber: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',  // Main amber
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  pink: {
    50: '#FDF2F8',
    100: '#FCE7F3',
    200: '#FBCFE8',
    300: '#F9A8D4',
    400: '#F472B6',
    500: '#EC4899',  // Main pink
    600: '#DB2777',
    700: '#BE185D',
    800: '#9D174D',
    900: '#831843',
  },
  emerald: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',  // Main emerald (Trust)
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },
  red: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',  // Main error
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },
  blue: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',  // Main info
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },
  purple: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D5FF',
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#8B5CF6',  // Main purple
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
  },
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  white: '#FFFFFF',
  black: '#000000',
} as const;

// ============================================
// 2. SEMANTIC COLORS (Use these in components)
// ============================================
export const COLORS = {
  // --------------------------------------------
  // Brand - Primary (Warm Amber)
  // --------------------------------------------
  primary: primitives.amber[500],
  primaryLight: primitives.amber[400],
  primaryDark: primitives.amber[600],
  primaryMuted: `rgba(245, 158, 11, 0.15)`,

  // --------------------------------------------
  // Brand - Secondary (Emotional Pink)
  // --------------------------------------------
  secondary: primitives.pink[500],
  secondaryLight: primitives.pink[400],
  secondaryMuted: `rgba(236, 72, 153, 0.15)`,

  // --------------------------------------------
  // Brand - Accent (Coral)
  // --------------------------------------------
  accent: '#FF6B6B',
  coral: '#FF6B6B',

  // --------------------------------------------
  // Trust System
  // --------------------------------------------
  trust: primitives.emerald[500],
  trustLight: primitives.emerald[400],
  trustDark: primitives.emerald[600],
  trustMuted: `rgba(16, 185, 129, 0.15)`,

  // Trust Score Ring Levels
  trustLow: primitives.red[500],
  trustMedium: primitives.amber[500],
  trustHigh: primitives.emerald[500],
  trustPlatinum: '#FFD700',

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
  successMuted: `rgba(16, 185, 129, 0.15)`,

  error: primitives.red[500],
  errorLight: primitives.red[100],
  errorDark: primitives.red[600],
  danger: primitives.red[500],
  destructive: primitives.red[600],

  warning: primitives.amber[500],
  warningLight: primitives.amber[100],
  warningDark: primitives.amber[600],

  info: primitives.blue[500],
  infoLight: primitives.blue[50],
  infoDark: primitives.blue[600],

  // --------------------------------------------
  // Text
  // --------------------------------------------
  text: primitives.gray[800],
  textPrimary: primitives.gray[800],
  textSecondary: primitives.gray[500],
  textTertiary: primitives.gray[400],
  textMuted: primitives.gray[400],
  textInverse: primitives.white,
  subtitle: 'rgba(255, 255, 255, 0.9)',

  // --------------------------------------------
  // Background
  // --------------------------------------------
  background: '#FFFBF5',         // Warm white
  backgroundSecondary: '#FFF8F0',
  backgroundLight: primitives.white,
  backgroundDark: '#0E1B14',

  // --------------------------------------------
  // Surface
  // --------------------------------------------
  surface: primitives.white,
  surfaceLight: primitives.white,
  surfaceDark: '#1A2F23',

  // --------------------------------------------
  // Border
  // --------------------------------------------
  border: primitives.gray[200],
  borderLight: primitives.gray[100],
  borderDark: '#2D4A3A',

  // --------------------------------------------
  // Glass Effects (iOS 26 Liquid Glass)
  // --------------------------------------------
  glass: 'rgba(255, 251, 245, 0.85)',
  glassBorder: 'rgba(255, 255, 255, 0.3)',
  glassLight: 'rgba(255, 255, 255, 0.95)',

  // --------------------------------------------
  // Overlay (Simplified - only 3 levels needed)
  // --------------------------------------------
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',
  modalBackdrop: 'rgba(0, 0, 0, 0.4)',

  // --------------------------------------------
  // Gray Scale
  // --------------------------------------------
  gray: primitives.gray,

  // --------------------------------------------
  // UI Essentials
  // --------------------------------------------
  white: primitives.white,
  black: primitives.black,
  transparent: 'transparent',
  disabled: primitives.gray[300],
  shadow: primitives.black,
  shadowColor: primitives.black,

  // --------------------------------------------
  // Card
  // --------------------------------------------
  card: primitives.white,
  cardBackground: primitives.white,
  cardDark: '#243D2F',

  // --------------------------------------------
  // Input
  // --------------------------------------------
  inputBackground: primitives.gray[50],

  // --------------------------------------------
  // Button
  // --------------------------------------------
  buttonPrimary: primitives.amber[500],
  buttonDark: primitives.gray[800],
  buttonDisabled: primitives.gray[300],

  // --------------------------------------------
  // Social/Brand Colors
  // --------------------------------------------
  facebook: '#1877F2',
  google: '#EA4335',
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
  amber: primitives.amber[500],
  amberLight: primitives.amber[100],
  amberDark: primitives.amber[600],
  amberBright: primitives.amber[400],
  emerald: primitives.emerald[500],
  purple: primitives.purple[500],
  violet: primitives.purple[500],
  pink: primitives.pink[500],
  blue: primitives.blue[500],
  gold: '#FFD700',
  teal: '#14B8A6',
  indigo: '#6366F1',
  orange: '#F97316',
  orangeDark: '#EA580C',
  orangeBright: '#FB923C',

  // ============================================
  // LEGACY ALIASES (Deprecated - use semantic names)
  // These are kept for backwards compatibility only
  // ============================================

  // Legacy overlay variants (use overlay, overlayLight, overlayDark)
  overlayMedium: 'rgba(0, 0, 0, 0.4)',
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
  mint: primitives.emerald[500],
  mintDark: primitives.emerald[600],
  mintTransparent: 'rgba(16, 185, 129, 0.12)',
  mintTransparentLight: 'rgba(16, 185, 129, 0.15)',
  mintTransparentDark: 'rgba(16, 185, 129, 0.2)',
  mintBorder: primitives.emerald[200],
  mintBackground: primitives.emerald[100],

  // Legacy error variants (use error, errorLight)
  errorRed: primitives.red[500],
  errorRedLight: primitives.red[100],
  errorBackground: primitives.red[50],

  // Legacy color transparency
  primaryTransparent: 'rgba(245, 158, 11, 0.15)',
  secondaryTransparent: 'rgba(236, 72, 153, 0.15)',
  coralTransparent: 'rgba(255, 107, 107, 0.15)',
  coralTransparentLight: 'rgba(255, 107, 107, 0.1)',
  softOrangeTransparent: 'rgba(255, 169, 77, 0.15)',
  purpleTransparent: 'rgba(139, 92, 246, 0.15)',
  softGrayTransparent: 'rgba(184, 180, 175, 0.15)',
  successTransparent: 'rgba(16, 185, 129, 0.15)',
  errorTransparent10: 'rgba(239, 68, 68, 0.1)',
  errorTransparent20: 'rgba(239, 68, 68, 0.2)',
  tealTransparent20: 'rgba(0, 128, 128, 0.2)',
  warningTransparent20: 'rgba(245, 158, 11, 0.2)',
  successTransparent33: 'rgba(16, 185, 129, 0.33)',
  infoTransparent33: 'rgba(59, 130, 246, 0.33)',
  warningTransparent33: 'rgba(245, 158, 11, 0.33)',
  emeraldTransparent20: 'rgba(16, 185, 129, 0.2)',
  whatsappTransparent20: 'rgba(37, 211, 102, 0.2)',
  instagramTransparent20: 'rgba(225, 48, 108, 0.2)',

  // Legacy filter/pill
  filterPillActive: 'rgba(245, 158, 11, 0.2)',
  filterPillActiveBorder: 'rgba(245, 158, 11, 0.5)',

  // Legacy misc
  backgroundGradient: '#FFFBF5',
  glassBackground: 'rgba(255, 251, 245, 0.85)',
  mapHeader: 'rgba(255, 251, 245, 0.95)',
  beige: '#E8D9CE',
  beigeLight: '#F4ECE7',
  brown: '#9C6C49',
  brownDark: '#221710',
  brownGray: '#A8A29E',
  greenSuccess: primitives.emerald[500],
  greenBright: '#22C55E',
  greenDark: '#15803D',
  orangeAlt: '#F97316',
  softOrange: '#FFA94D',
  softRed: '#FF8787',
  softGray: '#B8B4AF',
  grayMedium: primitives.gray[500],
  grayLight: primitives.gray[400],
  darkGray: '#D4D4D4',
  lightGray: primitives.gray[200],
} as const;

// ============================================
// 3. GRADIENT PRESETS
// ============================================
export const GRADIENTS = {
  // Primary gradients
  primary: [primitives.amber[500], primitives.amber[400]] as const,
  secondary: [primitives.pink[500], primitives.pink[400]] as const,

  // Gift-moment specific
  gift: [primitives.amber[500], primitives.pink[500]] as const,
  giftButton: [primitives.amber[500], primitives.pink[500]] as const,
  celebration: [primitives.pink[500], primitives.purple[500]] as const,

  // Trust/Success
  trust: [primitives.emerald[500], primitives.emerald[600]] as const,

  // Decorative
  sunset: [primitives.amber[500], primitives.red[500]] as const,
  aurora: [primitives.purple[500], primitives.pink[500]] as const,

  // Card overlay (for image cards)
  hero: ['transparent', 'rgba(0, 0, 0, 0.7)'] as const,
  heroLight: ['transparent', 'rgba(0, 0, 0, 0.5)'] as const,
} as const;

// ============================================
// 4. SHADOW PRESETS
// ============================================
export const CARD_SHADOW = {
  shadowColor: primitives.black,
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 3,
} as const;

export const CARD_SHADOW_LIGHT = {
  shadowColor: primitives.black,
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 3,
  elevation: 2,
} as const;

export const CARD_SHADOW_HEAVY = {
  shadowColor: primitives.black,
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.12,
  shadowRadius: 12,
  elevation: 5,
} as const;

// Export primitives for advanced use cases (theme generation, etc.)
export { primitives };
