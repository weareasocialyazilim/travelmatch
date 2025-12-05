/**
 * Haptics Hook
 * Cross-platform haptic feedback for user interactions
 * @module hooks/useHaptics
 */

import * as Haptics from 'expo-haptics';
import { logger } from '../utils/logger';
import { Platform } from 'react-native';

/**
 * Available haptic feedback types
 * - light: Subtle tap feedback
 * - medium: Standard button press
 * - heavy: Significant impact
 * - success: Positive action completed
 * - warning: Action needs attention
 * - error: Action failed
 */
type HapticType =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'warning'
  | 'error';

/**
 * Hook for triggering haptic feedback
 *
 * Provides a simple, cross-platform API for haptic feedback.
 * Automatically handles unsupported platforms (web) gracefully.
 *
 * @returns Object with impact function
 *
 * @example
 * ```tsx
 * function Button({ onPress }: ButtonProps) {
 *   const { impact } = useHaptics();
 *
 *   const handlePress = () => {
 *     impact('medium');
 *     onPress();
 *   };
 *
 *   return <TouchableOpacity onPress={handlePress}>...</TouchableOpacity>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Different feedback types
 * impact('light');   // Subtle tap
 * impact('success'); // Task completed
 * impact('error');   // Something went wrong
 * ```
 */
export const useHaptics = () => {
  const impact = async (type: HapticType = 'light') => {
    if (Platform.OS === 'web') return;

    try {
      switch (type) {
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'success':
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
          );
          break;
        case 'warning':
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Warning,
          );
          break;
        case 'error':
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Error,
          );
          break;
        default:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      // Haptic feedback failed, but this shouldn't break the app
      logger.warn('Haptic feedback failed:', error);
    }
  };

  return { impact };
};
