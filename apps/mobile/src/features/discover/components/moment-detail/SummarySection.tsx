import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';

interface SummarySectionProps {
  totalEarned: number;
  guestCount: number;
  rating: number;
}

export const SummarySection: React.FC<SummarySectionProps> = React.memo(
  ({ totalEarned, guestCount, rating }) => {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Summary</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <MaterialCommunityIcons name="cash" size={24} color={COLORS.mint} />
            <Text style={styles.summaryValue}>${totalEarned}</Text>
            <Text style={styles.summaryLabel}>Total Earned</Text>
          </View>
          <View style={styles.summaryCard}>
            <MaterialCommunityIcons
              name="account-group"
              size={24}
              color={COLORS.mint}
            />
            <Text style={styles.summaryValue}>{guestCount}</Text>
            <Text style={styles.summaryLabel}>Guests</Text>
          </View>
          <View style={styles.summaryCard}>
            <MaterialCommunityIcons
              name="star"
              size={24}
              color={COLORS.feedback.warning}
            />
            <Text style={styles.summaryValue}>{rating.toFixed(1)}</Text>
            <Text style={styles.summaryLabel}>Rating</Text>
          </View>
        </View>
      </View>
    );
  },
);

SummarySection.displayName = 'SummarySection';

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    color: COLORS.text.primary,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    alignItems: 'center',
    backgroundColor: COLORS.utility.white,
    borderColor: COLORS.border.default,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  summaryValue: {
    color: COLORS.text.primary,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
  },
  summaryLabel: {
    color: COLORS.text.secondary,
    fontSize: 12,
    marginTop: 4,
  },
});
