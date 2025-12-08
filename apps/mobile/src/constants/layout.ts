import { radii } from './radii';
import { spacing } from './spacing';

export const LAYOUT = {
  // Convenience padding (legacy keys used across codebase)
  padding: spacing.md,
  // Keep existing spacing object for newer code
  // Spacing
  spacing: {
    xs: spacing.xs,
    sm: spacing.sm,
    md: spacing.md,
    lg: spacing.lg,
    xl: spacing.xl,
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
    padding: spacing.md,
  },

  // Filter pill
  filterPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
  },

  // Bottom nav
  bottomNav: {
    gradientHeight: 96,
    marginHorizontal: spacing.md,
    marginBottomIOS: spacing.sm,
    marginBottomAndroid: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },

  // List
  list: {
    contentPaddingHorizontal: spacing.md,
    contentPaddingBottom: 120,
    contentPaddingTop: spacing.sm,
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
