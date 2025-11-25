import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../constants/colors';
import { VALUES } from '../constants/values';
import { LAYOUT } from '../constants/layout';
import { GiverSlot } from '../types';
import { MOCK_SLOTS } from '../mocks';

export const ReceiverApprovalScreenV2: React.FC<{ navigation: any; route: any }> = ({
  navigation,
  route,
}) => {
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const momentTitle = route.params?.momentTitle || 'Coffee for a Stranger';
  const totalAmount = route.params?.totalAmount || 50;

  const toggleSlot = (slotId: string) => {
    if (selectedSlots.includes(slotId)) {
      setSelectedSlots(selectedSlots.filter((id) => id !== slotId));
    } else {
      setSelectedSlots([...selectedSlots, slotId]);
    }
  };

  const handleApprove = async () => {
    if (selectedSlots.length === 0) {
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      
      const approvedGivers = MOCK_SLOTS.filter((slot) =>
        selectedSlots.includes(slot.id)
      ).map((slot) => ({
        id: slot.giver.id,
        name: slot.giver.name,
        avatar: slot.giver.avatar,
        amount: slot.amount,
      }));
      
      navigation.navigate('MatchConfirmation', {
        selectedGivers: approvedGivers,
      });
    }, 1500);
  };

  const handleRejectAll = () => {
    navigation.goBack();
  };

  const selectedTotalAmount = MOCK_SLOTS.filter((slot) =>
    selectedSlots.includes(slot.id)
  ).reduce((sum, slot) => sum + slot.amount, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.accent]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Approve Givers</Text>
          <View style={styles.headerSpacer} />
        </View>
        <Text style={styles.headerSubtitle}>{momentTitle}</Text>
      </LinearGradient>

      {/* Selection Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total Needed</Text>
            <Text style={styles.summaryValue}>${totalAmount}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Selected</Text>
            <Text style={[styles.summaryValue, styles.selectedValue]}>
              ${selectedTotalAmount}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Givers</Text>
            <Text style={styles.summaryValue}>
              {selectedSlots.length}/{MOCK_SLOTS.length}
            </Text>
          </View>
        </View>

        {selectedTotalAmount >= totalAmount && (
          <View style={styles.successBanner}>
            <Icon name="check-circle" size={20} color={COLORS.success} />
            <Text style={styles.successText}>Amount fulfilled!</Text>
          </View>
        )}
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Icon name="information" size={20} color={COLORS.info} />
        <Text style={styles.infoText}>
          Select one or more givers to approve. You can choose multiple givers to
          split the cost or select the one that best fits your needs.
        </Text>
      </View>

      {/* Giver Slots */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Available Givers</Text>

        {MOCK_SLOTS.map((slot) => {
          const isSelected = selectedSlots.includes(slot.id);
          return (
            <TouchableOpacity
              key={slot.id}
              style={[styles.slotCard, isSelected && styles.slotCardSelected]}
              onPress={() => toggleSlot(slot.id)}
              activeOpacity={0.8}
            >
              {/* Position Badge */}
              <View style={styles.positionBadge}>
                <Text style={styles.positionText}>#{slot.position}</Text>
              </View>

              {/* Selection Indicator */}
              {isSelected && (
                <View style={styles.selectedBadge}>
                  <Icon name="check-circle" size={24} color={COLORS.success} />
                </View>
              )}

              <View style={styles.slotContent}>
                {/* Giver Info */}
                <View style={styles.giverInfo}>
                  <Image
                    source={{ uri: slot.giver.avatar }}
                    style={styles.giverAvatar}
                  />
                  <View style={styles.giverDetails}>
                    <Text style={styles.giverName}>{slot.giver.name}</Text>
                    <View style={styles.trustBadge}>
                      <Icon name="shield-check" size={14} color={COLORS.success} />
                      <Text style={styles.trustScore}>
                        {slot.giver.trustScore}% Trust
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Amount */}
                <View style={styles.amountContainer}>
                  <Text style={styles.amountLabel}>Offer</Text>
                  <Text style={styles.amountValue}>${slot.amount}</Text>
                </View>

                {/* Message */}
                <View style={styles.messageContainer}>
                  <Icon name="message-text" size={16} color={COLORS.textSecondary} />
                  <Text style={styles.messageText}>{slot.message}</Text>
                </View>

                {/* Timestamp */}
                <Text style={styles.timestamp}>{slot.timestamp}</Text>

                {/* View Profile */}
                <TouchableOpacity
                  style={styles.profileButton}
                  onPress={() =>
                    navigation.navigate('ProfileDetail', { userId: slot.giver.id })
                  }
                >
                  <Text style={styles.profileButtonText}>View Profile</Text>
                  <Icon name="chevron-right" size={16} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* Empty State */}
        {MOCK_SLOTS.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="account-off" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyTitle}>No Givers Yet</Text>
            <Text style={styles.emptySubtitle}>
              Waiting for kind people to offer support
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={styles.rejectButton}
          onPress={handleRejectAll}
          activeOpacity={0.8}
        >
          <Text style={styles.rejectButtonText}>Reject All</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.approveButton,
            selectedSlots.length === 0 && styles.approveButtonDisabled,
          ]}
          onPress={handleApprove}
          disabled={loading || selectedSlots.length === 0}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.accent]}
            style={styles.approveButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {loading ? (
              <Text style={styles.approveButtonText}>Processing...</Text>
            ) : (
              <>
                <Icon name="check" size={20} color={COLORS.white} />
                <Text style={styles.approveButtonText}>
                  Approve {selectedSlots.length > 0 && `(${selectedSlots.length})`}
                </Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: LAYOUT.padding * 2,
    paddingTop: LAYOUT.padding * 2,
    paddingBottom: LAYOUT.padding * 3,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: LAYOUT.padding,
  },
  backButton: {
    padding: LAYOUT.padding / 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
  },
  headerSpacer: {
    width: 40,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    opacity: 0.9,
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: LAYOUT.padding * 2,
    marginTop: -LAYOUT.padding * 2,
    borderRadius: VALUES.borderRadius,
    padding: LAYOUT.padding * 1.5,
    ...VALUES.shadow,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: LAYOUT.padding / 2,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
  },
  selectedValue: {
    color: COLORS.primary,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: LAYOUT.padding,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.success + '20',
    paddingVertical: LAYOUT.padding,
    borderRadius: VALUES.borderRadius / 2,
    marginTop: LAYOUT.padding,
  },
  successText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.success,
    marginLeft: LAYOUT.padding / 2,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.info + '20',
    marginHorizontal: LAYOUT.padding * 2,
    marginTop: LAYOUT.padding * 2,
    padding: LAYOUT.padding * 1.5,
    borderRadius: VALUES.borderRadius,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.text,
    marginLeft: LAYOUT.padding,
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: LAYOUT.padding * 2,
    paddingTop: LAYOUT.padding * 2,
    paddingBottom: LAYOUT.padding * 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: LAYOUT.padding * 1.5,
  },
  slotCard: {
    backgroundColor: COLORS.white,
    borderRadius: VALUES.borderRadius,
    padding: LAYOUT.padding * 1.5,
    marginBottom: LAYOUT.padding * 1.5,
    borderWidth: 2,
    borderColor: COLORS.border,
    position: 'relative',
    ...VALUES.shadow,
  },
  slotCardSelected: {
    borderColor: COLORS.success,
    backgroundColor: COLORS.success + '10',
  },
  positionBadge: {
    position: 'absolute',
    top: LAYOUT.padding,
    right: LAYOUT.padding,
    backgroundColor: COLORS.primary,
    paddingHorizontal: LAYOUT.padding,
    paddingVertical: LAYOUT.padding / 2,
    borderRadius: VALUES.borderRadius / 2,
  },
  positionText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
  selectedBadge: {
    position: 'absolute',
    top: LAYOUT.padding,
    left: LAYOUT.padding,
    zIndex: 1,
  },
  slotContent: {
    marginTop: LAYOUT.padding / 2,
  },
  giverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: LAYOUT.padding * 1.5,
  },
  giverAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  giverDetails: {
    flex: 1,
    marginLeft: LAYOUT.padding,
  },
  giverName: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: LAYOUT.padding / 2,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trustScore: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.success,
    marginLeft: LAYOUT.padding / 2,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: LAYOUT.padding,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    marginBottom: LAYOUT.padding,
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  amountValue: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: LAYOUT.padding,
  },
  messageText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.text,
    marginLeft: LAYOUT.padding / 2,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: LAYOUT.padding,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: LAYOUT.padding,
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  profileButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginRight: LAYOUT.padding / 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: LAYOUT.padding * 6,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: LAYOUT.padding * 2,
    marginBottom: LAYOUT.padding,
  },
  emptySubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: LAYOUT.padding * 2,
    paddingVertical: LAYOUT.padding * 1.5,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  rejectButton: {
    flex: 1,
    paddingVertical: LAYOUT.padding * 1.5,
    borderWidth: 2,
    borderColor: COLORS.error,
    borderRadius: VALUES.borderRadius,
    alignItems: 'center',
    marginRight: LAYOUT.padding,
  },
  rejectButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.error,
  },
  approveButton: {
    flex: 2,
    borderRadius: VALUES.borderRadius,
    overflow: 'hidden',
  },
  approveButtonDisabled: {
    opacity: 0.5,
  },
  approveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: LAYOUT.padding * 1.5,
  },
  approveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.white,
    marginLeft: LAYOUT.padding / 2,
  },
});
