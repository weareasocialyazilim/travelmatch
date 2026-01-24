/**
 * Lovendo Mobile Constants - Edition Color Palette
 *
 * Felsefe: Twilight Zinc (Yumuşak Koyu) zemin üzerinde
 * GenZ enerjisini temsil eden yüksek kontrastlı Neon dokunuşlar.
 *
 * ═══════════════════════════════════════════════════════════════════
 * ARCHITECTURE NOTE:
 * ═══════════════════════════════════════════════════════════════════
 * Bu dosya @lovendo/design-system/tokens ile senkronize tutulmalıdır.
 * Canonical source: packages/design-system/src/tokens/colors.ts
 *
 * Mobile flat exports (COLORS.primary) kullanırken,
 * Design-system nested + flat aliases (COLORS.primary.main, COLORS.primaryMain) kullanır.
 *
 * MIGRATION PLAN (Phase 2 - Post-Launch):
 * 1. Mobile bileşenlerini design-system tokens'a migrate et
 * 2. Bu dosyayı design-system re-export'a dönüştür
 * 3. Flat → Nested geçişi için alias layer ekle
 *
 * Şu an için backward compatibility korunuyor.
 * ═══════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════
// PRIMITIVES - Raw color values
// ═══════════════════════════════════════════════════════════════════
const primitives = {
  zinc: {
    50: '#FAFAFA',
    100: '#F4F4F5',
    200: '#E4E4E7',
    300: '#D4D4D8',
    400: '#A1A1AA',
    500: '#71717A',
    600: '#52525B',
    700: '#3F3F46',
    800: '#27272A',
    900: '#18181B',
    950: '#09090B',
  },
  lime: {
    50: '#F7FEE7',
    100: '#ECFCCB',
    200: '#D9F99D',
    300: '#BEF264',
    400: '#A3E635',
    500: '#DFFF00',
    600: '#C8E600',
    700: '#A3CC00',
    800: '#84A300',
    900: '#657A00',
  },
  violet: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D5FF',
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#A855F7',
    600: '#9333EA',
    700: '#7C3AED',
    800: '#6B21A8',
    900: '#581C87',
  },
  rose: {
    50: '#FFF1F2',
    100: '#FFE4E6',
    200: '#FECDD3',
    300: '#FDA4AF',
    400: '#FB7185',
    500: '#F43F5E',
    600: '#E11D48',
    700: '#BE123C',
    800: '#9F1239',
    900: '#881337',
  },
  cyan: {
    50: '#ECFEFF',
    100: '#CFFAFE',
    200: '#A5F3FC',
    300: '#67E8F9',
    400: '#22D3EE',
    500: '#06B6D4',
    600: '#0891B2',
    700: '#0E7490',
    800: '#155E75',
    900: '#164E63',
  },
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
  },
  fuchsia: {
    50: '#FDF4FF',
    100: '#FAE8FF',
    200: '#F5D0FE',
    300: '#F0ABFC',
    400: '#E879F9',
    500: '#D946EF',
    600: '#C026D3',
    700: '#A21CAF',
    800: '#86198F',
    900: '#701A75',
  },
  white: '#FFFFFF',
  black: '#000000',
  magenta: '#D946EF',
  seafoam: '#20B2AA',
  // Purple alias for primitives.purple access
  purple: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D5FF',
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#A855F7',
    600: '#9333EA',
    700: '#7C3AED',
    800: '#6B21A8',
    900: '#581C87',
  },
  // Mint color scale (alias for emerald)
  mint: {
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
} as const;

// ═══════════════════════════════════════════════════════════════════
// GRADIENTS
// ═══════════════════════════════════════════════════════════════════
export const GRADIENTS = {
  primary: ['#DFFF00', '#C8E600'] as const,
  secondary: ['#A855F7', '#9333EA'] as const,
  warm: ['#DFFF00', '#F43F5E'] as const,
  dark: ['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.95)'] as const,
  glass: ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)'] as const,
  cardOverlay: ['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.85)'] as const,
  shimmer: ['transparent', 'rgba(255, 255, 255, 0.2)', 'transparent'] as const,
  // Additional gradients
  gift: ['#FFD700', '#FFA500'] as const,
  giftButton: ['#FFD700', '#FFA500'] as const,
  trust: ['#06B6D4', '#0891B2'] as const,
  sunset: ['#F43F5E', '#FB923C', '#FCD34D'] as const,
  // Aurora effect
  aurora: ['#00F5D4', '#00BBF9', '#9B5DE5', '#F15BB5'] as const,
  // Disabled state
  disabled: ['#52525B', '#3F3F46'] as const,
};

// ═══════════════════════════════════════════════════════════════════
// CARD SHADOW
// ═══════════════════════════════════════════════════════════════════
export const CARD_SHADOW = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 12,
  elevation: 8,
};

export const CARD_SHADOW_LIGHT = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 6,
  elevation: 4,
};

export const CARD_SHADOW_HEAVY = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.25,
  shadowRadius: 16,
  elevation: 12,
};

// ═══════════════════════════════════════════════════════════════════
// SHADOWS - Shadow presets for various elevations
// ═══════════════════════════════════════════════════════════════════
export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  card: CARD_SHADOW,
  subtle: CARD_SHADOW_LIGHT,
  trustGlow: {
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: (color: string, intensity = 0.4) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: intensity,
    shadowRadius: 16,
    elevation: 8,
  }),
};

// ═══════════════════════════════════════════════════════════════════
// PALETTE (alias for primitives)
// ═══════════════════════════════════════════════════════════════════
export const PALETTE = primitives;

// ═══════════════════════════════════════════════════════════════════
// SEMANTIC COLORS - Twilight Zinc & Neon Energy
// ═══════════════════════════════════════════════════════════════════
export const COLORS = {
  // Primary (Neon Lime)
  primary: '#DFFF00',
  primaryDark: '#C8E600',
  primaryLight: '#E8FF4D',

  // Secondary (Electric Violet)
  secondary: primitives.violet[500],
  secondaryDark: primitives.violet[600],
  secondaryLight: primitives.violet[400],

  // Accent (Cyan) - Nested structure for COLORS.accent.primary
  accent: {
    primary: primitives.cyan[500],
    dark: primitives.cyan[600],
    light: primitives.cyan[400],
  },
  // Flat aliases for backward compatibility
  accentDark: primitives.cyan[600],
  accentLight: primitives.cyan[400],

  // Semantic
  success: primitives.emerald[500],
  warning: primitives.amber[500],
  error: primitives.rose[500],
  info: primitives.cyan[500],

  // Text (flat alias - for nested, use COLORS.text.primary etc.)
  textColor: '#F8FAFC',
  textSecondary: '#94A3B8',
  textDisabled: '#334155',

  // Background (flat aliases)
  white: '#FFFFFF',
  black: '#000000',
  backgroundColor: '#121214',
  borderColor: 'rgba(255, 255, 255, 0.08)',

  // Grayscale
  gray50: primitives.zinc[50],
  gray100: primitives.zinc[100],
  gray200: primitives.zinc[200],
  gray300: primitives.zinc[300],
  gray400: primitives.zinc[400],
  gray500: primitives.zinc[500],
  gray600: primitives.zinc[600],
  gray700: primitives.zinc[700],
  gray800: primitives.zinc[800],
  gray900: primitives.zinc[900],

  // Named colors
  coral: primitives.rose[400],
  mint: primitives.emerald[400],
  lavender: primitives.violet[400],
  sky: primitives.cyan[400],
  peach: primitives.amber[300],

  // Trust colors (flat aliases - for nested use COLORS.trust.primary etc.)
  trustColor: primitives.cyan[500],
  trustLight: primitives.cyan[400],
  trustDark: primitives.cyan[600],

  // Additional colors
  orange: primitives.amber[500],
  orangeDark: primitives.amber[700],
  rose: primitives.rose[500],
  violet: primitives.violet[500],
  emerald: primitives.emerald[500],
  lime: '#DFFF00',
  cyan: primitives.cyan[500],
  darkGray: '#1E1E20',
  infoLight: 'rgba(6, 182, 212, 0.15)',
  greenBright: primitives.emerald[400],
  green: primitives.emerald[500],

  // Metallic
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  platinum: '#E5E4E2',

  // ═══════════════════════════════════════════════════════════════════
  // NESTED STRUCTURES - For components using nested access
  // ═══════════════════════════════════════════════════════════════════
  brand: {
    primary: '#DFFF00',
    primaryLight: '#E8FF4D',
    primaryDark: '#C8E600',
    secondary: '#A855F7',
    secondaryLight: '#C084FC',
    secondaryDark: '#9333EA',
    secondaryTransparent: 'rgba(168, 85, 247, 0.15)',
    accent: '#06B6D4',
  },

  text: {
    primary: '#F8FAFC',
    secondary: '#94A3B8',
    tertiary: '#64748B',
    muted: '#475569',
    link: '#DFFF00',
    onLight: '#121214',
    onLightSecondary: '#475569',
    onDark: '#FFFFFF',
    onDarkSecondary: 'rgba(255, 255, 255, 0.72)',
    onDarkMuted: 'rgba(255, 255, 255, 0.48)',
    inverse: '#121214',
    primaryMuted: 'rgba(248, 250, 252, 0.6)',
    primaryWhite80: 'rgba(255, 255, 255, 0.8)',
  },

  bg: {
    primary: '#121214',
    primaryLight: '#1E1E20',
    primaryDark: '#0A0A0B',
    secondary: '#1E1E20',
    tertiary: '#27272A',
    elevated: '#27272A',
    glass: 'rgba(255, 255, 255, 0.03)',
  },

  border: {
    default: 'rgba(255, 255, 255, 0.08)',
    light: 'rgba(255, 255, 255, 0.05)',
    dark: 'rgba(255, 255, 255, 0.15)',
    focus: '#DFFF00',
    glow: 'rgba(223, 255, 0, 0.3)',
    primary: 'rgba(255, 255, 255, 0.08)',
    subtle: 'rgba(255, 255, 255, 0.06)',
  },

  feedback: {
    success: '#10B981',
    successLight: 'rgba(16, 185, 129, 0.15)',
    warning: '#F59E0B',
    warningLight: 'rgba(245, 158, 11, 0.15)',
    error: '#F43F5E',
    errorLight: 'rgba(244, 63, 94, 0.15)',
    info: '#06B6D4',
    infoLight: 'rgba(6, 182, 212, 0.15)',
  },

  // Status colors (alias for feedback)
  status: {
    success: '#10B981',
    warning: '#F59E0B',
    error: '#F43F5E',
    info: '#06B6D4',
  },

  utility: {
    white: '#FFFFFF',
    black: '#000000',
    ultraBlack: '#121214',
    transparent: 'transparent',
    disabled: '#52525B',
  },

  surface: {
    base: '#121214',
    baseLight: '#1E1E20',
    card: '#1E1E20',
    cardSolid: '#1E1E20',
    modal: 'rgba(18, 18, 20, 0.95)',
    overlay: 'rgba(0, 0, 0, 0.6)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',
    overlayMedium: 'rgba(0, 0, 0, 0.5)',
    overlayHeavy: 'rgba(0, 0, 0, 0.85)',
    overlayBackdrop: 'rgba(0, 0, 0, 0.7)',
    overlay30: 'rgba(0, 0, 0, 0.3)',
    overlay40: 'rgba(0, 0, 0, 0.4)',
    glass: 'rgba(255, 255, 255, 0.03)',
    glassBorder: 'rgba(255, 255, 255, 0.08)',
    glassBackground: 'rgba(30, 30, 32, 0.85)',
    muted: '#27272A',
    elevated: '#27272A',
    primary: '#121214',
    secondary: '#1E1E20',
  },

  // Trust nested structure
  trust: {
    primary: '#06B6D4',
    light: '#22D3EE',
    dark: '#0891B2',
    transparent: 'rgba(6, 182, 212, 0.15)',
    surface: 'rgba(6, 182, 212, 0.08)',
    muted: 'rgba(6, 182, 212, 0.15)',
  },

  // Background nested structure (for COLORS.background.primary)
  background: {
    primary: '#121214',
    secondary: '#1E1E20',
    tertiary: '#27272A',
    elevated: '#27272A',
    glass: 'rgba(255, 255, 255, 0.03)',
  },

  // ═══════════════════════════════════════════════════════════════════
  // LEGACY FLAT ALIASES - For backward compatibility
  // ═══════════════════════════════════════════════════════════════════
  textOnDark: '#FFFFFF',
  textOnDarkSecondary: 'rgba(255, 255, 255, 0.72)',
  textOnDarkMuted: 'rgba(255, 255, 255, 0.48)',
  textInverse: '#121214',

  backgroundDark: '#121214',
  surfaceDark: '#1E1E20',

  // Soft colors
  softGray: '#94A3B8',
  softOrange: '#F59E0B',
  softOrangeTransparent: 'rgba(245, 158, 11, 0.15)',

  // Transparent variants
  mintTransparent: 'rgba(16, 185, 129, 0.15)',
  mintTransparentLight: 'rgba(16, 185, 129, 0.08)',
  secondaryTransparent: 'rgba(168, 85, 247, 0.15)',

  // Additional semantic colors
  successLight: 'rgba(16, 185, 129, 0.15)',
  warningLight: 'rgba(245, 158, 11, 0.15)',
  errorLight: 'rgba(244, 63, 94, 0.15)',

  // Overlay colors
  whiteOverlay20: 'rgba(255, 255, 255, 0.20)',
  whiteOverlay10: 'rgba(255, 255, 255, 0.10)',
  blackOverlay60: 'rgba(0, 0, 0, 0.6)',

  // Subtitle/muted
  subtitle: '#94A3B8',
  lightGray: 'rgba(255, 255, 255, 0.12)',

  // ═══════════════════════════════════════════════════════════════════
  // MORE LEGACY ALIASES - For additional backward compatibility
  // ═══════════════════════════════════════════════════════════════════
  // Text aliases
  textPrimary: '#F8FAFC',
  textMuted: '#475569',
  textLight: '#94A3B8',

  // Background aliases
  backgroundPrimary: '#121214',
  backgroundSecondary: '#1E1E20',

  // Surface aliases
  surfaceMuted: '#27272A',
  surfaceSubtle: 'rgba(255, 255, 255, 0.03)',
  surfaceCard: '#1E1E20',
  cardBackground: '#1E1E20',
  inputBackground: '#1E1E20',

  // Overlay aliases (flat) - Keep for backward compatibility
  // overlay: 'rgba(0, 0, 0, 0.6)' is now nested, see below
  overlay30: 'rgba(0, 0, 0, 0.3)',
  overlay40: 'rgba(0, 0, 0, 0.4)',
  darkOverlay: 'rgba(0, 0, 0, 0.85)',

  // Overlay nested structure (for COLORS.overlay.heavy, etc.)
  overlay: {
    light: 'rgba(0, 0, 0, 0.3)',
    medium: 'rgba(0, 0, 0, 0.5)',
    heavy: 'rgba(0, 0, 0, 0.85)',
    backdrop: 'rgba(0, 0, 0, 0.7)',
    default: 'rgba(0, 0, 0, 0.6)',
  },

  // Overlays alias for compatibility
  overlays: {
    light: 'rgba(0, 0, 0, 0.3)',
    medium: 'rgba(0, 0, 0, 0.5)',
    heavy: 'rgba(0, 0, 0, 0.85)',
    backdrop: 'rgba(0, 0, 0, 0.7)',
    default: 'rgba(0, 0, 0, 0.6)',
  },

  // Border aliases
  borderDefault: 'rgba(255, 255, 255, 0.08)',
  borderLight: 'rgba(255, 255, 255, 0.05)',

  // Shadow
  shadowColor: 'rgba(0, 0, 0, 0.3)',

  // Primary muted
  primaryMuted: 'rgba(223, 255, 0, 0.15)',
  primaryTransparent: 'rgba(223, 255, 0, 0.08)',

  // Trust colors
  trustGold: '#FFD700',

  // Special colors
  brown: '#8B4513',
  beige: '#F5F5DC',
  beigeLight: '#FAF8F5',
  teal: '#14B8A6',
  blue: '#3B82F6',
  magenta: '#D946EF',

  // Status colors
  greenSuccess: '#10B981',
  softRed: '#F87171',

  // Button colors
  buttonDark: '#1E1E20',
  disabled: '#52525B',

  // Modal/Overlay
  modalBackdrop: 'rgba(0, 0, 0, 0.7)',
  overlay60: 'rgba(0, 0, 0, 0.6)',
  blackTransparent: 'rgba(0, 0, 0, 0.5)',

  // Filter pills
  filterPillActive: 'rgba(223, 255, 0, 0.15)',
  filterPillActiveBorder: '#DFFF00',

  // Success muted
  successMuted: 'rgba(16, 185, 129, 0.15)',

  // Error/Background variants
  errorBackground: 'rgba(244, 63, 94, 0.15)',

  // Shadow
  shadow: 'rgba(0, 0, 0, 0.25)',

  // Gray variants
  grayLight: '#E4E4E7',

  // White transparent
  whiteTransparentLight: 'rgba(255, 255, 255, 0.15)',

  // KYC colors
  kycBronze: '#CD7F32',
  kycSilver: '#C0C0C0',
  kycGold: '#FFD700',
  kycPlatinum: '#E5E4E2',

  // Additional muted colors
  secondaryMuted: 'rgba(168, 85, 247, 0.15)',
  trustMuted: 'rgba(6, 182, 212, 0.15)',
  accentMuted: 'rgba(6, 182, 212, 0.15)',
  purpleTransparent: 'rgba(168, 85, 247, 0.15)',
  primarySurface: 'rgba(223, 255, 0, 0.1)',

  // Transparent variants (20% opacity)
  tealTransparent20: 'rgba(20, 184, 166, 0.2)',
  warningTransparent20: 'rgba(245, 158, 11, 0.2)',
  successTransparent20: 'rgba(16, 185, 129, 0.2)',
  errorTransparent20: 'rgba(244, 63, 94, 0.2)',
  trustTransparent20: 'rgba(6, 182, 212, 0.2)',

  // Success variants
  successDark: primitives.emerald[700],

  // Trust level colors
  trustLow: '#F87171',
  trustMedium: '#F59E0B',
  trustHigh: '#10B981',
  trustPlatinum: '#E5E4E2',

  // Error variants
  errorRedLight: 'rgba(244, 63, 94, 0.15)',

  // White variants
  whiteTransparent: 'rgba(255, 255, 255, 0.5)',
  whiteOverlay80: 'rgba(255, 255, 255, 0.8)',

  // Social media colors
  whatsapp: '#25D366',
  whatsappTransparent20: 'rgba(37, 211, 102, 0.2)',
  instagram: '#E4405F',
  instagramTransparent20: 'rgba(228, 64, 95, 0.2)',
  twitter: '#1DA1F2',
  facebook: '#1877F2',
  google: '#EA4335',
  telegram: '#0088CC',
  linkedin: '#0A66C2',

  // Glass color
  glass: 'rgba(255, 255, 255, 0.03)',
  glassBorder: 'rgba(255, 255, 255, 0.08)',

  // Gray variants
  gray: '#71717A',
  grayDark: '#52525B',

  // Mint background
  mintBackground: 'rgba(16, 185, 129, 0.1)',
  mintDark: primitives.emerald[700],
  mintBorder: 'rgba(16, 185, 129, 0.3)',

  // Danger color
  danger: primitives.rose[500],
  dangerLight: 'rgba(244, 63, 94, 0.15)',

  // Black transparent variants
  blackTransparentDark: 'rgba(0, 0, 0, 0.7)',

  // Seafoam
  seafoam: '#20B2AA',

  // Brown variants
  brownDark: '#5D4037',
  brownGray: '#8B7355',

  // Orange variants
  orangeBright: '#FF6B00',

  // White transparent variants
  whiteTransparentDarker: 'rgba(255, 255, 255, 0.08)',
  whiteTransparentDarkest: 'rgba(255, 255, 255, 0.04)',

  // Background variants
  backgroundDarkSecondary: '#1C1C1E',

  // Warning muted
  warningMuted: 'rgba(245, 158, 11, 0.15)',

  // Primary white opacity variant
  primaryWhite80: 'rgba(255, 255, 255, 0.8)',

  // ═══════════════════════════════════════════════════════════════════
  // ADDITIONAL MISSING PROPERTIES
  // ═══════════════════════════════════════════════════════════════════
  // Hairline border
  hairline: 'rgba(255, 255, 255, 0.08)',
  hairlineLight: 'rgba(255, 255, 255, 0.12)',
  hairlineDark: 'rgba(255, 255, 255, 0.04)',

  // Text tertiary alias (flat)
  textTertiary: '#64748B',

  // Purple color
  purple: primitives.violet[500],

  // Cyan/accent nested structure (for COLORS.accent.primary)
  accentColors: {
    primary: '#06B6D4',
    light: '#22D3EE',
    dark: '#0891B2',
  },

  // Card brand colors
  visa: '#1A1F71',
  mastercard: '#EB001B',
  amex: '#006FCF',
  discover: '#FF6000',

  // Destructive action color
  destructive: primitives.rose[500],
  destructiveLight: 'rgba(244, 63, 94, 0.15)',

  // Amber colors (from primitives)
  amber: primitives.amber[500],
  amberLight: primitives.amber[400],
  amberDark: primitives.amber[600],
} as const;

export type ColorKey = keyof typeof COLORS;
export type ColorValue = (typeof COLORS)[ColorKey];

// Export primitives for advanced use
export { primitives };

// ═══════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════
export const getTrustRingColors = (score: number) => {
  if (score >= 90)
    return { ring: COLORS.trustPlatinum, glow: 'rgba(229, 228, 226, 0.4)' };
  if (score >= 70)
    return { ring: COLORS.trustHigh, glow: 'rgba(16, 185, 129, 0.4)' };
  if (score >= 40)
    return { ring: COLORS.trustMedium, glow: 'rgba(245, 158, 11, 0.4)' };
  return { ring: COLORS.trustLow, glow: 'rgba(248, 113, 113, 0.4)' };
};

// THEME_COLORS is now deprecated - use COLORS directly
export const THEME_COLORS = COLORS;
