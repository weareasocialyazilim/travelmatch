/**
 * Lovendo Ultimate Design System - Spacing & Sizes
 *
 * 8pt Grid System with Premium spacing rules
 * Shared across all platforms (mobile, web, etc.)
 *
 * Awwwards Standards:
 * - Screen padding: 20-24px
 * - Card padding: 14-16px
 * - Button heights: 44/48px (min tap target)
 * - Radius: 16 base, 24 hero, 12 chip
 */

// ═══════════════════════════════════════════════════
// SPACING - 8pt grid
// ═══════════════════════════════════════════════════
export const SPACING = {
  // Base scale
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,

  // Semantic (Awwwards standard)
  screenPadding: 20,
  cardPadding: 16,
  sectionGap: 24,
  itemGap: 12,
  inlineGap: 8,
} as const;

// ═══════════════════════════════════════════════════
// RADIUS - Premium corners
// ═══════════════════════════════════════════════════
export const RADIUS = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 28,
  full: 9999,

  // Semantic
  chip: 12,
  button: 14,
  card: 16,
  cardHero: 24,
  sheet: 28,
  avatar: 9999,
} as const;

// ═══════════════════════════════════════════════════
// SIZES - Component dimensions
// ═══════════════════════════════════════════════════
export const SIZES = {
  // Buttons
  buttonSmall: 36,
  button: 44,
  buttonLarge: 52,
  buttonXL: 56,

  // Chips/Pills
  chip: 32,
  chipSmall: 28,

  // Inputs
  input: 48,
  inputLarge: 56,

  // Avatars
  avatarXS: 28,
  avatarSM: 36,
  avatarMD: 48,
  avatarLG: 64,
  avatarXL: 80,
  avatarHero: 100,

  // Trust Ring
  trustRingSM: 44,
  trustRingMD: 64,
  trustRingLG: 88,
  trustRingHero: 120,

  // Icons
  iconSM: 16,
  iconMD: 20,
  iconLG: 24,
  iconXL: 28,

  // Navigation
  bottomNav: 84,
  header: 56,
  tabBar: 48,

  // Cards
  cardImageHeight: 200,
  cardImageHeightLarge: 280,

  // FAB
  fab: 56,
  fabSmall: 44,
} as const;

// ═══════════════════════════════════════════════════
// BORDER
// ═══════════════════════════════════════════════════
export const BORDER = {
  thin: 1,
  hairline: 0.5,
  medium: 1.5,
  thick: 2,
} as const;

// ═══════════════════════════════════════════════════
// LAYOUT - Legacy compatibility
// ═══════════════════════════════════════════════════
export const LAYOUT = {
  padding: SPACING.base,
  margin: SPACING.base,
  borderRadius: RADIUS.md,
  screenPadding: SPACING.screenPadding,
  cardPadding: SPACING.cardPadding,
  headerHeight: SIZES.header,
  tabBarHeight: SIZES.tabBar,
} as const;

// ═══════════════════════════════════════════════════
// Type exports
// ═══════════════════════════════════════════════════
export type SpacingKey = keyof typeof SPACING;
export type SpacingValue = (typeof SPACING)[SpacingKey];
export type RadiusKey = keyof typeof RADIUS;
export type SizeKey = keyof typeof SIZES;
export type BorderKey = keyof typeof BORDER;
