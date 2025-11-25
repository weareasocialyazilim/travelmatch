export const LAYOUT = {
  // Convenience padding (legacy keys used across codebase)
  padding: 16,
  // Keep existing spacing object for newer code
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
  },
  
  // Border radius
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    full: 9999,
  },
  
  // Component sizes
  header: {
    titleSize: 34,
    buttonSize: 48,
  },
  
  avatar: {
    size: 32,
    borderRadius: 16,
  },
  
  verifiedBadge: {
    size: 32,
    borderRadius: 16,
  },
  
  // Card
  card: {
    imageAspectRatio: 16 / 9,
    borderRadius: 16,
    padding: 16,
  },
  
  // Filter pill
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  
  // Bottom nav
  bottomNav: {
    gradientHeight: 96,
    marginHorizontal: 16,
    marginBottomIOS: 8,
    marginBottomAndroid: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  
  // List
  list: {
    contentPaddingHorizontal: 16,
    contentPaddingBottom: 120,
    contentPaddingTop: 8,
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
