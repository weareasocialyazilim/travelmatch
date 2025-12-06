import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

interface ActionBarProps {
  isOwner: boolean;
  isCompleted: boolean;
  price: number;
  onGift: () => void;
  onCreateSimilar: () => void;
}

export const ActionBar: React.FC<ActionBarProps> = React.memo(
  ({ isOwner, isCompleted, price, onGift, onCreateSimilar }) => {
    // Hide for active owner
    if (isOwner && !isCompleted) {
      return null;
    }

    return (
      <View style={styles.bottomBar}>
        {isOwner && isCompleted ? (
          // Completed owner - Create Similar button
          <TouchableOpacity
            style={styles.createSimilarButton}
            onPress={onCreateSimilar}
            accessibilityLabel="Create similar moment"
            accessibilityRole="button"
          >
            <MaterialCommunityIcons
              name="plus"
              size={20}
              color={COLORS.white}
            />
            <Text style={styles.createSimilarText}>Create Similar Moment</Text>
          </TouchableOpacity>
        ) : (
          // Guest view - gift the moment
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={onGift}
            accessibilityLabel={`Gift this moment for ${price} dollars`}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>Gift this moment</Text>
            <View style={styles.buttonBadge}>
              <Text style={styles.badgeText}>${price}</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  },
);

ActionBar.displayName = 'ActionBar';

const styles = StyleSheet.create({
  bottomBar: {
    backgroundColor: COLORS.white,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: COLORS.mint,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  buttonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
  },
  buttonBadge: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
  },
  createSimilarButton: {
    alignItems: 'center',
    backgroundColor: COLORS.mint,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  createSimilarText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
