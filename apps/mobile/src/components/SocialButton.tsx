import React, { memo, useMemo } from 'react';
import type { ViewStyle } from 'react-native';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

type Provider = 'google' | 'apple' | 'facebook' | 'phone' | 'email';
type Size = 'large' | 'icon';

export interface SocialButtonProps {
  provider: Provider;
  size?: Size;
  onPress?: () => void;
  style?: ViewStyle;
  label?: string;
  /** Use provider-specific colors (Apple black, Google blue, etc.) */
  useProviderColors?: boolean;
}

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

// Provider config with brand colors
const providerConfig: Record<
  Provider,
  { icon: IconName; text: string; color: string; iconColor: string }
> = {
  google: {
    icon: 'google',
    text: 'Continue with Google',
    color: '#4285F4', // Google blue
    iconColor: COLORS.utility.white,
  },
  apple: {
    icon: 'apple',
    text: 'Continue with Apple',
    color: '#000000', // Apple black
    iconColor: COLORS.utility.white,
  },
  facebook: {
    icon: 'facebook',
    text: 'Continue with Facebook',
    color: '#1877F2', // Facebook blue
    iconColor: COLORS.utility.white,
  },
  phone: {
    icon: 'phone',
    text: 'Continue with Phone',
    color: COLORS.mint,
    iconColor: COLORS.utility.white,
  },
  email: {
    icon: 'email',
    text: 'Continue with Email',
    color: COLORS.buttonDark,
    iconColor: COLORS.utility.white,
  },
};

const SocialButton: React.FC<SocialButtonProps> = memo(
  ({ provider, size = 'large', onPress, style, label, useProviderColors = false }) => {
    // Memoize config lookup
    const config = useMemo(() => providerConfig[provider], [provider]);

    // Memoize display text
    const displayText = useMemo(
      () => label || config.text,
      [label, config.text],
    );

    // Memoize background color
    const backgroundColor = useMemo(
      () => (useProviderColors ? config.color : COLORS.buttonDark),
      [useProviderColors, config.color],
    );

    if (size === 'icon') {
      return (
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor }, style]}
          onPress={onPress}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={displayText}
          accessibilityHint={`Sign in with ${provider}`}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialCommunityIcons
            name={config.icon}
            size={24}
            color={config.iconColor}
          />
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        style={[styles.largeButton, { backgroundColor }, style]}
        onPress={onPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={displayText}
        accessibilityHint={`Sign in with ${provider}`}
      >
        <MaterialCommunityIcons
          name={config.icon}
          size={24}
          color={config.iconColor}
        />
        <Text style={styles.largeButtonText}>{displayText}</Text>
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) =>
    prevProps.provider === nextProps.provider &&
    prevProps.size === nextProps.size &&
    prevProps.label === nextProps.label &&
    prevProps.useProviderColors === nextProps.useProviderColors,
);

SocialButton.displayName = 'SocialButton';

const styles = StyleSheet.create({
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  largeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 28,
    paddingHorizontal: 20,
    gap: 12,
  },
  largeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.utility.white,
  },
});

export { SocialButton };
export default SocialButton;
