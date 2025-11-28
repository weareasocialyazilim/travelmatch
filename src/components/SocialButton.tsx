import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../constants/colors';
import { VALUES } from '../constants/values';
import { LAYOUT } from '../constants/layout';

type Provider = 'google' | 'apple' | 'facebook' | 'phone' | 'email';

interface Props {
  provider: Provider;
  label?: string;
  onPress?: () => void;
  size?: 'full' | 'icon';
  style?: StyleProp<ViewStyle>;
}

const iconMap: Record<Provider, string> = {
  google: 'google',
  apple: 'apple',
  facebook: 'facebook',
  phone: 'phone',
  email: 'email',
};

const SocialButton: React.FC<Props> = ({
  provider,
  label,
  onPress,
  size = 'full',
  style,
}) => {
  const iconName = iconMap[provider];

  const providerStyles = {
    google: {
      wrapperBg: COLORS.white,
      iconColor: COLORS.error,
      textColor: COLORS.text,
      borderColor: COLORS.border,
    },
    apple: {
      wrapperBg: COLORS.black,
      iconColor: COLORS.white,
      textColor: COLORS.white,
      borderColor: COLORS.transparent,
    },
    facebook: {
      wrapperBg: COLORS.white,
      iconColor: COLORS.info,
      textColor: COLORS.text,
      borderColor: COLORS.border,
    },
    phone: {
      wrapperBg: COLORS.primary,
      iconColor: COLORS.white,
      textColor: COLORS.white,
      borderColor: COLORS.transparent,
    },
    email: {
      wrapperBg: COLORS.transparent,
      iconColor: COLORS.white,
      textColor: COLORS.white,
      borderColor: COLORS.whiteTransparent,
    },
  }[provider];

  const iconCircleBg =
    provider === 'apple' || provider === 'google' || provider === 'facebook'
      ? COLORS.white
      : COLORS.transparent;

  if (size === 'icon') {
    return (
      <TouchableOpacity
        style={[
          styles.iconButton,
          {
            backgroundColor: providerStyles.wrapperBg,
            borderColor: providerStyles.borderColor,
          },
          style,
        ]}
        onPress={onPress}
        activeOpacity={0.8}
        accessible
        accessibilityRole="button"
        accessibilityLabel={label || `Continue with ${provider}`}
      >
        <Icon name={iconName} size={20} color={providerStyles.iconColor} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.fullButton,
        {
          backgroundColor: providerStyles.wrapperBg,
          borderColor: providerStyles.borderColor,
        },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.85}
      accessible
      accessibilityRole="button"
      accessibilityLabel={label || `Continue with ${provider}`}
    >
      <View style={[styles.iconWrapper, { backgroundColor: iconCircleBg }]}>
        <Icon name={iconName} size={18} color={providerStyles.iconColor} />
      </View>
      <Text style={[styles.label, { color: providerStyles.textColor }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fullButton: {
    alignItems: 'center',
    borderRadius: VALUES.borderRadius,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 10,
    minHeight: 56,
    paddingHorizontal: 14,
    paddingVertical: LAYOUT.padding * 1.4,
    width: '100%',
  },
  iconButton: {
    alignItems: 'center',
    borderRadius: 28,
    borderWidth: 1,
    elevation: 2,
    height: 56,
    justifyContent: 'center',
    shadowColor: COLORS.shadowColor,
    shadowOpacity: 0.06,
    shadowRadius: 6,
    width: 56,
  },
  iconWrapper: {
    alignItems: 'center',
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    marginRight: 12,
    width: 36,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SocialButton;
