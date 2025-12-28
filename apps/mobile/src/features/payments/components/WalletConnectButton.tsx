import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';

interface WalletConnectButtonProps {
  onPress: () => void;
}

export const WalletConnectButton = ({ onPress }: WalletConnectButtonProps) => {
  const walletName = Platform.OS === 'ios' ? 'Apple Pay' : 'Google Pay';
  const helpText =
    Platform.OS === 'ios'
      ? 'Make sure Apple Pay is set up on your device'
      : 'Make sure Google Pay is set up on your device';

  return (
    <View>
      <TouchableOpacity
        style={styles.connectWalletButton}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name={Platform.OS === 'ios' ? 'apple' : 'google'}
          size={24}
          color={COLORS.text.primary}
        />
        <Text style={styles.connectWalletText}>Connect {walletName}</Text>
        <MaterialCommunityIcons name="plus-circle-outline" size={20} color={COLORS.text.primary} />
      </TouchableOpacity>
      <Text style={styles.walletHelpText}>{helpText}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  connectWalletButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.utility.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: COLORS.softGray,
    borderStyle: 'dashed',
  },
  connectWalletText: {
    flex: 1,
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginLeft: 12,
  },
  walletHelpText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    marginBottom: 24,
    marginTop: 4,
    paddingHorizontal: 4,
  },
});
