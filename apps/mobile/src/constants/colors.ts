import { TYPOGRAPHY } from '../theme/typography';

/**
 * TravelMatch iOS 26.3 Design System Colors
 *
 * New warm amber/pink palette for gift-moment experience
 * Designed to evoke warmth, celebration, and trust
 */
export const COLORS = {
  // ============================================
  // PRIMARY - Warm Amber (Gift/Celebration feel)
  // ============================================
  primary: '#F59E0B',           // Main amber - warm, emotional, gift-wrap feel
  primaryLight: '#FBBF24',      // Light amber for gradients
  primaryDark: '#D97706',       // Dark amber for pressed states
  primaryMuted: 'rgba(245, 158, 11, 0.15)',

  // ============================================
  // SECONDARY - Emotional Pink/Coral
  // ============================================
  secondary: '#EC4899',         // Pink - emotional, celebration
  secondaryLight: '#F472B6',    // Light pink
  secondaryMuted: 'rgba(236, 72, 153, 0.15)',

  // ============================================
  // ACCENT - Coral for highlights
  // ============================================
  accent: '#FF6B6B',
  coral: '#FF6B6B',

  // ============================================
  // SUCCESS/TRUST - Emerald Green
  // ============================================
  success: '#10B981',           // Trust, approval, verification
  successLight: '#34D399',
  successMuted: 'rgba(16, 185, 129, 0.15)',
  trust: '#10B981',             // Alias for trust-related UI

  // ============================================
  // TRUST SCORE RING COLORS
  // ============================================
  trustLow: '#EF4444',          // 0-30: Red - Low trust
  trustMedium: '#F59E0B',       // 31-60: Amber - Medium trust
  trustHigh: '#10B981',         // 61-85: Green - High trust
  trustPlatinum: '#FFD700',     // 86-100: Gold - Platinum trust

  // ============================================
  // KYC BADGE COLORS
  // ============================================
  kycBronze: '#CD7F32',         // Email verified
  kycSilver: '#C0C0C0',         // Phone verified
  kycGold: '#FFD700',           // Full KYC
  kycPlatinum: '#E5E4E2',       // 10+ successful gifts + Gold

  // ============================================
  // BACKGROUND - Warm White Tones
  // ============================================
  background: '#FFFBF5',        // Warm white - inviting, travel-friendly
  backgroundSecondary: '#FFF8F0',
  backgroundGradient: '#FFFBF5',
  backgroundLight: '#FFFFFF',
  backgroundDark: '#0E1B14',

  // ============================================
  // SURFACE
  // ============================================
  surface: '#FFFFFF',
  surfaceLight: '#FFFFFF',
  surfaceDark: '#1A2F23',

  // ============================================
  // GLASS EFFECTS (iOS 26 Liquid Glass)
  // ============================================
  glass: 'rgba(255, 251, 245, 0.85)',
  glassBackground: 'rgba(255, 251, 245, 0.85)',
  glassBorder: 'rgba(255, 255, 255, 0.3)',
  glassLight: 'rgba(255, 255, 255, 0.95)',

  // ============================================
  // OVERLAYS - Lighter for modern feel
  // ============================================
  overlay: 'rgba(0, 0, 0, 0.4)',        // Default overlay (was 0.5)
  overlayLight: 'rgba(0, 0, 0, 0.2)',
  overlayMedium: 'rgba(0, 0, 0, 0.4)',
  overlayDark: 'rgba(0, 0, 0, 0.6)',
  overlay30: 'rgba(0, 0, 0, 0.3)',
  overlay40: 'rgba(0, 0, 0, 0.4)',
  overlay50: 'rgba(0, 0, 0, 0.5)',
  overlay60: 'rgba(0, 0, 0, 0.6)',
  overlay70: 'rgba(0, 0, 0, 0.7)',
  overlay75: 'rgba(0, 0, 0, 0.5)',      // Reduced from 0.75

  // ============================================
  // TEXT COLORS
  // ============================================
  text: '#1F2937',              // Main text - slightly softer than pure black
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textMuted: '#9CA3AF',
  textInverse: '#FFFFFF',
  textWhite70: 'rgba(255, 255, 255, 0.7)',
  textWhite80: 'rgba(255, 255, 255, 0.8)',
  subtitle: 'rgba(255, 255, 255, 0.9)',

  // ============================================
  // GRAY SCALE
  // ============================================
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

  // ============================================
  // UI COLORS
  // ============================================
  white: '#FFFFFF',
  black: '#000000',
  border: '#E5E7EB',
  borderDark: '#2D4A3A',
  cardDark: '#243D2F',
  transparent: 'transparent',
  modalBackdrop: 'rgba(0, 0, 0, 0.4)',
  shadowColor: '#000',
  shadow: '#000',
  darkOverlay: 'rgba(20, 20, 20, 0.4)',

  // ============================================
  // CARD COLORS
  // ============================================
  cardBackground: '#FFFFFF',
  card: '#FFFFFF',

  // ============================================
  // SEMANTIC COLORS
  // ============================================
  info: '#3B82F6',
  warning: '#F59E0B',
  error: '#EF4444',
  danger: '#EF4444',
  destructive: '#DC2626',

  // ============================================
  // STATUS VARIANTS
  // ============================================
  successDark: '#059669',
  successTransparent: 'rgba(16, 185, 129, 0.15)',
  warningLight: '#FEF3C7',
  warningDark: '#D97706',
  errorBackground: '#FEF2F2',
  errorLight: '#FEE2E2',
  errorRed: '#E53E3E',
  errorRedLight: '#FEE2E2',

  // ============================================
  // FILTER/PILL COLORS (Updated for new primary)
  // ============================================
  filterPillActive: 'rgba(245, 158, 11, 0.2)',
  filterPillActiveBorder: 'rgba(245, 158, 11, 0.5)',

  // ============================================
  // TRANSPARENCY VARIANTS
  // ============================================
  primaryTransparent: 'rgba(245, 158, 11, 0.15)',
  secondaryTransparent: 'rgba(236, 72, 153, 0.15)',
  coralTransparent: 'rgba(255, 107, 107, 0.15)',
  coralTransparentLight: 'rgba(255, 107, 107, 0.1)',
  softOrangeTransparent: 'rgba(255, 169, 77, 0.15)',
  purpleTransparent: 'rgba(139, 92, 246, 0.15)',
  softGrayTransparent: 'rgba(184, 180, 175, 0.15)',

  // White transparency variants
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

  // Black transparency variants
  blackTransparent: 'rgba(0, 0, 0, 0.5)',
  blackTransparentLight: 'rgba(0, 0, 0, 0.3)',
  blackTransparentDark: 'rgba(0, 0, 0, 0.1)',
  blackTransparentDarker: 'rgba(0, 0, 0, 0.08)',

  // Status transparency
  errorTransparent10: 'rgba(239, 68, 68, 0.1)',
  errorTransparent20: 'rgba(239, 68, 68, 0.2)',
  tealTransparent20: 'rgba(0, 128, 128, 0.2)',
  warningTransparent20: 'rgba(245, 158, 11, 0.2)',
  successTransparent33: 'rgba(16, 185, 129, 0.33)',
  infoTransparent33: 'rgba(59, 130, 246, 0.33)',
  warningTransparent33: 'rgba(245, 158, 11, 0.33)',
  emeraldTransparent20: 'rgba(16, 185, 129, 0.2)',

  // ============================================
  // LEGACY COLORS (Maintained for compatibility)
  // ============================================
  mint: '#10B981',              // Now maps to success/emerald
  mintTransparent: 'rgba(16, 185, 129, 0.12)',
  mintTransparentLight: 'rgba(16, 185, 129, 0.15)',
  mintTransparentDark: 'rgba(16, 185, 129, 0.2)',
  mintBorder: '#A7F3D0',
  mintBackground: '#D1FAE5',
  mintDark: '#059669',
  mapHeader: 'rgba(255, 251, 245, 0.95)',

  // ============================================
  // ADDITIONAL UI COLORS
  // ============================================
  beige: '#E8D9CE',
  beigeLight: '#F4ECE7',
  brown: '#9C6C49',
  brownDark: '#221710',
  brownGray: '#A8A29E',
  greenSuccess: '#10B981',
  greenBright: '#22C55E',
  greenDark: '#15803D',
  orange: '#F97316',
  orangeDark: '#EA580C',
  orangeBright: '#FB923C',
  orangeAlt: '#F97316',
  teal: '#14B8A6',
  blue: '#3B82F6',
  softOrange: '#FFA94D',
  softRed: '#FF8787',
  softGray: '#B8B4AF',
  purple: '#8B5CF6',
  violet: '#8B5CF6',
  pink: '#EC4899',
  gold: '#FFD700',
  amber: '#F59E0B',
  amberLight: '#FEF3C7',
  amberDark: '#D97706',
  amberBright: '#FBBF24',
  emerald: '#10B981',
  indigo: '#6366F1',
  grayMedium: '#6B7280',
  grayLight: '#9CA3AF',
  disabled: '#D1D5DB',
  darkGray: '#D4D4D4',
  lightGray: '#E5E7EB',

  // ============================================
  // BUTTON COLORS
  // ============================================
  buttonPrimary: '#F59E0B',     // Updated to amber
  buttonDark: '#1F2937',
  buttonDisabled: '#D1D5DB',

  // ============================================
  // INPUT
  // ============================================
  inputBackground: '#F9FAFB',

  // ============================================
  // SOCIAL/BRAND COLORS
  // ============================================
  facebook: '#1877F2',
  twitter: '#1DA1F2',
  whatsapp: '#25D366',
  instagram: '#E4405F',
  telegram: '#0088CC',
  linkedin: '#0A66C2',
  tiktok: '#000000',
  visa: '#1A1F71',
  mastercard: '#EB001B',
  whatsappTransparent20: 'rgba(37, 211, 102, 0.2)',
  instagramTransparent20: 'rgba(225, 48, 108, 0.2)',

  // ============================================
  // GRADIENT DEFINITIONS (for reference)
  // ============================================
  // Primary gradient: ['#F59E0B', '#FBBF24']
  // Gift button gradient: ['#F59E0B', '#EC4899']
  // Celebration gradient: ['#EC4899', '#8B5CF6']
} as const;

/**
 * Gradient presets for common use cases
 */
export const GRADIENTS = {
  primary: ['#F59E0B', '#FBBF24'] as const,
  giftButton: ['#F59E0B', '#EC4899'] as const,
  celebration: ['#EC4899', '#8B5CF6'] as const,
  trust: ['#10B981', '#34D399'] as const,
  sunset: ['#F59E0B', '#EF4444'] as const,
  aurora: ['#8B5CF6', '#EC4899'] as const,
} as const;

// Font sizes
export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
} as const;

// Line heights
export const LINE_HEIGHTS = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
} as const;

// Typography presets - Extended version (use TYPOGRAPHY from typography.ts for main usage)
export const TYPOGRAPHY_EXTENDED = {
  h1: {
    ...TYPOGRAPHY.display2,
    fontWeight: '800' as const,
    lineHeight: 40,
    letterSpacing: -0.5,
    color: '#1A1A1A',
  },
  h2: {
    ...TYPOGRAPHY.h2,
    fontWeight: '700' as const,
    lineHeight: 32,
    letterSpacing: -0.3,
    color: '#1A1A1A',
  },
  h3: {
    ...TYPOGRAPHY.h3,
    fontWeight: '700' as const,
    lineHeight: 28,
    color: '#1A1A1A',
  },
  h4: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600' as const,
    lineHeight: 24,
    color: '#1A1A1A',
  },
  body: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '400' as const,
    lineHeight: 24,
    color: '#1A1A1A',
  },
  bodySmall: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '400' as const,
    lineHeight: 20,
    color: '#666666',
  },
  caption: {
    ...TYPOGRAPHY.caption,
    fontWeight: '500' as const,
    lineHeight: 16,
    color: '#999999',
  },
  button: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '700' as const,
    lineHeight: 24,
  },
  buttonSmall: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
  label: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600' as const,
    lineHeight: 20,
    color: '#1A1A1A',
  },
} as const;

// Card shadow style
export const CARD_SHADOW = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.05,
  shadowRadius: 3,
  elevation: 2,
} as const;
