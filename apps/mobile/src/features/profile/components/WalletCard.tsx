import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

interface WalletCardProps {
  balance: number;
  onPress: () => void;
}

const WalletCard: React.FC<WalletCardProps> = memo(
  ({ balance, onPress }) => {
    return (
      <TouchableOpacity
        style={styles.walletCard}
        onPress={onPress}
        accessibilityLabel={`Wallet balance $${balance.toFixed(2)}. Tap to manage`}
        accessibilityRole="button"
      >
        <View style={styles.walletLeft}>
          <View style={styles.walletIconWrapper}>
            <MaterialCommunityIcons
              name="wallet"
              size={24}
              color={COLORS.mint}
            />
          </View>
          <View>
            <Text style={styles.walletLabel}>Wallet</Text>
            <Text style={styles.walletBalance}>${balance.toFixed(2)}</Text>
          </View>
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={COLORS.text.secondary}
        />
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) => prevProps.balance === nextProps.balance,
);

WalletCard.displayName = 'WalletCard';

const styles = StyleSheet.create({
  walletCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.utility.white,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: COLORS.utility.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  walletLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  walletIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.mintTransparent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletLabel: {
    fontSize: 13,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  walletBalance: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
});

export default WalletCard;
