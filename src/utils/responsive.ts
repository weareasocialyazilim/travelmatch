/**
 * Responsive Design Utilities
 * Cihaz boyutları, breakpoints ve responsive utilities
 */

import { Dimensions, Platform, PixelRatio } from 'react-native';

/**
 * Device Dimensions
 */
export const getDeviceDimensions = () => {
  const { width, height } = Dimensions.get('window');
  const screenWidth = Dimensions.get('screen').width;
  const screenHeight = Dimensions.get('screen').height;

  return {
    window: { width, height },
    screen: { width: screenWidth, height: screenHeight },
  };
};

/**
 * Device Type Detection
 */
export const DEVICE_SIZES = {
  MOBILE_S: 320,
  MOBILE_M: 375,
  MOBILE_L: 425,
  TABLET: 768,
  TABLET_L: 1024,
  DESKTOP: 1440,
} as const;

export const getDeviceType = () => {
  const { width } = Dimensions.get('window');

  if (width < DEVICE_SIZES.TABLET) return 'mobile';
  if (width < DEVICE_SIZES.DESKTOP) return 'tablet';
  return 'desktop';
};

export const isTablet = () => {
  const { width, height } = Dimensions.get('window');
  const aspectRatio = height / width;

  // iPad aspect ratios are typically between 1.3 and 1.4
  return (
    (width >= DEVICE_SIZES.TABLET && aspectRatio > 1.2 && aspectRatio < 1.6) ||
    (Platform.OS === 'ios' && Platform.isPad)
  );
};

export const isSmallDevice = () => {
  const { width } = Dimensions.get('window');
  return width < DEVICE_SIZES.MOBILE_M;
};

/**
 * Design System Base Dimensions
 * Based on iPhone 11/12/13 Pro viewport
 * These values are used as reference for responsive scaling
 */
export const DESIGN_SYSTEM = {
  /** Base width for responsive calculations (iPhone standard) */
  STANDARD_WIDTH: 375,
  /** Base height for responsive calculations (iPhone standard) */
  STANDARD_HEIGHT: 812,
  /** Minimum touch target size (WCAG 2.1 AA compliance) */
  MIN_TOUCH_TARGET: 44,
  /** Default hit slop for touch targets */
  DEFAULT_HIT_SLOP: 8,
} as const;

const STANDARD_WIDTH = DESIGN_SYSTEM.STANDARD_WIDTH;
const STANDARD_HEIGHT = DESIGN_SYSTEM.STANDARD_HEIGHT;

export const responsiveWidth = (size: number): number => {
  const { width } = Dimensions.get('window');
  return (width / STANDARD_WIDTH) * size;
};

export const responsiveHeight = (size: number): number => {
  const { height } = Dimensions.get('window');
  return (height / STANDARD_HEIGHT) * size;
};

export const responsiveFontSize = (size: number): number => {
  const { width } = Dimensions.get('window');
  const scale = width / STANDARD_WIDTH;
  const newSize = size * scale;

  return Math.round(PixelRatio.roundToNearestPixel(newSize));
};

/**
 * Responsive Spacing
 */
export const createResponsiveSpacing = () => {
  const deviceType = getDeviceType();
  const multiplier =
    deviceType === 'tablet' ? 1.5 : deviceType === 'desktop' ? 2 : 1;

  return {
    xs: 4 * multiplier,
    sm: 8 * multiplier,
    md: 16 * multiplier,
    lg: 24 * multiplier,
    xl: 32 * multiplier,
    xxl: 48 * multiplier,
  };
};

/**
 * Breakpoint Utilities
 */
export const useBreakpoint = () => {
  const { width } = Dimensions.get('window');

  return {
    isMobile: width < DEVICE_SIZES.TABLET,
    isTablet: width >= DEVICE_SIZES.TABLET && width < DEVICE_SIZES.DESKTOP,
    isDesktop: width >= DEVICE_SIZES.DESKTOP,
    width,
  };
};

/**
 * Orientation Detection
 */
export const isLandscape = () => {
  const { width, height } = Dimensions.get('window');
  return width > height;
};

export const isPortrait = () => {
  const { width, height } = Dimensions.get('window');
  return height > width;
};

/**
 * Platform-specific Values
 */
export const platformValue = <T>(values: {
  ios?: T;
  android?: T;
  web?: T;
  default: T;
}): T => {
  if (Platform.OS === 'ios' && values.ios !== undefined) return values.ios;
  if (Platform.OS === 'android' && values.android !== undefined)
    return values.android;
  if (Platform.OS === 'web' && values.web !== undefined) return values.web;
  return values.default;
};

/**
 * Responsive Grid
 */
export const getGridColumns = (): number => {
  const deviceType = getDeviceType();

  switch (deviceType) {
    case 'mobile':
      return 2;
    case 'tablet':
      return 3;
    case 'desktop':
      return 4;
    default:
      return 2;
  }
};

/**
 * Hit Slop for better touch targets
 * Improves accessibility by expanding touch area
 */
export const getHitSlop = (size = DESIGN_SYSTEM.DEFAULT_HIT_SLOP) => ({
  top: size,
  bottom: size,
  left: size,
  right: size,
});

/**
 * Minimum touch target helper
 * Ensures touch targets meet WCAG 2.1 AA guidelines (44x44px minimum)
 */
export const ensureMinTouchTarget = (size: number): number => {
  return Math.max(size, DESIGN_SYSTEM.MIN_TOUCH_TARGET);
};

/**
 * Safe percentages (for avoiding very large/small values)
 */
export const clampPercentage = (
  percentage: number,
  min = 20,
  max = 90,
): number => {
  return Math.max(min, Math.min(max, percentage));
};
