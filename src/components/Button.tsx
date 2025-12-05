import React, { memo } from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated from 'react-native-reanimated';
import { COLORS } from '../constants/colors';
import { radii } from '../constants/radii';
import { spacing } from '../constants/spacing';
import { hapticPatterns } from '../utils/haptics';
import { usePressScale } from '../utils/animations';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  style?: object;
  enableHaptic?: boolean;
}

const Button: React.FC<ButtonProps> = memo(
  ({
    title,
    onPress,
    variant = 'primary',
    disabled = false,
    style,
    enableHaptic = true,
  }) => {
    const { animatedStyle, onPressIn, onPressOut } = usePressScale();

    const handlePress = () => {
      if (enableHaptic && !disabled) {
        if (variant === 'primary') {
          hapticPatterns.primaryAction();
        } else {
          hapticPatterns.buttonPress();
        }
      }
      onPress();
    };

    return (
      <TouchableOpacity
        style={[
          styles.button,
          variant === 'secondary' && styles.secondaryButton,
          variant === 'outline' && styles.outlineButton,
          disabled && styles.disabledButton,
          style,
        ]}
        onPress={handlePress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled}
        activeOpacity={1}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ disabled }}
        accessibilityHint={disabled ? 'Button is disabled' : undefined}
      >
        <Animated.View style={animatedStyle}>
          <Text
            style={[
              styles.buttonText,
              variant === 'secondary' && styles.secondaryButtonText,
              variant === 'outline' && styles.outlineButtonText,
              disabled && styles.disabledButtonText,
            ]}
          >
            {title}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    );
  },
);

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: COLORS.buttonPrimary,
    borderRadius: radii.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: COLORS.transparent,
    borderColor: COLORS.buttonPrimary,
    borderWidth: 1,
  },
  secondaryButtonText: {
    color: COLORS.buttonPrimary,
  },
  outlineButton: {
    backgroundColor: COLORS.transparent,
    borderColor: COLORS.border,
    borderWidth: 1,
  },
  outlineButtonText: {
    color: COLORS.text,
  },
  // eslint-disable-next-line react-native/sort-styles
  disabledButton: {
    backgroundColor: COLORS.disabled,
    borderColor: COLORS.disabled,
  },
  disabledButtonText: {
    color: COLORS.white,
  },
});

Button.displayName = 'Button';

export default Button;
