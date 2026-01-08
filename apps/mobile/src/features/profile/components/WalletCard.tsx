import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// Profile dark theme colors
const WALLET_COLORS = {
  background: 'rgba(255, 255, 255, 0.06)',
  border: 'rgba(255, 255, 255, 0.08)',
  text: {
    primary: '#F8FAFC',
    secondary: '#94A3B8',
  },
  neon: {
    lime: '#DFFF00',
  },
};

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
        accessibilityLabel={`Cüzdan bakiyesi ₺${balance.toFixed(2)}. Yönetmek için dokun`}
        accessibilityRole="button"
      >
        <View style={styles.walletLeft}>
          <View style={styles.walletIconWrapper}>
            <MaterialCommunityIcons
              name="wallet"
              size={22}
              color={WALLET_COLORS.neon.lime}
            />
          </View>
          <View>
            <Text style={styles.walletLabel}>Cüzdan</Text>
            <Text style={styles.walletBalance}>₺{balance.toFixed(2)}</Text>
          </View>
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color={WALLET_COLORS.text.secondary}
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
    backgroundColor: WALLET_COLORS.background,
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: WALLET_COLORS.border,
  },
  walletLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  walletIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(223, 255, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletLabel: {
    fontSize: 12,
    color: WALLET_COLORS.text.secondary,
    marginBottom: 2,
  },
  walletBalance: {
    fontSize: 18,
    fontWeight: '700',
    color: WALLET_COLORS.text.primary,
    letterSpacing: -0.3,
  },
});

export default WalletCard;
