import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '@/constants/colors';
import type { RequestItem } from '../types/requests.types';
import type { NavigationProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/routeParams';

interface RequestCardProps {
  item: RequestItem;
  onAccept: (item: RequestItem) => void;
  onDecline: (item: RequestItem) => void;
}

export const RequestCard = ({ item, onAccept, onDecline }: RequestCardProps) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  return (
    <View style={styles.requestCard}>
      {/* Header */}
      <View style={styles.cardHeader}>
        <TouchableOpacity
          onPress={() => navigation.navigate('ProfileDetail', { userId: item.person.id })}
          style={styles.avatarContainer}
        >
          <Image source={{ uri: item.person.avatar }} style={styles.avatar} />
          {item.person.isVerified && (
            <View style={styles.verifiedBadge}>
              <MaterialCommunityIcons name="check-decagram" size={12} color={COLORS.brand.primary} />
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
            <MaterialCommunityIcons name="star" size={12} color={COLORS.gold} />
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
              name={item.proofUploaded ? 'check-circle' : 'alert-circle-outline'}
              size={14}
              color={item.proofUploaded ? COLORS.feedback.success : COLORS.feedback.warning}
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
          <TouchableOpacity style={styles.declineButton} onPress={() => onDecline(item)}>
            <Text style={styles.declineButtonText}>Decline</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.acceptButton,
              item.proofRequired && !item.proofUploaded && styles.acceptButtonDisabled,
            ]}
            onPress={() => onAccept(item)}
          >
            <Text style={styles.acceptButtonText}>
              {item.proofRequired && !item.proofUploaded ? 'Upload Proof' : 'Accept'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  requestCard: {
    backgroundColor: COLORS.utility.white,
    borderRadius: 12,
    marginBottom: 8,
    padding: 12,
    shadowColor: COLORS.utility.black,
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
    backgroundColor: COLORS.utility.white,
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
    color: COLORS.text.primary,
  },
  categoryInline: {
    fontSize: 13,
    color: COLORS.text.secondary,
    marginLeft: 8,
  },
  newDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.brand.primary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    color: COLORS.text.secondary,
    fontSize: 12,
  },
  separator: {
    color: COLORS.text.secondary,
    fontSize: 12,
  },
  city: {
    color: COLORS.text.secondary,
    fontSize: 13,
  },
  timeAgo: {
    color: COLORS.text.secondary,
    fontSize: 12,
  },
  amountBadge: {
    backgroundColor: `${COLORS.brand.primary}15`,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  amountText: {
    color: COLORS.brand.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  message: {
    color: COLORS.text.secondary,
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
    backgroundColor: `${COLORS.feedback.warning}15`,
    borderRadius: 6,
  },
  proofUploadedCompact: {
    backgroundColor: `${COLORS.feedback.success}15`,
  },
  proofTextCompact: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.feedback.warning,
  },
  proofTextUploadedCompact: {
    color: COLORS.feedback.success,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  declineButton: {
    alignItems: 'center',
    backgroundColor: COLORS.bg.secondary,
    borderRadius: 8,
    flex: 1,
    paddingVertical: 10,
  },
  declineButtonText: {
    color: COLORS.text.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
  acceptButton: {
    alignItems: 'center',
    backgroundColor: COLORS.brand.primary,
    borderRadius: 8,
    flex: 1,
    paddingVertical: 10,
  },
  acceptButtonDisabled: {
    backgroundColor: COLORS.feedback.warning,
  },
  acceptButtonText: {
    color: COLORS.utility.white,
    fontSize: 14,
    fontWeight: '600',
  },
});
