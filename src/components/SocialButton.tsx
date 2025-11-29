import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { radii } from '../constants/radii';
import { spacing } from '../constants/spacing';

type Provider = 'google' | 'apple' | 'facebook';
type Size = 'large' | 'icon';

interface SocialButtonProps {
  provider: Provider;
  size?: Size;
  onPress?: () => void;
  style?: ViewStyle;
}

const SocialButton: React.FC<SocialButtonProps> = ({
  provider,
  size = 'large',
  onPress,
  style,
}) => {
  const providerConfig = {
    google: {
      icon: 'google',
      text: 'Continue with Google',
      color: COLORS.error,
    },
    apple: {
      icon: 'apple',
      text: 'Continue with Apple',
      color: COLORS.black,
    },
    facebook: {
      icon: 'facebook',
      text: 'Continue with Facebook',
      color: COLORS.info,
    },
  };

  const config = providerConfig[provider];

  if (size === 'icon') {
    return (
      <TouchableOpacity
        style={[styles.iconButton, { backgroundColor: config.color }, style]}
        onPress={onPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={config.text}
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
      accessibilityLabel={config.text}
    >
      <MaterialCommunityIcons
        name={config.icon}
        size={22}
        color={config.color}
      />
      <Text style={[styles.largeButtonText, { color: config.color }]}>
        {config.text}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  iconButton: {
    alignItems: 'center',
    borderRadius: radii.full,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  largeButton: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: radii.full,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
    paddingVertical: spacing.md,
    width: '100%',
  },
  largeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SocialButton;
