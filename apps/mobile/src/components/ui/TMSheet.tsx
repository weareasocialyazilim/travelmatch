/**
 * TMSheet - TravelMatch Ultimate Design System 2026
 * Bottom sheet component with "Soft Glass" aesthetic
 *
 * Features:
 * - Handle indicator
 * - Swipe to dismiss (velocity-based)
 * - Backdrop blur
 * - Keyboard avoiding
 * - Safe area aware
 * - Multiple size presets (content, half, full, dynamic)
 */

import React, { forwardRef } from 'react';
import {
  GenericBottomSheet,
  GenericBottomSheetProps,
  BottomSheetRef,
  BottomSheetHeight,
} from './GenericBottomSheet';

export type TMSheetSize = 'content' | 'half' | 'full' | 'dynamic';

export interface TMSheetProps extends Omit<GenericBottomSheetProps, 'height'> {
  /** Sheet size preset */
  size?: TMSheetSize;
  /** Custom height (overrides size) */
  height?: BottomSheetHeight;
}

// Map TMSheet sizes to GenericBottomSheet heights
const SIZE_TO_HEIGHT: Record<TMSheetSize, BottomSheetHeight> = {
  content: 'auto',
  half: 'medium',
  full: 'full',
  dynamic: 'auto',
};

/**
 * TMSheet - Premium bottom sheet component
 *
 * @example
 * ```tsx
 * <TMSheet
 *   visible={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Select Option"
 *   size="half"
 * >
 *   <YourContent />
 * </TMSheet>
 * ```
 */
export const TMSheet = forwardRef<BottomSheetRef, TMSheetProps>(
  ({ size = 'half', height, ...props }, ref) => {
    // Use custom height if provided, otherwise map size to height
    const resolvedHeight = height ?? SIZE_TO_HEIGHT[size];

    return (
      <GenericBottomSheet
        ref={ref}
        height={resolvedHeight}
        showHandle={true}
        swipeToDismiss={true}
        dismissible={true}
        keyboardAware={true}
        scrollable={true}
        {...props}
      />
    );
  },
);

TMSheet.displayName = 'TMSheet';

// Re-export types and variants for convenience
export type { BottomSheetRef, BottomSheetHeight };
export {
  ConfirmationBottomSheet,
  SelectionBottomSheet,
  type ConfirmationBottomSheetProps,
  type SelectionBottomSheetProps,
  type SelectionOption,
} from './GenericBottomSheet';

export default TMSheet;
