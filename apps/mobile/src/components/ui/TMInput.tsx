/**
 * TMInput - Backward Compatibility Layer
 *
 * This component now wraps LiquidInput (the Master Design component).
 * All new code should use LiquidInput directly.
 *
 * @deprecated Import LiquidInput directly for new code
 * @deprecationDate 2026-01-10 (Remove after this date)
 *
 * Migration:
 * - OLD: import { TMInput } from '@/components/ui/TMInput';
 * - NEW: import { LiquidInput } from '@/components/ui/LiquidInput';
 */

import React, { memo, useEffect, useRef } from 'react';
import type { ViewStyle, TextInputProps } from 'react-native';
import { LiquidInput } from './LiquidInput';
import type { Ionicons } from '@expo/vector-icons';

// Map MaterialCommunityIcons names to Ionicons names
const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  email: 'mail-outline',
  'email-outline': 'mail-outline',
  lock: 'lock-closed-outline',
  'lock-outline': 'lock-closed-outline',
  eye: 'eye-outline',
  'eye-off': 'eye-off-outline',
  account: 'person-outline',
  'account-outline': 'person-outline',
  phone: 'call-outline',
  'phone-outline': 'call-outline',
  magnify: 'search-outline',
  search: 'search-outline',
  calendar: 'calendar-outline',
  'calendar-outline': 'calendar-outline',
  'map-marker': 'location-outline',
  'map-marker-outline': 'location-outline',
  'credit-card': 'card-outline',
  'credit-card-outline': 'card-outline',
  close: 'close-outline',
  'check-circle': 'checkmark-circle-outline',
};

export interface TMInputProps extends Omit<TextInputProps, 'style'> {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  success?: boolean;
  hint?: string;
  disabled?: boolean;
  leftIcon?: string;
  rightIcon?: string;
  onRightIconPress?: () => void;
  showClear?: boolean;
  maxLength?: number;
  multiline?: boolean;
  numberOfLines?: number;
  containerStyle?: ViewStyle;
  required?: boolean;
  testID?: string;
}

/**
 * @deprecated Use LiquidInput directly
 */
export const TMInput: React.FC<TMInputProps> = memo(
  ({
    value,
    onChangeText,
    placeholder,
    label,
    error,
    success,
    hint,
    disabled,
    leftIcon,
    rightIcon,
    onRightIconPress,
    showClear,
    maxLength,
    multiline,
    numberOfLines,
    containerStyle,
    required,
    testID,
    secureTextEntry,
    ...rest
  }) => {
    // Deprecation warning - shows once per component mount in dev mode
    const hasWarned = useRef(false);
    useEffect(() => {
      if (!hasWarned.current && __DEV__) {
        console.warn(
          '[DEPRECATION] TMInput will be removed on 2026-01-10.\n' +
            'Please migrate to: import { LiquidInput } from "@/components/ui/LiquidInput"',
        );
        hasWarned.current = true;
      }
    }, []);

    // Map MaterialCommunityIcons to Ionicons
    const mappedIcon = leftIcon
      ? iconMap[leftIcon] || 'ellipse-outline'
      : undefined;

    return (
      <LiquidInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        label={label}
        error={error}
        icon={mappedIcon as keyof typeof Ionicons.glyphMap}
        containerStyle={containerStyle}
        editable={!disabled}
        maxLength={maxLength}
        multiline={multiline}
        numberOfLines={numberOfLines}
        secureTextEntry={secureTextEntry}
        testID={testID}
        {...rest}
      />
    );
  },
);

TMInput.displayName = 'TMInput';

// Re-export LiquidInput as the primary component
export { LiquidInput } from './LiquidInput';

export default TMInput;
