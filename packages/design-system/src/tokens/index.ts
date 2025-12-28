/**
 * Design Tokens - Main Export
 * Central export for all design tokens
 */

import { colors, type Colors } from './colors';
import {
  SPACING,
  spacing,
  RADIUS,
  radius,
  radii,
  SIZES,
  BORDER,
  shadows,
  type Spacing,
  type Radius,
  type Sizes,
  type Border,
  type Shadows,
  type SpacingKey,
  type RadiusKey,
  type SizeKey,
  type BorderKey,
} from './spacing';
import { typography, type Typography } from './typography';

export { colors, type Colors } from './colors';
export { typography, type Typography } from './typography';
export {
  SPACING,
  spacing,
  RADIUS,
  radius,
  radii,
  SIZES,
  BORDER,
  shadows,
  type Spacing,
  type Radius,
  type Sizes,
  type Border,
  type Shadows,
  type SpacingKey,
  type RadiusKey,
  type SizeKey,
  type BorderKey,
} from './spacing';

// Combined theme type
export interface Theme {
  colors: Colors;
  typography: Typography;
  spacing: Spacing;
  radius: Radius;
  sizes: Sizes;
  border: Border;
  shadows: Shadows;
}

// Default theme
export const defaultTheme: Theme = {
  colors,
  typography,
  spacing,
  radius,
  sizes: SIZES,
  border: BORDER,
  shadows,
};
