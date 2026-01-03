/**
 * Input Component - Backward Compatibility Layer
 *
 * This component now wraps LiquidInput (the Master Design component).
 * All new code should use LiquidInput directly.
 *
 * @deprecated Import LiquidInput directly for new code
 * @deprecationDate 2026-01-10 (Remove after this date)
 *
 * Migration:
 * - OLD: import { Input } from '@/components/ui/Input';
 * - NEW: import { LiquidInput } from '@/components/ui/LiquidInput';
 */

import React, { memo, useEffect, useRef } from 'react';
import type { ViewStyle, TextInputProps } from 'react-native';
import { LiquidInput } from './LiquidInput';
import type { Ionicons } from '@expo/vector-icons';

// Map MaterialCommunityIcons names to Ionicons names for common icons
const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  'email': 'mail-outline',
  'email-outline': 'mail-outline',
  'lock': 'lock-closed-outline',
  'lock-outline': 'lock-closed-outline',
  'eye': 'eye-outline',
  'eye-off': 'eye-off-outline',
  'account': 'person-outline',
  'account-outline': 'person-outline',
  'phone': 'call-outline',
  'phone-outline': 'call-outline',
  'magnify': 'search-outline',
  'search': 'search-outline',
  'calendar': 'calendar-outline',
  'calendar-outline': 'calendar-outline',
  'map-marker': 'location-outline',
  'map-marker-outline': 'location-outline',
  'credit-card': 'card-outline',
  'credit-card-outline': 'card-outline',
};

interface InputProps extends TextInputProps {
  /** Input label text */
  label?: string;
  /** Error message - shows in red below input */
  error?: string;
  /** Helper text hint (not used in LiquidInput, kept for API compat) */
  hint?: string;
  /** Left icon name from MaterialCommunityIcons (mapped to Ionicons) */
  leftIcon?: string;
  /** Right icon name (not used in LiquidInput) */
  rightIcon?: string;
  /** Handler for right icon press (not used) */
  onRightIconPress?: () => void;
  /** Container wrapper styles */
  containerStyle?: ViewStyle;
  /** Show required asterisk on label (not used) */
  required?: boolean;
  /** Show success checkmark (not used in LiquidInput) */
  showSuccess?: boolean;
  /** Show clear button (not used in LiquidInput) */
  showClearButton?: boolean;
  /** Callback when clear button is pressed (not used) */
  onClear?: () => void;
}

/**
 * @deprecated Use LiquidInput directly
 */
export const Input: React.FC<InputProps> = memo(
  ({
    label,
    error,
    hint,
    leftIcon,
    rightIcon,
    onRightIconPress,
    containerStyle,
    required,
    showSuccess,
    showClearButton,
    onClear,
    ...rest
  }) => {
    // Deprecation warning - shows once per component mount in dev mode
    const hasWarned = useRef(false);
    useEffect(() => {
      if (!hasWarned.current && __DEV__) {
        console.warn(
          '[DEPRECATION] Input will be removed on 2026-01-10.\n' +
            'Please migrate to: import { LiquidInput } from "@/components/ui/LiquidInput"',
        );
        hasWarned.current = true;
      }
    }, []);

    // Map MaterialCommunityIcons to Ionicons
    const mappedIcon = leftIcon
      ? (iconMap[leftIcon] || 'ellipse-outline')
      : undefined;

    return (
      <LiquidInput
        label={label}
        error={error}
        icon={mappedIcon as keyof typeof Ionicons.glyphMap}
        containerStyle={containerStyle}
        {...rest}
      />
    );
  },
);

Input.displayName = 'Input';

// Re-export LiquidInput as the primary component
export { LiquidInput } from './LiquidInput';

export default Input;
