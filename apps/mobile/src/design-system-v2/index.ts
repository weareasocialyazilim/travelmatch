/**
 * TravelMatch Awwwards Design System 2026 - V2
 *
 * Central export file for all V2 design system components,
 * colors, typography, and utilities.
 *
 * Import from this file for consistent access:
 * import { ButtonV2, COLORS_V2, TYPE_SCALE } from '@/design-system-v2';
 */

// ============================================
// COLORS & THEMING
// ============================================
export {
  PALETTE,
  COLORS_V2,
  GRADIENTS_V2,
  SHADOWS_V2,
  getTrustRingColors,
  getTrustLevel,
  withOpacity,
  isColorDark,
  type PaletteColor,
  type SemanticColor,
  type GradientName,
} from '../constants/colors-v2';

// ============================================
// TYPOGRAPHY
// ============================================
export {
  FONTS,
  FONT_SIZES_V2,
  LINE_HEIGHTS_V2,
  LETTER_SPACING_V2,
  TYPE_SCALE,
  TEXT_VARIANTS_V2,
  TOUCH_TARGETS,
  getAccessibleFontSize,
  getLineHeight,
  createAccessibleTextStyle,
  type FontFamily,
  type FontSize,
  type TypographyCategory,
} from '../constants/typography-v2';

// ============================================
// ANIMATIONS
// ============================================
export {
  SPRINGS,
  TIMINGS,
  useAnimationsV2,
  usePressAnimationV2,
  useEntranceAnimationV2,
  useParallaxV2,
  useFloatingAnimationV2,
  useSkeletonAnimationV2,
  createStaggerDelays,
  getSpringConfig,
  getTimingConfig,
  type SpringConfig,
  type TimingConfig,
} from '../hooks/useAnimationsV2';

// ============================================
// NAVIGATION
// ============================================
export {
  TRANSITION_SPECS_V2,
  TRANSITIONS_V2,
  forFade,
  forScaleFade,
  forSlideUpFade,
  forHorizontalSlide,
  forModalPresentation,
  getStandardScreenOptions,
  getModalScreenOptions,
  getDetailScreenOptions,
  getAuthScreenOptions,
  DEFAULT_NAVIGATOR_OPTIONS,
  MODAL_NAVIGATOR_OPTIONS,
  AUTH_NAVIGATOR_OPTIONS,
} from '../navigation/transitionsV2';

// ============================================
// UI COMPONENTS
// ============================================
export {
  ButtonV2,
  IconButtonV2,
  type ButtonVariant,
  type ButtonSize,
  type ButtonV2Props,
  type IconButtonV2Props,
} from '../components/ui/ButtonV2';

export {
  MomentCardV2,
  type Moment,
  type MomentUser,
  type MomentCategory,
  type MomentLocation,
  type MomentCardV2Props,
} from '../components/MomentCardV2';

export {
  BottomNavV2,
  BottomNavCompactV2,
  type TabName,
  type BottomNavV2Props,
  type BottomNavCompactV2Props,
} from '../components/BottomNavV2';

export {
  ProfileHeaderV2,
  type ProfileUser,
  type ProfileHeaderV2Props,
} from '../components/profile/ProfileHeaderV2';

// ============================================
// SCREEN COMPONENTS
// ============================================
export { OnboardingScreenV2 } from '../features/auth/screens/OnboardingScreenV2';
export { WelcomeScreenV2 } from '../features/auth/screens/WelcomeScreenV2';

// ============================================
// DESIGN SYSTEM INFO
// ============================================
export const DESIGN_SYSTEM_VERSION = '2.0.0';
export const DESIGN_SYSTEM_NAME = 'TravelMatch Awwwards 2026';
export const DESIGN_AESTHETIC = 'Liquid Warmth';
