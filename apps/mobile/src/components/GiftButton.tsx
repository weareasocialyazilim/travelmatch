/**
 * GiftButton Component
 *
 * Primary call-to-action button for gifting moments.
 * Features gradient background, gift icon, press animation, and haptic feedback.
 * Part of iOS 26.3 design system for TravelMatch.
 */
import React, { useCallback } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { COLORS, GRADIENTS } from '../constants/colors';

interface GiftButtonProps {
  /** Callback when button is pressed */
  onPress: () => void;
  /** Optional price to display */
  price?: number;
  /** Currency symbol */
  currency?: string;
  /** Whether button is disabled */
  disabled?: boolean;
  /** Button label (default: "Hediye Et") */
  label?: string;
  /** Button size variant */
  size?: 'small' | 'medium' | 'large';
  /** Whether to show the gift icon */
  showIcon?: boolean;
  /** Custom style */
  style?: ViewStyle;
  /** Full width mode */
  fullWidth?: boolean;
}

const SIZE_CONFIG = {
  small: {
    height: 44,
    paddingHorizontal: 16,
    fontSize: 14,
    iconSize: 18,
    borderRadius: 22,
  },
  medium: {
    height: 52,
    paddingHorizontal: 20,
    fontSize: 16,
    iconSize: 22,
    borderRadius: 26,
  },
  large: {
    height: 56,
    paddingHorizontal: 24,
    fontSize: 18,
    iconSize: 24,
    borderRadius: 28,
  },
};

export const GiftButton: React.FC<GiftButtonProps> = ({
  onPress,
  price,
  currency = '₺',
  disabled = false,
  label = 'Hediye Et',
  size = 'large',
  showIcon = true,
  style,
  fullWidth = false,
}) => {
  const scale = useSharedValue(1);
  const config = SIZE_CONFIG[size];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, {
      damping: 15,
      stiffness: 300,
    });
  }, [scale]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 300,
    });
  }, [scale]);

  const handlePress = useCallback(() => {
    // Heavy haptic feedback for important action
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    onPress();
  }, [onPress]);

  return (
    <Animated.View style={[animatedStyle, fullWidth && styles.fullWidth, style]}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={1}
        accessibilityRole="button"
        accessibilityLabel={price ? `${label} ${currency}${price}` : label}
        accessibilityState={{ disabled }}
      >
        <LinearGradient
          colors={disabled ? [COLORS.disabled, COLORS.disabled] : GRADIENTS.giftButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.button,
            {
              height: config.height,
              paddingHorizontal: config.paddingHorizontal,
              borderRadius: config.borderRadius,
            },
            disabled && styles.disabled,
          ]}
        >
          {/* Gift Icon */}
          {showIcon && (
            <MaterialCommunityIcons
              name="gift"
              size={config.iconSize}
              color={COLORS.white}
              style={styles.icon}
            />
          )}

          {/* Text Container */}
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.mainText,
                { fontSize: config.fontSize },
              ]}
            >
              {label}
            </Text>
            {price !== undefined && (
              <Text
                style={[
                  styles.priceText,
                  { fontSize: config.fontSize - 4 },
                ]}
              >
                {currency}{price}
              </Text>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabled: {
    opacity: 0.5,
    shadowOpacity: 0,
  },
  icon: {
    marginRight: 8,
  },
  textContainer: {
    alignItems: 'center',
  },
  mainText: {
    color: COLORS.white,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  priceText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    marginTop: 2,
  },
});

export default GiftButton;
