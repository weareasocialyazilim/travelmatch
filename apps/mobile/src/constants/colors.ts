/**
 * TravelMatch Mobile Constants - Awwwards Edition Color Palette
 *
 * Felsefe: Twilight Zinc (Yumuşak Koyu) zemin üzerinde
 * GenZ enerjisini temsil eden yüksek kontrastlı Neon dokunuşlar.
 *
 * Bu dosya geriye dönük uyumluluk için flat color exports sağlar.
 * Yeni projeler için design-system/tokens/colors.ts kullanın.
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
  white: '#FFFFFF',
  black: '#000000',
} as const;

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

  // Accent (Cyan)
  accent: primitives.cyan[500],
  accentDark: primitives.cyan[600],
  accentLight: primitives.cyan[400],

  // Semantic
  success: primitives.emerald[500],
  warning: primitives.amber[500],
  error: primitives.rose[500],
  info: primitives.cyan[500],

  // Text
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  textDisabled: '#334155',

  // Background
  white: '#FFFFFF',
  black: '#000000',
  background: '#121214',
  border: 'rgba(255, 255, 255, 0.08)',

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

  // Trust colors
  trust: primitives.cyan[500],
  trustLight: primitives.cyan[400],
  trustDark: primitives.cyan[600],

  // Additional colors
  orange: primitives.amber[500],
  rose: primitives.rose[500],
  violet: primitives.violet[500],
  emerald: primitives.emerald[500],
  lime: '#DFFF00',
  cyan: primitives.cyan[500],

  // Metallic
  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',
  platinum: '#E5E4E2',

  // ═══════════════════════════════════════════════════════════════════
  // NESTED STRUCTURES - For components using nested access
  // ═══════════════════════════════════════════════════════════════════
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

  utility: {
    white: '#FFFFFF',
    black: '#000000',
    ultraBlack: '#121214',
    transparent: 'transparent',
    disabled: '#52525B',
  },

  surface: {
    card: '#1E1E20',
    cardSolid: '#1E1E20',
    modal: 'rgba(18, 18, 20, 0.95)',
    overlay: 'rgba(0, 0, 0, 0.6)',
    overlayHeavy: 'rgba(0, 0, 0, 0.85)',
    glass: 'rgba(255, 255, 255, 0.03)',
    glassBorder: 'rgba(255, 255, 255, 0.08)',
    glassBackground: 'rgba(30, 30, 32, 0.85)',
  },
} as const;

export type ColorKey = keyof typeof COLORS;
export type ColorValue = (typeof COLORS)[ColorKey];

// Export primitives for advanced use
export { primitives };

// Re-export theme colors for components that need full nested structure
export { COLORS as THEME_COLORS } from '../theme/colors';
