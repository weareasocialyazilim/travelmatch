/**
 * Design Tokens - Main Export
 * Central export for all design tokens
 *
 * "Cinematic Travel + Trust Jewelry"
 * Palette A: Sunset Proof
 */

import {
  colors,
  gradients,
  shadows,
  primitives,
  type Colors,
  type Gradients,
  type Shadows,
} from './colors';
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
export {
  colors,
  gradients,
  shadows,
  primitives,
  type Colors,
  type Gradients,
  type Shadows,
  type ColorName,
  type GradientName,
  type ShadowName,
} from './colors';

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
  colors: Colors;
  gradients: Gradients;
  typography: Typography;
  spacing: Spacing;
  radius: Radius;
  shadows: Shadows;
  cssShadows: CSSShadows;
}

// Default theme
export const defaultTheme: Theme = {
  colors,
  gradients,
  typography,
  spacing,
  radius,
  shadows,
  cssShadows,
};
