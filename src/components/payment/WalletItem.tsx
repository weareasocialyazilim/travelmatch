/**
 * WalletItem Component
 * Displays a digital wallet (Apple Pay/Google Pay) with connection status
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import type { Wallet, WalletSettings } from './types';

interface WalletItemProps {
  wallet: Wallet;
  walletSettings: WalletSettings;
  onPress: (wallet: Wallet) => void;
}

export const WalletItem: React.FC<WalletItemProps> = ({
  wallet,
  walletSettings,
  onPress,
}) => {
  const iconName = Platform.OS === 'ios' ? 'apple' : 'google';

  return (
    <TouchableOpacity
      style={styles.walletItem}
      onPress={() => onPress(wallet)}
      activeOpacity={0.7}
      accessibilityLabel={`${wallet.name}, ${wallet.status}${
        walletSettings.isDefaultPayment ? ', default payment method' : ''
      }`}
      accessibilityRole="button"
    >
      <View style={styles.walletIcon}>
        <MaterialCommunityIcons name={iconName} size={24} color={COLORS.text} />
      </View>
      <View style={styles.walletInfo}>
        <View style={styles.walletNameRow}>
          <Text style={styles.walletName}>{wallet.name}</Text>
          {walletSettings.isDefaultPayment && (
            <View style={styles.defaultBadge}>
              <Text style={styles.defaultBadgeText}>Default</Text>
            </View>
          )}
        </View>
        <Text style={styles.walletStatus}>{wallet.status}</Text>
      </View>
      <MaterialCommunityIcons
        name="chevron-right"
        size={20}
        color={COLORS.softGray}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  walletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  walletIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  walletInfo: {
    flex: 1,
  },
  walletNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  walletName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  walletStatus: {
    fontSize: 14,
    color: COLORS.softGray,
    marginTop: 2,
  },
  defaultBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default WalletItem;
