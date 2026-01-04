/**
 * useGuestAction Hook
 *
 * Guest kullanıcıların eylemlerini kesip LoginPromptModal'ı tetikleyen hook.
 * Kullanıcı giriş yapmamışsa modal gösterir, yapmışsa action'ı çalıştırır.
 *
 * @module hooks/useGuestAction
 *
 * @example
 * ```tsx
 * const { requireAuth, LoginModal } = useGuestAction();
 *
 * const handleGift = () => {
 *   requireAuth('gift', () => {
 *     // Hediye gönderme işlemi
 *     navigation.navigate('Checkout', { momentId });
 *   });
 * };
 *
 * return (
 *   <>
 *     <Button onPress={handleGift}>Gift This</Button>
 *     <LoginModal />
 *   </>
 * );
 * ```
 */

import React, { useState, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from './useAuth';
import { LoginPromptModal } from '@/components/LoginPromptModal';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/routeParams';

type ActionType = 'gift' | 'chat' | 'save' | 'default';

interface UseGuestActionReturn {
  /** Check if user is authenticated and show modal if not */
  requireAuth: (action: ActionType, callback: () => void) => void;
  /** Is the login prompt modal visible */
  isModalVisible: boolean;
  /** Hide the modal manually */
  hideModal: () => void;
  /** The LoginPromptModal component to render */
  LoginModal: React.FC;
  /** Check if user is a guest (not authenticated) */
  isGuest: boolean;
}

export const useGuestAction = (): UseGuestActionReturn => {
  const { user, isAuthenticated } = useAuth();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentAction, setCurrentAction] = useState<ActionType>('default');
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(
    null,
  );

  const isGuest = !isAuthenticated || !user;

  const requireAuth = useCallback(
    (action: ActionType, callback: () => void) => {
      if (isGuest) {
        setCurrentAction(action);
        setPendingCallback(() => callback);
        setIsModalVisible(true);
      } else {
        callback();
      }
    },
    [isGuest],
  );

  const hideModal = useCallback(() => {
    setIsModalVisible(false);
    setPendingCallback(null);
  }, []);

  const handleLogin = useCallback(() => {
    setIsModalVisible(false);
    navigation.navigate('UnifiedAuth', { initialMode: 'login' });
  }, [navigation]);

  const handleRegister = useCallback(() => {
    setIsModalVisible(false);
    navigation.navigate('UnifiedAuth', { initialMode: 'register' });
  }, [navigation]);

  const LoginModal: React.FC = useCallback(
    () => (
      <LoginPromptModal
        visible={isModalVisible}
        onClose={hideModal}
        onLogin={handleLogin}
        onRegister={handleRegister}
        action={currentAction}
      />
    ),
    [isModalVisible, hideModal, handleLogin, handleRegister, currentAction],
  );

  return {
    requireAuth,
    isModalVisible,
    hideModal,
    LoginModal,
    isGuest,
  };
};

export default useGuestAction;
