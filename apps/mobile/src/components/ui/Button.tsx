import React, { memo, useMemo } from 'react';
import type { ViewStyle, TextStyle } from 'react-native';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { a11yProps } from '../../utils/accessibility';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: keyof typeof MaterialCommunityIcons.glyphMap;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityHint?: string;
  accessibilityLabel?: string;
}

export const Button: React.FC<ButtonProps> = memo(
  ({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    fullWidth = false,
    icon,
    iconPosition = 'left',
    style,
    textStyle,
    accessibilityHint,
    accessibilityLabel,
  }) => {
    // Memoize variant styles
    const variantStyles = useMemo((): ViewStyle => {
      if (disabled) {
        return {
          backgroundColor: COLORS.gray[300],
          borderWidth: 0,
        };
      }

      switch (variant) {
        case 'primary':
          return {
            backgroundColor: COLORS.primary,
            borderWidth: 0,
          };
        case 'secondary':
          return {
            backgroundColor: COLORS.primaryMuted,
            borderWidth: 0,
          };
        case 'outline':
          return {
            backgroundColor: COLORS.transparent,
            borderWidth: 2,
            borderColor: COLORS.primary,
          };
        case 'ghost':
          return {
            backgroundColor: COLORS.transparent,
            borderWidth: 0,
          };
        case 'danger':
          return {
            backgroundColor: COLORS.error,
            borderWidth: 0,
          };
        default:
          return {};
      }
    }, [variant, disabled]);

    // Memoize size styles
    const sizeStyles = useMemo((): ViewStyle => {
      switch (size) {
        case 'sm':
          return { height: 36, paddingHorizontal: 12 };
        case 'md':
          return { height: 48, paddingHorizontal: 20 };
        case 'lg':
          return { height: 56, paddingHorizontal: 24 };
        default:
          return { height: 48, paddingHorizontal: 20 };
      }
    }, [size]);

    // Memoize text color
    const textColor = useMemo((): string => {
      if (disabled) return COLORS.gray[400];

      switch (variant) {
        case 'primary':
          return COLORS.text;
        case 'danger':
          return COLORS.white;
        case 'secondary':
        case 'outline':
        case 'ghost':
          return COLORS.text;
        default:
          return COLORS.text;
      }
    }, [variant, disabled]);

    // Memoize text size
    const textSize = useMemo((): number => {
      switch (size) {
        case 'sm':
          return 14;
        case 'md':
          return 16;
        case 'lg':
          return 18;
        default:
          return 16;
      }
    }, [size]);

    // Memoize icon size
    const iconSize = useMemo((): number => {
      switch (size) {
        case 'sm':
          return 16;
        case 'md':
          return 20;
        case 'lg':
          return 24;
        default:
          return 20;
      }
    }, [size]);

    // Memoize hitSlop
    const hitSlop = useMemo(() => {
      switch (size) {
        case 'sm':
          return { top: 4, bottom: 4, left: 8, right: 8 }; // 36 + 8 = 44pt
        case 'md':
        case 'lg':
        default:
          return { top: 8, bottom: 8, left: 8, right: 8 }; // Default padding
      }
    }, [size]);

    // Memoize accessibility props
    const a11y = useMemo(
      () =>
        a11yProps.button(
          accessibilityLabel || title,
          accessibilityHint || (loading ? 'Loading' : undefined),
          disabled || loading,
        ),
      [accessibilityLabel, title, accessibilityHint, loading, disabled],
    );

    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        hitSlop={hitSlop}
        {...a11y}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ disabled: disabled || loading }}
        style={[
          styles.base,
          variantStyles,
          sizeStyles,
          fullWidth && styles.fullWidth,
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={textColor} size="small" />
        ) : (
          <View style={styles.content}>
            {icon && iconPosition === 'left' && (
              <MaterialCommunityIcons
                name={icon}
                size={iconSize}
                color={textColor}
                style={styles.iconLeft}
              />
            )}
            <Text
              style={[
                styles.text,
                { color: textColor, fontSize: textSize },
                textStyle,
              ]}
            >
              {title}
            </Text>
            {icon && iconPosition === 'right' && (
              <MaterialCommunityIcons
                name={icon}
                size={iconSize}
                color={textColor}
                style={styles.iconRight}
              />
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) =>
    prevProps.title === nextProps.title &&
    prevProps.variant === nextProps.variant &&
    prevProps.size === nextProps.size &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.loading === nextProps.loading &&
    prevProps.fullWidth === nextProps.fullWidth &&
    prevProps.icon === nextProps.icon &&
    prevProps.iconPosition === nextProps.iconPosition,
);

Button.displayName = 'Button';

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9999,
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
    fontWeight: '700',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});

export default Button;
