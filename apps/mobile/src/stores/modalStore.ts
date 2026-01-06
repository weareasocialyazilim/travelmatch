/**
 * Modal Store - Centralized Modal Management
 *
 * Master Pattern: Single source of truth for all modals/bottom sheets.
 * Prevents "Ghost Overlay" bugs and z-index conflicts.
 *
 * Usage:
 * ```tsx
 * // Open a modal
 * useModalStore.getState().openModal('confirmation', {
 *   title: 'Are you sure?',
 *   onConfirm: () => handleConfirm(),
 * });
 *
 * // Close the current modal
 * useModalStore.getState().closeModal();
 * ```
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { logger } from '@/utils/logger';

// ============================================================================
// MODAL TYPES
// ============================================================================

export type ModalType =
  | 'none'
  | 'confirmation'
  | 'login'
  | 'filter'
  | 'gift'
  | 'selection'
  | 'info'
  | 'error'
  | 'success'
  | 'custom';

export interface ConfirmationModalProps {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

export interface LoginModalProps {
  action: 'gift' | 'chat' | 'save' | 'default';
  onSuccess?: () => void;
}

export interface FilterModalProps {
  initialFilters?: Record<string, unknown>;
  onApply: (filters: Record<string, unknown>) => void;
}

export interface GiftModalProps {
  momentId: string;
  recipientId: string;
  recipientName: string;
  requestedAmount?: number;
  currency?: string;
}

export interface SelectionModalProps {
  title: string;
  options: Array<{
    id: string;
    label: string;
    icon?: string;
    description?: string;
  }>;
  selectedId?: string;
  onSelect: (id: string) => void;
}

export interface InfoModalProps {
  title: string;
  message: string;
  icon?: string;
  buttonText?: string;
  onDismiss?: () => void;
}

export interface ErrorModalProps {
  title?: string;
  message: string;
  code?: string;
  retryable?: boolean;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export interface SuccessModalProps {
  title?: string;
  message: string;
  icon?: string;
  buttonText?: string;
  onDismiss?: () => void;
}

export interface CustomModalProps {
  component: React.ComponentType<{ onClose: () => void }>;
  props?: Record<string, unknown>;
}

export type ModalProps =
  | ConfirmationModalProps
  | LoginModalProps
  | FilterModalProps
  | GiftModalProps
  | SelectionModalProps
  | InfoModalProps
  | ErrorModalProps
  | SuccessModalProps
  | CustomModalProps;

// ============================================================================
// MODAL STATE
// ============================================================================

interface ModalState {
  // Current modal
  activeModal: ModalType;
  modalProps: ModalProps | null;

  // Modal queue for sequential modals
  modalQueue: Array<{ type: ModalType; props: ModalProps }>;

  // Modal visibility animation state
  isVisible: boolean;
  isAnimating: boolean;

  // Actions
  openModal: <T extends ModalProps>(type: ModalType, props: T) => void;
  closeModal: () => void;
  closeAllModals: () => void;

  // Queue management
  queueModal: <T extends ModalProps>(type: ModalType, props: T) => void;
  processQueue: () => void;

  // Animation helpers
  setIsAnimating: (animating: boolean) => void;
}

// ============================================================================
// MODAL STORE
// ============================================================================

export const useModalStore = create<ModalState>()(
  devtools(
    (set, get) => ({
      // Initial state
      activeModal: 'none',
      modalProps: null,
      modalQueue: [],
      isVisible: false,
      isAnimating: false,

      // Open a modal
      openModal: (type, props) => {
        const { activeModal, isAnimating, queueModal } = get();

        // If another modal is active or animating, queue this one
        if (activeModal !== 'none' || isAnimating) {
          logger.debug('[ModalStore] Queueing modal', { type });
          queueModal(type, props);
          return;
        }

        logger.debug('[ModalStore] Opening modal', { type });
        set({
          activeModal: type,
          modalProps: props,
          isVisible: true,
          isAnimating: true,
        });
      },

      // Close the current modal
      closeModal: () => {
        const { activeModal, processQueue } = get();

        if (activeModal === 'none') {
          return;
        }

        logger.debug('[ModalStore] Closing modal', { type: activeModal });
        set({
          isVisible: false,
          isAnimating: true,
        });

        // After animation, clear state and process queue
        setTimeout(() => {
          set({
            activeModal: 'none',
            modalProps: null,
            isAnimating: false,
          });
          processQueue();
        }, 300); // Match animation duration
      },

      // Close all modals and clear queue
      closeAllModals: () => {
        logger.debug('[ModalStore] Closing all modals');
        set({
          activeModal: 'none',
          modalProps: null,
          modalQueue: [],
          isVisible: false,
          isAnimating: false,
        });
      },

      // Queue a modal for later
      queueModal: (type, props) => {
        set((state) => ({
          modalQueue: [...state.modalQueue, { type, props }],
        }));
      },

      // Process the next modal in queue
      processQueue: () => {
        const { modalQueue, openModal } = get();

        if (modalQueue.length === 0) {
          return;
        }

        const [next, ...rest] = modalQueue;
        set({ modalQueue: rest });

        if (next) {
          // Small delay before opening next modal
          setTimeout(() => {
            openModal(next.type, next.props);
          }, 100);
        }
      },

      // Set animation state
      setIsAnimating: (animating) => {
        set({ isAnimating: animating });
      },
    }),
    {
      name: 'modal-store',
      enabled: typeof __DEV__ !== 'undefined' ? __DEV__ : false,
    },
  ),
);

// ============================================================================
// CONVENIENCE HOOKS
// ============================================================================

/**
 * Hook to check if any modal is open
 */
export const useIsModalOpen = () =>
  useModalStore((state) => state.activeModal !== 'none');

/**
 * Hook to get the current modal type
 */
export const useActiveModal = () => useModalStore((state) => state.activeModal);

/**
 * Hook to get modal props with type safety
 */
export function useModalProps<T extends ModalProps>(): T | null {
  return useModalStore((state) => state.modalProps as T | null);
}

// ============================================================================
// HELPER FUNCTIONS (for non-React contexts)
// ============================================================================

/**
 * Show a confirmation dialog
 */
export const showConfirmation = (props: ConfirmationModalProps) => {
  useModalStore.getState().openModal('confirmation', props);
};

/**
 * Show an error modal
 */
export const showError = (props: ErrorModalProps) => {
  useModalStore.getState().openModal('error', props);
};

/**
 * Show a success modal
 */
export const showSuccess = (props: SuccessModalProps) => {
  useModalStore.getState().openModal('success', props);
};

/**
 * Show an info modal
 */
export const showInfo = (props: InfoModalProps) => {
  useModalStore.getState().openModal('info', props);
};

/**
 * Show login prompt modal
 */
export const showLoginPrompt = (props: LoginModalProps) => {
  useModalStore.getState().openModal('login', props);
};

// ============================================================================
// ALERT.ALERT REPLACEMENT
// ============================================================================

/**
 * Alert button definition (matches React Native Alert.alert API)
 */
export interface AlertButton {
  text?: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

/**
 * Show an alert - Direct replacement for Alert.alert
 *
 * This provides a Liquid Design styled alert instead of native system alerts.
 *
 * @example
 * // Simple alert
 * showAlert('Title', 'Message');
 *
 * // With buttons (like Alert.alert)
 * showAlert('Confirm', 'Are you sure?', [
 *   { text: 'Cancel', style: 'cancel' },
 *   { text: 'Delete', style: 'destructive', onPress: () => handleDelete() }
 * ]);
 *
 * // Object syntax (alternative)
 * showAlert({ title: 'Title', message: 'Message', buttons: [...] });
 */

interface AlertOptions {
  title: string;
  message?: string;
  buttons?: AlertButton[];
}

export function showAlert(options: AlertOptions): void;
export function showAlert(
  title: string,
  message?: string,
  buttons?: AlertButton[],
): void;
export function showAlert(
  titleOrOptions: string | AlertOptions,
  message?: string,
  buttons?: AlertButton[],
): void {
  // Handle object syntax
  let title: string;
  let msg: string | undefined;
  let btns: AlertButton[] | undefined;

  if (typeof titleOrOptions === 'object') {
    title = titleOrOptions.title;
    msg = titleOrOptions.message;
    btns = titleOrOptions.buttons;
  } else {
    title = titleOrOptions;
    msg = message;
    btns = buttons;
  }

  const store = useModalStore.getState();

  // No buttons or single OK button → Info modal
  if (!btns || btns.length === 0) {
    store.openModal('info', {
      title,
      message: msg || '',
      buttonText: 'OK',
    });
    return;
  }

  // Single button → Info modal with custom button text
  if (btns.length === 1) {
    const btn = btns[0];
    store.openModal('info', {
      title,
      message: msg || '',
      buttonText: btn?.text || 'OK',
      onDismiss: btn?.onPress,
    });
    return;
  }

  // Two buttons → Confirmation modal
  if (btns.length === 2) {
    const cancelBtn = btns.find((b) => b.style === 'cancel') || btns[0];
    const confirmBtn = btns.find((b) => b.style !== 'cancel') || btns[1];

    store.openModal('confirmation', {
      title,
      message: msg || '',
      confirmText: confirmBtn?.text || 'OK',
      cancelText: cancelBtn?.text || 'Cancel',
      destructive: confirmBtn?.style === 'destructive',
      onConfirm: async () => {
        confirmBtn?.onPress?.();
      },
      onCancel: () => {
        cancelBtn?.onPress?.();
      },
    });
    return;
  }

  // More than 2 buttons → Selection modal
  store.openModal('selection', {
    title,
    options: btns.map((btn, index) => ({
      id: `btn-${index}`,
      label: btn.text || 'Option',
      description: index === 0 && msg ? msg : undefined,
    })),
    onSelect: (id) => {
      const index = parseInt(id.replace('btn-', ''), 10);
      btns[index]?.onPress?.();
    },
  });
}

/**
 * Quick error alert (convenience wrapper)
 */
export const alertError = (title: string, message: string) => {
  showError({ title, message });
};

/**
 * Quick success alert (convenience wrapper)
 */
export const alertSuccess = (title: string, message: string) => {
  showSuccess({ title, message });
};

export default useModalStore;
