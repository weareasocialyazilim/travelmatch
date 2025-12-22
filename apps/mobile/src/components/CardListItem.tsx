/**
 * CardListItem Component
 * Displays a credit/debit card in a list
 */

import React, { memo, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

export interface CardListItemProps {
  id: string;
  brand: 'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown';
  last4: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault?: boolean;
  onPress?: () => void;
  onOptionsPress?: () => void;
}

// Brand config defined outside component to avoid recreation
const brandConfig: Record<string, { icon: 'credit-card' | 'credit-card-outline'; color: string }> = {
  visa: { icon: 'credit-card', color: '#1A1F71' },
  mastercard: { icon: 'credit-card', color: '#EB001B' },
  amex: { icon: 'credit-card', color: '#006FCF' },
  discover: { icon: 'credit-card', color: '#FF6000' },
  unknown: { icon: 'credit-card-outline', color: COLORS.textSecondary },
};

export const CardListItem: React.FC<CardListItemProps> = memo(
  ({
    brand,
    last4,
    expiryMonth,
    expiryYear,
    isDefault = false,
    onPress,
    onOptionsPress,
  }) => {
    // Memoize brand config to prevent recreation
    const config = useMemo(() => brandConfig[brand] || brandConfig.unknown, [brand]);

    // Memoize icon container background style
    const iconContainerStyle = useMemo(
      () => [styles.iconContainer, { backgroundColor: config.color + '20' }],
      [config.color],
    );

    // Memoize expiry text to prevent recreation
    const expiryText = useMemo(() => {
      if (!expiryMonth || !expiryYear) return null;
      return `Expires ${String(expiryMonth).padStart(2, '0')}/${String(expiryYear).slice(-2)}`;
    }, [expiryMonth, expiryYear]);

    return (
      <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
        <View style={iconContainerStyle}>
          <MaterialCommunityIcons name={config.icon} size={24} color={config.color} />
        </View>
        <View style={styles.info}>
          <Text style={styles.cardNumber}>•••• {last4}</Text>
          {expiryText && <Text style={styles.expiry}>{expiryText}</Text>}
          {isDefault && <Text style={styles.defaultBadge}>Default</Text>}
        </View>
        <TouchableOpacity style={styles.optionsButton} onPress={onOptionsPress}>
          <MaterialCommunityIcons name="dots-vertical" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) =>
    prevProps.id === nextProps.id &&
    prevProps.brand === nextProps.brand &&
    prevProps.last4 === nextProps.last4 &&
    prevProps.expiryMonth === nextProps.expiryMonth &&
    prevProps.expiryYear === nextProps.expiryYear &&
    prevProps.isDefault === nextProps.isDefault,
);

CardListItem.displayName = 'CardListItem';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  cardNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  expiry: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  defaultBadge: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 2,
  },
  optionsButton: {
    padding: 8,
  },
});

export default CardListItem;
