/**
 * TravelMatch Spacing System
 *
 * Based on 8pt grid system for consistent visual rhythm
 * All values are multiples of 4 for sub-grid alignment
 *
 * Usage:
 * - Use SPACING for semantic spacing (recommended)
 * - Use spacing for numeric scale (0-16)
 */

// ============================================
// Numeric Scale (8pt grid)
// ============================================
export const spacing = {
  0: 0,
  1: 4,     // xs
  2: 8,     // sm
  3: 12,    // md (8 + 4)
  4: 16,    // lg
  5: 20,    // (16 + 4)
  6: 24,    // xl
  8: 32,    // 2xl
  10: 40,   // 3xl
  12: 48,   // 4xl
  16: 64,   // 5xl
} as const;

// ============================================
// Semantic Spacing
// ============================================
export const SPACING = {
  // Base semantic sizes
  xs: spacing[1],     // 4
  sm: spacing[2],     // 8
  md: spacing[4],     // 16
  lg: spacing[6],     // 24
  xl: spacing[8],     // 32
  '2xl': spacing[12], // 48
  '3xl': spacing[16], // 64

  // Legacy aliases for backwards compatibility
  xxl: spacing[12],   // 48

  // Component-specific constants
  cardPadding: spacing[4],      // 16
  cardPaddingLarge: spacing[6], // 24
  screenPadding: spacing[4],    // 16
  screenPaddingLarge: spacing[6], // 24
  sectionGap: spacing[6],       // 24
  itemGap: spacing[3],          // 12

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
  avatarSmall: 40,    // Legacy alias
  avatarMedium: 56,   // Legacy alias
  avatarLarge: 80,    // Legacy alias

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
  bottomSheetRadius: 24,
  modalRadius: 16,

  // Navigation
  bottomNavHeight: 80,
  headerHeight: 56,
  tabBarHeight: 48,
} as const;

// Type exports
export type SpacingKey = keyof typeof SPACING;
export type SpacingValue = typeof SPACING[SpacingKey];
