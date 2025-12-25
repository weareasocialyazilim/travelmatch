import { radii } from './radii';
import { SPACING } from './spacing';

export const LAYOUT = {
  // Convenience padding (legacy keys used across codebase)
  padding: SPACING.md,
  // Keep existing spacing object for newer code
  // Spacing
  spacing: {
    xs: SPACING.xs,
    sm: SPACING.sm,
    md: SPACING.md,
    lg: SPACING.lg,
    xl: SPACING.xl,
  },

  // Border radius
  borderRadius: {
    sm: radii.sm,
    md: radii.md,
    lg: radii.lg,
    full: radii.full,
  },

  // Component sizes
  header: {
    titleSize: 34,
    buttonSize: 48,
  },

  avatar: {
    size: 32,
    borderRadius: radii.xl,
  },

  verifiedBadge: {
    size: 32,
    borderRadius: radii.xl,
  },

  // Card
  card: {
    imageAspectRatio: 16 / 9,
    borderRadius: radii.xl,
    padding: SPACING.md,
  },

  // Filter pill
  filterPill: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
  },

  // Bottom nav
  bottomNav: {
    gradientHeight: 96,
    marginHorizontal: SPACING.md,
    marginBottomIOS: SPACING.sm,
    marginBottomAndroid: SPACING.md,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },

  // List
  list: {
    contentPaddingHorizontal: SPACING.md,
    contentPaddingBottom: 120,
    contentPaddingTop: SPACING.sm,
  },

  // Shadow offsets
  shadowOffset: {
    none: { width: 0, height: 0 },
    sm: { width: 0, height: 1 },
    md: { width: 0, height: 2 },
    lg: { width: 0, height: 3 },
    xl: { width: 0, height: 4 },
    xxl: { width: 0, height: 10 },
    bottomSheet: { width: 0, height: -3 },
  },

  // Sizes for modals and containers
  size: {
    errorButtonMin: 200,
    errorMessageMax: 300,
    modalMax: 400,
    iconSm: 80,
  },
} as const;

export const TIMING = {
  refreshDuration: 1500,
} as const;
