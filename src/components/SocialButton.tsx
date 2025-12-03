import React from 'react';
import type { ViewStyle } from 'react-native';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
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
}

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const SocialButton: React.FC<SocialButtonProps> = ({
  provider,
  size = 'large',
  onPress,
  style,
  label,
}) => {
  const providerConfig: Record<Provider, { icon: IconName; text: string }> = {
    google: {
      icon: 'google',
      text: 'Continue with Google',
    },
    apple: {
      icon: 'apple',
      text: 'Continue with Apple',
    },
    facebook: {
      icon: 'facebook',
      text: 'Continue with Facebook',
    },
    phone: {
      icon: 'phone',
      text: 'Continue with Phone',
    },
    email: {
      icon: 'email',
      text: 'Continue with Email',
    },
  };

  const config = providerConfig[provider];
  const displayText = label || config.text;

  if (size === 'icon') {
    return (
      <TouchableOpacity
        style={[styles.iconButton, style]}
        onPress={onPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={displayText}
      >
        <MaterialCommunityIcons
          name={config.icon}
          size={24}
          color={COLORS.white}
        />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.largeButton, style]}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={displayText}
    >
      <MaterialCommunityIcons
        name={config.icon}
        size={24}
        color={COLORS.white}
      />
      <Text style={styles.largeButtonText}>{displayText}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.buttonDark,
  },
  largeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.buttonDark,
    paddingHorizontal: 20,
    gap: 12,
  },
  largeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default SocialButton;
