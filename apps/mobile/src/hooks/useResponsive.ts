/**
 * Responsive Hooks
 * React hooks for responsive design
 */

import { useState, useEffect } from 'react';
import type { ScaledSize } from 'react-native';
import { Dimensions } from 'react-native';
import { getDeviceType, isTablet, isLandscape } from '../utils/responsive';

/**
 * Hook to track window dimensions
 */
export const useWindowDimensions = () => {
  const [dimensions, setDimensions] = useState(() => {
    const { width, height } = Dimensions.get('window');
    return { width, height };
  });

  useEffect(() => {
    const onChange = ({ window }: { window: ScaledSize }) => {
      setDimensions({ width: window.width, height: window.height });
    };

    const subscription = Dimensions.addEventListener('change', onChange);

    return () => subscription?.remove();
  }, []);

  return dimensions;
};

/**
 * Hook to detect device type
 */
export const useDeviceType = () => {
  const [deviceType, setDeviceType] = useState(() => getDeviceType());

  useEffect(() => {
    const onChange = () => {
      setDeviceType(getDeviceType());
    };

    const subscription = Dimensions.addEventListener('change', onChange);

    return () => subscription?.remove();
  }, []);

  return deviceType;
};

/**
 * Hook to detect tablet
 */
export const useIsTablet = () => {
  const [tablet, setTablet] = useState(() => isTablet());

  useEffect(() => {
    const onChange = () => {
      setTablet(isTablet());
    };

    const subscription = Dimensions.addEventListener('change', onChange);

    return () => subscription?.remove();
  }, []);

  return tablet;
};

/**
 * Hook to detect orientation
 */
export const useOrientation = () => {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(() =>
    isLandscape() ? 'landscape' : 'portrait',
  );

  useEffect(() => {
    const onChange = () => {
      setOrientation(isLandscape() ? 'landscape' : 'portrait');
    };

    const subscription = Dimensions.addEventListener('change', onChange);

    return () => subscription?.remove();
  }, []);

  return orientation;
};

/**
 * Hook for responsive values based on breakpoints
 */
export const useResponsiveValue = <T>(values: {
  mobile: T;
  tablet?: T;
  desktop?: T;
}): T => {
  const deviceType = useDeviceType();

  if (deviceType === 'desktop' && values.desktop) return values.desktop;
  if (deviceType === 'tablet' && values.tablet) return values.tablet;
  return values.mobile;
};
