/**
 * TravelMatch Awwwards Design System - Colors
 *
 * "Liquid Warmth" aesthetic - Organic Luxury meets Playful Warmth
 *
 * Design Philosophy:
 * - Gift-giving = warmth, emotion, connection
 * - Travel = discovery, adventure, freedom
 * - Trust = reliability, transparency
 */

// ============================================
// 1. PRIMITIVE PALETTE
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
} as const;

// ============================================
// 2. SEMANTIC COLORS
// ============================================
export const COLORS = {
  // ----------------------------------------
  // Brand Colors
  // ----------------------------------------
  brand: {
    primary: primitives.orange[500],
    primaryLight: primitives.orange[400],
    primaryDark: primitives.orange[600],
    primaryMuted: 'rgba(249, 115, 22, 0.12)',
    primaryDisabled: primitives.orange[300],
    primaryWhite80: 'rgba(249, 115, 22, 0.8)',

    secondary: primitives.rose[500],
    secondaryLight: primitives.rose[400],
    secondaryDark: primitives.rose[600],
    secondaryMuted: 'rgba(244, 63, 94, 0.12)',
    secondaryTransparent: 'rgba(244, 63, 94, 0.15)',

    accent: primitives.violet[500],
    accentLight: primitives.violet[400],
    accentDark: primitives.violet[600],
    accentMuted: 'rgba(168, 85, 247, 0.12)',
  },

  // ----------------------------------------
  // Background Colors
  // ----------------------------------------
  bg: {
    primary: '#FFFCF7', // Warm cream
    secondary: '#FFF9F0', // Slightly warmer
    tertiary: '#FFF5E6', // Warm tint
    elevated: '#FFFFFF', // Pure white for cards
    primaryLight: '#FFFEFA',
    primaryDark: '#FFF5E6',

    dark: primitives.stone[950],
    darkSecondary: primitives.stone[900],
    darkElevated: primitives.stone[800],
  },

  // ----------------------------------------
  // Surface Colors
  // ----------------------------------------
  surface: {
    base: '#FFFFFF',
    muted: primitives.stone[50],
    subtle: primitives.stone[100],
    baseLight: primitives.stone[50],
    baseMuted: primitives.stone[100],
    baseSubtle: primitives.stone[200],

    glass: 'rgba(255, 252, 247, 0.75)',
    glassBorder: 'rgba(255, 255, 255, 0.25)',
    glassLight: 'rgba(255, 255, 255, 0.9)',
    glassDark: 'rgba(28, 25, 23, 0.85)',
    glassDarkBorder: 'rgba(255, 255, 255, 0.1)',
    glassBackground: 'rgba(255, 255, 255, 0.9)',
  },

  // ----------------------------------------
  // Text Colors
  // ----------------------------------------
  text: {
    primary: primitives.stone[900],
    secondary: primitives.stone[500],
    tertiary: primitives.stone[400],
    muted: primitives.stone[400],
    disabled: primitives.stone[300],
    inverse: '#FFFFFF',
    primaryMuted: primitives.stone[600],
    primaryWhite80: 'rgba(255, 255, 255, 0.8)',
    primaryDisabled: primitives.stone[300],

    onDark: '#FFFFFF',
    onDarkSecondary: 'rgba(255, 255, 255, 0.7)',
    onDarkMuted: 'rgba(255, 255, 255, 0.5)',

    accent: primitives.orange[600],
    link: primitives.sky[600],
  },

  // ----------------------------------------
  // Border Colors
  // ----------------------------------------
  border: {
    default: primitives.stone[200],
    subtle: primitives.stone[100],
    strong: primitives.stone[300],
    focus: primitives.orange[500],
    error: primitives.red[500],
    light: primitives.stone[100],

    dark: primitives.stone[700],
    darkSubtle: primitives.stone[800],
  },

  // ----------------------------------------
  // Interactive Colors
  // ----------------------------------------
  interactive: {
    primary: primitives.orange[500],
    primaryHover: primitives.orange[600],
    primaryPressed: primitives.orange[700],

    secondary: primitives.rose[500],
    secondaryHover: primitives.rose[600],

    accent: primitives.violet[500],
    accentHover: primitives.violet[600],
  },

  // ----------------------------------------
  // Feedback Colors
  // ----------------------------------------
  feedback: {
    success: primitives.emerald[500],
    successLight: primitives.emerald[50],
    successBorder: primitives.emerald[200],

    error: primitives.red[500],
    errorLight: primitives.red[50],
    errorBorder: primitives.red[200],

    warning: primitives.orange[500],
    warningLight: primitives.orange[50],
    warningBorder: primitives.orange[200],

    info: primitives.sky[500],
    infoLight: primitives.sky[50],
    infoBorder: primitives.sky[200],
    successTransparent33: 'rgba(16, 185, 129, 0.33)',
  },

  // ----------------------------------------
  // Trust System
  // ----------------------------------------
  trust: {
    primary: primitives.emerald[500],
    light: primitives.emerald[400],
    dark: primitives.emerald[600],
    muted: 'rgba(16, 185, 129, 0.12)',
    glow: 'rgba(16, 185, 129, 0.3)',

    platinum: '#E5E4E2',
    gold: '#FFD700',
    silver: '#C0C0C0',
    bronze: '#CD7F32',

    highStart: primitives.emerald[400],
    highEnd: primitives.emerald[600],
    mediumStart: primitives.orange[400],
    mediumEnd: primitives.orange[600],
    lowStart: primitives.stone[400],
    lowEnd: primitives.stone[500],
  },

  // ----------------------------------------
  // Overlay Colors
  // ----------------------------------------
  overlay: {
    light: 'rgba(0, 0, 0, 0.04)',
    medium: 'rgba(0, 0, 0, 0.3)',
    heavy: 'rgba(0, 0, 0, 0.5)',
    dark: 'rgba(0, 0, 0, 0.7)',
    backdrop: 'rgba(0, 0, 0, 0.4)',
    '10': 'rgba(0, 0, 0, 0.1)',
    '20': 'rgba(0, 0, 0, 0.2)',
    '30': 'rgba(0, 0, 0, 0.3)',
    '40': 'rgba(0, 0, 0, 0.4)',
    '50': 'rgba(0, 0, 0, 0.5)',
    '60': 'rgba(0, 0, 0, 0.6)',
    '70': 'rgba(0, 0, 0, 0.7)',
    '80': 'rgba(0, 0, 0, 0.8)',
  },

  // Direct overlay shortcuts for backward compatibility
  overlay10: 'rgba(0, 0, 0, 0.1)',
  overlay20: 'rgba(0, 0, 0, 0.2)',
  overlay30: 'rgba(0, 0, 0, 0.3)',
  overlay40: 'rgba(0, 0, 0, 0.4)',
  overlay50: 'rgba(0, 0, 0, 0.5)',
  overlay60: 'rgba(0, 0, 0, 0.6)',
  overlay70: 'rgba(0, 0, 0, 0.7)',
  overlay80: 'rgba(0, 0, 0, 0.8)',

  // ----------------------------------------
  // Social Colors
  // ----------------------------------------
  social: {
    apple: '#000000',
    google: '#4285F4',
    facebook: '#1877F2',
    twitter: '#1DA1F2',
    instagram: '#E4405F',
    whatsapp: '#25D366',
    telegram: '#0088CC',
    linkedin: '#0A66C2',
  },

  // ----------------------------------------
  // Utility
  // ----------------------------------------
  utility: {
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
  },

  // ----------------------------------------
  // BACKWARD COMPATIBILITY - Legacy flat keys
  // ----------------------------------------
  // Brand shortcuts
  primary: primitives.orange[500],
  primaryLight: primitives.orange[400],
  primaryDark: primitives.orange[600],
  primaryMuted: 'rgba(249, 115, 22, 0.12)',
  primaryDisabled: primitives.orange[300],
  primaryWhite80: 'rgba(249, 115, 22, 0.8)',
  secondary: primitives.rose[500],
  secondaryTransparent: 'rgba(244, 63, 94, 0.12)',
  accent: primitives.violet[500],

  // Background shortcuts
  background: '#FFFCF7',
  backgroundSecondary: '#FFF9F0',
  card: '#FFFFFF',
  cardBackground: '#FFFFFF',
  inputBackground: '#F5F5F4',
  modalBackdrop: 'rgba(0, 0, 0, 0.5)',

  // Text shortcuts (use _flat suffix to avoid conflict with nested 'text' object)
  textPrimary: primitives.stone[900],
  textSecondary: primitives.stone[500],
  textTertiary: primitives.stone[400],
  textInverse: '#FFFFFF',
  subtitle: primitives.stone[500],

  // Feedback shortcuts
  success: primitives.emerald[500],
  successLight: primitives.emerald[100],
  successDark: primitives.emerald[700],
  successMuted: 'rgba(16, 185, 129, 0.12)',
  successTransparent33: 'rgba(16, 185, 129, 0.33)',
  greenSuccess: primitives.emerald[500],
  greenBright: primitives.emerald[400],

  error: primitives.red[500],
  errorLight: primitives.red[100],
  errorBackground: primitives.red[50],
  errorRed: primitives.red[500],
  errorRedLight: primitives.red[100],
  errorTransparent10: 'rgba(239, 68, 68, 0.1)',
  errorTransparent20: 'rgba(239, 68, 68, 0.2)',
  softRed: primitives.red[100],
  danger: primitives.red[500],
  destructive: primitives.red[500],

  warning: primitives.orange[500],
  warningLight: primitives.orange[100],
  warningDark: primitives.orange[700],
  warningTransparent20: 'rgba(249, 115, 22, 0.2)',
  warningTransparent33: 'rgba(249, 115, 22, 0.33)',

  info: primitives.sky[500],
  infoLight: primitives.sky[100],
  infoTransparent33: 'rgba(14, 165, 233, 0.33)',

  // Gray scale
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  gray: primitives.stone,
  lightGray: primitives.stone[200],
  darkGray: primitives.stone[600],
  grayLight: primitives.stone[100],
  softGray: primitives.stone[100],
  hairline: primitives.stone[200],
  shadowColor: primitives.stone[950],
  shadow: primitives.stone[950],

  // Border shortcuts
  borderDefault: primitives.stone[200],
  borderLight: primitives.stone[100],
  divider: primitives.stone[200],

  // Trust/KYC colors (use flat naming to avoid conflict)
  trustPrimary: primitives.emerald[500],
  trustHigh: primitives.emerald[500],
  trustMedium: primitives.orange[500],
  trustLow: primitives.stone[400],
  trustGlow: 'rgba(16, 185, 129, 0.3)',
  trustTransparent20: 'rgba(16, 185, 129, 0.2)',
  trustPlatinum: '#E5E4E2',
  kycGold: '#FFD700',
  kycSilver: '#C0C0C0',
  kycBronze: '#CD7F32',
  kycPlatinum: '#E5E4E2',
  gold: '#FFD700',

  // Special colors
  beige: '#F5F5DC',
  beigeLight: '#FFFEF5',
  brown: '#8B4513',
  brownDark: '#654321',
  brownGray: '#7D6B5D',
  orange: primitives.orange[500],
  orangeBright: primitives.orange[400],
  orangeDark: primitives.orange[700],
  softOrange: primitives.orange[100],
  softOrangeTransparent: 'rgba(249, 115, 22, 0.1)',
  coral: primitives.rose[400],
  amber: '#F59E0B',
  amberBright: '#FBBF24',
  purple: primitives.violet[500],
  indigo: '#6366F1',
  blue: primitives.sky[500],
  teal: '#14B8A6',
  tealTransparent20: 'rgba(20, 184, 166, 0.2)',
  mint: '#10B981',
  mintBackground: 'rgba(16, 185, 129, 0.1)',
  mintBorder: 'rgba(16, 185, 129, 0.3)',
  mintDark: '#059669',
  mintTransparent: 'rgba(16, 185, 129, 0.15)',
  mintTransparentLight: 'rgba(16, 185, 129, 0.08)',

  // Overlay/Transparency (legacy - use overlay object or overlayXX instead)
  overlay75: 'rgba(0, 0, 0, 0.75)',
  darkOverlay: 'rgba(0, 0, 0, 0.7)',
  blackTransparent: 'rgba(0, 0, 0, 0.3)',
  blackTransparentDark: 'rgba(0, 0, 0, 0.6)',
  whiteTransparent: 'rgba(255, 255, 255, 0.5)',
  whiteTransparentLight: 'rgba(255, 255, 255, 0.3)',
  whiteTransparentDarkest: 'rgba(255, 255, 255, 0.1)',
  whiteOverlay20: 'rgba(255, 255, 255, 0.2)',
  whiteOverlay30: 'rgba(255, 255, 255, 0.3)',
  whiteOverlay70: 'rgba(255, 255, 255, 0.7)',
  whiteOverlay80: 'rgba(255, 255, 255, 0.8)',

  // Glass effects
  glass: 'rgba(255, 255, 255, 0.8)',
  glassBorder: 'rgba(255, 255, 255, 0.2)',
  glassBackground: 'rgba(255, 255, 255, 0.9)',

  // Button colors
  buttonPrimary: primitives.orange[500],
  buttonSecondary: primitives.stone[100],
  buttonDark: primitives.stone[900],
  button: primitives.orange[500],
  disabled: primitives.stone[300],

  // Filter colors
  filterPillActive: primitives.orange[500],
  filterPillActiveBorder: primitives.orange[600],

  // Social (flat)
  apple: '#000000',
  instagram: '#E4405F',
  instagramTransparent20: 'rgba(228, 64, 95, 0.2)',
  facebook: '#1877F2',
  twitter: '#1DA1F2',
  whatsapp: '#25D366',
  whatsappTransparent20: 'rgba(37, 211, 102, 0.2)',
  telegram: '#0088CC',
  linkedin: '#0A66C2',

  // Payment cards
  visa: '#1A1F71',
  mastercard: '#EB001B',

  // Emerald (for legacy trust references)
  emerald: primitives.emerald,
} as const;

// ============================================
// 3. GRADIENTS
// ============================================
export const GRADIENTS = {
  hero: [
    primitives.orange[500],
    primitives.rose[500],
    primitives.violet[500],
  ] as const,
  heroVertical: ['#F97316', '#F43F5E', '#0C0A09'] as const,

  gift: [primitives.orange[500], primitives.rose[500]] as const,
  giftVertical: [primitives.orange[400], primitives.rose[600]] as const,

  trust: [primitives.emerald[400], primitives.emerald[600]] as const,
  aurora: [
    primitives.violet[500],
    primitives.rose[500],
    primitives.orange[500],
  ] as const,
  celebration: [
    primitives.rose[500],
    primitives.violet[500],
    primitives.sky[500],
  ] as const,
  sunset: [primitives.orange[500], primitives.red[500]] as const,

  cardOverlay: [
    'transparent',
    'rgba(0, 0, 0, 0.4)',
    'rgba(0, 0, 0, 0.8)',
  ] as const,
  cardOverlayLight: [
    'transparent',
    'rgba(0, 0, 0, 0.2)',
    'rgba(0, 0, 0, 0.5)',
  ] as const,

  glassLight: ['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)'] as const,
  glassDark: ['rgba(28, 25, 23, 0.9)', 'rgba(28, 25, 23, 0.7)'] as const,

  buttonDisabled: [primitives.stone[300], primitives.stone[400]] as const,
  disabled: [primitives.stone[300], primitives.stone[400]] as const,

  // Legacy gradient shortcuts
  giftButton: [primitives.orange[500], primitives.rose[500]] as const,
  primary: [primitives.orange[400], primitives.orange[600]] as const,
} as const;

// ============================================
// 4. SHADOWS
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
  // Legacy shortcuts
  card: {
    shadowColor: primitives.stone[950],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  button: {
    shadowColor: primitives.orange[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  trustGlow: {
    shadowColor: primitives.emerald[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;

// Export individual shadow for backward compatibility
export const CARD_SHADOW = SHADOWS.card;
export const CARD_SHADOW_LIGHT = SHADOWS.xs;
export const CARD_SHADOW_HEAVY = SHADOWS.lg;
export const BUTTON_SHADOW = SHADOWS.button;
export const GLOW_SHADOW = SHADOWS.glow;

// ============================================
// 5. LEGACY COMPATIBILITY
// ============================================
export const COLORS_LEGACY = {
  primary: COLORS.brand.primary,
  primaryLight: COLORS.brand.primaryLight,
  primaryDark: COLORS.brand.primaryDark,
  secondary: COLORS.brand.secondary,
  accent: COLORS.brand.accent,
  background: COLORS.bg.primary,
  surface: COLORS.surface.base,
  text: COLORS.text.primary,
  textSecondary: COLORS.text.secondary,
  border: COLORS.border.default,
  success: COLORS.feedback.success,
  error: COLORS.feedback.error,
  warning: COLORS.feedback.warning,
  info: COLORS.feedback.info,
  trust: COLORS.trust.primary,
  white: COLORS.utility.white,
  black: COLORS.utility.black,
  transparent: COLORS.utility.transparent,
  overlay: COLORS.overlay.medium,
  glass: COLORS.surface.glass,
  glassBorder: COLORS.surface.glassBorder,
  card: COLORS.surface.base,
} as const;

export { primitives };
