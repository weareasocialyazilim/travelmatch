/**
 * Design Tokens - Main Export
 * Central export for all design tokens
 *
 * "Cinematic Travel + Trust Jewelry"
 * Palette A: Sunset Proof
 */

import { COLORS, GRADIENTS, SHADOWS } from './colors';
import {
  spacing,
  radius,
  shadows as cssShadows,
  type Spacing,
  type Radius,
  type Shadows as CSSShadows,
} from './spacing';
import { typography, type Typography } from './typography';

// Color exports
export { COLORS, GRADIENTS, SHADOWS } from './colors';

// Typography exports
export { typography, type Typography } from './typography';

// Spacing exports
export {
  spacing,
  radius,
  shadows as cssShadows,
  type Spacing,
  type Radius,
  type Shadows as CSSShadows,
} from './spacing';

// Combined theme type
export interface Theme {
  colors: typeof COLORS;
  gradients: typeof GRADIENTS;
  typography: Typography;
  spacing: Spacing;
  radius: Radius;
  shadows: typeof SHADOWS;
  cssShadows: CSSShadows;
}

// Default theme
export const defaultTheme: Theme = {
  colors: COLORS,
  gradients: GRADIENTS,
  typography,
  spacing,
  radius,
  shadows: SHADOWS,
  cssShadows,
};
