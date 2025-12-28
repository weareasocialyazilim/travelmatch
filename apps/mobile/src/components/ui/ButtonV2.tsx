/**
 * TravelMatch Awwwards Design System 2026 - Button V2
 *
 * Premium button component with:
 * - Gradient filled variant (primary)
 * - Outlined variant (secondary)
 * - Text only variant (ghost)
 * - Destructive variant (danger)
 * - Glassmorphism variant (glass)
 *
 * Features:
 * - Animated press states
 * - Loading spinner
 * - Left/right icons
 * - Haptic feedback
 * - Accessibility support
 */

import React, { useCallback } from 'react';
import {
  Pressable,
  Text,
  View,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { COLORS_V2, GRADIENTS_V2, SHADOWS_V2, PALETTE } from '../../constants/colors-v2';
import { TYPE_SCALE } from '../../constants/typography-v2';
import { SPRINGS } from '../../hooks/useAnimationsV2';

// ============================================
// TYPES
// ============================================
export type ButtonVariant =
  | 'primary' // Gradient filled
  | 'secondary' // Outlined
  | 'ghost' // Text only
  | 'danger' // Destructive
  | 'glass' // Glassmorphism
  | 'dark'; // Dark solid

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonV2Props {
  /** Visual variant */
  variant?: ButtonVariant;
  /** Size preset */
  size?: ButtonSize;
  /** Icon name from MaterialCommunityIcons on the left */
  leftIcon?: string;
  /** Icon name from MaterialCommunityIcons on the right */
  rightIcon?: string;
  /** Show loading spinner */
  loading?: boolean;
  /** Disable button */
  disabled?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** Enable haptic feedback */
  haptic?: boolean;
  /** Press handler */
  onPress: () => void;
  /** Long press handler */
  onLongPress?: () => void;
  /** Button text content */
  children: React.ReactNode;
  /** Additional container style */
  style?: ViewStyle;
  /** Additional text style */
  textStyle?: TextStyle;
  /** Test ID for testing */
  testID?: string;
  /** Accessibility label */
  accessibilityLabel?: string;
}

// ============================================
// SIZE CONFIGURATIONS
// ============================================
const SIZE_STYLES = {
  sm: {
    height: 40,
    paddingHorizontal: 16,
    iconSize: 18,
    gap: 6,
  },
  md: {
    height: 52,
    paddingHorizontal: 24,
    iconSize: 20,
    gap: 8,
  },
  lg: {
    height: 60,
    paddingHorizontal: 32,
    iconSize: 22,
    gap: 10,
  },
} as const;

// ============================================
// ANIMATED PRESSABLE WRAPPER
// ============================================
const AnimatedPressable = Reanimated.createAnimatedComponent(Pressable);

// ============================================
// MAIN COMPONENT
// ============================================
export const ButtonV2: React.FC<ButtonV2Props> = ({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  loading = false,
  disabled = false,
  fullWidth = false,
  haptic = true,
  onPress,
  onLongPress,
  children,
  style,
  textStyle,
  testID,
  accessibilityLabel,
}) => {
  const scale = useSharedValue(1);
  const sizeConfig = SIZE_STYLES[size];
  const isDisabled = disabled || loading;

  // Animated style for press feedback
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Press handlers
  const handlePressIn = useCallback(() => {
    if (isDisabled) return;
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    scale.value = withSpring(0.97, SPRINGS.snappy);
  }, [isDisabled, haptic]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, SPRINGS.bouncy);
  }, []);

  const handlePress = useCallback(() => {
    if (isDisabled) return;
    onPress();
  }, [isDisabled, onPress]);

  const handleLongPress = useCallback(() => {
    if (isDisabled || !onLongPress) return;
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onLongPress();
  }, [isDisabled, onLongPress, haptic]);

  // Get colors based on variant
  const getTextColor = (): string => {
    if (isDisabled) return COLORS_V2.interactive.disabledText;
    switch (variant) {
      case 'secondary':
        return COLORS_V2.interactive.primary;
      case 'ghost':
        return COLORS_V2.interactive.primary;
      case 'danger':
        return PALETTE.white;
      case 'glass':
        return PALETTE.white;
      case 'dark':
        return PALETTE.white;
      default:
        return PALETTE.white;
    }
  };

  const getIconColor = (): string => {
    return getTextColor();
  };

  // Render button content
  const renderContent = () => (
    <View style={[styles.content, { gap: sizeConfig.gap }]}>
      {loading ? (
        <ActivityIndicator
          color={getTextColor()}
          size="small"
        />
      ) : (
        <>
          {leftIcon && (
            <MaterialCommunityIcons
              name={leftIcon as keyof typeof MaterialCommunityIcons.glyphMap}
              size={sizeConfig.iconSize}
              color={getIconColor()}
            />
          )}
          <Text
            style={[
              size === 'lg' ? TYPE_SCALE.button.large :
              size === 'sm' ? TYPE_SCALE.button.small :
              TYPE_SCALE.button.base,
              { color: getTextColor() },
              textStyle,
            ]}
          >
            {children}
          </Text>
          {rightIcon && (
            <MaterialCommunityIcons
              name={rightIcon as keyof typeof MaterialCommunityIcons.glyphMap}
              size={sizeConfig.iconSize}
              color={getIconColor()}
            />
          )}
        </>
      )}
    </View>
  );

  // Render based on variant
  const renderButton = () => {
    const baseButtonStyle: ViewStyle = {
      height: sizeConfig.height,
      paddingHorizontal: sizeConfig.paddingHorizontal,
      borderRadius: sizeConfig.height / 2,
      overflow: 'hidden',
      opacity: isDisabled ? 0.5 : 1,
    };

    switch (variant) {
      case 'primary':
        return (
          <View style={[baseButtonStyle, styles.primaryButton]}>
            <LinearGradient
              colors={isDisabled ? GRADIENTS_V2.disabled : GRADIENTS_V2.gift}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradient}
            >
              {renderContent()}
            </LinearGradient>
          </View>
        );

      case 'secondary':
        return (
          <View
            style={[
              baseButtonStyle,
              styles.secondaryButton,
              {
                borderColor: isDisabled
                  ? COLORS_V2.interactive.disabled
                  : COLORS_V2.interactive.primary,
              },
            ]}
          >
            {renderContent()}
          </View>
        );

      case 'ghost':
        return (
          <View style={[baseButtonStyle, styles.ghostButton]}>
            {renderContent()}
          </View>
        );

      case 'danger':
        return (
          <View style={[baseButtonStyle, styles.dangerButton]}>
            <LinearGradient
              colors={[PALETTE.red[500], PALETTE.red[600]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradient}
            >
              {renderContent()}
            </LinearGradient>
          </View>
        );

      case 'glass':
        return (
          <View style={[baseButtonStyle, styles.glassButton]}>
            <BlurView
              intensity={Platform.OS === 'ios' ? 20 : 100}
              tint="light"
              style={styles.blurView}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0.1)']}
                style={styles.gradient}
              >
                {renderContent()}
              </LinearGradient>
            </BlurView>
          </View>
        );

      case 'dark':
        return (
          <View style={[baseButtonStyle, styles.darkButton]}>
            {renderContent()}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <Reanimated.View
      style={[
        fullWidth && styles.fullWidth,
        animatedStyle,
        style,
      ]}
    >
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onLongPress={onLongPress ? handleLongPress : undefined}
        disabled={isDisabled}
        testID={testID}
        accessibilityLabel={accessibilityLabel || (typeof children === 'string' ? children : undefined)}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
        style={[
          fullWidth && styles.fullWidth,
          variant === 'primary' && !isDisabled && SHADOWS_V2.buttonPrimary,
        ]}
      >
        {renderButton()}
      </AnimatedPressable>
    </Reanimated.View>
  );
};

// ============================================
// STYLES
// ============================================
const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS_V2.interactive.primary,
  },
  secondaryButton: {
    borderWidth: 2,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostButton: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerButton: {
    backgroundColor: COLORS_V2.feedback.error,
  },
  glassButton: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  blurView: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 100,
  },
  darkButton: {
    backgroundColor: PALETTE.sand[900],
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ============================================
// ICON BUTTON VARIANT
// ============================================
export interface IconButtonV2Props {
  icon: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  haptic?: boolean;
  onPress: () => void;
  style?: ViewStyle;
  testID?: string;
  accessibilityLabel: string;
}

const ICON_BUTTON_SIZES = {
  sm: { size: 36, iconSize: 18 },
  md: { size: 44, iconSize: 22 },
  lg: { size: 56, iconSize: 28 },
} as const;

export const IconButtonV2: React.FC<IconButtonV2Props> = ({
  icon,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  loading = false,
  haptic = true,
  onPress,
  style,
  testID,
  accessibilityLabel,
}) => {
  const scale = useSharedValue(1);
  const sizeConfig = ICON_BUTTON_SIZES[size];
  const isDisabled = disabled || loading;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    if (isDisabled) return;
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    scale.value = withSpring(0.9, SPRINGS.snappy);
  }, [isDisabled, haptic]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, SPRINGS.bouncy);
  }, []);

  const getIconColor = (): string => {
    if (isDisabled) return COLORS_V2.interactive.disabledText;
    switch (variant) {
      case 'primary':
        return PALETTE.white;
      case 'secondary':
        return COLORS_V2.interactive.primary;
      case 'glass':
        return PALETTE.white;
      default:
        return COLORS_V2.text.secondary;
    }
  };

  const getBackgroundStyle = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: COLORS_V2.interactive.primary };
      case 'secondary':
        return {
          borderWidth: 2,
          borderColor: COLORS_V2.interactive.primary,
          backgroundColor: 'transparent',
        };
      case 'glass':
        return {
          backgroundColor: 'rgba(255,255,255,0.15)',
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.2)',
        };
      default:
        return { backgroundColor: COLORS_V2.bg.secondary };
    }
  };

  return (
    <Reanimated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        testID={testID}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
        style={[
          {
            width: sizeConfig.size,
            height: sizeConfig.size,
            borderRadius: sizeConfig.size / 2,
            alignItems: 'center',
            justifyContent: 'center',
            opacity: isDisabled ? 0.5 : 1,
          },
          getBackgroundStyle(),
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={getIconColor()} size="small" />
        ) : (
          <MaterialCommunityIcons
            name={icon as keyof typeof MaterialCommunityIcons.glyphMap}
            size={sizeConfig.iconSize}
            color={getIconColor()}
          />
        )}
      </Pressable>
    </Reanimated.View>
  );
};

export default ButtonV2;
