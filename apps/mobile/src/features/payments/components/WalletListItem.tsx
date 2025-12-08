import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import type { Wallet } from '../types/payment-methods.types';

interface WalletListItemProps {
  wallet: Wallet;
  isDefault: boolean;
  onPress: (wallet: Wallet) => void;
}

export const WalletListItem = ({ wallet, isDefault, onPress }: WalletListItemProps) => {
  return (
    <TouchableOpacity
      style={styles.walletItem}
      onPress={() => onPress(wallet)}
      activeOpacity={0.7}
    >
      <View style={styles.walletIcon}>
        <MaterialCommunityIcons
          name={Platform.OS === 'ios' ? 'apple' : 'google'}
          size={24}
          color={COLORS.text}
        />
      </View>
      <View style={styles.walletInfo}>
        <View style={styles.walletNameRow}>
          <Text style={styles.walletName}>{wallet.name}</Text>
          {isDefault && (
            <View style={styles.defaultBadgeSmall}>
              <Text style={styles.defaultBadgeText}>Default</Text>
            </View>
          )}
        </View>
        <Text style={styles.walletStatus}>{wallet.status}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color={COLORS.softGray} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  walletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 12,
    marginBottom: 8,
  },
  walletIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.beige,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletInfo: {
    flex: 1,
  },
  walletNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  walletName: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.text,
  },
  walletStatus: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  defaultBadgeSmall: {
    backgroundColor: COLORS.mint,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  defaultBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.white,
  },
});
