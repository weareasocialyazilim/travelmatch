/**
 * ModalProvider - Centralized Modal Rendering
 *
 * Master UX Pattern: Single render point for all application modals.
 * Prevents z-index conflicts and "Ghost Overlay" bugs.
 *
 * Usage:
 * ```tsx
 * // In App.tsx
 * <ModalProvider>
 *   <Navigation />
 * </ModalProvider>
 * ```
 */

import React, { useEffect } from 'react';
import { BackHandler, Platform, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {
  useModalStore,
  useActiveModal,
  useModalProps,
  type ConfirmationModalProps,
  type LoginModalProps,
  type ErrorModalProps,
  type SuccessModalProps,
  type InfoModalProps,
  type SelectionModalProps,
} from '@/stores/modalStore';
import { LoginPromptModal } from '@/components/LoginPromptModal';
import { GlassModal } from '@/components/ui/GlassModal';
import { SelectionBottomSheet } from '@/components/ui/GenericBottomSheet';
import { navigate } from '@/services/navigationService';

// ============================================================================
// MODAL COMPONENTS
// ============================================================================

/**
 * Confirmation Modal - Uses GlassModal API
 */
const ConfirmationModal: React.FC = () => {
  const props = useModalProps<ConfirmationModalProps>();
  const closeModal = useModalStore((state) => state.closeModal);

  if (!props) return null;

  const handleConfirm = async () => {
    await props.onConfirm();
    closeModal();
  };

  const handleCancel = () => {
    props.onCancel?.();
    closeModal();
  };

  return (
    <GlassModal
      visible
      title={props.title}
      message={props.message || ''}
      type={props.destructive ? 'danger' : 'info'}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      confirmText={props.confirmText || 'Confirm'}
      cancelText={props.cancelText || 'Cancel'}
    />
  );
};

/**
 * Login Prompt Modal
 */
const LoginModal: React.FC = () => {
  const props = useModalProps<LoginModalProps>();
  const closeModal = useModalStore((state) => state.closeModal);

  if (!props) return null;

  const handleClose = () => {
    closeModal();
  };

  const handleLogin = () => {
    navigate('UnifiedAuth', { initialMode: 'login' });
    closeModal();
  };

  const handleRegister = () => {
    navigate('UnifiedAuth', { initialMode: 'register' });
    closeModal();
  };

  return (
    <LoginPromptModal
      visible
      onClose={handleClose}
      onLogin={handleLogin}
      onRegister={handleRegister}
      action={props.action}
    />
  );
};

/**
 * Error Modal - Uses GlassModal with danger type
 */
const ErrorModal: React.FC = () => {
  const props = useModalProps<ErrorModalProps>();
  const closeModal = useModalStore((state) => state.closeModal);

  if (!props) return null;

  const handleDismiss = () => {
    props.onDismiss?.();
    closeModal();
  };

  const handleRetry = () => {
    if (props.onRetry) {
      props.onRetry();
    }
    closeModal();
  };

  const message = props.code
    ? `${props.message}\n\nCode: ${props.code}`
    : props.message;

  return (
    <GlassModal
      visible
      title={props.title || 'Error'}
      message={message}
      type="danger"
      onConfirm={props.retryable ? handleRetry : handleDismiss}
      onCancel={handleDismiss}
      confirmText={props.retryable ? 'Retry' : 'OK'}
      cancelText="Dismiss"
    />
  );
};

/**
 * Success Modal - Uses GlassModal with success type
 */
const SuccessModal: React.FC = () => {
  const props = useModalProps<SuccessModalProps>();
  const closeModal = useModalStore((state) => state.closeModal);

  if (!props) return null;

  const handleDismiss = () => {
    props.onDismiss?.();
    closeModal();
  };

  const message = props.icon
    ? `${props.icon}\n\n${props.message}`
    : props.message;

  return (
    <GlassModal
      visible
      title={props.title || 'Success'}
      message={message}
      type="success"
      onConfirm={handleDismiss}
      onCancel={handleDismiss}
      confirmText={props.buttonText || 'OK'}
      cancelText="Close"
    />
  );
};

/**
 * Info Modal - Uses GlassModal with info type
 */
const InfoModal: React.FC = () => {
  const props = useModalProps<InfoModalProps>();
  const closeModal = useModalStore((state) => state.closeModal);

  if (!props) return null;

  const handleDismiss = () => {
    props.onDismiss?.();
    closeModal();
  };

  const message = props.icon
    ? `${props.icon}\n\n${props.message}`
    : props.message;

  return (
    <GlassModal
      visible
      title={props.title}
      message={message}
      type="info"
      onConfirm={handleDismiss}
      onCancel={handleDismiss}
      confirmText={props.buttonText || 'Got it'}
      cancelText="Close"
    />
  );
};

/**
 * Selection Modal - For Alert.alert with multiple buttons
 */
const SelectionModal: React.FC = () => {
  const props = useModalProps<SelectionModalProps>();
  const closeModal = useModalStore((state) => state.closeModal);

  if (!props) return null;

  const handleSelect = (value: string) => {
    props.onSelect(value);
    closeModal();
  };

  const handleClose = () => {
    closeModal();
  };

  return (
    <SelectionBottomSheet
      visible
      title={props.title}
      options={props.options.map((opt) => ({
        value: opt.id,
        label: opt.label,
        icon: opt.icon,
        description: opt.description,
      }))}
      selectedValue={props.selectedId}
      onSelect={handleSelect}
      onClose={handleClose}
    />
  );
};

// ============================================================================
// MODAL PROVIDER
// ============================================================================

interface ModalProviderProps {
  children: React.ReactNode;
}

export const ModalProvider: React.FC<ModalProviderProps> = ({ children }) => {
  const activeModal = useActiveModal();
  const isVisible = useModalStore((state) => state.isVisible);
  const closeModal = useModalStore((state) => state.closeModal);

  // Backdrop animation
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    backdropOpacity.value = withTiming(isVisible ? 1 : 0, {
      duration: 200,
      easing: Easing.ease,
    });
  }, [isVisible, backdropOpacity]);

  // Handle Android back button
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (activeModal !== 'none') {
          closeModal();
          return true;
        }
        return false;
      },
    );

    return () => backHandler.remove();
  }, [activeModal, closeModal]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
    pointerEvents: backdropOpacity.value > 0 ? 'auto' : 'none',
  }));

  const renderModal = () => {
    switch (activeModal) {
      case 'confirmation':
        return <ConfirmationModal />;
      case 'login':
        return <LoginModal />;
      case 'error':
        return <ErrorModal />;
      case 'success':
        return <SuccessModal />;
      case 'info':
        return <InfoModal />;
      case 'selection':
        return <SelectionModal />;
      case 'gift':
        // Gift modal is handled by the GiftFlow screens, not inline
        return null;
      case 'filter':
        // Filter modal is handled by individual screens
        return null;
      case 'custom':
        // Custom modals render their own component
        return null;
      case 'none':
      default:
        return null;
    }
  };

  return (
    <>
      {children}

      {/* Modal Overlay */}
      {activeModal !== 'none' && (
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          {renderModal()}
        </Animated.View>
      )}
    </>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
});

export default ModalProvider;
