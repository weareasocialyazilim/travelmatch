import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';

export interface Contributor {
  userId: string;
  name: string;
  avatar?: string;
  isAnonymous?: boolean;
}

interface ContributorSlotsSectionProps {
  price: number;
  contributors: Contributor[];
  currentCount: number;
  maxContributors: number | null;
}

export const ContributorSlotsSection: React.FC<ContributorSlotsSectionProps> = React.memo(
  ({ price, contributors, currentCount, maxContributors }) => {
    // Only show for 100+ TL moments (3 max contributors)
    if (price < 100 || maxContributors === null) {
      return null;
    }

    const slotsRemaining = Math.max(0, maxContributors - currentCount);
    const isFull = slotsRemaining === 0;

    // Create slot indicators
    const slots = Array.from({ length: maxContributors }, (_, index) => {
      const contributor = contributors[index];
      return { filled: !!contributor, contributor };
    });

    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <MaterialCommunityIcons
            name="account-group"
            size={20}
            color={COLORS.primary}
          />
          <Text style={styles.title}>Destekçi Slotları</Text>
          <View style={[styles.badge, isFull && styles.badgeFull]}>
            <Text style={[styles.badgeText, isFull && styles.badgeTextFull]}>
              {isFull ? 'Dolu' : `${slotsRemaining} kaldı`}
            </Text>
          </View>
        </View>

        <View style={styles.slotsRow}>
          {slots.map((slot, index) => (
            <View key={index} style={styles.slotContainer}>
              {slot.filled && slot.contributor ? (
                <View style={styles.filledSlot}>
                  {slot.contributor.isAnonymous ? (
                    <View style={styles.anonymousAvatar}>
                      <MaterialCommunityIcons
                        name="incognito"
                        size={24}
                        color={COLORS.text.secondary}
                      />
                    </View>
                  ) : (
                    <Image
                      source={{
                        uri: slot.contributor.avatar || 'https://via.placeholder.com/48',
                      }}
                      style={styles.contributorAvatar}
                    />
                  )}
                  <Text style={styles.contributorName} numberOfLines={1}>
                    {slot.contributor.isAnonymous ? 'Anonim' : slot.contributor.name}
                  </Text>
                </View>
              ) : (
                <View style={styles.emptySlot}>
                  <View style={styles.emptyAvatar}>
                    <MaterialCommunityIcons
                      name="plus"
                      size={24}
                      color={COLORS.text.tertiary}
                    />
                  </View>
                  <Text style={styles.emptyText}>Boş</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <Text style={styles.infoText}>
          💡 100₺+ hediyeler en fazla 3 kişi tarafından desteklenebilir
        </Text>
      </View>
    );
  },
);

ContributorSlotsSection.displayName = 'ContributorSlotsSection';

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.bg.secondary,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  badge: {
    backgroundColor: COLORS.mint + '20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeFull: {
    backgroundColor: COLORS.coral + '20',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.mint,
  },
  badgeTextFull: {
    color: COLORS.coral,
  },
  slotsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  slotContainer: {
    alignItems: 'center',
    width: 80,
  },
  filledSlot: {
    alignItems: 'center',
  },
  contributorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: COLORS.mint,
    marginBottom: 6,
  },
  anonymousAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.bg.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  contributorName: {
    fontSize: 12,
    color: COLORS.text.primary,
    fontWeight: '500',
    textAlign: 'center',
  },
  emptySlot: {
    alignItems: 'center',
  },
  emptyAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: COLORS.border.light,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    backgroundColor: COLORS.bg.primary,
  },
  emptyText: {
    fontSize: 12,
    color: COLORS.text.tertiary,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: 4,
  },
});
