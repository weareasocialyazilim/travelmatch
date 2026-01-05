/**
 * useGuestAction Hook
 *
 * Guest kullanıcıların eylemlerini kesip login modal'ı tetikleyen hook.
 * Kullanıcı giriş yapmamışsa modal gösterir, yapmışsa action'ı çalıştırır.
 *
 * NOW USES: Centralized modalStore for modal management.
 *
 * @module hooks/useGuestAction
 *
 * @example
 * ```tsx
 * const { requireAuth, isGuest } = useGuestAction();
 *
 * const handleGift = () => {
 *   requireAuth('gift', () => {
 *     // Hediye gönderme işlemi
 *     navigation.navigate('Checkout', { momentId });
 *   });
 * };
 *
 * return (
 *   <Button onPress={handleGift}>Gift This</Button>
 *   // LoginModal is now rendered by ModalProvider in App.tsx
 * );
 * ```
 */

import { useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { showLoginPrompt, useModalStore } from '@/stores/modalStore';

type ActionType = 'gift' | 'chat' | 'save' | 'default';

interface UseGuestActionReturn {
  /** Check if user is authenticated and show modal if not */
  requireAuth: (action: ActionType, callback: () => void) => void;
  /** Check if user is a guest (not authenticated) */
  isGuest: boolean;
  /** @deprecated Use ModalProvider in App.tsx instead - LoginModal is no longer needed */
  LoginModal: React.FC;
  /** @deprecated Modal visibility is now managed by modalStore */
  isModalVisible: boolean;
  /** @deprecated Use modalStore.closeModal() instead */
  hideModal: () => void;
}

export const useGuestAction = (): UseGuestActionReturn => {
  const { user, isAuthenticated } = useAuth();
  const closeModal = useModalStore((state) => state.closeModal);
  const activeModal = useModalStore((state) => state.activeModal);

  // Store pending callback for post-login execution
  const pendingCallbackRef = useRef<(() => void) | null>(null);

  const isGuest = !isAuthenticated || !user;

  const requireAuth = useCallback(
    (action: ActionType, callback: () => void) => {
      if (isGuest) {
        pendingCallbackRef.current = callback;
        showLoginPrompt({ action });
      } else {
        callback();
      }
    },
    [isGuest],
  );

  const hideModal = useCallback(() => {
    closeModal();
    pendingCallbackRef.current = null;
  }, [closeModal]);

  // Deprecated - LoginModal is now rendered by ModalProvider
  const LoginModal: React.FC = () => null;

  return {
    requireAuth,
    isModalVisible: activeModal === 'login',
    hideModal,
    LoginModal,
    isGuest,
  };
};

export default useGuestAction;
