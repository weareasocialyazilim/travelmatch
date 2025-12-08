import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import type { SavedCard, Wallet, WalletSettings } from '../types/payment-methods.types';

interface PaymentPriorityNoticeProps {
  wallets: Wallet[];
  savedCards: SavedCard[];
  walletSettings: WalletSettings;
  isWalletConnected: boolean;
}

export const PaymentPriorityNotice = ({
  wallets,
  savedCards,
  walletSettings,
  isWalletConnected,
}: PaymentPriorityNoticeProps) => {
  const getNoticeText = () => {
    if (isWalletConnected && walletSettings.isDefaultPayment) {
      return `${wallets[0]?.name ?? 'Wallet'} will be used for all payments. Cards are backup options.`;
    }

    const defaultCard = savedCards.find((c) => c.isDefault);
    if (defaultCard) {
      return `${defaultCard.brand} •••• ${defaultCard.lastFour} will be used for payments.`;
    }

    return 'Please set a default payment method.';
  };

  return (
    <View style={styles.priorityNotice}>
      <MaterialCommunityIcons name="information-outline" size={20} color={COLORS.brown} />
      <View style={styles.priorityNoticeText}>
        <Text style={styles.priorityNoticeTitle}>Payment Priority</Text>
        <Text style={styles.priorityNoticeDescription}>{getNoticeText()}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  priorityNotice: {
    flexDirection: 'row',
    backgroundColor: COLORS.amber,
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'flex-start',
    gap: 12,
  },
  priorityNoticeText: {
    flex: 1,
  },
  priorityNoticeTitle: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '700',
    color: COLORS.brown,
    marginBottom: 4,
  },
  priorityNoticeDescription: {
    ...TYPOGRAPHY.caption,
    color: COLORS.brown,
    lineHeight: 18,
  },
});
