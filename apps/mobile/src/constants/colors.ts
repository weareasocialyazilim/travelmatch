import { TYPOGRAPHY } from '../theme/typography';

export const COLORS = {
  // Primary colors
  primary: '#A6E5C1',
  primaryDark: '#8BD4A8',
  primaryLight: '#C4F0D5',
  primaryMuted: 'rgba(166, 229, 193, 0.15)',
  mint: '#A6E5C1',
  coral: '#FF6F61',
  success: '#28A745',

  // Background colors
  background: '#F8F8F8',
  backgroundGradient: '#F8F8F8',
  backgroundLight: '#FFFFFF',
  backgroundDark: '#0E1B14',
  backgroundSecondary: '#F5F5F5',

  // Surface colors
  surface: '#FFFFFF',
  surfaceLight: '#FFFFFF',
  surfaceDark: '#1A2F23',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',

  // Text colors
  text: '#1A1A1A',
  textPrimary: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textMuted: '#9CA3AF',
  textInverse: '#FFFFFF',

  // Gray scale
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

  // UI colors
  white: '#FFFFFF',
  black: '#000000',
  border: '#E5E5E5',
  borderDark: '#2D4A3A',
  cardDark: '#243D2F',
  transparent: 'transparent',
  mintTransparent: 'rgba(166, 229, 193, 0.12)',
  mintTransparentLight: 'rgba(166, 229, 193, 0.15)',
  mintTransparentDark: 'rgba(166, 229, 193, 0.2)',
  coralTransparent: 'rgba(255, 111, 97, 0.15)',
  coralTransparentLight: 'rgba(255, 111, 97, 0.1)',
  softOrangeTransparent: 'rgba(255, 169, 77, 0.15)',
  modalBackdrop: 'rgba(0, 0, 0, 0.5)',
  whiteTransparent: 'rgba(255, 255, 255, 0.18)',
  transparentWhite: 'rgba(255, 255, 255, 0.18)',
  whiteTransparentLight: 'rgba(255, 255, 255, 0.3)',
  whiteTransparentDark: 'rgba(255, 255, 255, 0.2)',
  whiteTransparentDarker: 'rgba(255, 255, 193, 0.1)',
  whiteTransparentDarkest: 'rgba(255, 255, 255, 0.05)',
  blackTransparent: 'rgba(0, 0, 0, 0.7)',
  blackTransparentLight: 'rgba(0,0,0,0.3)',
  blackTransparentDark: 'rgba(0,0,0,0.1)',
  blackTransparentDarker: 'rgba(0,0,0,0.08)',
  subtitle: 'rgba(255, 255, 255, 0.9)',
  mapHeader: 'rgba(246, 242, 236, 0.95)',

  // Overlay colors
  overlay30: 'rgba(0, 0, 0, 0.3)',
  overlay40: 'rgba(0, 0, 0, 0.4)',
  overlay50: 'rgba(0, 0, 0, 0.5)',
  overlay60: 'rgba(0, 0, 0, 0.6)',
  overlay70: 'rgba(0, 0, 0, 0.7)',
  overlay75: 'rgba(0, 0, 0, 0.75)',
  whiteOverlay20: 'rgba(255, 255, 255, 0.2)',
  whiteOverlay30: 'rgba(255, 255, 255, 0.3)',
  whiteOverlay70: 'rgba(255, 255, 255, 0.7)',
  whiteOverlay80: 'rgba(255, 255, 255, 0.8)',
  textWhite70: 'rgba(255, 255, 255, 0.7)',
  textWhite80: 'rgba(255, 255, 255, 0.8)',
  shadowColor: '#000',
  errorBackground: '#FEF2F2',

  // Card colors
  cardBackground: '#FFFFFF',
  card: '#FFFFFF',

  // Filter pill colors
  filterPillActive: 'rgba(166, 229, 193, 0.3)',
  filterPillActiveBorder: 'rgba(166, 229, 193, 0.5)',

  // Glass effect
  glassBackground: 'rgba(255, 255, 255, 0.95)',
  glassBorder: 'rgba(229, 229, 229, 0.5)',

  // Accent
  accent: '#E67E22',

  // Custom UI colors (must be defined before usage)
  beige: '#E8D9CE',
  beigeLight: '#F4ECE7',
  brown: '#9C6C49',
  greenSuccess: '#07880E',
  destructive: '#DC2626', // Red for destructive actions
  orange: '#F47B25',
  teal: '#008080',
  blue: '#3B82F6',
  errorRed: '#E53E3E',
  errorRedLight: '#FEE2E2',
  errorLight: '#FEE2E2', // Alias for errorRedLight
  darkOverlay: 'rgba(20, 20, 20, 0.4)',
  shadow: '#000',

  // Secondary / semantic colors
  secondary: '#6CB4FF',
  info: '#3B82F6', // Same as blue
  warning: '#F59E0B',
  error: '#EF4444',
  danger: '#EF4444',

  // Social colors
  facebook: '#1877F2',
  twitter: '#1DA1F2',
  whatsapp: '#25D366',
  instagram: '#E4405F',

  // Other colors
  softOrange: '#FFA94D',
  softRed: '#FF8787',
  softGray: '#B8B4AF',
  purple: '#8E44AD',
  purpleTransparent: 'rgba(142, 68, 173, 0.15)',
  gold: '#FFD700',

  // Mint/Green shades
  mintBorder: '#D1E6DA',
  mintBackground: '#E8F3EC',
  mintDark: '#50956E',

  // Transparent colors for badges/overlays
  errorTransparent10: '#EF444410',
  errorTransparent20: '#EF444420',
  tealTransparent20: '#00808020',
  warningTransparent20: '#F59E0B20',
  successTransparent: '#D4F4DD',
  greenBright: '#22C55E',
  greenDark: '#15803D',
  amberBright: '#FFAB00',
  brownDark: '#221710',
  brownGray: '#A8A29E',
  orangeBright: '#FB923C',

  // Status colors
  successDark: '#00B372',
  orangeDark: '#FF9500',
  successLight: '#E6F9F0',
  warningLight: '#FFF9E6',
  warningDark: '#FFD166',
  disabled: '#D0D0D0',
  darkGray: '#D4D4D4',
  lightGray: '#E5E5E5',
  buttonPrimary: '#007AFF',
  buttonDark: '#1E1E1E',
  buttonDisabled: '#D0D0D0',

  // Input
  inputBackground: '#F5F5F5',

  // Soft gray transparent
  softGrayTransparent: 'rgba(184, 180, 175, 0.15)',

  // Social/Brand colors (additional)
  telegram: '#0088CC',
  linkedin: '#0A66C2',
  tiktok: '#000000',
  visa: '#1A1F71',
  mastercard: '#EB001B',

  // Status colors with transparency
  successTransparent33: '#28A74533',
  infoTransparent33: '#007BFF33',
  warningTransparent33: '#FFC10733',

  // Accent colors
  indigo: '#6366F1',
  amber: '#F59E0B',
  amberLight: '#FFF8E1',
  amberDark: '#FF6F00',
  emerald: '#10B981',

  // Transparency variants
  emeraldTransparent20: '#10B98120',
  whatsappTransparent20: '#25D36620',
  instagramTransparent20: '#E1306C20',

  // Notification/Status type colors
  violet: '#8B5CF6',
  pink: '#EC4899',
  grayMedium: '#6B7280',
  grayLight: '#9CA3AF',
  orangeAlt: '#F97316',
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
