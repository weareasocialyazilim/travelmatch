import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { showAlert } from '@/stores/modalStore';
import { TYPOGRAPHY } from '@/theme/typography';
import { ESCROW_THRESHOLDS } from '@/constants/values';
import type { GiftInboxItem } from '@/hooks/useGiftInbox';
import * as Haptics from 'expo-haptics';

/**
 * Gift Action Types based on Chat Lock mechanism
 *
 * MASTER Revizyonu:
 * - Tier 1 (0-30$): "Sadece Parayı Al" - no chat option
 * - Tier 2 (30-100$): "Parayı Al + Like (Chat Aç)" - requires approval
 * - Tier 3 (100$+): Premium - highlighted card, same approval flow
 */
export type GiftAction = 'accept_only' | 'accept_and_like' | 'accept_premium';

interface GiftInboxCardProps {
  item: GiftInboxItem;
  onPress: () => void;
  onAcceptOnly?: (item: GiftInboxItem) => void;
  onAcceptAndLike?: (item: GiftInboxItem) => void;
  getStatusIcon: (item: GiftInboxItem) => {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    color: string;
    text: string;
  };
}

/**
 * Determine gift tier based on amount
 */
const getGiftTier = (amount: number): 'basic' | 'candidate' | 'premium' => {
  if (amount < ESCROW_THRESHOLDS.DIRECT_MAX) return 'basic';
  if (amount < ESCROW_THRESHOLDS.OPTIONAL_MAX) return 'candidate';
  return 'premium';
};

export const GiftInboxCard: React.FC<GiftInboxCardProps> = ({
  item,
  onPress,
  onAcceptOnly,
  onAcceptAndLike,
  getStatusIcon,
}) => {
  const status = getStatusIcon(item);
  const [isProcessing, setIsProcessing] = useState(false);

  // Determine tier for highest gift in bundle
  const highestGift = Math.max(...item.gifts.map((g) => g.amount));
  const tier = getGiftTier(highestGift);
  const isPremium = tier === 'premium';
  const canOpenChat = tier !== 'basic';

  const handleAcceptOnly = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    showAlert({
      title: '💰 Sadece Parayı Al',
      message:
        'Hediyeyi kabul edip ödemeyi alacaksınız. Chat açılmayacak ve gönderici toplu teşekkür mesajı alacak.',
      buttons: [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Onayla',
          onPress: () => {
            setIsProcessing(true);
            onAcceptOnly?.(item);
            setIsProcessing(false);
          },
        },
      ],
    });
  }, [item, onAcceptOnly]);

  const handleAcceptAndLike = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    showAlert({
      title: '💬 Parayı Al + Chat Aç',
      message: `${item.sender.name} ile chat başlatmak istiyor musunuz? Hediyeyi kabul edip chati açacaksınız.`,
      buttons: [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Like & Chat Aç',
          onPress: () => {
            setIsProcessing(true);
            onAcceptAndLike?.(item);
            setIsProcessing(false);
          },
        },
      ],
    });
  }, [item, onAcceptAndLike]);

  return (
    <TouchableOpacity
      style={[styles.inboxItem, isPremium && styles.premiumCard]}
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Premium Badge */}
      {isPremium && (
        <View style={styles.premiumBadge}>
          <MaterialCommunityIcons name="diamond" size={12} color="#C0C0C0" />
          <Text style={styles.premiumBadgeText}>Premium Teklif</Text>
        </View>
      )}

      <View style={styles.cardContent}>
        <View style={styles.inboxItemLeft}>
          <Image
            source={{ uri: item.sender.avatar }}
            style={styles.inboxAvatar}
          />
          {item.sender.isVerified && (
            <View style={styles.inboxVerifiedBadge}>
              <MaterialCommunityIcons
                name="check-decagram"
                size={12}
                color={COLORS.brand.primary}
              />
            </View>
          )}
        </View>

        <View style={styles.inboxItemContent}>
          <View style={styles.inboxItemHeader}>
            <Text style={styles.inboxName}>
              {item.sender.name}, {item.sender.age}
            </Text>
            <View style={styles.inboxRating}>
              <MaterialCommunityIcons
                name="star"
                size={12}
                color={COLORS.softOrange}
              />
              <Text style={styles.inboxRatingText}>{item.sender.rating}</Text>
            </View>
          </View>

          <Text
            style={[styles.inboxGiftCount, isPremium && styles.premiumText]}
          >
            {item.gifts.length} hediye · ${item.totalAmount} toplam
          </Text>

          <Text style={styles.inboxMessage} numberOfLines={1}>
            &quot;{item.latestMessage}&quot;
          </Text>

          <View style={styles.inboxStatus}>
            <MaterialCommunityIcons
              name={status.icon}
              size={14}
              color={status.color}
            />
            <Text style={[styles.inboxStatusText, { color: status.color }]}>
              {status.text}
            </Text>
          </View>
        </View>

        <View style={styles.inboxItemRight}>
          <Text style={styles.inboxTime}>{item.latestGiftAt}</Text>
        </View>
      </View>

      {/* Action Buttons - Chat Lock System */}
      {!item.canStartChat && (
        <View style={styles.actionButtons}>
          {/* Always show "Accept Only" */}
          <TouchableOpacity
            style={styles.acceptOnlyButton}
            onPress={handleAcceptOnly}
            disabled={isProcessing}
          >
            <MaterialCommunityIcons
              name="cash"
              size={16}
              color={COLORS.text.secondary}
            />
            <Text style={styles.acceptOnlyText}>Sadece Parayı Al</Text>
          </TouchableOpacity>

          {/* Show "Like + Chat" only for Tier 2 and 3 */}
          {canOpenChat && (
            <TouchableOpacity
              style={[
                styles.acceptAndLikeButton,
                isPremium && styles.premiumButton,
              ]}
              onPress={handleAcceptAndLike}
              disabled={isProcessing}
            >
              <MaterialCommunityIcons
                name="heart"
                size={16}
                color={isPremium ? '#C0C0C0' : COLORS.utility.white}
              />
              <Text
                style={[
                  styles.acceptAndLikeText,
                  isPremium && styles.premiumButtonText,
                ]}
              >
                {isPremium ? 'Premium Chat Aç' : 'Like & Chat Aç'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Already chatting indicator */}
      {item.canStartChat && (
        <View style={styles.chatActiveIndicator}>
          <MaterialCommunityIcons
            name="message-text"
            size={14}
            color={COLORS.mint}
          />
          <Text style={styles.chatActiveText}>Chat Aktif</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  inboxItem: {
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
  premiumCard: {
    borderWidth: 2,
    borderColor: '#C0C0C0',
    backgroundColor: '#FAFAFA',
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#808080',
  },
  premiumText: {
    color: '#808080',
    fontWeight: '600',
  },
  cardContent: {
    flexDirection: 'row',
  },
  inboxItemLeft: {
    marginRight: 12,
  },
  inboxAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  inboxVerifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: COLORS.utility.white,
    borderRadius: 10,
    padding: 2,
  },
  inboxItemContent: {
    flex: 1,
  },
  inboxItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  inboxName: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  inboxRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  inboxRatingText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  inboxGiftCount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  inboxMessage: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.text.primary,
    fontStyle: 'italic',
    marginBottom: 6,
  },
  inboxStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inboxStatusText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '500',
  },
  inboxItemRight: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  inboxTime: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
  },
  acceptOnlyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.bg.secondary,
  },
  acceptOnlyText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  acceptAndLikeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: COLORS.brand.primary,
  },
  premiumButton: {
    backgroundColor: '#333333',
    borderWidth: 1,
    borderColor: '#C0C0C0',
  },
  acceptAndLikeText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: COLORS.utility.white,
  },
  premiumButtonText: {
    color: '#C0C0C0',
  },

  // Chat Active Indicator
  chatActiveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
  },
  chatActiveText: {
    ...TYPOGRAPHY.caption,
    fontWeight: '600',
    color: COLORS.mint,
  },
});
