import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import type { PendingRequest } from './types';

interface RequestsSectionProps {
  requests: PendingRequest[];
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}

export const RequestsSection: React.FC<RequestsSectionProps> = React.memo(
  ({ requests, onAccept, onDecline }) => {
    if (requests.length === 0) {
      return (
        <View style={styles.section}>
          <View style={styles.emptyRequestsCard}>
            <MaterialCommunityIcons
              name="account-clock-outline"
              size={40}
              color={COLORS.text.secondary}
            />
            <Text style={styles.emptyRequestsText}>
              No pending requests yet
            </Text>
            <Text style={styles.emptyRequestsSubtext}>
              Share your moment to get more visibility
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>
          Pending Requests ({requests.length})
        </Text>
        {requests.map((request) => (
          <View key={request.id} style={styles.requestCard}>
            <Image
              source={{ uri: request.avatar || undefined }}
              style={styles.requestAvatar}
            />
            <View style={styles.requestInfo}>
              <Text style={styles.requestName}>{request.name}</Text>
              <Text style={styles.requestMessage} numberOfLines={1}>
                {request.message}
              </Text>
            </View>
            <View style={styles.requestActions}>
              <TouchableOpacity
                style={styles.acceptButton}
                onPress={() => onAccept(request.id)}
                accessibilityLabel={`Accept ${request.name}'s request`}
                accessibilityRole="button"
              >
                <MaterialCommunityIcons
                  name="check"
                  size={20}
                  color={COLORS.utility.white}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.declineButton}
                onPress={() => onDecline(request.id)}
                accessibilityLabel={`Decline ${request.name}'s request`}
                accessibilityRole="button"
              >
                <MaterialCommunityIcons
                  name="close"
                  size={20}
                  color={COLORS.feedback.error}
                />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    );
  },
);

RequestsSection.displayName = 'RequestsSection';

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
  requestCard: {
    alignItems: 'center',
    backgroundColor: COLORS.utility.white,
    borderColor: COLORS.border.default,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: 10,
    padding: 12,
  },
  requestAvatar: {
    borderRadius: 20,
    height: 40,
    width: 40,
  },
  requestInfo: {
    flex: 1,
    marginLeft: 12,
  },
  requestName: {
    color: COLORS.text.primary,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  requestMessage: {
    color: COLORS.text.secondary,
    fontSize: 13,
  },
  requestActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    alignItems: 'center',
    backgroundColor: COLORS.mint,
    borderRadius: 18,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  declineButton: {
    alignItems: 'center',
    backgroundColor: COLORS.utility.white,
    borderColor: COLORS.feedback.error,
    borderRadius: 18,
    borderWidth: 1.5,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  emptyRequestsCard: {
    alignItems: 'center',
    backgroundColor: COLORS.utility.white,
    borderColor: COLORS.border.default,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  emptyRequestsText: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptyRequestsSubtext: {
    color: COLORS.text.secondary,
    fontSize: 14,
    marginTop: 4,
  },
});
