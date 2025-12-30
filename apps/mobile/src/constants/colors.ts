/**
 * TravelMatch Ultimate Design System 2026 - "Sunset Proof Palette"
 *
 * Semantic Color System for gift-moment experience
 * Motto: "Give a moment. See it happen."
 *
 * 4 Core Emotions:
 * 1. DUYGU → "Birinin yolculuğuna dokunuyorum"
 * 2. GÜVEN → "Proof + Trust Score ile gerçek"
 * 3. KEŞİF → "Yer, zaman, insan—hepsi canlı"
 * 4. PREMIUM → "Az ama çok iyi. Her piksel kontrollü"
 *
 * Architecture:
 * 1. PRIMITIVES - Raw color values (internal use only)
 * 2. COLORS - Semantic colors (use these in components)
 * 3. GRADIENTS - Gradient presets for common use cases
 * 4. SHADOWS - Premium soft shadows
 */

// ═══════════════════════════════════════════════════════════════════
// 1. PRIMITIVE COLORS (Raw values - DO NOT use directly)
// ═══════════════════════════════════════════════════════════════════
const primitives = {
  // ═══════════════════════════════════════════
  // PRIMARY: Sunset Amber (Aksiyonlar)
  // "Gift gönder, Create, Continue"
  // ═══════════════════════════════════════════
  amber: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B', // ← Ana Primary
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  // ═══════════════════════════════════════════
  // SECONDARY: Magenta/Pink (Duygu)
  // "Reaction, highlight, proof, gift received"
  // ═══════════════════════════════════════════
  magenta: {
    50: '#FDF2F8',
    100: '#FCE7F3',
    200: '#FBCFE8',
    300: '#F9A8D4',
    400: '#F472B6',
    500: '#EC4899', // ← Ana Secondary
    600: '#DB2777',
    700: '#BE185D',
    800: '#9D174D',
    900: '#831843',
  },

  // ═══════════════════════════════════════════
  // ACCENT: Seafoam/Ocean Teal (Keşif)
  // "Discover, map, location, filters"
  // ═══════════════════════════════════════════
  seafoam: {
    50: '#F0FDFA',
    100: '#CCFBF1',
    200: '#99F6E4',
    300: '#5EEAD4',
    400: '#2DD4BF',
    500: '#14B8A6', // ← Ana Accent
    600: '#0D9488',
    700: '#0F766E',
    800: '#115E59',
    900: '#134E4A',
  },

  // ═══════════════════════════════════════════
  // TRUST: Emerald (Güvenilirlik)
  // "Trust score, verified, proof status"
  // ═══════════════════════════════════════════
  emerald: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981', // ← Trust Primary
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },

  // ═══════════════════════════════════════════
  // NEUTRAL: Warm Stone (Premium his)
  // ═══════════════════════════════════════════
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

  // ═══════════════════════════════════════════
  // FEEDBACK
  // ═══════════════════════════════════════════
  red: {
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
  },
  blue: {
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
  },
  purple: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D5FF',
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#8B5CF6',
    600: '#7C3AED',
    700: '#6D28D9',
    800: '#5B21B6',
    900: '#4C1D95',
  },

  // Legacy gray alias (use stone instead)
  gray: {
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
  },

  white: '#FFFFFF',
  black: '#000000',
} as const;

// ═══════════════════════════════════════════════════════════════════
// 2. SEMANTIC COLORS (Use these in components)
// ═══════════════════════════════════════════════════════════════════
export const COLORS = {
  // ─────────────────────────────────────────────
  // Primary (Aksiyon)
  // Send gift, Create moment, Continue, Confirm
  // ─────────────────────────────────────────────
  primary: primitives.amber[500],
  primaryLight: primitives.amber[400],
  primaryDark: primitives.amber[600],
  primaryMuted: 'rgba(245, 158, 11, 0.12)',
  primarySurface: primitives.amber[50],

  // ─────────────────────────────────────────────
  // Secondary (Duygu/Emotion)
  // Gift received, reaction, proof highlight
  // ─────────────────────────────────────────────
  secondary: primitives.magenta[500],
  secondaryLight: primitives.magenta[400],
  secondaryDark: primitives.magenta[600],
  secondaryMuted: 'rgba(236, 72, 153, 0.12)',
  secondarySurface: primitives.magenta[50],

  // ─────────────────────────────────────────────
  // Accent (Keşif/Discovery)
  // Map, location, filters, explore
  // ─────────────────────────────────────────────
  accent: primitives.seafoam[500],
  accentLight: primitives.seafoam[400],
  accentDark: primitives.seafoam[600],
  accentMuted: 'rgba(20, 184, 166, 0.12)',
  accentSurface: primitives.seafoam[50],
  coral: '#FF6B6B', // Legacy

  // ─────────────────────────────────────────────
  // Trust (Güvenilirlik) - "Jewelry" aesthetic (with nested object)
  // Trust score, verified badges, proof status
  // ─────────────────────────────────────────────
  trust: {
    primary: primitives.emerald[500],
    light: primitives.emerald[400],
    dark: primitives.emerald[600],
    muted: 'rgba(16, 185, 129, 0.15)',
    surface: primitives.emerald[50],
  },
  trustLight: primitives.emerald[400],
  trustDark: primitives.emerald[600],
  trustMuted: 'rgba(16, 185, 129, 0.15)',
  trustSurface: primitives.emerald[50],

  // Trust Score Levels (Jewelry tiers)
  trustPlatinum: '#E5E4E2', // 90-100
  trustGold: '#FFD700', // 70-89
  trustSilver: '#C0C0C0', // 50-69
  trustBronze: '#CD7F32', // 0-49

  // Trust Ring Levels (legacy)
  trustLow: primitives.red[500],
  trustMedium: primitives.amber[500],
  trustHigh: primitives.emerald[500],

  // KYC Badge Colors
  kycBronze: '#CD7F32',
  kycSilver: '#C0C0C0',
  kycGold: '#FFD700',
  kycPlatinum: '#E5E4E2',

  // ─────────────────────────────────────────────
  // Semantic Feedback
  // ─────────────────────────────────────────────
  success: primitives.emerald[500],
  successLight: primitives.emerald[50],
  successDark: primitives.emerald[600],
  successMuted: 'rgba(16, 185, 129, 0.15)',

  error: primitives.red[500],
  errorLight: primitives.red[50],
  errorDark: primitives.red[600],
  danger: primitives.red[500],
  destructive: primitives.red[600],

  warning: primitives.amber[500],
  warningLight: primitives.amber[50],
  warningDark: primitives.amber[600],

  info: primitives.blue[500],
  infoLight: primitives.blue[50],
  infoDark: primitives.blue[600],

  // ─────────────────────────────────────────────
  // Text (with nested object for backward compatibility)
  // ─────────────────────────────────────────────
  text: {
    primary: primitives.stone[900],
    primaryMuted: primitives.stone[400], // For secondary emphasis text
    primaryWhite80: 'rgba(255, 255, 255, 0.8)', // White text with 80% opacity
    secondary: primitives.stone[500],
    tertiary: primitives.stone[400],
    muted: primitives.stone[400],
    disabled: primitives.stone[300],
    inverse: '#FFFFFF',
  },
  textPrimary: primitives.stone[900],
  textSecondary: primitives.stone[500],
  textTertiary: primitives.stone[400],
  textMuted: primitives.stone[400],
  textDisabled: primitives.stone[300],
  textInverse: '#FFFFFF',
  subtitle: 'rgba(255, 255, 255, 0.9)',

  // On dark surfaces
  textOnDark: '#FFFFFF',
  textOnDarkSecondary: 'rgba(255, 255, 255, 0.72)',
  textOnDarkMuted: 'rgba(255, 255, 255, 0.48)',

  // ─────────────────────────────────────────────
  // Brand (nested for backward compatibility)
  // ─────────────────────────────────────────────
  brand: {
    primary: primitives.amber[500],
    primaryLight: primitives.amber[400],
    primaryDark: primitives.amber[600],
    secondary: primitives.magenta[500],
    secondaryLight: primitives.magenta[400],
    secondaryTransparent: 'rgba(236, 72, 153, 0.12)',
    accent: primitives.seafoam[500],
  },

  // ─────────────────────────────────────────────
  // Feedback (nested for backward compatibility)
  // ─────────────────────────────────────────────
  feedback: {
    success: primitives.emerald[500],
    successLight: primitives.emerald[400],
    error: primitives.red[500],
    errorLight: primitives.red[400],
    warning: primitives.amber[500],
    warningLight: primitives.amber[400],
    info: primitives.blue[500],
    infoLight: primitives.blue[400],
  },

  // ─────────────────────────────────────────────
  // Utility (nested for backward compatibility)
  // ─────────────────────────────────────────────
  utility: {
    white: primitives.white,
    black: primitives.black,
    transparent: 'transparent',
  },

  // ─────────────────────────────────────────────
  // Background (with nested bg for backward compatibility)
  // ─────────────────────────────────────────────
  bg: {
    primary: '#FFFCF8',
    primaryLight: '#FFFFFF', // Lighter variant for cancel buttons, cards
    primaryDark: '#F5F0E8', // Darker variant for pressed states
    secondary: '#FFF9F2',
    tertiary: '#FFF5E8',
  },

  // ─────────────────────────────────────────────
  // Background - "Cinematic" gradient-ready
  // ─────────────────────────────────────────────
  background: '#FFFCF8', // Warm cream (light mode)
  backgroundSecondary: '#FFF9F2', // Slightly warmer
  backgroundTertiary: '#FFF5E8', // Sunset tint
  backgroundLight: primitives.white,

  backgroundDark: '#0C0A09', // Midnight travel (dark mode)
  backgroundDarkSecondary: '#1C1917',
  backgroundDarkTertiary: '#292524',

  // ─────────────────────────────────────────────
  // Surface - "Soft glass" cards (nested for component compatibility)
  // ─────────────────────────────────────────────
  surface: {
    base: '#FFFFFF',
    baseLight: primitives.white,
    light: primitives.white,
    muted: primitives.stone[50],
    subtle: primitives.stone[100],
    dark: '#1A2F23',
    glassBackground: 'rgba(255, 252, 248, 0.78)',
    glassBorder: 'rgba(255, 255, 255, 0.2)',
  },
  // Flat surface aliases for backwards compatibility
  surfaceLight: primitives.white,
  surfaceMuted: primitives.stone[50],
  surfaceSubtle: primitives.stone[100],
  surfaceDark: '#1A2F23',

  // Glass effects
  glass: 'rgba(255, 252, 248, 0.78)',
  glassBorder: 'rgba(255, 255, 255, 0.2)',
  glassLight: 'rgba(255, 255, 255, 0.92)',
  glassDark: 'rgba(28, 25, 23, 0.88)',
  glassDarkBorder: 'rgba(255, 255, 255, 0.08)',

  // ─────────────────────────────────────────────
  // Border - "Hairline" aesthetic (nested for component compatibility)
  // ─────────────────────────────────────────────
  border: {
    default: primitives.stone[200],
    light: primitives.stone[100],
    strong: primitives.stone[300],
    focus: primitives.amber[500],
    dark: '#2D4A3A',
  },
  // Flat border aliases for backwards compatibility
  borderLight: primitives.stone[100],
  borderStrong: primitives.stone[300],
  borderFocus: primitives.amber[500],
  borderDark: '#2D4A3A',

  // Hairline border (10% opacity)
  hairline: 'rgba(0, 0, 0, 0.1)',
  hairlineLight: 'rgba(255, 255, 255, 0.1)',

  // ─────────────────────────────────────────────
  // Overlay (nested for component compatibility)
  // ─────────────────────────────────────────────
  overlay: {
    default: 'rgba(0, 0, 0, 0.5)',
    light: 'rgba(0, 0, 0, 0.3)',
    medium: 'rgba(0, 0, 0, 0.5)',
    heavy: 'rgba(0, 0, 0, 0.7)',
    dark: 'rgba(0, 0, 0, 0.7)',
    backdrop: 'rgba(0, 0, 0, 0.4)',
  },
  // Flat overlay aliases
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',
  backdrop: 'rgba(0, 0, 0, 0.4)',
  modalBackdrop: 'rgba(0, 0, 0, 0.4)',

  // ─────────────────────────────────────────────
  // Gray Scale
  // ─────────────────────────────────────────────
  gray: primitives.stone,

  // ─────────────────────────────────────────────
  // UI Essentials
  // ─────────────────────────────────────────────
  white: primitives.white,
  black: primitives.black,
  transparent: 'transparent',
  disabled: primitives.stone[300],
  shadow: primitives.black,
  shadowColor: primitives.black,

  // ─────────────────────────────────────────────
  // Card
  // ─────────────────────────────────────────────
  card: primitives.white,
  cardBackground: primitives.white,
  cardDark: '#243D2F',

  // ─────────────────────────────────────────────
  // Input
  // ─────────────────────────────────────────────
  inputBackground: primitives.stone[50],

  // ─────────────────────────────────────────────
  // Button
  // ─────────────────────────────────────────────
  buttonPrimary: primitives.amber[500],
  buttonDark: primitives.stone[800],
  buttonDisabled: primitives.stone[300],

  // ─────────────────────────────────────────────
  // Social/Brand Colors
  // ─────────────────────────────────────────────
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

  // ─────────────────────────────────────────────
  // Additional Named Colors
  // ─────────────────────────────────────────────
  amber: primitives.amber[500],
  amberLight: primitives.amber[100],
  amberDark: primitives.amber[600],
  amberBright: primitives.amber[400],
  emerald: primitives.emerald[500],
  purple: primitives.purple[500],
  violet: primitives.purple[500],
  pink: primitives.magenta[500],
  magenta: primitives.magenta[500],
  blue: primitives.blue[500],
  gold: '#FFD700',
  teal: primitives.seafoam[500],
  seafoam: primitives.seafoam[500],
  indigo: '#6366F1',
  orange: '#F97316',
  orangeDark: '#EA580C',
  orangeBright: '#FB923C',

  // ═══════════════════════════════════════════════════
  // LEGACY ALIASES (Deprecated - use semantic names)
  // These are kept for backwards compatibility only
  // ═══════════════════════════════════════════════════

  // Legacy overlay variants
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

  // Legacy error variants
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
  trustTransparent20: 'rgba(16, 185, 129, 0.2)', // Trust green with 20% opacity
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
  backgroundGradient: '#FFFCF8',
  glassBackground: 'rgba(255, 252, 248, 0.85)',
  mapHeader: 'rgba(255, 252, 248, 0.95)',
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
  grayMedium: primitives.stone[500],
  grayLight: primitives.stone[400],
  darkGray: '#D4D4D4',
  lightGray: primitives.stone[200],
} as const;

// ═══════════════════════════════════════════════════════════════════
// 3. GRADIENT PRESETS - "Cinematic Travel" aesthetic
// ═══════════════════════════════════════════════════════════════════
export const GRADIENTS = {
  // Primary gradients
  primary: [primitives.amber[500], primitives.amber[400]] as const,
  secondary: [primitives.magenta[500], primitives.magenta[400]] as const,

  // Hero / Splash - Cinematic
  hero: [primitives.amber[500], primitives.magenta[500]] as const,
  heroVertical: ['#F59E0B', '#EC4899', '#0C0A09'] as const,

  // Primary CTA - "Gift" action
  gift: [primitives.amber[500], primitives.magenta[500]] as const,
  giftButton: [primitives.amber[500], primitives.magenta[500]] as const,
  giftSoft: [primitives.amber[400], primitives.magenta[400]] as const,

  // Trust - Jewelry shimmer
  trust: [primitives.emerald[400], primitives.emerald[600]] as const,
  trustShimmer: ['#34D399', '#10B981', '#34D399'] as const,

  // Discovery - Ocean/travel
  discover: [primitives.seafoam[400], primitives.seafoam[600]] as const,

  // Decorative
  celebration: [primitives.magenta[500], primitives.purple[500]] as const,
  sunset: ['#FCD34D', '#F59E0B', '#EC4899'] as const,
  sunsetSoft: ['rgba(252, 211, 77, 0.3)', 'rgba(236, 72, 153, 0.2)'] as const,
  aurora: [primitives.purple[500], primitives.magenta[500]] as const,

  // Card overlays
  cardOverlay: [
    'transparent',
    'rgba(0, 0, 0, 0.4)',
    'rgba(0, 0, 0, 0.75)',
  ] as const,
  cardOverlayLight: [
    'transparent',
    'rgba(0, 0, 0, 0.2)',
    'rgba(0, 0, 0, 0.5)',
  ] as const,
  heroLight: ['transparent', 'rgba(0, 0, 0, 0.5)'] as const,

  // Glass
  glassLight: ['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)'] as const,

  // Map/location peek
  mapPeek: ['rgba(255, 252, 248, 0)', 'rgba(255, 252, 248, 1)'] as const,

  // Disabled
  disabled: [primitives.stone[300], primitives.stone[400]] as const,
} as const;

// ═══════════════════════════════════════════════════════════════════
// 4. SHADOW PRESETS - Premium "soft" aesthetic
// ═══════════════════════════════════════════════════════════════════
export const SHADOWS = {
  // None
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  // Subtle
  subtle: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },

  // Small
  sm: {
    shadowColor: primitives.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  // Medium
  md: {
    shadowColor: primitives.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // Large
  lg: {
    shadowColor: primitives.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },

  // Cards - soft glass effect
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

  // Buttons
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

  // Trust ring glow
  trustGlow: {
    shadowColor: primitives.emerald[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },

  // Elevated surfaces
  elevated: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
} as const;

// Legacy shadow exports for backwards compatibility
export const CARD_SHADOW = SHADOWS.card;
export const CARD_SHADOW_LIGHT = SHADOWS.subtle;
export const CARD_SHADOW_HEAVY = SHADOWS.elevated;

// Export primitives for advanced use cases
export { primitives };

// PALETTE export for backwards compatibility
// Note: primitives already includes white and black, so we just spread it
export const PALETTE = {
  ...primitives,
} as const;

// Type exports for TypeScript
export type ColorKey = keyof typeof COLORS;
export type GradientKey = keyof typeof GRADIENTS;
export type ShadowKey = keyof typeof SHADOWS;

// Trust level types and helper functions
export type TrustLevel = 'low' | 'medium' | 'high' | 'platinum';

export const getTrustLevel = (score: number): TrustLevel => {
  if (score >= 90) return 'platinum';
  if (score >= 70) return 'high';
  if (score >= 50) return 'medium';
  return 'low';
};

export const getTrustRingColors = (score: number): [string, string] => {
  const level = getTrustLevel(score);
  switch (level) {
    case 'platinum':
      return [COLORS.trustPlatinum, COLORS.trustGold];
    case 'high':
      return [COLORS.trustGold, primitives.amber[400]];
    case 'medium':
      return [primitives.amber[400], primitives.amber[500]];
    default:
      return [COLORS.trustLow, primitives.red[400]];
  }
};
