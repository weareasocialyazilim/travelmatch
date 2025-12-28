/**
 * CardItem Component
 * Displays a saved payment card with optional default badge
 */

import React, { memo, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import type { SavedCard } from './types';

interface CardItemProps {
  card: SavedCard;
  onPress: (card: SavedCard) => void;
  showDefaultBadge?: boolean;
}

export const CardItem: React.FC<CardItemProps> = memo(
  ({ card, onPress, showDefaultBadge = true }) => {
    // Memoize card icon props to prevent recreation
    const cardIconName = useMemo(
      () => (card.brand === 'Visa' ? 'credit-card' : 'credit-card-outline'),
      [card.brand],
    );

    const cardIconColor = useMemo(
      () => (card.brand === 'Visa' ? COLORS.visa : COLORS.mastercard),
      [card.brand],
    );

    // Memoize accessibility label
    const accessibilityLabel = useMemo(
      () =>
        `${card.brand} card ending in ${card.lastFour}${
          card.isDefault ? ', default' : ''
        }`,
      [card.brand, card.lastFour, card.isDefault],
    );

    // Memoize press handler
    const handlePress = useCallback(() => {
      onPress(card);
    }, [card, onPress]);

    return (
      <TouchableOpacity
        style={styles.cardItem}
        onPress={handlePress}
        activeOpacity={0.7}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
      >
        <View style={styles.cardIcon}>
          <MaterialCommunityIcons
            name={cardIconName}
            size={20}
            color={cardIconColor}
          />
        </View>
        <View style={styles.cardTextContainer}>
          <View style={styles.cardNameRow}>
            <Text style={styles.cardText}>•••• {card.lastFour}</Text>
            {card.isDefault && showDefaultBadge && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>Default</Text>
              </View>
            )}
          </View>
          <Text style={styles.cardBrand}>{card.brand}</Text>
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color={COLORS.softGray}
        />
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) =>
    prevProps.card.id === nextProps.card.id &&
    prevProps.card.brand === nextProps.card.brand &&
    prevProps.card.lastFour === nextProps.card.lastFour &&
    prevProps.card.isDefault === nextProps.card.isDefault &&
    prevProps.showDefaultBadge === nextProps.showDefaultBadge,
);

CardItem.displayName = 'CardItem';

const styles = StyleSheet.create({
  cardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  cardBrand: {
    fontSize: 14,
    color: COLORS.softGray,
    marginTop: 2,
  },
  defaultBadge: {
    backgroundColor: COLORS.brand.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.utility.white,
  },
});

export default CardItem;
