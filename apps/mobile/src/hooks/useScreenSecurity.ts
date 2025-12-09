/**
 * Screen Security Hook
 * 
 * Enables screenshot protection for sensitive screens (payments, banking, etc.)
 * 
 * Usage:
 * function WithdrawScreen() {
 *   useScreenSecurity(); // Blocks screenshots while this screen is active
 *   // ...
 * }
 */

import { useEffect } from 'react';
import * as ScreenCapture from 'expo-screen-capture';
import { logger } from '../utils/logger';

export function useScreenSecurity() {
  useEffect(() => {
    let hasPermission = false;

    async function enableProtection() {
      try {
        await ScreenCapture.preventScreenCaptureAsync();
        hasPermission = true;
        logger.info('ScreenSecurity', 'Screenshot protection enabled');
      } catch (error) {
        logger.warn('ScreenSecurity', 'Failed to enable screenshot protection', error);
      }
    }

    async function disableProtection() {
      if (hasPermission) {
        try {
          await ScreenCapture.allowScreenCaptureAsync();
          logger.info('ScreenSecurity', 'Screenshot protection disabled');
        } catch (error) {
          logger.warn('ScreenSecurity', 'Failed to disable screenshot protection', error);
        }
      }
    }

    enableProtection();

    return () => {
      disableProtection();
    };
  }, []);
}
