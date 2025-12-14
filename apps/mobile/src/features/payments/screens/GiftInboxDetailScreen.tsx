// @ts-nocheck - TODO: Fix type errors
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ReportBlockBottomSheet } from '@/components/ReportBlockBottomSheet';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import type { RootStackParamList } from '@/navigation/AppNavigator';
import type { StackScreenProps } from '@react-navigation/stack';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

type GiftInboxDetailScreenProps = StackScreenProps<
  RootStackParamList,
  'GiftInboxDetail'
>;

export const GiftInboxDetailScreen: React.FC<GiftInboxDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const {
    senderId,
    senderName,
    senderAvatar,
    senderAge,
    senderRating,
    senderVerified,
    senderTripCount,
    senderCity,
    gifts,
    totalAmount,
    canStartChat,
  } = route.params;

  const [_isHidden, setIsHidden] = useState(false);
  const [showReportSheet, setShowReportSheet] = useState(false);

  const handleStartChat = () => {
    if (!canStartChat) {
      Alert.alert(
        'Upload Proof First',
        'You need to upload proof for pending gifts before starting a chat.',
        [{ text: 'OK' }],
      );
      return;
    }

    navigation.navigate('Chat', {
      otherUser: {
        id: senderId,
        name: senderName,
        avatar: senderAvatar,
        isVerified: senderVerified,
        type: 'traveler',
        role: 'Traveler',
        kyc: senderVerified ? 'Verified' : 'Unverified',
        location: senderCity,
      },
    });
  };

  const handleViewProfile = () => {
    navigation.navigate('ProfileDetail', { userId: senderId });
  };

  const handleHide = () => {
    Alert.alert(
      'Hide Gifts',
      `Hide all gifts from ${senderName}? This won&apos;t affect your received money.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Hide',
          style: 'destructive',
          onPress: () => {
            setIsHidden(true);
            // TODO: API call to hide
            navigation.goBack();
          },
        },
      ],
    );
  };

  const handleReport = () => {
    setShowReportSheet(true);
  };

  const handleReportSubmit = (
    action: string,
    _reason?: string,
    _details?: string,
  ) => {
    if (action === 'block') {
      Alert.alert('User Blocked', `${senderName} has been blocked.`);
    } else if (action === 'report') {
      Alert.alert(
        'Report Submitted',
        `Thank you for reporting. We&apos;ll review this within 24 hours.`,
      );
    } else if (action === 'hide') {
      setIsHidden(true);
      navigation.goBack();
    }
  };

  const handleUploadProof = (_giftId: string) => {
    navigation.navigate('ProofUpload');
  };

  const getGiftStatusInfo = (
    status: string,
  ): { icon: IconName; color: string; text: string } => {
    switch (status) {
      case 'received':
        return { icon: 'check-circle', color: COLORS.mint, text: 'Received' };
      case 'pending_proof':
        return {
          icon: 'camera-outline',
          color: COLORS.coral,
          text: 'Upload Proof',
        };
      case 'verifying':
        return {
          icon: 'timer-sand',
          color: COLORS.softOrange,
          text: 'Verifying...',
        };
      case 'verified':
        return { icon: 'check-decagram', color: COLORS.mint, text: 'Verified' };
      case 'failed':
        return { icon: 'close-circle', color: COLORS.error, text: 'Failed' };
      default:
        return { icon: 'gift-outline', color: COLORS.primary, text: 'Pending' };
    }
  };

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case 'direct':
        return 'Direct Pay';
      case 'half_escrow':
        return 'Half Escrow';
      case 'full_escrow':
        return 'Full Escrow';
      default:
        return type;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={COLORS.text}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{senderName}&apos;s Gifts</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Sender Profile Card */}
        <View style={styles.profileCard}>
          <TouchableOpacity onPress={handleViewProfile}>
            <Image source={{ uri: senderAvatar }} style={styles.avatar} />
          </TouchableOpacity>

          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>
                {senderName}, {senderAge}
              </Text>
              {senderVerified && (
                <MaterialCommunityIcons
                  name="check-decagram"
                  size={18}
                  color={COLORS.primary}
                />
              )}
            </View>

            <Text style={styles.city}>📍 {senderCity}</Text>

            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <MaterialCommunityIcons
                  name="star"
                  size={16}
                  color={COLORS.softOrange}
                />
                <Text style={styles.statText}>{senderRating}</Text>
              </View>
              <View style={styles.stat}>
                <MaterialCommunityIcons
                  name="airplane"
                  size={16}
                  color={COLORS.primary}
                />
                <Text style={styles.statText}>{senderTripCount} trips</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.viewProfileButton}
            onPress={handleViewProfile}
          >
            <Text style={styles.viewProfileText}>View Profile</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={16}
              color={COLORS.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Total Amount Card */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Received</Text>
          <Text style={styles.totalAmount}>${totalAmount}</Text>
          <Text style={styles.giftCount}>
            {gifts.length} gift{gifts.length > 1 ? 's' : ''}
          </Text>
        </View>

        {/* Gifts List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gifts</Text>

          {gifts.map((gift) => {
            const statusInfo = getGiftStatusInfo(gift.status);
            return (
              <View key={gift.id} style={styles.giftItem}>
                <View style={styles.giftHeader}>
                  <Text style={styles.giftEmoji}>{gift.momentEmoji}</Text>
                  <View style={styles.giftInfo}>
                    <Text style={styles.giftTitle}>{gift.momentTitle}</Text>
                    <Text style={styles.giftAmount}>
                      ${gift.amount} · {getPaymentTypeLabel(gift.paymentType)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.giftMessage}>
                  &quot;{gift.message}&quot;
                </Text>

                <View style={styles.giftFooter}>
                  <View style={styles.giftStatus}>
                    <MaterialCommunityIcons
                      name={statusInfo.icon}
                      size={16}
                      color={statusInfo.color}
                    />
                    <Text
                      style={[
                        styles.giftStatusText,
                        { color: statusInfo.color },
                      ]}
                    >
                      {statusInfo.text}
                    </Text>
                  </View>

                  {gift.status === 'pending_proof' && (
                    <TouchableOpacity
                      style={styles.uploadButton}
                      onPress={() => handleUploadProof(gift.id)}
                    >
                      <MaterialCommunityIcons
                        name="camera"
                        size={16}
                        color={COLORS.white}
                      />
                      <Text style={styles.uploadButtonText}>Upload</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[
              styles.startChatButton,
              !canStartChat && styles.startChatButtonDisabled,
            ]}
            onPress={handleStartChat}
          >
            <MaterialCommunityIcons
              name="message-outline"
              size={20}
              color={canStartChat ? COLORS.white : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.startChatText,
                !canStartChat && styles.startChatTextDisabled,
              ]}
            >
              {canStartChat
                ? `Start Chat with ${senderName}`
                : 'Upload proof to start chat'}
            </Text>
          </TouchableOpacity>

          <View style={styles.secondaryActions}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleHide}
            >
              <MaterialCommunityIcons
                name="eye-off-outline"
                size={20}
                color={COLORS.textSecondary}
              />
              <Text style={styles.secondaryButtonText}>Hide</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleReport}
            >
              <MaterialCommunityIcons
                name="flag-outline"
                size={20}
                color={COLORS.error}
              />
              <Text
                style={[styles.secondaryButtonText, { color: COLORS.error }]}
              >
                Report
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <MaterialCommunityIcons
            name="information-outline"
            size={20}
            color={COLORS.primary}
          />
          <Text style={styles.infoText}>
            Starting a chat won&apos;t affect your received gifts. You can chat
            freely once you upload proof for any escrow gifts.
          </Text>
        </View>
      </ScrollView>

      {/* Report/Block Bottom Sheet */}
      <ReportBlockBottomSheet
        visible={showReportSheet}
        onClose={() => setShowReportSheet(false)}
        onSubmit={handleReportSubmit}
        targetType="user"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    ...TYPOGRAPHY.h4,
    fontWeight: '600',
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  name: {
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
    color: COLORS.text,
  },
  city: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  viewProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    top: 20,
    right: 20,
  },
  viewProfileText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: '500',
  },
  totalCard: {
    backgroundColor: COLORS.primary + '15',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  totalLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  totalAmount: {
    ...TYPOGRAPHY.display1,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  giftCount: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  giftItem: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  giftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  giftEmoji: {
    ...TYPOGRAPHY.display2,
    marginRight: 12,
  },
  giftInfo: {
    flex: 1,
  },
  giftTitle: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.text,
  },
  giftAmount: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  giftMessage: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text,
    fontStyle: 'italic',
    marginBottom: 12,
    paddingLeft: 44,
  },
  giftFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 44,
  },
  giftStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  giftStatusText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '500',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.coral,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  uploadButtonText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: COLORS.white,
  },
  actionsSection: {
    marginBottom: 20,
  },
  startChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    gap: 8,
    marginBottom: 12,
  },
  startChatButtonDisabled: {
    backgroundColor: COLORS.border,
  },
  startChatText: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.white,
  },
  startChatTextDisabled: {
    color: COLORS.textSecondary,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  secondaryButtonText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary + '10',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    lineHeight: 18,
  },
});

export default GiftInboxDetailScreen;
