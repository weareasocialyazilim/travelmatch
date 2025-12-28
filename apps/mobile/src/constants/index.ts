/**
 * Constants barrel export
 */

// Export spacing but omit LAYOUT to avoid conflict with layout.ts
export {
  SPACING,
  RADIUS,
  SIZES,
  Z_INDEX,
  OPACITY,
  HIT_SLOP,
  BORDER,
  spacing,
  radii,
} from './spacing';
export type { SpacingKey, RadiusKey, SizeKey, BorderKey } from './spacing';
export * from './radii';
export * from './strings';
// Re-export colors explicitly to avoid duplicate names with typography
export {
  COLORS,
  GRADIENTS,
  CARD_SHADOW,
  CARD_SHADOW_LIGHT,
  CARD_SHADOW_HEAVY,
} from './colors';
export * from './shadows';
export * from './typography';
export * from './layout';
export * from './values';
