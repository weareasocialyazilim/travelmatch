export const COLORS = {
  // Primary colors
  primary: '#A6E5C1',
  mint: '#A6E5C1',
  coral: '#FF6F61',

  // Background colors
  background: '#F8F8F8',
  backgroundGradient: '#F8F8F8',

  // Text colors
  text: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',

  // UI colors
  white: '#FFFFFF',
  black: '#000000',
  border: '#E5E5E5',
  transparent: 'transparent',
  mintTransparent: 'rgba(166, 229, 193, 0.12)',
  mintTransparentLight: 'rgba(166, 229, 193, 0.15)',
  mintTransparentDark: 'rgba(166, 229, 193, 0.2)',
  coralTransparent: 'rgba(255, 111, 97, 0.15)',
  coralTransparentLight: 'rgba(255, 111, 97, 0.1)',
  softOrangeTransparent: 'rgba(255, 169, 77, 0.15)',
  modalBackdrop: 'rgba(0, 0, 0, 0.5)',
  whiteTransparent: 'rgba(255, 255, 255, 0.18)',
  whiteTransparentLight: 'rgba(255, 255, 255, 0.3)',
  whiteTransparentDark: 'rgba(255, 255, 255, 0.2)',
  whiteTransparentDarker: 'rgba(255, 255, 255, 0.1)',
  whiteTransparentDarkest: 'rgba(255, 255, 255, 0.05)',
  blackTransparent: 'rgba(0, 0, 0, 0.7)',
  blackTransparentLight: 'rgba(0,0,0,0.3)',
  blackTransparentDark: 'rgba(0,0,0,0.1)',
  blackTransparentDarker: 'rgba(0,0,0,0.08)',
  subtitle: 'rgba(255, 255, 255, 0.9)',
  mapHeader: 'rgba(246, 242, 236, 0.95)',

  // Card colors
  cardBackground: '#FFFFFF',

  // Filter pill colors
  filterPillActive: 'rgba(166, 229, 193, 0.3)',
  filterPillActiveBorder: 'rgba(166, 229, 193, 0.5)',

  // Glass effect
  glassBackground: 'rgba(255, 255, 255, 0.95)',
  glassBorder: 'rgba(229, 229, 229, 0.5)',

  // Accent
  accent: '#E67E22',
  // Secondary / semantic colors
  secondary: '#6CB4FF',
  info: '#1877F2', // Facebook
  twitter: '#1DA1F2',
  whatsapp: '#25D366',
  instagram: '#E4405F',
  error: '#DB4437',
  errorBackground: '#FFE6E6',
  softOrange: '#FFA94D',
  softRed: '#FF8787',
  softGray: '#B8B4AF',
  purple: '#8E44AD',
  purpleTransparent: 'rgba(142, 68, 173, 0.15)',
  gold: '#FFD700',

  // Status colors
  success: '#5BC08A',
  successDark: '#00B372',
  orange: '#FFB84D',
  orangeDark: '#FF9500',
  successLight: '#E6F9F0',
  warning: '#FFF9E6',
  warningLight: '#FFF9E6',
  warningDark: '#FFD166',
  disabled: '#D0D0D0',
  gray: '#F5F5F5',
  darkGray: '#D4D4D4',
  lightGray: '#E5E5E5',
  buttonPrimary: '#007AFF',
  buttonDark: '#1E1E1E',

  // Shadow
  shadowColor: '#000000',
  // Light background variant
  backgroundLight: '#FFFFFF',
  // Card alias
  card: '#FFFFFF',
} as const;

// Typography
export const TYPOGRAPHY = {
  h1: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#1A1A1A',
  },
  h2: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#1A1A1A',
  },
  h3: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#1A1A1A',
  },
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    color: '#1A1A1A',
  },
  bodySmall: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: '#666666',
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: '#999999',
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
