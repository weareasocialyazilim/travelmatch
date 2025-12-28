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
import { COLORS, primitives } from '../../constants/colors';

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
    showSuccess,
    onFocus: onFocusProp,
    onBlur: onBlurProp,
    ...rest
  }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const isPassword = secureTextEntry !== undefined;

    // Memoize border color calculation
    const borderColor = useMemo((): string => {
      if (error) return COLORS.feedback.error;
      if (showSuccess) return COLORS.feedback.success;
      if (isFocused) return COLORS.brand.primary;
      return primitives.stone[200];
    }, [error, showSuccess, isFocused]);

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
        {label && (
          <Text style={styles.label}>
            {label}
            {rest.required && <Text style={styles.required}> *</Text>}
          </Text>
        )}

        <View
          style={[
            styles.inputContainer,
            { borderColor },
            isFocused && styles.inputFocused,
            error && styles.inputError,
            showSuccess && !error && styles.inputSuccess,
          ]}
        >
          {leftIcon && (
            <MaterialCommunityIcons
              name={leftIcon}
              size={20}
              color={isFocused ? COLORS.brand.primary : primitives.stone[400]}
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
            placeholderTextColor={primitives.stone[400]}
            onFocus={handleFocus}
            onBlur={handleBlur}
            secureTextEntry={isPassword && !showPassword}
            accessibilityLabel={label}
            accessibilityHint={hint}
            accessibilityRole="none"
          />

          {isPassword && (
            <TouchableOpacity
              onPress={togglePassword}
              style={styles.rightIconContainer}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              accessibilityLabel={
                showPassword ? 'Hide password' : 'Show password'
              }
            >
              <MaterialCommunityIcons
                name={showPassword ? 'eye-off' : 'eye'}
                size={20}
                color={primitives.stone[400]}
              />
            </TouchableOpacity>
          )}

          {rightIcon && !isPassword && !showSuccess && (
            <TouchableOpacity
              onPress={onRightIconPress}
              style={styles.rightIconContainer}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              disabled={!onRightIconPress}
              testID={rest.testID ? `${rest.testID}-toggle` : undefined}
            >
              <MaterialCommunityIcons
                name={rightIcon}
                size={20}
                color={primitives.stone[400]}
              />
            </TouchableOpacity>
          )}

          {showSuccess && !error && !isPassword && (
            <View style={styles.successIconContainer}>
              <MaterialCommunityIcons
                name="check-circle"
                size={20}
                color={COLORS.feedback.success}
              />
            </View>
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
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: COLORS.surface.baseLight,
    paddingHorizontal: 16,
    height: 52,
  },
  inputFocused: {
    borderWidth: 2,
  },
  inputError: {
    borderColor: COLORS.feedback.error,
  },
  inputSuccess: {
    borderColor: COLORS.feedback.success,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text.primary,
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
  successIconContainer: {
    marginLeft: 12,
    padding: 4,
  },
  error: {
    fontSize: 12,
    color: COLORS.feedback.error,
    marginTop: 4,
  },
  hint: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 4,
  },
  required: {
    color: COLORS.feedback.error,
    fontWeight: '600',
  },
});

export default Input;
