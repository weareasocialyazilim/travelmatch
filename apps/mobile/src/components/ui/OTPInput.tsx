/**
 * OTPInput Component
 *
 * Smart OTP input with auto-advance behavior
 * Following UX best practice: "Smart Keyboard Behavior"
 *
 * Features:
 * - Auto-advance to next field when digit entered
 * - Auto-submit when all digits filled
 * - Backspace moves to previous field
 * - Visual feedback for filled/focused states
 * - SMS autofill support via textContentType
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Keyboard,
  Pressable,
  Text,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { COLORS, primitives } from '../../constants/colors';

export interface OTPInputProps {
  /** Number of OTP digits */
  length?: number;
  /** Current value */
  value: string;
  /** Callback when value changes */
  onChange: (value: string) => void;
  /** Callback when all digits are entered */
  onComplete?: (code: string) => void;
  /** Error state */
  error?: boolean;
  /** Error message to display */
  errorMessage?: string;
  /** Auto focus first input on mount */
  autoFocus?: boolean;
  /** Disable all inputs */
  disabled?: boolean;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export const OTPInput: React.FC<OTPInputProps> = ({
  length = 6,
  value,
  onChange,
  onComplete,
  error = false,
  errorMessage,
  autoFocus = true,
  disabled = false,
}) => {
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  // Convert value string to array
  const digits = value.split('').slice(0, length);
  while (digits.length < length) {
    digits.push('');
  }

  // Auto focus first input on mount
  useEffect(() => {
    if (autoFocus && !disabled) {
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [autoFocus, disabled]);

  // Handle digit input
  const handleChangeText = useCallback(
    (text: string, index: number) => {
      // Only allow digits
      const digit = text.replace(/[^0-9]/g, '').slice(-1);

      // Update value
      const newDigits = [...digits];
      newDigits[index] = digit;
      const newValue = newDigits.join('');
      onChange(newValue);

      // Auto-advance to next field
      if (digit && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }

      // Auto-submit when complete
      if (digit && index === length - 1 && newValue.length === length) {
        Keyboard.dismiss();
        onComplete?.(newValue);
      }
    },
    [digits, length, onChange, onComplete]
  );

  // Handle backspace
  const handleKeyPress = useCallback(
    (e: { nativeEvent: { key: string } }, index: number) => {
      if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        // Clear previous digit
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        onChange(newDigits.join(''));
      }
    },
    [digits, onChange]
  );

  // Handle focus
  const handleFocus = useCallback((index: number) => {
    setFocusedIndex(index);
  }, []);

  // Handle blur
  const handleBlur = useCallback(() => {
    setFocusedIndex(null);
  }, []);

  // Handle tap on container to focus appropriate input
  const handleContainerPress = useCallback(() => {
    // Find first empty field or last field
    const emptyIndex = digits.findIndex((d) => !d);
    const targetIndex = emptyIndex !== -1 ? emptyIndex : length - 1;
    inputRefs.current[targetIndex]?.focus();
  }, [digits, length]);

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.inputsContainer}
        onPress={handleContainerPress}
        accessibilityRole="none"
      >
        {digits.map((digit, index) => (
          <OTPDigitInput
            key={index}
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            value={digit}
            index={index}
            isFocused={focusedIndex === index}
            isFilled={!!digit}
            isError={error}
            disabled={disabled}
            onChangeText={(text) => handleChangeText(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            onFocus={() => handleFocus(index)}
            onBlur={handleBlur}
          />
        ))}
      </Pressable>

      {errorMessage && (
        <Text style={styles.errorText}>{errorMessage}</Text>
      )}
    </View>
  );
};

interface OTPDigitInputProps {
  value: string;
  index: number;
  isFocused: boolean;
  isFilled: boolean;
  isError: boolean;
  disabled: boolean;
  onChangeText: (text: string) => void;
  onKeyPress: (e: { nativeEvent: { key: string } }) => void;
  onFocus: () => void;
  onBlur: () => void;
}

const OTPDigitInput = React.forwardRef<TextInput, OTPDigitInputProps>(
  (
    {
      value,
      index,
      isFocused,
      isFilled,
      isError,
      disabled,
      onChangeText,
      onKeyPress,
      onFocus,
      onBlur,
    },
    ref
  ) => {
    const scale = useSharedValue(1);
    const borderWidth = useSharedValue(1.5);

    // Animate on focus
    useEffect(() => {
      if (isFocused) {
        scale.value = withSequence(
          withSpring(1.05, { damping: 15, stiffness: 300 }),
          withSpring(1, { damping: 15, stiffness: 300 })
        );
        borderWidth.value = withTiming(2, { duration: 150 });
      } else {
        borderWidth.value = withTiming(1.5, { duration: 150 });
      }
    }, [isFocused, scale, borderWidth]);

    // Animate on fill
    useEffect(() => {
      if (isFilled) {
        scale.value = withSequence(
          withSpring(1.1, { damping: 15, stiffness: 400 }),
          withSpring(1, { damping: 15, stiffness: 300 })
        );
      }
    }, [isFilled, scale]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
      borderWidth: borderWidth.value,
    }));

    const getBorderColor = () => {
      if (isError) return COLORS.feedback.error;
      if (isFocused) return COLORS.primary;
      if (isFilled) return COLORS.feedback.success;
      return COLORS.border.default;
    };

    const getBackgroundColor = () => {
      if (isError) return `${COLORS.feedback.error}08`;
      if (isFilled) return `${COLORS.feedback.success}08`;
      if (isFocused) return `${COLORS.primary}05`;
      return COLORS.white;
    };

    return (
      <AnimatedView
        style={[
          styles.digitContainer,
          animatedStyle,
          {
            borderColor: getBorderColor(),
            backgroundColor: getBackgroundColor(),
          },
        ]}
      >
        <TextInput
          ref={ref}
          style={[
            styles.digitInput,
            isFilled && styles.digitInputFilled,
            isError && styles.digitInputError,
          ]}
          value={value}
          onChangeText={onChangeText}
          onKeyPress={onKeyPress}
          onFocus={onFocus}
          onBlur={onBlur}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          maxLength={1}
          selectTextOnFocus
          editable={!disabled}
          caretHidden
          accessibilityLabel={`Digit ${index + 1}`}
          accessibilityHint={`Enter digit ${index + 1} of verification code`}
        />

        {/* Cursor indicator when focused and empty */}
        {isFocused && !value && (
          <View style={styles.cursor} />
        )}
      </AnimatedView>
    );
  }
);

OTPDigitInput.displayName = 'OTPDigitInput';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  inputsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  digitContainer: {
    width: 52,
    height: 60,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  digitInput: {
    width: '100%',
    height: '100%',
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
    padding: 0,
  },
  digitInputFilled: {
    color: COLORS.feedback.success,
  },
  digitInputError: {
    color: COLORS.feedback.error,
  },
  cursor: {
    position: 'absolute',
    width: 2,
    height: 28,
    backgroundColor: COLORS.primary,
    borderRadius: 1,
  },
  errorText: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.feedback.error,
    textAlign: 'center',
  },
});

export default OTPInput;
