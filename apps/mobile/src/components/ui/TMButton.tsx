// components/ui/TMButton.tsx
// TravelMatch Ultimate Design System 2026
// Awwwards standardında Buton Sistemi
// Neon parlaması, haptik geri bildirim ve ipeksi geçişler içerir.

import React, { useCallback } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, GRADIENTS, SHADOWS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import { RADIUS, SIZES, SPACING } from '@/constants/spacing';
import { SPRING, HAPTIC } from '@/hooks/useMotion';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger' | 'neon';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface TMButtonProps {
  /** Button text - use either children or title */
  children?: string;
  /** Button text - alias for children (backward compat) */
  title?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  rightIcon?: keyof typeof MaterialCommunityIcons.glyphMap;
  /** Generic icon slot (renders before text) */
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: TextStyle;
  testID?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const TMButton: React.FC<TMButtonProps> = ({
  children,
  title,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  icon,
  loading = false,
  disabled = false,
  fullWidth = false,
  onPress,
  style,
  textStyle,
  testID,
}) => {
  const scale = useSharedValue(1);

  // Support both children and title props
  const buttonText = children || title || '';

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.96, SPRING.snappy);
    runOnJS(HAPTIC.light)();
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, SPRING.default);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const sizeStyles: Record<ButtonSize, ViewStyle> = {
    xs: { height: SIZES.buttonXS, paddingHorizontal: SPACING.sm },
    sm: { height: SIZES.buttonSmall, paddingHorizontal: SPACING.base },
    md: { height: SIZES.button, paddingHorizontal: SPACING.lg },
    lg: { height: SIZES.buttonLarge, paddingHorizontal: SPACING.xl },
    xl: { height: SIZES.buttonXL, paddingHorizontal: SPACING['2xl'] },
  };

  const textSizeStyles: Record<ButtonSize, TextStyle> = {
    xs: TYPOGRAPHY.labelXSmall,
    sm: TYPOGRAPHY.labelSmall,
    md: TYPOGRAPHY.label,
    lg: TYPOGRAPHY.labelLarge,
    xl: TYPOGRAPHY.labelLarge,
  };

  const radiusBySize: Record<ButtonSize, number> = {
    xs: RADIUS.buttonSmall,
    sm: RADIUS.buttonSmall,
    md: RADIUS.button,
    lg: RADIUS.button,
    xl: RADIUS.buttonLarge,
  };

  const iconSize = size === 'xl' ? 24 : size === 'lg' ? 22 : size === 'md' ? 20 : size === 'sm' ? 18 : 16;

  const getTextColor = (): string => {
    if (disabled) return COLORS.textDisabled;
    switch (variant) {
      case 'primary':
      case 'neon':
      case 'danger':
        return COLORS.white;
      case 'secondary':
      case 'outline':
      case 'ghost':
        return COLORS.primary;
      default:
        return COLORS.white;
    }
  };

  const getIconColor = (): string => {
    if (disabled) return COLORS.textDisabled;
    switch (variant) {
      case 'primary':
      case 'neon':
      case 'danger':
        return COLORS.white;
      default:
        return COLORS.primary;
    }
  };

  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'neon' || variant === 'danger' ? '#FFF' : COLORS.primary}
          size="small"
        />
      ) : (
        <View style={styles.content}>
          {/* Generic icon slot */}
          {icon && <View style={styles.iconGap}>{icon}</View>}

          {/* Left icon from icon library */}
          {leftIcon && !icon && (
            <MaterialCommunityIcons
              name={leftIcon}
              size={iconSize}
              color={getIconColor()}
              style={styles.leftIcon}
            />
          )}

          <Text
            style={[
              styles.text,
              textSizeStyles[size],
              { color: getTextColor() },
              variant === 'neon' && styles.neonText,
              textStyle,
            ]}
          >
            {buttonText}
          </Text>

          {rightIcon && (
            <MaterialCommunityIcons
              name={rightIcon}
              size={iconSize}
              color={getIconColor()}
              style={styles.rightIcon}
            />
          )}
        </View>
      )}
    </>
  );

  // Primary variant with gradient
  if (variant === 'primary') {
    return (
      <Animated.View
        style={[fullWidth && styles.fullWidth, animatedStyle, style]}
      >
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          testID={testID}
          style={[
            styles.button,
            sizeStyles[size],
            { borderRadius: radiusBySize[size] },
            disabled && styles.disabled,
          ]}
        >
          <LinearGradient
            colors={disabled ? GRADIENTS.disabled : GRADIENTS.gift}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.gradient,
              { borderRadius: radiusBySize[size] },
              !disabled && SHADOWS.button,
            ]}
          >
            {renderContent()}
          </LinearGradient>
        </Pressable>
      </Animated.View>
    );
  }

  // Neon variant with glow effect
  if (variant === 'neon') {
    return (
      <Animated.View
        style={[fullWidth && styles.fullWidth, animatedStyle, style]}
      >
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          testID={testID}
          style={[
            styles.button,
            sizeStyles[size],
            { borderRadius: radiusBySize[size] },
            disabled && styles.disabled,
          ]}
        >
          <LinearGradient
            colors={disabled ? GRADIENTS.disabled : GRADIENTS.gift}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.gradient,
              styles.neonGlow,
              { borderRadius: radiusBySize[size] },
            ]}
          >
            {renderContent()}
            {/* Neon Glow Overlay */}
            <View style={styles.glowOverlay} />
          </LinearGradient>
        </Pressable>
      </Animated.View>
    );
  }

  // Danger variant
  if (variant === 'danger') {
    return (
      <Animated.View
        style={[fullWidth && styles.fullWidth, animatedStyle, style]}
      >
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled || loading}
          testID={testID}
          style={[
            styles.button,
            sizeStyles[size],
            { borderRadius: radiusBySize[size] },
            styles.danger,
            disabled && styles.disabled,
          ]}
        >
          {renderContent()}
        </Pressable>
      </Animated.View>
    );
  }

  // Other variants (secondary, ghost, outline)
  return (
    <Animated.View
      style={[fullWidth && styles.fullWidth, animatedStyle, style]}
    >
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        testID={testID}
        style={[
          styles.button,
          sizeStyles[size],
          { borderRadius: radiusBySize[size] },
          variant === 'secondary' && styles.secondary,
          variant === 'outline' && [
            styles.outline,
            { borderRadius: radiusBySize[size] },
          ],
          variant === 'ghost' && styles.ghost,
          disabled && styles.disabled,
        ]}
      >
        {renderContent()}
      </AnimatedPressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  neonText: {
    fontWeight: '900',
  },
  iconGap: {
    marginRight: 8,
  },
  leftIcon: {
    marginRight: SPACING.xs,
  },
  rightIcon: {
    marginLeft: SPACING.xs,
  },
  secondary: {
    backgroundColor: COLORS.primaryMuted,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: COLORS.error,
  },
  neonGlow: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  glowOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    zIndex: -1,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default TMButton;
