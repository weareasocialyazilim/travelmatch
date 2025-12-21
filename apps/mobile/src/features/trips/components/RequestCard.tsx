import React, { memo } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '@/constants/colors';
import type { RequestItem } from '../types/requests.types';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/AppNavigator';

interface RequestCardProps {
  item: RequestItem;
  onAccept: (item: RequestItem) => void;
  onDecline: (item: RequestItem) => void;
}

export const RequestCard = memo(
  ({ item, onAccept, onDecline }: RequestCardProps) => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();

    return (
      <View style={styles.requestCard}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('ProfileDetail', { userId: item.person.id })
            }
            style={styles.avatarContainer}
          >
            <Image source={{ uri: item.person.avatar }} style={styles.avatar} />
            {item.person.isVerified && (
              <View style={styles.verifiedBadge}>
                <MaterialCommunityIcons
                  name="check-decagram"
                  size={12}
                  color={COLORS.primary}
                />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.personName}>
                {item.person.name}, {item.person.age}
              </Text>
              <Text style={styles.categoryInline}>
                {item.momentEmoji} {item.momentTitle}
              </Text>
              {item.isNew && <View style={styles.newDot} />}
            </View>
            <View style={styles.metaRow}>
              <MaterialCommunityIcons
                name="star"
                size={12}
                color={COLORS.gold}
              />
              <Text style={styles.rating}>{item.person.rating}</Text>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.city}>{item.person.city}</Text>
              <Text style={styles.separator}>•</Text>
              <Text style={styles.timeAgo}>{item.timeAgo}</Text>
            </View>
          </View>

          <View style={styles.amountBadge}>
            <Text style={styles.amountText}>€{item.amount}</Text>
          </View>
        </View>

        {/* Message */}
        <Text style={styles.message} numberOfLines={1}>
          &quot;{item.message}&quot;
        </Text>

        {/* Actions Row */}
        <View style={styles.actionsRow}>
          {item.proofRequired && (
            <View
              style={[
                styles.proofStatusCompact,
                item.proofUploaded && styles.proofUploadedCompact,
              ]}
            >
              <MaterialCommunityIcons
                name={
                  item.proofUploaded ? 'check-circle' : 'alert-circle-outline'
                }
                size={14}
                color={item.proofUploaded ? COLORS.success : COLORS.warning}
              />
              <Text
                style={[
                  styles.proofTextCompact,
                  item.proofUploaded && styles.proofTextUploadedCompact,
                ]}
              >
                {item.proofUploaded ? 'Proof Uploaded' : 'Proof Required'}
              </Text>
            </View>
          )}

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.declineButton}
              onPress={() => onDecline(item)}
            >
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.acceptButton,
                item.proofRequired &&
                  !item.proofUploaded &&
                  styles.acceptButtonDisabled,
              ]}
              onPress={() => onAccept(item)}
            >
              <Text style={styles.acceptButtonText}>
                {item.proofRequired && !item.proofUploaded
                  ? 'Upload Proof'
                  : 'Accept'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  requestCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 8,
    padding: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    borderRadius: 20,
    height: 40,
    width: 40,
  },
  verifiedBadge: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    bottom: -2,
    position: 'absolute',
    right: -2,
  },
  headerInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  personName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  categoryInline: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  newDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  separator: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  city: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  timeAgo: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  amountBadge: {
    backgroundColor: `${COLORS.primary}15`,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  amountText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  message: {
    color: COLORS.textSecondary,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
    marginBottom: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  proofStatusCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: `${COLORS.warning}15`,
    borderRadius: 6,
  },
  proofUploadedCompact: {
    backgroundColor: `${COLORS.success}15`,
  },
  proofTextCompact: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.warning,
  },
  proofTextUploadedCompact: {
    color: COLORS.success,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  declineButton: {
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 8,
    flex: 1,
    paddingVertical: 10,
  },
  declineButtonText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  acceptButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    flex: 1,
    paddingVertical: 10,
  },
  acceptButtonDisabled: {
    backgroundColor: COLORS.warning,
  },
  acceptButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
});

RequestCard.displayName = 'RequestCard';
