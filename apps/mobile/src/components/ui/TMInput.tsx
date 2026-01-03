/**
 * TMInput - TravelMatch Ultimate Design System 2026
 * Enhanced input component with floating label, validation states, and animations
 *
 * @deprecated Use LiquidInput for new implementations.
 * LiquidInput provides Awwwards-quality glass morphism aesthetics with neon glow.
 * For React Hook Form integration, use ControlledLiquidInput.
 *
 * This component is maintained for backward compatibility only.
 *
 * Features:
 * - Animated floating label
 * - Clear button
 * - Character counter
 * - Error/success states with border color change
 * - Shake animation for errors
 * - Accessibility compliant
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  Pressable,
  TextInputProps,
  ViewStyle,
  Platform,
  UIManager,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, primitives } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import { RADIUS, SPACING, SIZES } from '@/constants/spacing';
import { SPRING, HAPTIC } from '@/utils/motion';

// Enable LayoutAnimation on Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface TMInputProps extends Omit<TextInputProps, 'style'> {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  success?: boolean;
  hint?: string;
  disabled?: boolean;
  leftIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  rightIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  onRightIconPress?: () => void;
  showClear?: boolean;
  maxLength?: number;
  multiline?: boolean;
  numberOfLines?: number;
  containerStyle?: ViewStyle;
  required?: boolean;
  testID?: string;
}

export const TMInput: React.FC<TMInputProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  success,
  hint,
  disabled = false,
  leftIcon,
  rightIcon,
  onRightIconPress,
  showClear = false,
  maxLength,
  multiline = false,
  numberOfLines = 1,
  containerStyle,
  required = false,
  secureTextEntry,
  testID,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Animated values
  const labelPosition = useSharedValue(value ? 1 : 0);
  const shakeX = useSharedValue(0);
  const borderScale = useSharedValue(1);

  const isPassword = secureTextEntry !== undefined;
  const hasValue = value && value.length > 0;
  const showFloatingLabel = label && (isFocused || hasValue);

  // Shake animation when error changes
  useEffect(() => {
    if (error) {
      shakeX.value = withSequence(
        withTiming(-8, { duration: 50 }),
        withTiming(8, { duration: 50 }),
        withTiming(-6, { duration: 50 }),
        withTiming(6, { duration: 50 }),
        withTiming(0, { duration: 50 }),
      );
      HAPTIC.error();
    }
  }, [error]);

  // Label animation
  useEffect(() => {
    labelPosition.value = withSpring(
      isFocused || hasValue ? 1 : 0,
      SPRING.default,
    );
  }, [isFocused, hasValue]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    borderScale.value = withSpring(1.02, SPRING.snappy);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    borderScale.value = withSpring(1, SPRING.default);
  }, []);

  const handleClear = useCallback(() => {
    onChangeText('');
    inputRef.current?.focus();
    HAPTIC.light();
  }, [onChangeText]);

  const togglePassword = useCallback(() => {
    setShowPassword((prev) => !prev);
    HAPTIC.selection();
  }, []);

  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  const labelAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(labelPosition.value, [0, 1], [0, -24]),
      },
      {
        scale: interpolate(labelPosition.value, [0, 1], [1, 0.85]),
      },
    ],
    opacity: interpolate(labelPosition.value, [0, 1], [0.6, 1]),
  }));

  // Border color based on state
  const getBorderColor = () => {
    if (error) return COLORS.error;
    if (success) return COLORS.success;
    if (isFocused) return COLORS.primary;
    return primitives.stone[200];
  };

  // Icon color based on focus
  const getIconColor = () => {
    if (disabled) return primitives.stone[300];
    if (error) return COLORS.error;
    if (isFocused) return COLORS.primary;
    return primitives.stone[400];
  };

  return (
    <Animated.View
      style={[styles.container, containerStyle, containerAnimatedStyle]}
      testID={testID}
    >
      {/* Floating Label */}
      {label && (
        <Animated.View style={[styles.labelContainer, labelAnimatedStyle]}>
          <Text
            style={[
              styles.label,
              isFocused && styles.labelFocused,
              error && styles.labelError,
              success && styles.labelSuccess,
            ]}
          >
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        </Animated.View>
      )}

      {/* Input Container */}
      <View
        style={[
          styles.inputContainer,
          { borderColor: getBorderColor() },
          isFocused && styles.inputFocused,
          error && styles.inputError,
          success && styles.inputSuccess,
          disabled && styles.inputDisabled,
          multiline && styles.inputMultiline,
          multiline && { minHeight: numberOfLines * 24 + 24 },
        ]}
      >
        {/* Left Icon */}
        {leftIcon && (
          <MaterialCommunityIcons
            name={leftIcon}
            size={20}
            color={getIconColor()}
            style={styles.leftIcon}
          />
        )}

        {/* Text Input */}
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={showFloatingLabel ? undefined : placeholder || label}
          placeholderTextColor={primitives.stone[400]}
          editable={!disabled}
          secureTextEntry={isPassword && !showPassword}
          maxLength={maxLength}
          multiline={multiline}
          numberOfLines={numberOfLines}
          style={[
            styles.input,
            leftIcon && styles.inputWithLeftIcon,
            (rightIcon || isPassword || (showClear && hasValue)) &&
              styles.inputWithRightIcon,
            multiline && styles.inputTextMultiline,
          ]}
          accessibilityLabel={label}
          accessibilityHint={hint}
          {...rest}
        />

        {/* Clear Button */}
        {showClear && hasValue && !isPassword && !disabled && (
          <Pressable
            onPress={handleClear}
            style={styles.clearButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            accessibilityLabel="Clear input"
          >
            <View style={styles.clearButtonInner}>
              <MaterialCommunityIcons
                name="close"
                size={14}
                color={primitives.white}
              />
            </View>
          </Pressable>
        )}

        {/* Password Toggle */}
        {isPassword && (
          <Pressable
            onPress={togglePassword}
            style={styles.rightIconButton}
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
          </Pressable>
        )}

        {/* Right Icon */}
        {rightIcon && !isPassword && (
          <Pressable
            onPress={onRightIconPress}
            style={styles.rightIconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            disabled={!onRightIconPress}
          >
            <MaterialCommunityIcons
              name={rightIcon}
              size={20}
              color={getIconColor()}
            />
          </Pressable>
        )}

        {/* Success Icon */}
        {success && !error && !isPassword && !rightIcon && (
          <View style={styles.successIcon}>
            <MaterialCommunityIcons
              name="check-circle"
              size={20}
              color={COLORS.success}
            />
          </View>
        )}
      </View>

      {/* Bottom Row: Error/Hint + Character Counter */}
      <View style={styles.bottomRow}>
        {/* Error or Hint */}
        <View style={styles.messageContainer}>
          {error && <Text style={styles.errorText}>{error}</Text>}
          {hint && !error && <Text style={styles.hintText}>{hint}</Text>}
        </View>

        {/* Character Counter */}
        {maxLength && (
          <Text
            style={[
              styles.counter,
              value.length >= maxLength && styles.counterLimit,
            ]}
          >
            {value.length}/{maxLength}
          </Text>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.base,
  },
  labelContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 1,
    backgroundColor: COLORS.surface.base,
    paddingHorizontal: 4,
  },
  label: {
    ...TYPOGRAPHY.caption,
    color: primitives.stone[500],
  },
  labelFocused: {
    color: COLORS.primary,
  },
  labelError: {
    color: COLORS.error,
  },
  labelSuccess: {
    color: COLORS.success,
  },
  required: {
    color: COLORS.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: RADIUS.input,
    backgroundColor: COLORS.surface.base,
    paddingHorizontal: SPACING.base,
    minHeight: SIZES.input,
  },
  inputFocused: {
    borderWidth: 2,
  },
  inputError: {
    borderColor: COLORS.error,
    backgroundColor: `${COLORS.error}08`,
  },
  inputSuccess: {
    borderColor: COLORS.success,
    backgroundColor: `${COLORS.success}05`,
  },
  inputDisabled: {
    backgroundColor: primitives.stone[100],
    opacity: 0.6,
  },
  inputMultiline: {
    alignItems: 'flex-start',
    paddingVertical: SPACING.md,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text.primary,
    paddingVertical: 0,
  },
  inputWithLeftIcon: {
    marginLeft: SPACING.sm,
  },
  inputWithRightIcon: {
    marginRight: SPACING.sm,
  },
  inputTextMultiline: {
    textAlignVertical: 'top',
  },
  leftIcon: {
    marginRight: SPACING.sm,
  },
  rightIconButton: {
    padding: 4,
    marginLeft: SPACING.sm,
  },
  clearButton: {
    marginLeft: SPACING.sm,
  },
  clearButtonInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: primitives.stone[400],
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIcon: {
    marginLeft: SPACING.sm,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xs,
    paddingHorizontal: 4,
  },
  messageContainer: {
    flex: 1,
  },
  errorText: {
    ...TYPOGRAPHY.captionSmall,
    color: COLORS.error,
  },
  hintText: {
    ...TYPOGRAPHY.captionSmall,
    color: COLORS.text.secondary,
  },
  counter: {
    ...TYPOGRAPHY.captionSmall,
    color: primitives.stone[400],
    marginLeft: SPACING.sm,
  },
  counterLimit: {
    color: COLORS.error,
  },
});

export default TMInput;
