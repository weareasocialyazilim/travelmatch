/**
 * TravelMatch Ultimate Design System 2026 - "8pt Premium Grid"
 * Motto: "Give a moment. See it happen."
 *
 * Based on 8pt grid system for consistent visual rhythm
 * All values are multiples of 4 for sub-grid alignment
 *
 * Usage:
 * - Use SPACING for semantic spacing (recommended)
 * - Use spacing for numeric scale (0-16)
 */

import { Dimensions, Platform, StatusBar } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ═══════════════════════════════════════════════════════════════════
// Numeric Scale (8pt grid)
// ═══════════════════════════════════════════════════════════════════
export const spacing = {
  0: 0,
  1: 4, // xs
  2: 8, // sm
  3: 12, // md (8 + 4)
  4: 16, // lg
  5: 20, // (16 + 4)
  6: 24, // xl
  8: 32, // 2xl
  10: 40, // 3xl
  12: 48, // 4xl
  16: 64, // 5xl
} as const;

// ═══════════════════════════════════════════════════════════════════
// Semantic Spacing
// ═══════════════════════════════════════════════════════════════════
export const SPACING = {
  // Base scale (multiples of 4)
  none: 0,
  xxs: 2,
  xs: spacing[1], // 4
  sm: spacing[2], // 8
  md: spacing[3], // 12
  base: spacing[4], // 16
  lg: spacing[5], // 20
  xl: spacing[6], // 24
  '2xl': spacing[8], // 32
  '3xl': spacing[10], // 40
  '4xl': spacing[12], // 48
  '5xl': spacing[16], // 64
  '6xl': 80,
  '7xl': 96,

  // Legacy alias for backwards compatibility
  xxl: spacing[12], // 48

  // Semantic spacing (Award standard)
  screenPadding: 20, // Dış boşluklar: 20-24
  screenPaddingLarge: 24,
  cardPadding: 16, // Kart içi: 14-16
  cardPaddingSmall: 12,
  cardPaddingLarge: 24,
  sectionGap: 24, // Bölümler arası
  itemGap: 12, // Liste item arası
  inlineGap: 8, // İç içe elemanlar
  componentGap: 16, // Component arası

  // Interactive element sizes
  buttonHeight: 56,
  buttonHeightSmall: 44,
  buttonHeightLarge: 64,
  inputHeight: 52,
  inputHeightSmall: 44,

  // Avatar sizes
  avatarXs: 24,
  avatarSm: 32,
  avatarMd: 40,
  avatarLg: 56,
  avatarXl: 80,
  avatarSmall: 40, // Legacy alias
  avatarMedium: 56, // Legacy alias
  avatarLarge: 80, // Legacy alias

  // Icon sizes
  iconXs: 16,
  iconSm: 20,
  iconMd: 24,
  iconLg: 32,
  iconXl: 40,

  // Border radius
  radiusXs: 4,
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusXl: 24,
  radiusFull: 9999,

  // Bottom sheet/modal
  bottomSheetRadius: 28,
  modalRadius: 24,

  // Navigation
  bottomNavHeight: 84,
  headerHeight: 56,
  tabBarHeight: 48,
} as const;

// ═══════════════════════════════════════════════════════════════════
// RADIUS - Premium rounded corners
// ═══════════════════════════════════════════════════════════════════
export const RADIUS = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12, // Küçük chip
  base: 16, // Ana radius
  lg: 20,
  xl: 24, // Hero kart
  '2xl': 28,
  '3xl': 32,
  full: 9999, // Pill/circle

  // Semantic
  chip: 12,
  button: 14,
  buttonSmall: 10,
  buttonLarge: 16,
  card: 16,
  cardHero: 24,
  sheet: 28,
  modal: 24,
  avatar: 9999,
  input: 12,
  badge: 8,
  tag: 6,
} as const;

// ═══════════════════════════════════════════════════════════════════
// SIZES - Component heights (Tap target: min 44)
// ═══════════════════════════════════════════════════════════════════
export const SIZES = {
  // Buttons
  buttonXS: 28,
  buttonSmall: 36,
  button: 44,
  buttonLarge: 52,
  buttonXL: 56,

  // Chips/Pills
  chip: 32,
  chipSmall: 28,
  chipLarge: 36,

  // Inputs
  inputSmall: 40,
  input: 48,
  inputLarge: 56,

  // Avatars
  avatarXXS: 24,
  avatarXS: 28,
  avatarSM: 36,
  avatarMD: 48,
  avatarLG: 64,
  avatarXL: 80,
  avatarHero: 100,
  avatar2XL: 120,

  // Trust ring
  trustRingXS: 32,
  trustRingSM: 44,
  trustRingMD: 64,
  trustRingLG: 88,
  trustRingHero: 120,

  // Icons
  iconXS: 12,
  iconSM: 16,
  iconMD: 20,
  iconLG: 24,
  iconXL: 28,
  icon2XL: 32,

  // Navigation
  bottomNav: 84,
  bottomNavSafe: 100, // With safe area
  header: 56,
  headerLarge: 64,
  tabBar: 48,
  statusBar: Platform.select({
    ios: 44,
    android: StatusBar.currentHeight ?? 24,
    default: 24,
  }),

  // Cards
  cardImageHeight: 200,
  cardImageHeightSmall: 160,
  cardImageHeightLarge: 280,
  cardImageHeightHero: 360,

  // Touch targets
  touchTarget: 44,
  touchTargetSmall: 36,
  touchTargetLarge: 52,

  // Dividers
  divider: 1,
  dividerThick: 2,

  // Borders
  borderWidth: 1,
  borderWidthMedium: 1.5,
  borderWidthThick: 2,
} as const;

// ═══════════════════════════════════════════════════════════════════
// LAYOUT - Screen dimensions and safe areas
// ═══════════════════════════════════════════════════════════════════
export const LAYOUT = {
  // Screen dimensions
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,

  // Content widths
  maxContentWidth: 428, // iPhone 14 Pro Max width
  narrowContentWidth: 320,
  wideContentWidth: 600,

  // Grid
  gridColumns: 12,
  gridGutter: SPACING.base,

  // Breakpoints (for future web support)
  breakpoints: {
    sm: 320,
    md: 375,
    lg: 414,
    xl: 428,
  },

  // Safe area insets (defaults, override with useSafeAreaInsets)
  safeAreaTop: Platform.select({
    ios: 47, // iPhone with notch
    android: StatusBar.currentHeight ?? 24,
    default: 0,
  }),
  safeAreaBottom: Platform.select({
    ios: 34, // iPhone with home indicator
    android: 0,
    default: 0,
  }),
} as const;

// ═══════════════════════════════════════════════════════════════════
// Z-INDEX - Layer management
// ═══════════════════════════════════════════════════════════════════
export const Z_INDEX = {
  base: 0,
  elevated: 1,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  overlay: 40,
  modal: 50,
  popover: 60,
  toast: 70,
  tooltip: 80,
  maximum: 100,
} as const;

// ═══════════════════════════════════════════════════════════════════
// OPACITY - Consistent opacity values
// ═══════════════════════════════════════════════════════════════════
export const OPACITY = {
  disabled: 0.5,
  muted: 0.6,
  secondary: 0.72,
  hover: 0.8,
  pressed: 0.9,
  full: 1,
} as const;

// ═══════════════════════════════════════════════════════════════════
// HIT SLOP - Touch area extensions
// ═══════════════════════════════════════════════════════════════════
export const HIT_SLOP = {
  small: { top: 4, right: 4, bottom: 4, left: 4 },
  default: { top: 8, right: 8, bottom: 8, left: 8 },
  large: { top: 12, right: 12, bottom: 12, left: 12 },
} as const;

// Type exports for TypeScript
export type SpacingKey = keyof typeof SPACING;
export type SpacingValue = (typeof SPACING)[SpacingKey];
export type RadiusKey = keyof typeof RADIUS;
export type SizeKey = keyof typeof SIZES;
