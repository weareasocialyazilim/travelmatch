/**
 * TravelMatch Ultimate Design System - Spacing & Sizes
 *
 * 8pt Grid System with Premium spacing rules
 *
 * Awwwards Standards:
 * - Screen padding: 20-24px
 * - Card padding: 14-16px
 * - Button heights: 44/48px (min tap target)
 * - Radius: 16 base, 24 hero, 12 chip
 *
 * Re-exports from @travelmatch/design-system for convenience
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

// Numeric scale alias for index-based access
export const spacing = {
  0: 0,
  1: 4,     // xs
  2: 8,     // sm
  3: 12,    // md (8 + 4)
  4: 16,    // base
  5: 20,    // lg
  6: 24,    // xl
  8: 32,    // 2xl
  10: 40,   // 3xl
  12: 48,   // 4xl
  16: 64,   // 5xl
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

// Legacy alias
export const radii = RADIUS;


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
// Type exports
// ═══════════════════════════════════════════════════
export type SpacingKey = keyof typeof SPACING;
export type RadiusKey = keyof typeof RADIUS;
export type SizeKey = keyof typeof SIZES;
export type BorderKey = keyof typeof BORDER;
