/**
 * TravelMatch Awwwards Design System 2026
 *
 * Estetik Yön: "Liquid Warmth" - Organic Luxury meets Playful Warmth
 * Semantic Color System for gift-moment experience
 *
 * Konsept:
 * - Gift-giving = sıcaklık, duygu, bağlantı
 * - Travel = keşif, macera, özgürlük
 * - Trust = güvenilirlik, şeffaflık
 *
 * Architecture:
 * 1. PALETTE - Raw color values with full shade scale
 * 2. COLORS - Semantic colors for consistent theming
 * 3. GRADIENTS - Awwwards-level gradient presets
 * 4. SHADOWS - Elevation system
 */

// ============================================
// 1. PALETTE - Raw Color Values
// ============================================
export const PALETTE = {
  // Primary: Warm Amber → Coral gradient
  // Represents the warmth of gift-giving
  primary: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    200: '#FED7AA',
    300: '#FDBA74',
    400: '#FB923C',
    500: '#F97316', // Main primary
    600: '#EA580C',
    700: '#C2410C',
    800: '#9A3412',
    900: '#7C2D12',
  },

  // Secondary: Rose Pink
  // Emotional connection and gift excitement
  rose: {
    50: '#FFF1F2',
    100: '#FFE4E6',
    200: '#FECDD3',
    300: '#FDA4AF',
    400: '#FB7185',
    500: '#F43F5E', // Main secondary
    600: '#E11D48',
    700: '#BE123C',
    800: '#9F1239',
    900: '#881337',
  },

  // Accent: Aurora Violet
  // Premium feel and uniqueness
  aurora: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D5FF',
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#A855F7', // Main accent
    600: '#9333EA',
    700: '#7C3AED',
    800: '#6B21A8',
    900: '#581C87',
  },

  // Trust: Deep Emerald
  // Reliability and transparency
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
  },

  // Neutrals: Warm Sand Grays
  sand: {
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

  // Info: Ocean Blue
  blue: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6', // Main info
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  // Warning: Warm Amber
  amber: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B', // Main warning
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },

  // Error: Vibrant Red
  red: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444', // Main error
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },

  // Legacy compatibility
  pink: {
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

  // Pure values
  white: '#FFFFFF',
  black: '#000000',
} as const;

// Legacy alias
const primitives = PALETTE;

// ============================================
// 2. SEMANTIC COLORS (Use these in components)
// ============================================
export const COLORS = {
  // --------------------------------------------
  // Brand - Primary (Warm Orange)
  // --------------------------------------------
  primary: PALETTE.primary[500],
  primaryLight: PALETTE.primary[400],
  primaryDark: PALETTE.primary[600],
  primaryMuted: `rgba(249, 115, 22, 0.15)`,

  // --------------------------------------------
  // Brand - Secondary (Rose Pink)
  // --------------------------------------------
  secondary: PALETTE.rose[500],
  secondaryLight: PALETTE.rose[400],
  secondaryMuted: `rgba(244, 63, 94, 0.15)`,

  // --------------------------------------------
  // Brand - Accent (Aurora Violet)
  // --------------------------------------------
  accent: PALETTE.aurora[500],
  accentLight: PALETTE.aurora[400],
  accentMuted: `rgba(168, 85, 247, 0.15)`,
  coral: PALETTE.rose[400],

  // --------------------------------------------
  // Trust System
  // --------------------------------------------
  trust: PALETTE.trust[500],
  trustLight: PALETTE.trust[400],
  trustDark: PALETTE.trust[600],
  trustMuted: `rgba(16, 185, 129, 0.15)`,

  // Trust Score Ring Levels
  trustLow: PALETTE.red[500],
  trustMedium: PALETTE.amber[500],
  trustHigh: PALETTE.trust[500],
  trustPlatinum: '#10B981',

  // KYC Badge Colors
  kycBronze: '#CD7F32',
  kycSilver: '#C0C0C0',
  kycGold: '#FFD700',
  kycPlatinum: '#E5E4E2',

  // --------------------------------------------
  // Semantic Feedback
  // --------------------------------------------
  success: PALETTE.trust[500],
  successLight: PALETTE.trust[50],
  successDark: PALETTE.trust[600],
  successMuted: `rgba(16, 185, 129, 0.15)`,

  error: PALETTE.red[500],
  errorLight: PALETTE.red[100],
  errorDark: PALETTE.red[600],
  danger: PALETTE.red[500],
  destructive: PALETTE.red[600],

  warning: PALETTE.amber[500],
  warningLight: PALETTE.amber[100],
  warningDark: PALETTE.amber[600],

  info: PALETTE.blue[500],
  infoLight: PALETTE.blue[50],
  infoDark: PALETTE.blue[600],

  // --------------------------------------------
  // Text
  // --------------------------------------------
  text: PALETTE.sand[900],
  textPrimary: PALETTE.sand[900],
  textSecondary: PALETTE.sand[500],
  textTertiary: PALETTE.sand[400],
  textMuted: PALETTE.sand[400],
  textInverse: PALETTE.white,
  subtitle: 'rgba(255, 255, 255, 0.9)',

  // --------------------------------------------
  // Background - Warm cream tones
  // --------------------------------------------
  background: '#FFFCF7',
  backgroundSecondary: '#FFF9F0',
  backgroundTertiary: '#FFF5E6',
  backgroundLight: PALETTE.white,
  backgroundDark: '#0C0A09',

  // --------------------------------------------
  // Surface
  // --------------------------------------------
  surface: PALETTE.white,
  surfaceLight: PALETTE.white,
  surfaceElevated: 'rgba(255, 252, 247, 0.95)',
  surfaceDark: '#1C1917',

  // --------------------------------------------
  // Border
  // --------------------------------------------
  border: PALETTE.sand[200],
  borderLight: PALETTE.sand[100],
  borderDark: PALETTE.sand[700],
  borderFocus: PALETTE.primary[500],

  // --------------------------------------------
  // Glass Effects (iOS 26 Liquid Glass)
  // --------------------------------------------
  glass: 'rgba(255, 252, 247, 0.72)',
  glassDark: 'rgba(28, 25, 23, 0.85)',
  glassBorder: 'rgba(255, 255, 255, 0.3)',
  glassLight: 'rgba(255, 255, 255, 0.95)',

  // --------------------------------------------
  // Overlay
  // --------------------------------------------
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',
  modalBackdrop: 'rgba(0, 0, 0, 0.4)',

  // --------------------------------------------
  // Gray Scale
  // --------------------------------------------
  gray: PALETTE.gray,

  // --------------------------------------------
  // UI Essentials
  // --------------------------------------------
  white: PALETTE.white,
  black: PALETTE.black,
  transparent: 'transparent',
  disabled: PALETTE.sand[300],
  disabledText: PALETTE.sand[400],
  shadow: PALETTE.black,
  shadowColor: PALETTE.black,

  // --------------------------------------------
  // Card
  // --------------------------------------------
  card: PALETTE.white,
  cardBackground: PALETTE.white,
  cardDark: '#1C1917',

  // --------------------------------------------
  // Input
  // --------------------------------------------
  inputBackground: PALETTE.sand[50],

  // --------------------------------------------
  // Button
  // --------------------------------------------
  buttonPrimary: PALETTE.primary[500],
  buttonDark: PALETTE.sand[900],
  buttonDisabled: PALETTE.sand[300],

  // --------------------------------------------
  // Interactive
  // --------------------------------------------
  interactive: PALETTE.primary[500],
  interactiveHover: PALETTE.primary[600],
  interactivePressed: PALETTE.primary[700],

  // --------------------------------------------
  // Social/Brand Colors
  // --------------------------------------------
  facebook: '#1877F2',
  google: '#4285F4',
  apple: PALETTE.black,
  twitter: '#1DA1F2',
  whatsapp: '#25D366',
  instagram: '#E4405F',
  telegram: '#0088CC',
  linkedin: '#0A66C2',
  tiktok: PALETTE.black,
  visa: '#1A1F71',
  mastercard: '#EB001B',

  // --------------------------------------------
  // Additional Named Colors
  // --------------------------------------------
  amber: PALETTE.amber[500],
  amberLight: PALETTE.amber[100],
  amberDark: PALETTE.amber[600],
  amberBright: PALETTE.amber[400],
  emerald: PALETTE.emerald[500],
  purple: PALETTE.purple[500],
  violet: PALETTE.purple[500],
  pink: PALETTE.pink[500],
  blue: PALETTE.blue[500],
  gold: '#FFD700',
  teal: '#14B8A6',
  indigo: '#6366F1',
  orange: PALETTE.primary[500],
  orangeDark: PALETTE.primary[600],
  orangeBright: PALETTE.primary[400],

  // ============================================
  // LEGACY ALIASES (Backwards compatibility)
  // ============================================
  overlayMedium: 'rgba(0, 0, 0, 0.4)',
  overlay30: 'rgba(0, 0, 0, 0.3)',
  overlay40: 'rgba(0, 0, 0, 0.4)',
  overlay50: 'rgba(0, 0, 0, 0.5)',
  overlay60: 'rgba(0, 0, 0, 0.6)',
  overlay70: 'rgba(0, 0, 0, 0.7)',
  overlay75: 'rgba(0, 0, 0, 0.75)',
  darkOverlay: 'rgba(20, 20, 20, 0.4)',
  textWhite70: 'rgba(255, 255, 255, 0.7)',
  textWhite80: 'rgba(255, 255, 255, 0.8)',
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
  blackTransparent: 'rgba(0, 0, 0, 0.5)',
  blackTransparentLight: 'rgba(0, 0, 0, 0.3)',
  blackTransparentDark: 'rgba(0, 0, 0, 0.1)',
  blackTransparentDarker: 'rgba(0, 0, 0, 0.08)',
  mint: PALETTE.emerald[500],
  mintDark: PALETTE.emerald[600],
  mintTransparent: 'rgba(16, 185, 129, 0.12)',
  mintTransparentLight: 'rgba(16, 185, 129, 0.15)',
  mintTransparentDark: 'rgba(16, 185, 129, 0.2)',
  mintBorder: PALETTE.emerald[200],
  mintBackground: PALETTE.emerald[100],
  errorRed: PALETTE.red[500],
  errorRedLight: PALETTE.red[100],
  errorBackground: PALETTE.red[50],
  primaryTransparent: 'rgba(249, 115, 22, 0.15)',
  secondaryTransparent: 'rgba(244, 63, 94, 0.15)',
  coralTransparent: 'rgba(251, 113, 133, 0.15)',
  coralTransparentLight: 'rgba(251, 113, 133, 0.1)',
  softOrangeTransparent: 'rgba(255, 169, 77, 0.15)',
  purpleTransparent: 'rgba(168, 85, 247, 0.15)',
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
  filterPillActive: 'rgba(249, 115, 22, 0.2)',
  filterPillActiveBorder: 'rgba(249, 115, 22, 0.5)',
  backgroundGradient: '#FFFCF7',
  glassBackground: 'rgba(255, 252, 247, 0.85)',
  mapHeader: 'rgba(255, 252, 247, 0.95)',
  beige: '#E8D9CE',
  beigeLight: '#F4ECE7',
  brown: '#9C6C49',
  brownDark: '#221710',
  brownGray: '#A8A29E',
  greenSuccess: PALETTE.emerald[500],
  greenBright: '#22C55E',
  greenDark: '#15803D',
  orangeAlt: PALETTE.primary[500],
  softOrange: '#FFA94D',
  softRed: '#FF8787',
  softGray: '#B8B4AF',
  grayMedium: PALETTE.gray[500],
  grayLight: PALETTE.gray[400],
  darkGray: '#D4D4D4',
  lightGray: PALETTE.gray[200],
} as const;

// ============================================
// 3. GRADIENTS - Awwwards Level Presets
// ============================================
export const GRADIENTS = {
  // Hero gradient - Splash and onboarding
  hero: ['#F97316', '#FB7185', '#A855F7'] as const,

  // Primary gradients
  primary: [PALETTE.primary[500], PALETTE.primary[400]] as const,
  secondary: [PALETTE.rose[500], PALETTE.rose[400]] as const,

  // Gift button - Main CTA
  gift: ['#F97316', '#F43F5E'] as const,
  giftButton: ['#F97316', '#F43F5E'] as const,
  giftHover: ['#EA580C', '#E11D48'] as const,

  // Trust ring
  trust: ['#10B981', '#34D399'] as const,
  trustPlatinum: ['#10B981', '#34D399', '#6EE7B7'] as const,

  // Aurora ambient - Premium feel
  aurora: ['#A855F7', '#F43F5E', '#F97316'] as const,
  auroraSubtle: ['#E9D5FF', '#FECDD3', '#FED7AA'] as const,

  // Celebration (gift received/sent)
  celebration: ['#F43F5E', '#A855F7', '#3B82F6'] as const,

  // Decorative
  sunset: ['#F97316', '#FB923C', '#FCD34D'] as const,
  night: ['#1E3A8A', '#6D28D9', '#A855F7'] as const,

  // Glass overlay
  glassLight: ['rgba(255, 252, 247, 0.9)', 'rgba(255, 252, 247, 0.7)'] as const,
  glassDark: ['rgba(28, 25, 23, 0.95)', 'rgba(28, 25, 23, 0.8)'] as const,

  // Card image overlays
  cardOverlay: ['transparent', 'rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0.8)'] as const,
  cardOverlayLight: ['transparent', 'rgba(0, 0, 0, 0.3)', 'rgba(0, 0, 0, 0.6)'] as const,
  hero2: ['transparent', 'rgba(0, 0, 0, 0.7)'] as const,
  heroLight: ['transparent', 'rgba(0, 0, 0, 0.5)'] as const,

  // Background ambient
  bgWarm: ['#FFFCF7', '#FFF5E6'] as const,
  bgCool: ['#F5F5F4', '#FAFAF9'] as const,

  // Button variants
  accent: ['#A855F7', '#9333EA'] as const,
  disabled: ['#D6D3D1', '#A8A29E'] as const,

  // Skeleton loading
  skeleton: ['rgba(231, 229, 228, 0.6)', 'rgba(231, 229, 228, 1)', 'rgba(231, 229, 228, 0.6)'] as const,
} as const;

// ============================================
// 4. SHADOWS - Elevation System
// ============================================
export const SHADOWS = {
  // Card shadows
  card: {
    shadowColor: PALETTE.sand[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardHover: {
    shadowColor: PALETTE.sand[900],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  cardElevated: {
    shadowColor: PALETTE.sand[900],
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 32,
    elevation: 12,
  },

  // Button shadows - colored
  buttonPrimary: {
    shadowColor: PALETTE.primary[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonSecondary: {
    shadowColor: PALETTE.rose[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonAccent: {
    shadowColor: PALETTE.aurora[500],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },

  // Floating elements
  floating: {
    shadowColor: PALETTE.black,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 16,
  },

  // Subtle shadows
  subtle: {
    shadowColor: PALETTE.sand[900],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
} as const;

// Legacy shadow exports
export const CARD_SHADOW = SHADOWS.card;
export const CARD_SHADOW_LIGHT = SHADOWS.subtle;
export const CARD_SHADOW_HEAVY = SHADOWS.cardElevated;

// ============================================
// 5. UTILITY FUNCTIONS
// ============================================

/**
 * Get trust ring colors based on score
 */
export const getTrustRingColors = (score: number): readonly [string, string] => {
  if (score >= 90) return ['#10B981', '#34D399'] as const; // Platinum
  if (score >= 70) return ['#F59E0B', '#FBBF24'] as const; // Gold
  if (score >= 50) return ['#3B82F6', '#60A5FA'] as const; // Silver
  return ['#78716C', '#A8A29E'] as const; // Bronze
};

/**
 * Get trust level label
 */
export const getTrustLevel = (score: number): 'platinum' | 'gold' | 'silver' | 'bronze' => {
  if (score >= 90) return 'platinum';
  if (score >= 70) return 'gold';
  if (score >= 50) return 'silver';
  return 'bronze';
};

/**
 * Create rgba color with opacity
 */
export const withOpacity = (hexColor: string, opacity: number): string => {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

/**
 * Check if color is dark (for contrast)
 */
export const isColorDark = (hexColor: string): boolean => {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
};

// Export primitives for advanced use cases
export { primitives };

// Export types
export type PaletteColor = keyof typeof PALETTE;
export type SemanticColor = keyof typeof COLORS;
export type GradientName = keyof typeof GRADIENTS;
