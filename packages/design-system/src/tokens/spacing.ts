/**
 * Design Tokens - Spacing
 * TravelMatch Web Design System 2026
 * "Cinematic Travel + Trust Jewelry"
 * Base unit: 8pt grid system
 */

// ═══════════════════════════════════════════
// SPACING SCALE (8pt grid)
// ═══════════════════════════════════════════
export const spacing = {
  // Base spacing scale
  none: 0,
  xxs: 2, // 0.125rem
  xs: 4, // 0.25rem
  sm: 8, // 0.5rem
  md: 12, // 0.75rem
  base: 16, // 1rem
  lg: 20, // 1.25rem
  xl: 24, // 1.5rem
  '2xl': 32, // 2rem
  '3xl': 40, // 2.5rem
  '4xl': 48, // 3rem
  '5xl': 64, // 4rem
  '6xl': 80, // 5rem
  '7xl': 96, // 6rem

  // Extended scale
  '4.5': 18, // 1.125rem
  '13': 52, // 3.25rem
  '15': 60, // 3.75rem
  '18': 72, // 4.5rem
  '22': 88, // 5.5rem
  '30': 120, // 7.5rem

  // Semantic spacing
  gutter: 16, // Default horizontal spacing
  sectionGap: 96, // Gap between major sections (landing page)
  adminSectionGap: 24, // Gap in admin panel
  componentGap: 12, // Gap between related components
  elementGap: 8, // Gap between small elements
} as const;

// ═══════════════════════════════════════════
// BORDER RADIUS
// ═══════════════════════════════════════════
export const radius = {
  none: 0,
  sm: 4, // 0.25rem
  md: 8, // 0.5rem
  base: 12, // 0.75rem - Default radius
  lg: 16, // 1rem
  xl: 20, // 1.25rem
  '2xl': 24, // 1.5rem
  '3xl': 32, // 2rem
  '4xl': 40, // 2.5rem
  full: 9999,
} as const;

// ═══════════════════════════════════════════
// SHADOWS
// ═══════════════════════════════════════════
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',

  // TravelMatch specific shadows
  card: '0 4px 24px -4px rgba(0, 0, 0, 0.08)',
  cardHover: '0 12px 40px -8px rgba(0, 0, 0, 0.15)',
  button: '0 4px 14px -2px rgba(245, 158, 11, 0.4)', // Primary amber glow
  buttonSecondary: '0 4px 14px -2px rgba(236, 72, 153, 0.4)', // Magenta glow
  trustGlow: '0 0 40px -8px rgba(16, 185, 129, 0.5)', // Emerald trust glow
  glass: '0 8px 32px -4px rgba(0, 0, 0, 0.1)',
  innerGlow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.1)',
} as const;

// ═══════════════════════════════════════════
// CONTAINER WIDTHS
// ═══════════════════════════════════════════
export const containerWidths = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1400,
} as const;

// ═══════════════════════════════════════════
// Z-INDEX SCALE
// ═══════════════════════════════════════════
export const zIndex = {
  behind: -1,
  base: 0,
  dropdown: 10,
  sticky: 20,
  fixed: 30,
  modalBackdrop: 40,
  modal: 50,
  popover: 60,
  tooltip: 70,
  toast: 80,
  max: 9999,
} as const;

// ═══════════════════════════════════════════
// ANIMATION DURATIONS
// ═══════════════════════════════════════════
export const durations = {
  fast: 150,
  normal: 200,
  slow: 300,
  slower: 500,
  slowest: 1000,
} as const;

// ═══════════════════════════════════════════
// EASING FUNCTIONS
// ═══════════════════════════════════════════
export const easings = {
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  spring: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
} as const;

export type Spacing = typeof spacing;
export type Radius = typeof radius;
export type Shadows = typeof shadows;
export type ContainerWidths = typeof containerWidths;
export type ZIndex = typeof zIndex;
export type Durations = typeof durations;
export type Easings = typeof easings;
