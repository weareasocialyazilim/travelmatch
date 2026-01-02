/**
 * Input Component
 * A feature-rich text input with label, error handling,
 * icons, password visibility toggle, and validation states.
 *
 * UX Best Practices Implemented:
 * 1. USE CLEAR ERROR STATES - Specific, actionable error messages
 * 2. APPROPRIATE INPUT TYPES - Configurable keyboard types
 * 3. REAL-TIME VALIDATION - Success states when valid
 * 4. ADD CLEAR OPTION - Quick delete to spare manual removal
 */

import React, { useState, memo, useCallback, useMemo } from 'react';
import type {
  ViewStyle,
  TextInputProps,
  NativeSyntheticEvent,
  TextInputFocusEventData,
  TargetedEvent,
} from 'react-native';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSequence,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
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
  /** Show clear button when there's text (UX best practice: quick delete option) */
  showClearButton?: boolean;
  /** Callback when clear button is pressed */
  onClear?: () => void;
}

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
    showClearButton,
    onClear,
    value,
    onFocus: onFocusProp,
    onBlur: onBlurProp,
    ...rest
  }) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Shake animation for error state
    const shakeValue = useSharedValue(0);

    const isPassword = secureTextEntry !== undefined;
    const hasValue = value && value.length > 0;

    // Trigger shake animation when error appears
    React.useEffect(() => {
      if (error) {
        shakeValue.value = withSequence(
          withTiming(-8, { duration: 50 }),
          withTiming(8, { duration: 50 }),
          withTiming(-6, { duration: 50 }),
          withTiming(6, { duration: 50 }),
          withTiming(0, { duration: 50 }),
        );
      }
    }, [error, shakeValue]);

    const shakeAnimatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: shakeValue.value }],
    }));

    // Memoize border color calculation
    const borderColor = useMemo((): string => {
      if (error) return COLORS.feedback.error;
      if (showSuccess) return COLORS.feedback.success;
      if (isFocused) return COLORS.brand.primary;
      return primitives.stone[200];
    }, [error, showSuccess, isFocused]);

    // Memoize callbacks - use TargetedEvent for React Native's new TextInput types
    const handleFocus = useCallback(
      (e: NativeSyntheticEvent<TargetedEvent>) => {
        setIsFocused(true);
        onFocusProp?.(e as NativeSyntheticEvent<TextInputFocusEventData>);
      },
      [onFocusProp],
    );
    const handleBlur = useCallback(
      (e: NativeSyntheticEvent<TargetedEvent>) => {
        setIsFocused(false);
        onBlurProp?.(e as NativeSyntheticEvent<TextInputFocusEventData>);
      },
      [onBlurProp],
    );
    const togglePassword = useCallback(
      () => setShowPassword((prev) => !prev),
      [],
    );

    // Handle clear button press
    const handleClear = useCallback(() => {
      onClear?.();
    }, [onClear]);

    return (
      <Animated.View
        style={[styles.container, containerStyle, shakeAnimatedStyle]}
      >
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
            value={value}
            style={[
              styles.input,
              leftIcon && styles.inputWithLeftIcon,
              (rightIcon || isPassword || (showClearButton && hasValue)) &&
                styles.inputWithRightIcon,
            ]}
            placeholderTextColor={primitives.stone[400]}
            onFocus={handleFocus}
            onBlur={handleBlur}
            secureTextEntry={isPassword && !showPassword}
            accessibilityLabel={label}
            accessibilityHint={hint}
            accessibilityRole="none"
          />

          {/* Clear button - UX best practice: quick delete option */}
          {showClearButton &&
            hasValue &&
            !isPassword &&
            !showSuccess &&
            !rightIcon && (
              <TouchableOpacity
                onPress={handleClear}
                style={styles.clearButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityLabel="Clear input"
                accessibilityRole="button"
              >
                <View style={styles.clearButtonInner}>
                  <MaterialCommunityIcons
                    name="close"
                    size={14}
                    color={primitives.stone[0]}
                  />
                </View>
              </TouchableOpacity>
            )}

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
      </Animated.View>
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
    backgroundColor: `${COLORS.feedback.error}08`,
  },
  inputSuccess: {
    borderColor: COLORS.feedback.success,
    backgroundColor: `${COLORS.feedback.success}05`,
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
  // Clear button - UX best practice for quick data removal
  clearButton: {
    marginLeft: 8,
    padding: 2,
  },
  clearButtonInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: primitives.stone[400],
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: {
    fontSize: 12,
    color: COLORS.feedback.error,
    marginTop: 6,
    marginLeft: 4,
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
