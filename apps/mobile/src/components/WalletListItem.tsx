/**
 * WalletListItem Component
 * Displays a wallet item in a list
 */

import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

export interface WalletListItemProps {
  id: string;
  type: 'apple_pay' | 'google_pay';
  isDefault?: boolean;
  onPress?: () => void;
  onOptionsPress?: () => void;
}

// Wallet config defined outside component to avoid recreation
const walletConfig = {
  apple_pay: {
    icon: 'apple' as const,
    label: 'Apple Pay',
  },
  google_pay: {
    icon: 'google' as const,
    label: 'Google Pay',
  },
};

export const WalletListItem: React.FC<WalletListItemProps> = memo(
  ({ type, isDefault = false, onPress, onOptionsPress }) => {
    const config = useMemo(() => walletConfig[type], [type]);

    return (
      <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name={config.icon} size={24} color={COLORS.text.primary} />
        </View>
        <View style={styles.info}>
          <Text style={styles.label}>{config.label}</Text>
          {isDefault && <Text style={styles.defaultBadge}>Default</Text>}
        </View>
        <TouchableOpacity style={styles.optionsButton} onPress={onOptionsPress}>
          <MaterialCommunityIcons name="dots-vertical" size={20} color={COLORS.text.secondary} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) =>
    prevProps.id === nextProps.id &&
    prevProps.type === nextProps.type &&
    prevProps.isDefault === nextProps.isDefault,
);

WalletListItem.displayName = 'WalletListItem';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.utility.white,
    borderRadius: 12,
    marginBottom: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.surface.base,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  defaultBadge: {
    fontSize: 12,
    color: COLORS.brand.primary,
    marginTop: 2,
  },
  optionsButton: {
    padding: 8,
  },
});

export default WalletListItem;
