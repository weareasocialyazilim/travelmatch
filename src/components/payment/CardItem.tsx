/**
 * CardItem Component
 * Displays a saved payment card with optional default badge
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import type { SavedCard } from './types';

interface CardItemProps {
  card: SavedCard;
  onPress: (card: SavedCard) => void;
  showDefaultBadge?: boolean;
}

export const CardItem: React.FC<CardItemProps> = ({
  card,
  onPress,
  showDefaultBadge = true,
}) => {
  const cardIconName =
    card.brand === 'Visa' ? 'credit-card' : 'credit-card-outline';
  const cardIconColor = card.brand === 'Visa' ? COLORS.visa : COLORS.mastercard;

  return (
    <TouchableOpacity
      style={styles.cardItem}
      onPress={() => onPress(card)}
      activeOpacity={0.7}
      accessibilityLabel={`${card.brand} card ending in ${card.lastFour}${
        card.isDefault ? ', default' : ''
      }`}
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
};

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
    color: COLORS.text,
  },
  cardBrand: {
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

export default CardItem;
