/**
 * Design Tokens - Main Export
 * Central export for all design tokens
 */

import { colors, type Colors } from './colors';
import {
  spacing,
  radius,
  SIZES,
  BORDER,
  shadows,
  type Spacing,
  type Radius,
  type Sizes,
  type Border,
  type Shadows,
} from './spacing';
import { typography, type Typography } from './typography';

export { colors, type Colors } from './colors';
export { typography, type Typography } from './typography';
export {
  spacing,
  radius,
  SIZES,
  BORDER,
  shadows,
  type Spacing,
  type Radius,
  type Sizes,
  type Border,
  type Shadows,
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
