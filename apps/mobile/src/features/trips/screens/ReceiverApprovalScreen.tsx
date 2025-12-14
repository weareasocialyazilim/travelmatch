// @ts-nocheck - TODO: Fix type errors
import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LoadingState } from '@/components/LoadingState';
import { supabase } from '@/config/supabase';
import { COLORS } from '@/constants/colors';
import { LAYOUT } from '@/constants/layout';
import { VALUES } from '@/constants/values';
import { logger } from '@/utils/logger';

interface GiverSlot {
  id: string;
  amount: number;
  giver: {
    id: string;
    name: string;
    avatar: string;
  };
}

export const ReceiverApprovalScreen: React.FC<{
  navigation: {
    navigate: (route: string, params: { [key: string]: unknown }) => void;
    goBack: () => void;
  };
  route: {
    params: { momentTitle: string; totalAmount: number; momentId: string };
  };
}> = ({ navigation, route }) => {
  const [slots, setSlots] = useState<GiverSlot[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const momentTitle = route.params?.momentTitle || 'Moment';
  const totalAmount = route.params?.totalAmount || 0;
  const momentId = route.params?.momentId;

  React.useEffect(() => {
    const fetchRequests = async () => {
      if (!momentId) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('requests')
          .select(
            `
            id,
            total_price,
            requester:profiles!user_id(id, full_name, avatar_url)
          `,
          )
          .eq('moment_id', momentId)
          .eq('status', 'pending');

        if (error) throw error;

        const mappedSlots: GiverSlot[] = (data || []).map((item: any) => ({
          id: item.id,
          amount: item.total_price,
          giver: {
            id: item.requester?.id,
            name: item.requester?.full_name || 'Unknown',
            avatar: item.requester?.avatar_url,
          },
        }));
        setSlots(mappedSlots);
      } catch (err) {
        logger.error('Error fetching requests', err as Error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, [momentId]);

  const toggleSlot = (slotId: string) => {
    if (selectedSlots.includes(slotId)) {
      setSelectedSlots(selectedSlots.filter((id) => id !== slotId));
    } else {
      setSelectedSlots([...selectedSlots, slotId]);
    }
  };

  const handleApprove = async () => {
    if (selectedSlots.length === 0) return;

    setLoading(true);
    try {
      // Update status to accepted for selected
      const { error } = await supabase
        .from('requests')
        .update({ status: 'accepted' })
        .in('id', selectedSlots);

      if (error) throw error;

      const approvedGivers = slots
        .filter((slot) => selectedSlots.includes(slot.id))
        .map((slot) => ({
          id: slot.giver.id,
          name: slot.giver.name,
          avatar: slot.giver.avatar,
          amount: slot.amount,
        }));

      navigation.navigate('MatchConfirmation', {
        selectedGivers: approvedGivers,
      });
    } catch (err) {
      logger.error('Error approving requests', err as Error);
      // Show error alert
    } finally {
      setLoading(false);
    }
  };

  const handleRejectAll = () => {
    navigation.goBack();
  };

  const selectedTotalAmount = slots
    .filter((slot) => selectedSlots.includes(slot.id))
    .reduce((sum, slot) => sum + slot.amount, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {loading && <LoadingState type="overlay" message="Processing..." />}
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
              {selectedSlots.length}/{slots.length}
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
          Select one or more givers to approve. You can choose multiple givers
          to split the cost or select the one that best fits your needs.
        </Text>
      </View>

      {/* Giver Slots */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>Available Givers</Text>

        {slots.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No pending requests found.
            </Text>
          </View>
        ) : (
          slots.map((slot, index) => {
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
                  <Text style={styles.positionText}>#{index + 1}</Text>
                </View>

                {/* Selection Indicator */}
                {isSelected && (
                  <View style={styles.selectedBadge}>
                    <Icon
                      name="check-circle"
                      size={24}
                      color={COLORS.success}
                    />
                  </View>
                )}

                <View style={styles.slotContent}>
                  {/* Giver Info */}
                  <View style={styles.giverInfo}>
                    <Image
                      source={{
                        uri:
                          slot.giver.avatar ||
                          'https://via.placeholder.com/150',
                      }}
                      style={styles.giverAvatar}
                    />
                    <View style={styles.giverDetails}>
                      <Text style={styles.giverName}>{slot.giver.name}</Text>
                      <View style={styles.trustBadge}>
                        <Icon
                          name="shield-check"
                          size={14}
                          color={COLORS.success}
                        />
                        <Text style={styles.trustScore}>100% Trust</Text>
                      </View>
                    </View>
                  </View>

                  {/* Amount */}
                  <View style={styles.amountContainer}>
                    <Text style={styles.amountLabel}>Offer</Text>
                    <Text style={styles.amountValue}>${slot.amount}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
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
            <>
              <Icon name="check" size={20} color={COLORS.white} />
              <Text style={styles.approveButtonText}>
                Approve{' '}
                {selectedSlots.length > 0 && `(${selectedSlots.length})`}
              </Text>
            </>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  amountContainer: {
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: COLORS.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: LAYOUT.padding,
    paddingVertical: LAYOUT.padding,
  },
  amountLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  amountValue: {
    color: COLORS.primary,
    fontSize: 24,
    fontWeight: '800',
  },
  approveButton: {
    borderRadius: VALUES.borderRadius,
    flex: 2,
    overflow: 'hidden',
  },
  approveButtonDisabled: {
    opacity: 0.5,
  },
  approveButtonGradient: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: LAYOUT.padding * 1.5,
  },
  approveButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    marginLeft: LAYOUT.padding / 2,
  },
  backButton: {
    padding: LAYOUT.padding / 2,
  },
  bottomActions: {
    backgroundColor: COLORS.white,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: LAYOUT.padding * 2,
    paddingVertical: LAYOUT.padding * 1.5,
  },
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: LAYOUT.padding * 6,
  },
  emptySubtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: LAYOUT.padding,
    marginTop: LAYOUT.padding * 2,
  },
  giverAvatar: {
    borderColor: COLORS.border,
    borderRadius: 30,
    borderWidth: 2,
    height: 60,
    width: 60,
  },
  giverDetails: {
    flex: 1,
    marginLeft: LAYOUT.padding,
  },
  giverInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: LAYOUT.padding * 1.5,
  },
  giverName: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: LAYOUT.padding / 2,
  },
  header: {
    paddingBottom: LAYOUT.padding * 3,
    paddingHorizontal: LAYOUT.padding * 2,
    paddingTop: LAYOUT.padding * 2,
  },
  headerSpacer: {
    width: 40,
  },
  headerSubtitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.9,
    textAlign: 'center',
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: '800',
  },
  headerTop: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: LAYOUT.padding,
  },
  infoCard: {
    backgroundColor: COLORS.info + '20',
    borderRadius: VALUES.borderRadius,
    flexDirection: 'row',
    marginHorizontal: LAYOUT.padding * 2,
    marginTop: LAYOUT.padding * 2,
    padding: LAYOUT.padding * 1.5,
  },
  infoText: {
    color: COLORS.text,
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    marginLeft: LAYOUT.padding,
  },
  messageContainer: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    marginBottom: LAYOUT.padding,
  },
  messageText: {
    color: COLORS.text,
    flex: 1,
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    marginLeft: LAYOUT.padding / 2,
  },
  positionBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: VALUES.borderRadius / 2,
    paddingHorizontal: LAYOUT.padding,
    paddingVertical: LAYOUT.padding / 2,
    position: 'absolute',
    right: LAYOUT.padding,
    top: LAYOUT.padding,
  },
  positionText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  profileButton: {
    alignItems: 'center',
    borderColor: COLORS.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: LAYOUT.padding,
  },
  profileButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
    marginRight: LAYOUT.padding / 2,
  },
  rejectButton: {
    alignItems: 'center',
    borderColor: COLORS.error,
    borderRadius: VALUES.borderRadius,
    borderWidth: 2,
    flex: 1,
    marginRight: LAYOUT.padding,
    paddingVertical: LAYOUT.padding * 1.5,
  },
  rejectButtonText: {
    color: COLORS.error,
    fontSize: 16,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: LAYOUT.padding * 4,
    paddingHorizontal: LAYOUT.padding * 2,
    paddingTop: LAYOUT.padding * 2,
  },
  scrollView: {
    flex: 1,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: LAYOUT.padding * 1.5,
  },
  selectedBadge: {
    left: LAYOUT.padding,
    position: 'absolute',
    top: LAYOUT.padding,
    zIndex: 1,
  },
  selectedValue: {
    color: COLORS.primary,
  },
  slotCard: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
    borderRadius: VALUES.borderRadius,
    borderWidth: 2,
    marginBottom: LAYOUT.padding * 1.5,
    padding: LAYOUT.padding * 1.5,
    position: 'relative',
  },
  slotCardSelected: {
    backgroundColor: COLORS.success + '10',
    borderColor: COLORS.success,
  },
  slotContent: {
    marginTop: LAYOUT.padding / 2,
  },
  successBanner: {
    alignItems: 'center',
    backgroundColor: COLORS.success + '20',
    borderRadius: VALUES.borderRadius / 2,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: LAYOUT.padding,
    paddingVertical: LAYOUT.padding,
  },
  successText: {
    color: COLORS.success,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: LAYOUT.padding / 2,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: VALUES.borderRadius,
    marginHorizontal: LAYOUT.padding * 2,
    marginTop: -LAYOUT.padding * 2,
    padding: LAYOUT.padding * 1.5,
  },
  summaryDivider: {
    backgroundColor: COLORS.border,
    marginHorizontal: LAYOUT.padding,
    width: 1,
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    marginBottom: LAYOUT.padding / 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryValue: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '800',
  },
  timestamp: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    marginBottom: LAYOUT.padding,
  },
  trustBadge: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  trustScore: {
    color: COLORS.success,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: LAYOUT.padding / 2,
  },
});
