/**
 * TravelMatch Awwwards Design System - Colors V2
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
export const COLORS_V2 = {
  // ----------------------------------------
  // Brand Colors
  // ----------------------------------------
  brand: {
    primary: primitives.orange[500],
    primaryLight: primitives.orange[400],
    primaryDark: primitives.orange[600],
    primaryMuted: 'rgba(249, 115, 22, 0.12)',

    secondary: primitives.rose[500],
    secondaryLight: primitives.rose[400],
    secondaryDark: primitives.rose[600],
    secondaryMuted: 'rgba(244, 63, 94, 0.12)',

    accent: primitives.violet[500],
    accentLight: primitives.violet[400],
    accentDark: primitives.violet[600],
    accentMuted: 'rgba(168, 85, 247, 0.12)',
  },

  // ----------------------------------------
  // Background Colors
  // ----------------------------------------
  bg: {
    primary: '#FFFCF7',      // Warm cream
    secondary: '#FFF9F0',    // Slightly warmer
    tertiary: '#FFF5E6',     // Warm tint
    elevated: '#FFFFFF',     // Pure white for cards

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

    glass: 'rgba(255, 252, 247, 0.75)',
    glassBorder: 'rgba(255, 255, 255, 0.25)',
    glassLight: 'rgba(255, 255, 255, 0.9)',
    glassDark: 'rgba(28, 25, 23, 0.85)',
    glassDarkBorder: 'rgba(255, 255, 255, 0.1)',
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
  },

  // ----------------------------------------
  // Trust System
  // ----------------------------------------
  trust: {
    primary: primitives.emerald[500],
    light: primitives.emerald[400],
    dark: primitives.emerald[600],
    muted: 'rgba(16, 185, 129, 0.12)',

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
  },

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
  },

  // ----------------------------------------
  // Utility
  // ----------------------------------------
  utility: {
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
  },
} as const;


// ============================================
// 3. GRADIENTS
// ============================================
export const GRADIENTS_V2 = {
  hero: [primitives.orange[500], primitives.rose[500], primitives.violet[500]] as const,
  heroVertical: ['#F97316', '#F43F5E', '#0C0A09'] as const,

  gift: [primitives.orange[500], primitives.rose[500]] as const,
  giftVertical: [primitives.orange[400], primitives.rose[600]] as const,

  trust: [primitives.emerald[400], primitives.emerald[600]] as const,
  aurora: [primitives.violet[500], primitives.rose[500], primitives.orange[500]] as const,
  celebration: [primitives.rose[500], primitives.violet[500], primitives.sky[500]] as const,
  sunset: [primitives.orange[500], primitives.red[500]] as const,

  cardOverlay: ['transparent', 'rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0.8)'] as const,
  cardOverlayLight: ['transparent', 'rgba(0, 0, 0, 0.2)', 'rgba(0, 0, 0, 0.5)'] as const,

  glassLight: ['rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.7)'] as const,
  glassDark: ['rgba(28, 25, 23, 0.9)', 'rgba(28, 25, 23, 0.7)'] as const,

  buttonDisabled: [primitives.stone[300], primitives.stone[400]] as const,
} as const;


// ============================================
// 4. SHADOWS
// ============================================
export const SHADOWS_V2 = {
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


// ============================================
// 5. LEGACY COMPATIBILITY
// ============================================
export const COLORS_LEGACY = {
  primary: COLORS_V2.brand.primary,
  primaryLight: COLORS_V2.brand.primaryLight,
  primaryDark: COLORS_V2.brand.primaryDark,
  secondary: COLORS_V2.brand.secondary,
  accent: COLORS_V2.brand.accent,
  background: COLORS_V2.bg.primary,
  surface: COLORS_V2.surface.base,
  text: COLORS_V2.text.primary,
  textSecondary: COLORS_V2.text.secondary,
  border: COLORS_V2.border.default,
  success: COLORS_V2.feedback.success,
  error: COLORS_V2.feedback.error,
  warning: COLORS_V2.feedback.warning,
  info: COLORS_V2.feedback.info,
  trust: COLORS_V2.trust.primary,
  white: COLORS_V2.utility.white,
  black: COLORS_V2.utility.black,
  transparent: COLORS_V2.utility.transparent,
  overlay: COLORS_V2.overlay.medium,
  glass: COLORS_V2.surface.glass,
  glassBorder: COLORS_V2.surface.glassBorder,
  card: COLORS_V2.surface.base,
} as const;

export { primitives };
