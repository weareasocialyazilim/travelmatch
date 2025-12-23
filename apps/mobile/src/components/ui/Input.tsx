/**
 * Input Component
 * A feature-rich text input with label, error handling,
 * icons, password visibility toggle, and validation states.
 */

import React, { useState, memo, useCallback, useMemo } from 'react';
import type { ViewStyle, TextInputProps } from 'react-native';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

interface InputProps extends TextInputProps {
  /** Input label text */
  label?: string;
  /** Error message - shows in red below input */
  error?: string;
  /** Helper text hint */
  hint?: string;
  /** Left icon name from MaterialCommunityIcons */
  leftIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  /** Right icon name from MaterialCommunityIcons */
  rightIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  /** Handler for right icon press */
  onRightIconPress?: () => void;
  /** Container wrapper styles */
  containerStyle?: ViewStyle;
  /** Show required asterisk on label */
  required?: boolean;
  /** Show success checkmark (for validation) */
  showSuccess?: boolean;
}

/**
 * Input - Text input with full feature set
 *
 * Features:
 * - Floating label
 * - Error/hint messages
 * - Left/right icons
 * - Password visibility toggle
 * - Focus state styling
 *
 * @example
 * ```tsx
 * // Basic input
 * <Input label="Email" placeholder="Enter email" />
 *
 * // With validation error
 * <Input
 *   label="Password"
 *   secureTextEntry
 *   error="Password too weak"
 * />
 *
 * // With icons
 * <Input
 *   label="Search"
 *   leftIcon="magnify"
 *   rightIcon="close"
 *   onRightIconPress={handleClear}
 * />
 * ```
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
    secureTextEntry,
    onFocus: onFocusProp,
    onBlur: onBlurProp,
    ...rest
  }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = secureTextEntry !== undefined;

    // Memoize border color calculation
    const borderColor = useMemo((): string => {
      if (error) return COLORS.error;
      if (isFocused) return COLORS.primary;
      return COLORS.gray[200];
    }, [error, isFocused]);

    // Memoize callbacks
    const handleFocus = useCallback(
      (e?: unknown) => {
        setIsFocused(true);
        onFocusProp?.(e as never);
      },
      [onFocusProp],
    );
    const handleBlur = useCallback(
      (e?: unknown) => {
        setIsFocused(false);
        onBlurProp?.(e as never);
      },
      [onBlurProp],
    );
    const togglePassword = useCallback(
      () => setShowPassword((prev) => !prev),
      [],
    );

    return (
      <View style={[styles.container, containerStyle]}>
        {label && <Text style={styles.label}>{label}</Text>}

        <View
          style={[
            styles.inputContainer,
            { borderColor },
            isFocused && styles.inputFocused,
            error && styles.inputError,
          ]}
        >
          {leftIcon && (
            <MaterialCommunityIcons
              name={leftIcon}
              size={20}
              color={isFocused ? COLORS.primary : COLORS.gray[400]}
              style={styles.leftIcon}
            />
          )}

          <TextInput
            {...rest}
            style={[
              styles.input,
              leftIcon && styles.inputWithLeftIcon,
              (rightIcon || isPassword) && styles.inputWithRightIcon,
            ]}
            placeholderTextColor={COLORS.gray[400]}
            onFocus={handleFocus}
            onBlur={handleBlur}
            secureTextEntry={isPassword && !showPassword}
            accessibilityLabel={label}
            accessibilityHint={hint}
          />

          {isPassword && (
            <TouchableOpacity
              onPress={togglePassword}
              style={styles.rightIconContainer}
              accessibilityLabel={
                showPassword ? 'Hide password' : 'Show password'
              }
            >
              <MaterialCommunityIcons
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color={COLORS.gray[400]}
              />
            </TouchableOpacity>
          )}

          {rightIcon && !isPassword && (
            <TouchableOpacity
              onPress={onRightIconPress}
              style={styles.rightIconContainer}
              disabled={!onRightIconPress}
            >
              <MaterialCommunityIcons
                name={rightIcon}
                size={20}
                color={COLORS.gray[400]}
              />
            </TouchableOpacity>
          )}
        </View>

        {error && <Text style={styles.error}>{error}</Text>}
        {hint && !error && <Text style={styles.hint}>{hint}</Text>}
      </View>
    );
  },
);

Input.displayName = 'Input';

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceLight,
    paddingHorizontal: 16,
    height: 52,
  },
  inputFocused: {
    borderWidth: 2,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    paddingVertical: 0,
  },
  inputWithLeftIcon: {
    paddingLeft: 0,
  },
  inputWithRightIcon: {
    paddingRight: 0,
  },
  leftIcon: {
    marginRight: 12,
  },
  rightIconContainer: {
    marginLeft: 12,
    padding: 4,
  },
  error: {
    fontSize: 12,
    color: COLORS.error,
    marginTop: 4,
  },
  hint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});

export default Input;
