import React, { useState, useMemo } from 'react';
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
import { ReportBlockBottomSheet } from '@/features/moderation';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { StackScreenProps } from '@react-navigation/stack';
import { useToast } from '@/context/ToastContext';
import { useConfirmation } from '@/context/ConfirmationContext';
import { profileApi } from '@/features/profile/services/profileService';
import { logger } from '@/utils/logger';
import {
  determineChatTier,
  type ChatTier,
  messagesApi,
} from '@/features/messages/services/messagesService';
import {
  ChatUnlockButton,
  GratitudeButton,
} from '@/features/messages/components';

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

type GiftInboxDetailScreenProps = StackScreenProps<
  RootStackParamList,
  'GiftInboxDetail'
>;

// Subscription tier configuration for badge display
const TIER_CONFIG: Record<
  string,
  { label: string; icon: IconName; color: string }
> = {
  free: { label: 'Free', icon: 'account', color: COLORS.text.tertiary },
  premium: { label: 'PREMIUM', icon: 'star', color: '#7B61FF' },
  platinum: { label: 'PLATINUM', icon: 'crown', color: '#FFB800' },
};

// Category to camera mode mapping for proof flow
const CATEGORY_CAMERA_MODES: Record<string, string> = {
  gastronomy: 'food',
  dining: 'food',
  cafe: 'food',
  travel: 'landscape',
  adventure: 'landscape',
  shopping: 'product',
  experience: 'selfie',
  wellness: 'selfie',
};

export const GiftInboxDetailScreen: React.FC<GiftInboxDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const { showToast: _showToast } = useToast();
  const { showConfirmation: _showConfirmation } = useConfirmation();
  const {
    senderId,
    senderName,
    senderAvatar,
    senderTrustScore,
    senderSubscriptionTier,
    senderMomentCount,
    senderVerified,
    senderCity,
    gifts,
    pendingOffers,
    totalAmount,
    canStartChat,
  } = route.params;

  const [_isHidden, setIsHidden] = useState(false);
  const [isHiding, setIsHiding] = useState(false);
  const [showReportSheet, setShowReportSheet] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [chatApproved, setChatApproved] = useState(canStartChat);
  const [gratitudeSent, setGratitudeSent] = useState(false);

  // Check if sender has any high-value offers (for chat unlock incentive)
  // NEW: 20% Bonus Threshold - if offer is 20%+ above requested, unlock chat early
  const hasHighValueOffer = useMemo(() => {
    // Check for explicit high-value flag
    const hasExplicitHighValue =
      gifts.some((g) => g.isHighValueOffer) ||
      pendingOffers?.some((o) => o.amount >= 500);

    // NEW: Check for 20% bonus threshold (generous offer unlocks chat)
    // This is the "Hemen Sohbet Et" unlock rule
    const hasGenerousOffer = gifts.some((g) => {
      if (!g.requestedAmount || g.requestedAmount === 0) return false;
      return g.amount >= g.requestedAmount * 1.2; // 20% above requested
    });

    return hasExplicitHighValue || hasGenerousOffer;
  }, [gifts, pendingOffers]);

  // Master UX: Unlock chat early for high-value subscriber offers
  // UPDATED: Premium/Platinum subscribers with 20%+ bonus can chat immediately
  const canStartChatEarly =
    hasHighValueOffer &&
    ['premium', 'platinum'].includes(senderSubscriptionTier);

  // Chat Lock Tier based on total gift amount (0-30-100 kuralları)
  const chatLockInfo = useMemo(() => {
    return determineChatTier(totalAmount);
  }, [totalAmount]);

  // Chat Lock Badge configuration
  const CHAT_LOCK_BADGE: Record<
    ChatTier,
    { label: string; icon: IconName; color: string; bgColor: string }
  > = {
    none: {
      label: 'Sadece Teşekkür',
      icon: 'gift-outline',
      color: COLORS.text.tertiary,
      bgColor: 'rgba(156, 163, 175, 0.15)',
    },
    candidate: {
      label: 'Chat Adayı',
      icon: 'message-badge-outline',
      color: '#7B61FF',
      bgColor: 'rgba(123, 97, 255, 0.15)',
    },
    premium: {
      label: 'Premium Teklif',
      icon: 'crown',
      color: '#FFB800',
      bgColor: 'rgba(255, 184, 0, 0.15)',
    },
  };

  const handleStartChat = () => {
    // Chat Lock Tier kontrolü - 0-30$ arası chat yok
    if (chatLockInfo.tier === 'none') {
      Alert.alert(
        'Sohbet Açılamaz',
        '30$ altındaki hediyeler için sohbet özelliği kullanılamaz. Bu gönderici toplu teşekkür mesajı alacak.',
        [{ text: 'Tamam' }],
      );
      return;
    }

    // Host henüz onay vermediyse
    if (!chatApproved && !canStartChatEarly) {
      Alert.alert(
        'Onay Gerekli',
        'Bu gönderici ile sohbet başlatmak için önce "Like" butonuna basarak onay vermelisiniz.',
        [{ text: 'Tamam' }],
      );
      return;
    }

    navigation.navigate('Chat', {
      otherUser: {
        id: senderId,
        name: senderName,
        avatar: senderAvatar,
        isVerified: senderVerified,
        type: 'subscriber',
        role: TIER_CONFIG[senderSubscriptionTier]?.label || 'Üye',
        kyc: senderVerified ? 'Verified' : 'Unverified',
        location: senderCity,
      },
    });
  };

  const handleViewProfile = () => {
    navigation.navigate('ProfileDetail', { userId: senderId });
  };

  /**
   * Handle Unlock Conversation - Host onayı ile sohbet açma
   * REFACTOR: handleLikeUser → handleUnlockConversation (niyet netleşti)
   * Sadece 30$+ (candidate veya premium tier) için aktif
   */
  const handleUnlockConversation = async (): Promise<void> => {
    if (chatLockInfo.tier === 'none') {
      Alert.alert(
        'Sohbet Açılamaz',
        '30$ altındaki hediyeler için sohbet açılamaz. Bu kullanıcı toplu teşekkür mesajı alacak.',
        [{ text: 'Tamam' }],
      );
      return;
    }

    // Find the eligible gift for chat unlock (highest amount)
    const eligibleGift = gifts
      .filter((g) => g.amount >= 30)
      .sort((a, b) => b.amount - a.amount)[0];

    if (!eligibleGift?.id) {
      Alert.alert('Hata', 'Uygun hediye bulunamadı.');
      return;
    }

    setIsApproving(true);
    try {
      // API call to unlock conversation - update is_chat_approved_by_host flag
      await messagesApi.unlockConversation(eligibleGift.id, senderId);

      setChatApproved(true);
      // Notification: "Seni beğendi" → "[Kullanıcı] seninle bir sohbet başlattı!"
    } catch (error) {
      logger.error('Failed to unlock conversation', error);
      Alert.alert('Hata', 'Sohbet açılamadı. Lütfen tekrar deneyin.');
      throw error; // Re-throw for ChatUnlockButton to handle
    } finally {
      setIsApproving(false);
    }
  };

  /**
   * Handle Send Gratitude - Teşekkür notu gönderme (sohbet açmaz!)
   * OnlyFans tarzı "bireysel teşekkür" - toplu değil
   */
  const handleSendGratitude = async (message: string): Promise<void> => {
    // Find any gift from this sender for gratitude note
    const targetGift = gifts[0];

    if (!targetGift?.id) {
      logger.error('No gift found for gratitude note');
      Alert.alert('Hata', 'Hediye bulunamadı.');
      throw new Error('No gift found');
    }

    try {
      // API call to send gratitude note
      await messagesApi.sendGratitudeNote(targetGift.id, senderId, message);

      setGratitudeSent(true);
      logger.info('Gratitude sent', { senderId, message });
    } catch (error) {
      logger.error('Failed to send gratitude', error);
      Alert.alert('Hata', 'Teşekkür gönderilemedi. Lütfen tekrar deneyin.');
      throw error;
    }
  };

  const handleHide = () => {
    Alert.alert(
      'Hediyeleri Gizle',
      `${senderName} kullanıcısından gelen tüm hediyeler gizlensin mi? Bu, alınan paranızı etkilemez.`,
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Gizle',
          style: 'destructive',
          onPress: async () => {
            if (isHiding) return;
            setIsHiding(true);
            try {
              for (const gift of gifts) {
                await profileApi.hideItem(gift.id, 'gift');
              }
              setIsHidden(true);
              navigation.goBack();
            } catch (error) {
              logger.error('Failed to hide gifts', error);
              Alert.alert(
                'Hata',
                'Hediyeler gizlenemedi. Lütfen tekrar deneyin.',
              );
            } finally {
              setIsHiding(false);
            }
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
      Alert.alert('Kullanıcı Engellendi', `${senderName} engellendi.`);
    } else if (action === 'report') {
      Alert.alert(
        'Rapor Gönderildi',
        'Raporunuz için teşekkürler. 24 saat içinde inceleyeceğiz.',
      );
    } else if (action === 'hide') {
      setIsHidden(true);
      navigation.goBack();
    }
  };

  // Master UX: Navigate to proof flow with category-specific camera mode
  const handleUploadProof = (giftId: string, momentCategory?: string) => {
    const cameraMode = momentCategory
      ? CATEGORY_CAMERA_MODES[momentCategory.toLowerCase()] || 'default'
      : 'default';

    navigation.navigate('ProofFlow', {
      giftId,
      cameraMode,
    } as any);
  };

  const getGiftStatusInfo = (
    status: string,
    isSubscriberOffer?: boolean,
  ): { icon: IconName; color: string; text: string } => {
    switch (status) {
      case 'pending':
        return {
          icon: isSubscriberOffer ? 'gift-open-outline' : 'clock-outline',
          color: '#7B61FF',
          text: isSubscriberOffer ? 'Teklif Bekliyor' : 'Beklemede',
        };
      case 'received':
        return { icon: 'check-circle', color: COLORS.mint, text: 'Alındı' };
      case 'pending_proof':
        return {
          icon: 'camera-outline',
          color: COLORS.brand.secondary,
          text: 'Kanıt Yükle',
        };
      case 'verifying':
        return {
          icon: 'timer-sand',
          color: COLORS.softOrange,
          text: 'Doğrulanıyor...',
        };
      case 'verified':
        return {
          icon: 'check-decagram',
          color: COLORS.mint,
          text: 'Doğrulandı',
        };
      case 'failed':
        return {
          icon: 'close-circle',
          color: COLORS.feedback.error,
          text: 'Başarısız',
        };
      default:
        return {
          icon: 'gift-outline',
          color: COLORS.brand.primary,
          text: 'Beklemede',
        };
    }
  };

  /**
   * Payment Type Label - LEGAL COMPLIANCE
   * All payments are held by PayTR (Turkish payment processor)
   * Standardized label: "PayTR Güvencesinde" (Protected by PayTR)
   */
  const getPaymentTypeLabel = (_type: string): string => {
    // LEGAL: All payment types are held in PayTR's secure pool
    // No more confusing "Direct Pay", "Half Escrow", "Full Escrow" labels
    return 'PayTR Güvencesinde';
  };

  const tierConfig = TIER_CONFIG[senderSubscriptionTier] || TIER_CONFIG.free;

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
            color={COLORS.text.primary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{senderName} Hediyeleri</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Sender Profile Card - Updated with Trust Garden & Subscription Tier */}
        <View style={styles.profileCard}>
          <TouchableOpacity onPress={handleViewProfile}>
            <Image source={{ uri: senderAvatar }} style={styles.avatar} />
            {/* Subscription Tier Badge */}
            {['premium', 'platinum'].includes(senderSubscriptionTier) && (
              <View
                style={[
                  styles.tierBadge,
                  { backgroundColor: tierConfig.color },
                ]}
              >
                <MaterialCommunityIcons
                  name={tierConfig.icon}
                  size={12}
                  color={COLORS.utility.white}
                />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.profileInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{senderName}</Text>
              {senderVerified && (
                <MaterialCommunityIcons
                  name="check-decagram"
                  size={18}
                  color={COLORS.brand.primary}
                />
              )}
              {/* Subscription Tier Label */}
              {['premium', 'platinum'].includes(senderSubscriptionTier) && (
                <View
                  style={[
                    styles.tierLabel,
                    { backgroundColor: `${tierConfig.color}20` },
                  ]}
                >
                  <Text
                    style={[styles.tierLabelText, { color: tierConfig.color }]}
                  >
                    {tierConfig.label}
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.city}>📍 {senderCity}</Text>

            <View style={styles.statsRow}>
              {/* Trust Garden Score */}
              <View style={styles.stat}>
                <MaterialCommunityIcons
                  name="shield-check"
                  size={16}
                  color={COLORS.trust?.primary || '#06B6D4'}
                />
                <Text style={styles.statText}>{senderTrustScore}% Güven</Text>
              </View>
              {/* Moment Count (replaces trip count) */}
              <View style={styles.stat}>
                <MaterialCommunityIcons
                  name="party-popper"
                  size={16}
                  color={COLORS.brand.primary}
                />
                <Text style={styles.statText}>{senderMomentCount} anı</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.viewProfileButton}
            onPress={handleViewProfile}
          >
            <Text style={styles.viewProfileText}>Profili Gör</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={16}
              color={COLORS.brand.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Pending Subscriber Offers Panel */}
        {pendingOffers && pendingOffers.length > 0 && (
          <View style={styles.pendingOffersCard}>
            <View style={styles.pendingOffersHeader}>
              <MaterialCommunityIcons
                name="gift-open-outline"
                size={20}
                color="#7B61FF"
              />
              <Text style={styles.pendingOffersTitle}>
                Bekleyen Teklifler ({pendingOffers.length})
              </Text>
            </View>
            {pendingOffers.map((offer) => (
              <View key={offer.id} style={styles.pendingOfferItem}>
                <Text style={styles.pendingOfferAmount}>
                  {offer.amount} {offer.currency}
                </Text>
                <Text style={styles.pendingOfferMessage} numberOfLines={1}>
                  {offer.message}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Total Amount Card */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Toplam Alınan</Text>
          <Text style={styles.totalAmount}>₺{totalAmount}</Text>

          {/* Chat Lock Tier Badge */}
          <View
            style={[
              styles.chatLockBadge,
              { backgroundColor: CHAT_LOCK_BADGE[chatLockInfo.tier].bgColor },
            ]}
          >
            <MaterialCommunityIcons
              name={CHAT_LOCK_BADGE[chatLockInfo.tier].icon}
              size={14}
              color={CHAT_LOCK_BADGE[chatLockInfo.tier].color}
            />
            <Text
              style={[
                styles.chatLockBadgeText,
                { color: CHAT_LOCK_BADGE[chatLockInfo.tier].color },
              ]}
            >
              {CHAT_LOCK_BADGE[chatLockInfo.tier].label}
            </Text>
          </View>
          <Text style={styles.chatLockDescription}>
            {chatLockInfo.messageTR}
          </Text>
          <Text style={styles.giftCount}>{gifts.length} hediye</Text>
        </View>

        {/* Gifts List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hediyeler</Text>

          {gifts.map((gift) => {
            const statusInfo = getGiftStatusInfo(
              gift.status,
              gift.isSubscriberOffer,
            );
            return (
              <View
                key={gift.id}
                style={[
                  styles.giftItem,
                  gift.isHighValueOffer && styles.highValueGiftItem,
                ]}
              >
                {/* High Value Badge */}
                {gift.isHighValueOffer && (
                  <View style={styles.highValueBadge}>
                    <MaterialCommunityIcons
                      name="diamond-stone"
                      size={12}
                      color="#FFB800"
                    />
                    <Text style={styles.highValueBadgeText}>Yüksek Değer</Text>
                  </View>
                )}

                <View style={styles.giftHeader}>
                  <Text style={styles.giftEmoji}>{gift.momentEmoji}</Text>
                  <View style={styles.giftInfo}>
                    <Text style={styles.giftTitle}>{gift.momentTitle}</Text>
                    <Text style={styles.giftAmount}>
                      ₺{gift.amount} · {getPaymentTypeLabel(gift.paymentType)}
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
                      onPress={() =>
                        handleUploadProof(gift.id, gift.momentCategory)
                      }
                    >
                      <MaterialCommunityIcons
                        name="camera"
                        size={16}
                        color={COLORS.utility.white}
                      />
                      <Text style={styles.uploadButtonText}>Yükle</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Actions - MASTER UX: Teşekkür Et ve Sohbeti Başlat ayrımı */}
        <View style={styles.actionsSection}>
          {/* Teşekkür Et Button - 0-30$ için tek seçenek, 30-100$ için isteğe bağlı */}
          <GratitudeButton
            tier={chatLockInfo.tier}
            senderName={senderName}
            hasSentGratitude={gratitudeSent}
            onSendGratitude={handleSendGratitude}
          />

          {/* Sohbeti Başlat Button - Sadece 30$+ için görünür */}
          <ChatUnlockButton
            tier={chatLockInfo.tier}
            senderName={senderName}
            isApproved={chatApproved || canStartChatEarly}
            isLoading={isApproving}
            onUnlock={handleUnlockConversation}
            onStartChat={handleStartChat}
          />

          {/* 0-30$ için sadece bilgi metni */}
          {chatLockInfo.tier === 'none' && (
            <View style={styles.supportOnlyNotice}>
              <MaterialCommunityIcons
                name="gift-outline"
                size={18}
                color={COLORS.text.tertiary}
              />
              <Text style={styles.supportOnlyText}>
                Bu miktar sadece destek amaçlıdır. Sohbet özelliği 30$ ve üzeri
                hediyeler için aktif olur.
              </Text>
            </View>
          )}

          {/* Early chat unlock hint for high-value offers */}
          {canStartChatEarly && !canStartChat && (
            <Text style={styles.earlyUnlockHint}>
              ✨ Yüksek değerli teklif sayesinde sohbet açıldı!
            </Text>
          )}

          <View style={styles.secondaryActions}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleHide}
            >
              <MaterialCommunityIcons
                name="eye-off-outline"
                size={20}
                color={COLORS.text.secondary}
              />
              <Text style={styles.secondaryButtonText}>Gizle</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleReport}
            >
              <MaterialCommunityIcons
                name="flag-outline"
                size={20}
                color={COLORS.feedback.error}
              />
              <Text
                style={[
                  styles.secondaryButtonText,
                  { color: COLORS.feedback.error },
                ]}
              >
                Bildir
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.infoBox}>
          <MaterialCommunityIcons
            name="information-outline"
            size={20}
            color={COLORS.brand.primary}
          />
          <Text style={styles.infoText}>
            Sohbet başlatmak alınan hediyelerinizi etkilemez. Emanet hediyeler
            için kanıt yükledikten sonra serbestçe sohbet edebilirsiniz.
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
    backgroundColor: COLORS.bg.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    ...TYPOGRAPHY.h4,
    fontWeight: '600',
    color: COLORS.text.primary,
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
    backgroundColor: COLORS.utility.white,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: COLORS.utility.black,
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
  tierBadge: {
    position: 'absolute',
    bottom: 0,
    right: 12,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.utility.white,
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  name: {
    ...TYPOGRAPHY.h4,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  tierLabel: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 4,
  },
  tierLabelText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    fontSize: 10,
  },
  city: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
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
    color: COLORS.text.secondary,
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
    color: COLORS.brand.primary,
    fontWeight: '500',
  },
  // Pending Offers Panel
  pendingOffersCard: {
    backgroundColor: '#7B61FF10',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#7B61FF30',
  },
  pendingOffersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  pendingOffersTitle: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: '#7B61FF',
  },
  pendingOfferItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#7B61FF20',
  },
  pendingOfferAmount: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  pendingOfferMessage: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    flex: 1,
    marginLeft: 12,
  },
  totalCard: {
    backgroundColor: COLORS.brand.primary + '15',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  totalLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  totalAmount: {
    ...TYPOGRAPHY.display1,
    fontWeight: '700',
    color: COLORS.brand.primary,
    marginBottom: 4,
  },
  chatLockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
    gap: 6,
  },
  chatLockBadgeText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '700',
    fontSize: 12,
  },
  chatLockDescription: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  giftCount: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h4,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  giftItem: {
    backgroundColor: COLORS.utility.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: COLORS.utility.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  highValueGiftItem: {
    borderWidth: 1,
    borderColor: '#FFB80050',
    backgroundColor: '#FFB80008',
  },
  highValueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#FFB80020',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  highValueBadgeText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: '#FFB800',
    fontSize: 10,
  },
  giftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  giftEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  giftInfo: {
    flex: 1,
  },
  giftTitle: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  giftAmount: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  giftMessage: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.primary,
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
    backgroundColor: COLORS.brand.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  uploadButtonText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: COLORS.utility.white,
  },
  actionsSection: {
    marginBottom: 20,
  },
  supportOnlyNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(156, 163, 175, 0.1)',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    marginBottom: 12,
  },
  supportOnlyText: {
    flex: 1,
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  earlyUnlockHint: {
    ...TYPOGRAPHY.caption,
    color: '#7B61FF',
    textAlign: 'center',
    marginBottom: 12,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginTop: 8,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  secondaryButtonText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.secondary,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.brand.primary + '10',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoText: {
    flex: 1,
    ...TYPOGRAPHY.caption,
    color: COLORS.text.primary,
    lineHeight: 18,
  },
});

export default GiftInboxDetailScreen;
