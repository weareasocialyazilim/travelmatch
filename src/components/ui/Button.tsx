import React from 'react';
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

export const Button: React.FC<ButtonProps> = ({
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
  const getVariantStyles = (): ViewStyle => {
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
  };

  const getSizeStyles = (): ViewStyle => {
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
  };

  const getTextColor = (): string => {
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
  };

  const getTextSize = (): number => {
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
  };

  const getIconSize = (): number => {
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
  };

  const textColor = getTextColor();

  // Accessibility props
  const a11y = a11yProps.button(
    accessibilityLabel || title,
    accessibilityHint || (loading ? 'Loading' : undefined),
    disabled || loading,
  );

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      {...a11y}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading }}
      style={[
        styles.base,
        getVariantStyles(),
        getSizeStyles(),
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
              size={getIconSize()}
              color={textColor}
              style={styles.iconLeft}
            />
          )}
          <Text
            style={[
              styles.text,
              { color: textColor, fontSize: getTextSize() },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <MaterialCommunityIcons
              name={icon}
              size={getIconSize()}
              color={textColor}
              style={styles.iconRight}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

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
