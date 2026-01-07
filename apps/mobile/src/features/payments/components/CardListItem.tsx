import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import type { SavedCard } from '../types/payment-methods.types';

interface CardListItemProps {
  card: SavedCard;
  showDefault: boolean;
  onPress: (card: SavedCard) => void;
}

export const CardListItem = ({
  card,
  showDefault,
  onPress,
}: CardListItemProps) => {
  return (
    <TouchableOpacity
      style={styles.cardItem}
      onPress={() => onPress(card)}
      activeOpacity={0.7}
    >
      <View style={styles.cardIcon}>
        <MaterialCommunityIcons
          name={card.brand === 'Visa' ? 'credit-card' : 'credit-card-outline'}
          size={20}
          color={card.brand === 'Visa' ? COLORS.visa : COLORS.mastercard}
        />
      </View>
      <View style={styles.cardTextContainer}>
        <View style={styles.cardNameRow}>
          <Text style={styles.cardText}>•••• {card.lastFour}</Text>
          {card.isDefault && showDefault && (
            <View style={styles.defaultBadgeSmall}>
              <Text style={styles.defaultBadgeText}>Default</Text>
            </View>
          )}
        </View>
        <Text style={styles.cardBrand}>{card.brand}</Text>
      </View>
      {card.isDefault && (
        <View style={styles.defaultBadge}>
          <View style={styles.defaultDot} />
        </View>
      )}
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
    backgroundColor: COLORS.utility.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.beige,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTextContainer: {
    flex: 1,
  },
  cardNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardText: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  cardBrand: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
  },
  defaultBadge: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.mint,
    marginRight: 8,
  },
  defaultDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.mint,
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
    color: COLORS.utility.white,
  },
});
