/**
 * useRequireEmailVerification Hook
 *
 * A hook that wraps actions and requires email verification before execution.
 * Shows EmailVerificationModal if email is not verified.
 */

import { useState, useCallback } from 'react';
import { useEmailVerification } from './useEmailVerification';

interface UseRequireEmailVerificationResult {
  /** Whether the email verification modal should be shown */
  showVerificationModal: boolean;
  /** Close the verification modal */
  closeVerificationModal: () => void;
  /** Wrap an action to require email verification */
  requireVerification: <T>(action: () => Promise<T> | T) => Promise<T | null>;
  /** Check if email is verified (for conditional UI) */
  isEmailVerified: boolean;
  /** Whether verification status is loading */
  isLoading: boolean;
}

export const useRequireEmailVerification =
  (): UseRequireEmailVerificationResult => {
    const { isEmailVerified, isLoading, checkVerification } =
      useEmailVerification();
    const [showVerificationModal, setShowVerificationModal] = useState(false);
    const [_pendingAction, setPendingAction] = useState<(() => unknown) | null>(
      null,
    );

    const closeVerificationModal = useCallback(() => {
      setShowVerificationModal(false);
      setPendingAction(null);
    }, []);

    /**
     * Wraps an action to require email verification before execution.
     * If email is not verified, shows modal and waits for verification.
     * Returns null if verification is cancelled.
     */
    const requireVerification = useCallback(
      async <T>(action: () => Promise<T> | T): Promise<T | null> => {
        // First, re-check verification status
        const verified = await checkVerification();

        if (verified) {
          // Email is verified, execute action immediately
          return action();
        }

        // Email not verified, show modal and wait
        return new Promise<T | null>((resolve) => {
          setPendingAction(() => async () => {
            try {
              const result = await action();
              resolve(result);
            } catch (error) {
              resolve(null);
              throw error;
            }
          });
          setShowVerificationModal(true);
        });
      },
      [checkVerification, closeVerificationModal],
    );

    return {
      showVerificationModal,
      closeVerificationModal,
      requireVerification,
      isEmailVerified,
      isLoading,
    };
  };

export default useRequireEmailVerification;
