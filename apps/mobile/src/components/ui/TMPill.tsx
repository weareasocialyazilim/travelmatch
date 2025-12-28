// components/ui/TMPill.tsx
// TravelMatch Ultimate Design System 2026
// Pill/Chip component for categories, filters, and tags

import React, { useCallback } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  StyleProp,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/constants/typography';
import { RADIUS, SIZES, SPACING } from '@/constants/spacing';
import { SPRING, HAPTIC } from '@/hooks/useMotion';

type PillVariant = 'default' | 'selected' | 'outlined' | 'muted';
type PillSize = 'sm' | 'md' | 'lg';

interface TMPillProps {
  children: string;
  variant?: PillVariant;
  size?: PillSize;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  emoji?: string;
  selected?: boolean;
  disabled?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const TMPill: React.FC<TMPillProps> = ({
  children,
  variant = 'default',
  size = 'md',
  icon,
  emoji,
  selected = false,
  disabled = false,
  onPress,
  onRemove,
  style,
  testID,
}) => {
  const scale = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    if (disabled) return;
    scale.value = withSpring(0.95, SPRING.snappy);
    runOnJS(HAPTIC.selection)();
  }, [disabled]);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, SPRING.default);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Compute effective variant based on selected state
  const effectiveVariant = selected ? 'selected' : variant;

  const sizeStyles: Record<PillSize, ViewStyle> = {
    sm: {
      height: SIZES.chipSmall,
      paddingHorizontal: SPACING.sm,
    },
    md: {
      height: SIZES.chip,
      paddingHorizontal: SPACING.md,
    },
    lg: {
      height: SIZES.chipLarge,
      paddingHorizontal: SPACING.base,
    },
  };

  const textSizeStyles = {
    sm: TYPOGRAPHY.labelXSmall,
    md: TYPOGRAPHY.labelSmall,
    lg: TYPOGRAPHY.label,
  };

  const iconSize = size === 'lg' ? 18 : size === 'md' ? 16 : 14;

  const getBackgroundColor = (): string => {
    if (disabled) return COLORS.surface.baseMuted;
    switch (effectiveVariant) {
      case 'selected':
        return COLORS.brand.primary;
      case 'outlined':
        return 'transparent';
      case 'muted':
        return COLORS.surface.baseMuted;
      default:
        return COLORS.surface.baseSubtle;
    }
  };

  const getTextColor = (): string => {
    if (disabled) return COLORS.text.primaryDisabled;
    switch (effectiveVariant) {
      case 'selected':
        return COLORS.utility.white;
      case 'outlined':
        return COLORS.text.primary;
      case 'muted':
        return COLORS.text.secondary;
      default:
        return COLORS.text.primary;
    }
  };

  const getBorderColor = (): string => {
    if (effectiveVariant === 'outlined') {
      return disabled ? COLORS.border.light : COLORS.border.default;
    }
    return 'transparent';
  };

  const content = (
    <>
      {emoji && <Text style={styles.emoji}>{emoji}</Text>}
      {icon && (
        <MaterialCommunityIcons
          name={icon}
          size={iconSize}
          color={getTextColor()}
          style={styles.icon}
        />
      )}
      <Text
        style={[styles.text, textSizeStyles[size], { color: getTextColor() }]}
        numberOfLines={1}
      >
        {children}
      </Text>
      {onRemove && (
        <Pressable
          onPress={onRemove}
          hitSlop={{ top: 8, right: 8, bottom: 8, left: 4 }}
          style={styles.removeButton}
        >
          <MaterialCommunityIcons
            name="close"
            size={iconSize}
            color={getTextColor()}
          />
        </Pressable>
      )}
    </>
  );

  // Non-interactive pill
  if (!onPress && !onRemove) {
    return (
      <Animated.View
        style={[
          styles.pill,
          sizeStyles[size],
          styles.pillDynamic,
          {
            backgroundColor: getBackgroundColor(),
            borderColor: getBorderColor(),
          },
          effectiveVariant === 'outlined' && styles.outlined,
          disabled && styles.disabled,
          style,
        ]}
        testID={testID}
      >
        {content}
      </Animated.View>
    );
  }

  // Interactive pill
  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      testID={testID}
      style={[
        styles.pill,
        sizeStyles[size],
        styles.pillDynamic,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
        },
        effectiveVariant === 'outlined' && styles.outlined,
        disabled && styles.disabled,
        animatedStyle,
        style,
      ]}
    >
      {content}
    </AnimatedPressable>
  );
};

// Convenience wrapper for category chips
interface TMCategoryChipProps {
  category: string;
  emoji?: string;
  selected?: boolean;
  onPress?: () => void;
  testID?: string;
}

export const TMCategoryChip: React.FC<TMCategoryChipProps> = ({
  category,
  emoji,
  selected = false,
  onPress,
  testID,
}) => (
  <TMPill emoji={emoji} selected={selected} onPress={onPress} testID={testID}>
    {category}
  </TMPill>
);

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.chip,
    gap: SPACING.xs,
  },
  pillDynamic: {
    borderWidth: 0,
  },
  outlined: {
    borderWidth: 1,
  },
  text: {
    textAlign: 'center',
  },
  emoji: {
    fontSize: 14,
  },
  icon: {
    marginRight: -2,
  },
  removeButton: {
    marginLeft: SPACING.xxs,
    marginRight: -SPACING.xs,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default TMPill;
