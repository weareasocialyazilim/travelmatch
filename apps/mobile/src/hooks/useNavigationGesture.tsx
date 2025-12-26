/**
 * Navigation Gesture Hook
 * Controls swipe-to-go-back behavior for specific screens
 *
 * DEFCON 3.4 FIX: Provides gesture control for screens that need
 * to disable swipe (payment flows, forms, modals)
 */

import { useEffect, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RootStackParamList } from '../navigation/routeParams';

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface UseNavigationGestureOptions {
  /** Disable swipe-to-go-back (for payment flows, forms) */
  disabled?: boolean;
  /** Callback before navigation back - return false to prevent */
  onBeforeGoBack?: () => boolean | Promise<boolean>;
}

/**
 * Hook to control navigation gestures on a per-screen basis
 *
 * @example
 * ```tsx
 * // Disable swipe during payment
 * function PaymentScreen() {
 *   const [isProcessing, setIsProcessing] = useState(false);
 *
 *   useNavigationGesture({
 *     disabled: isProcessing,
 *   });
 *
 *   return <PaymentForm />;
 * }
 *
 * // Confirm before leaving form with unsaved changes
 * function EditProfileScreen() {
 *   const [hasChanges, setHasChanges] = useState(false);
 *
 *   useNavigationGesture({
 *     onBeforeGoBack: async () => {
 *       if (hasChanges) {
 *         return await confirmDiscard();
 *       }
 *       return true;
 *     },
 *   });
 *
 *   return <ProfileForm />;
 * }
 * ```
 */
export const useNavigationGesture = (options: UseNavigationGestureOptions = {}) => {
  const { disabled = false, onBeforeGoBack } = options;
  const navigation = useNavigation<NavigationProp>();

  // Update gesture enabled state
  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: !disabled,
    });
  }, [navigation, disabled]);

  // Handle beforeRemove event for confirmation
  useEffect(() => {
    if (!onBeforeGoBack) return;

    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // Prevent default behavior
      e.preventDefault();

      // Check if we should allow navigation
      const handleBeforeGoBack = async () => {
        const shouldAllow = await onBeforeGoBack();
        if (shouldAllow) {
          // Allow the navigation
          navigation.dispatch(e.data.action);
        }
      };

      void handleBeforeGoBack();
    });

    return unsubscribe;
  }, [navigation, onBeforeGoBack]);

  // Utility to manually enable/disable gesture
  const setGestureEnabled = useCallback(
    (enabled: boolean) => {
      navigation.setOptions({
        gestureEnabled: enabled,
      });
    },
    [navigation]
  );

  return {
    setGestureEnabled,
    navigation,
  };
};

/**
 * Screens that should have gesture disabled by default
 * (can still be enabled with useNavigationGesture)
 */
export const GESTURE_DISABLED_SCREENS: Array<keyof RootStackParamList> = [
  // Payment/Critical Flows - prevent accidental exit
  'UnifiedGiftFlow',
  'RefundRequest',
  'Withdraw',

  // KYC Flow - prevent losing progress
  'KYCDocumentCapture',
  'KYCSelfie',
  'KYCReview',

  // Auth flows - prevent confusion
  'VerifyCode',
  'TwoFactorSetup',
  'SetPassword',
];

/**
 * HOC to disable navigation gestures for critical screens
 */
export const withDisabledGesture = <P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P> => {
  const WithDisabledGesture: React.FC<P> = (props) => {
    useNavigationGesture({ disabled: true });
    return <WrappedComponent {...props} />;
  };

  WithDisabledGesture.displayName = `WithDisabledGesture(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`;

  return WithDisabledGesture;
};

export default useNavigationGesture;
