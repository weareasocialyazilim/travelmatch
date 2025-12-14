/**
 * WalletConnectButton Component
 * Button for connecting wallet payment methods
 */

import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

export interface WalletConnectButtonProps {
  type: 'apple_pay' | 'google_pay';
  onPress?: () => void;
  disabled?: boolean;
}

export const WalletConnectButton: React.FC<WalletConnectButtonProps> = ({
  type,
  onPress,
  disabled = false,
}) => {
  const walletConfig = {
    apple_pay: {
      icon: 'apple' as const,
      label: 'Connect Apple Pay',
      available: Platform.OS === 'ios',
    },
    google_pay: {
      icon: 'google' as const,
      label: 'Connect Google Pay',
      available: Platform.OS === 'android',
    },
  };

  const config = walletConfig[type];

  if (!config.available) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.buttonDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <MaterialCommunityIcons
        name={config.icon}
        size={20}
        color={disabled ? COLORS.textSecondary : COLORS.textPrimary}
      />
      <Text style={[styles.label, disabled && styles.labelDisabled]}>
        {config.label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  buttonDisabled: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  labelDisabled: {
    color: COLORS.textSecondary,
  },
});

export default WalletConnectButton;
