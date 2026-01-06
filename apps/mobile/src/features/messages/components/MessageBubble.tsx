/**
 * MessageBubble - Premium Futuristic Chat Bubbles
 *
 * Awwwards-quality message bubbles with:
 * - Neon gradient for own messages
 * - Glass effect for received messages
 * - Premium proof cards with trust indicators
 */

import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, GRADIENTS } from '@/constants/colors';
import { FONTS, FONT_SIZES_V2 } from '@/constants/typography';
import { OfferBubble } from './OfferBubble';
import type { Message } from '../hooks/useChatScreen';
import type { OfferStatus } from '@/types/message.types';

interface MessageBubbleProps {
  item: Message;
  proofStatus?: 'pending' | 'verified' | 'rejected' | 'disputed';
  onAcceptOffer?: (messageId: string) => void;
  onDeclineOffer?: (messageId: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  item,
  proofStatus = 'verified',
  onAcceptOffer,
  onDeclineOffer,
}) => {
  // Offer message
  if (item.type === 'offer') {
    return (
      <OfferBubble
        amount={item.amount || 0}
        currency={item.currency}
        status={(item.offerStatus as OfferStatus) || 'pending'}
        momentTitle={item.momentTitle}
        isOwn={item.user === 'me'}
        onAccept={() => onAcceptOffer?.(item.id)}
        onDecline={() => onDeclineOffer?.(item.id)}
      />
    );
  }

  // System message
  if (item.type === 'system') {
    return (
      <View style={styles.systemMessageContainer}>
        <View style={styles.systemMessageBadge}>
          <Text style={styles.systemMessageText}>{item.text}</Text>
        </View>
      </View>
    );
  }

  // Proof message - Premium trust card
  if (item.type === 'proof') {
    return (
      <View style={styles.messageRow}>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=100',
          }}
          style={styles.messageAvatar}
        />
        <View style={styles.proofMessageContainer}>
          <View style={styles.proofCard}>
            <View style={styles.proofHeaderRow}>
              <MaterialCommunityIcons
                name="file-document-outline"
                size={18}
                color={COLORS.trust.primary}
              />
              <Text style={styles.proofHeaderText}>Proof of Moment</Text>
              <MaterialCommunityIcons
                name="check-decagram"
                size={18}
                color={COLORS.trust.primary}
              />
            </View>
            <Text style={styles.proofFilename}>{item.text}</Text>
          </View>
          {/* Status messages based on proof verification */}
          {proofStatus === 'pending' && (
            <View style={styles.proofStatusContainer}>
              <View
                style={[styles.proofStatusDot, styles.proofStatusPending]}
              />
              <Text style={styles.proofStatusTextPending}>Doğrulanıyor...</Text>
            </View>
          )}
          {proofStatus === 'verified' && (
            <View style={styles.proofStatusContainer}>
              <View
                style={[styles.proofStatusDot, styles.proofStatusVerified]}
              />
              <Text style={styles.proofStatusTextVerified}>
                Doğrulandı - Fonlar serbest bırakıldı
              </Text>
            </View>
          )}
          {proofStatus === 'rejected' && (
            <View style={styles.proofStatusContainer}>
              <View
                style={[styles.proofStatusDot, styles.proofStatusRejected]}
              />
              <Text style={styles.proofStatusTextRejected}>
                Doğrulama başarısız
              </Text>
            </View>
          )}
        </View>
      </View>
    );
  }

  // Image message
  if (item.type === 'image') {
    return (
      <View style={styles.messageRow}>
        <Image
          source={{
            uri: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=100',
          }}
          style={styles.messageAvatar}
        />
        <View style={styles.imageMessageContainer}>
          {item.imageUrl ? (
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.messageImage}
              resizeMode="cover"
            />
          ) : null}
        </View>
      </View>
    );
  }

  // My message - Neon gradient bubble
  if (item.user === 'me') {
    return (
      <View style={styles.myMessageRow}>
        <LinearGradient
          colors={GRADIENTS.gift as readonly [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.myMessageBubble}
        >
          <Text style={styles.myMessageText}>{item.text}</Text>
          {item.timestamp && (
            <Text style={styles.myMessageTime}>
              {new Date(item.timestamp).toLocaleTimeString('tr-TR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          )}
        </LinearGradient>
      </View>
    );
  }

  // Other user message - Glass effect bubble
  return (
    <View style={styles.messageRow}>
      <Image
        source={{
          uri: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=100',
        }}
        style={styles.messageAvatar}
      />
      <View style={styles.otherMessageBubble}>
        <Text style={styles.otherMessageText}>{item.text}</Text>
        {item.timestamp && (
          <Text style={styles.otherMessageTime}>
            {new Date(item.timestamp).toLocaleTimeString('tr-TR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // System Message
  systemMessageContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  systemMessageBadge: {
    backgroundColor: COLORS.surface.muted,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  systemMessageText: {
    fontSize: FONT_SIZES_V2.caption,
    fontFamily: FONTS.body.regular,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },

  // Message Rows
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  myMessageRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },

  // Avatar
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },

  // Other User Bubble - Glass Effect
  otherMessageBubble: {
    maxWidth: '75%',
    backgroundColor: COLORS.surface.base,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    // Subtle shadow
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  otherMessageText: {
    fontSize: FONT_SIZES_V2.body,
    fontFamily: FONTS.body.regular,
    color: COLORS.text.primary,
    lineHeight: 22,
  },
  otherMessageTime: {
    fontSize: FONT_SIZES_V2.tiny,
    fontFamily: FONTS.body.regular,
    color: COLORS.text.muted,
    marginTop: 4,
    alignSelf: 'flex-end',
  },

  // My Message Bubble - Neon Gradient
  myMessageBubble: {
    maxWidth: '75%',
    borderRadius: 20,
    borderBottomRightRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    // Neon glow effect
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  myMessageText: {
    fontSize: FONT_SIZES_V2.body,
    fontFamily: FONTS.body.regular,
    color: COLORS.white,
    lineHeight: 22,
  },
  myMessageTime: {
    fontSize: FONT_SIZES_V2.tiny,
    fontFamily: FONTS.body.regular,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
    alignSelf: 'flex-end',
  },

  // Image Message
  imageMessageContainer: {
    maxWidth: '75%',
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  messageImage: {
    width: 240,
    aspectRatio: 4 / 3,
  },

  // Proof Message - Trust Card
  proofMessageContainer: {
    maxWidth: '80%',
  },
  proofCard: {
    backgroundColor: COLORS.trust.surface,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.trust.muted,
  },
  proofHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  proofHeaderText: {
    fontSize: FONT_SIZES_V2.bodySmall,
    fontFamily: FONTS.body.semibold,
    fontWeight: '600',
    color: COLORS.trust.primary,
    flex: 1,
  },
  proofFilename: {
    fontSize: FONT_SIZES_V2.caption,
    fontFamily: FONTS.mono.regular,
    color: COLORS.trust.dark,
  },
  proofStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.trust.muted,
  },
  proofStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  proofStatusPending: {
    backgroundColor: COLORS.warning,
  },
  proofStatusVerified: {
    backgroundColor: COLORS.success,
    // Neon glow
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  proofStatusRejected: {
    backgroundColor: COLORS.error,
  },
  proofStatusTextPending: {
    fontSize: FONT_SIZES_V2.caption,
    fontFamily: FONTS.body.semibold,
    color: COLORS.warning,
  },
  proofStatusTextVerified: {
    fontSize: FONT_SIZES_V2.caption,
    fontFamily: FONTS.body.semibold,
    color: COLORS.success,
  },
  proofStatusTextRejected: {
    fontSize: FONT_SIZES_V2.caption,
    fontFamily: FONTS.body.semibold,
    color: COLORS.error,
  },
});
