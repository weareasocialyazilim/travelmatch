/**
 * Screen Tracking Hook
 * Ekran görüntülemelerini otomatik track eden hook
 */

import { useEffect } from 'react';
import { analytics } from '../services/analytics';

/**
 * Track screen views automatically
 * Usage: useScreenTracking('Home')
 */
export const useScreenTracking = (screenName: string) => {
  useEffect(() => {
    analytics.screen(screenName);
  }, [screenName]);
};
