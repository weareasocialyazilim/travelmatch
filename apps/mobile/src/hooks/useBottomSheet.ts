/**
 * useBottomSheet Hook
 * Provides easy-to-use bottom sheet state management
 */

import { useState, useCallback, useRef } from 'react';
import type { BottomSheetRef } from '../components/ui/GenericBottomSheet';

export interface UseBottomSheetOptions {
  /** Initial visibility state */
  initialVisible?: boolean;
  /** Callback when sheet opens */
  onOpen?: () => void;
  /** Callback when sheet closes */
  onClose?: () => void;
}

export interface UseBottomSheetReturn {
  /** Whether the bottom sheet is visible */
  visible: boolean;
  /** Open the bottom sheet */
  open: () => void;
  /** Close the bottom sheet */
  close: () => void;
  /** Toggle the bottom sheet */
  toggle: () => void;
  /** Ref to attach to the bottom sheet component */
  ref: React.RefObject<BottomSheetRef | null>;
  /** Props to spread on the bottom sheet component */
  sheetProps: {
    visible: boolean;
    onClose: () => void;
  };
}

/**
 * Hook for managing bottom sheet state
 *
 * @example
 * ```tsx
 * const { sheetProps, open } = useBottomSheet();
 *
 * return (
 *   <>
 *     <Button onPress={open} title="Open Sheet" />
 *     <GenericBottomSheet {...sheetProps} title="My Sheet">
 *       <Content />
 *     </GenericBottomSheet>
 *   </>
 * );
 * ```
 */
export const useBottomSheet = (
  options: UseBottomSheetOptions = {},
): UseBottomSheetReturn => {
  const { initialVisible = false, onOpen, onClose } = options;
  const [visible, setVisible] = useState(initialVisible);
  const ref = useRef<BottomSheetRef | null>(null);

  const open = useCallback(() => {
    setVisible(true);
    ref.current?.open();
    onOpen?.();
  }, [onOpen]);

  const close = useCallback(() => {
    setVisible(false);
    ref.current?.close();
    onClose?.();
  }, [onClose]);

  const toggle = useCallback(() => {
    if (visible) {
      close();
    } else {
      open();
    }
  }, [visible, open, close]);

  const sheetProps = {
    visible,
    onClose: close,
  };

  return {
    visible,
    open,
    close,
    toggle,
    ref,
    sheetProps,
  };
};

/**
 * Hook for managing multiple bottom sheets
 *
 * @example
 * ```tsx
 * const sheets = useMultipleBottomSheets(['filter', 'sort', 'confirm']);
 *
 * return (
 *   <>
 *     <Button onPress={() => sheets.open('filter')} title="Filter" />
 *     <GenericBottomSheet {...sheets.getProps('filter')} title="Filter">
 *       ...
 *     </GenericBottomSheet>
 *   </>
 * );
 * ```
 */
export const useMultipleBottomSheets = <T extends string>(_sheetNames: T[]) => {
  const [activeSheet, setActiveSheet] = useState<T | null>(null);

  const open = useCallback((name: T) => {
    setActiveSheet(name);
  }, []);

  const close = useCallback(() => {
    setActiveSheet(null);
  }, []);

  const isOpen = useCallback((name: T) => activeSheet === name, [activeSheet]);

  const getProps = useCallback(
    (name: T) => ({
      visible: activeSheet === name,
      onClose: close,
    }),
    [activeSheet, close],
  );

  return {
    activeSheet,
    open,
    close,
    isOpen,
    getProps,
  };
};

/**
 * Hook for confirmation dialogs
 *
 * @example
 * ```tsx
 * const confirmation = useConfirmation();
 *
 * const handleDelete = async () => {
 *   const confirmed = await confirmation.confirm({
 *     title: 'Delete Item',
 *     message: 'Are you sure?',
 *   });
 *
 *   if (confirmed) {
 *     // Delete item
 *   }
 * };
 * ```
 */
export interface ConfirmationOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}

export const useConfirmation = () => {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<ConfirmationOptions | null>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmationOptions): Promise<boolean> => {
    setOptions(opts);
    setVisible(true);

    return new Promise((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const handleConfirm = useCallback(() => {
    setVisible(false);
    resolveRef.current?.(true);
    resolveRef.current = null;
  }, []);

  const handleCancel = useCallback(() => {
    setVisible(false);
    resolveRef.current?.(false);
    resolveRef.current = null;
  }, []);

  return {
    visible,
    options,
    confirm,
    handleConfirm,
    handleCancel,
    sheetProps: {
      visible,
      onClose: handleCancel,
      onConfirm: handleConfirm,
      title: options?.title || '',
      message: options?.message || '',
      confirmText: options?.confirmText,
      cancelText: options?.cancelText,
      confirmDestructive: options?.destructive,
    },
  };
};

export default useBottomSheet;
