/**
 * ChatHeader - Immersive Liquid Glass Header
 *
 * Premium chat header with:
 * - BlurView glass effect for immersive feel
 * - Neon status indicator
 * - Linked moment card with glass styling
 * - Real-time typing and read status via Supabase channels
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
} from 'react-native-reanimated';
import { supabase } from '@/config/supabase';
import { COLORS } from '@/constants/colors';
import { FONTS, FONT_SIZES_V2 } from '@/constants/typography';

export interface LinkedMoment {
  id: string;
  title: string;
  image?: string;
  /** Requested amount (Alıcı sets this) */
  requested_amount?: number;
  currency?: string;
  status?: 'negotiating' | 'accepted' | 'paid' | 'completed';
  isGiftedByMe?: boolean;
}

interface ChatHeaderProps {
  conversationId: string;
  otherUser: {
    id: string;
    name: string;
    avatar?: string | null;
    type?: string;
    isVerified?: boolean | null;
  };
  linkedMoment?: LinkedMoment;
  isOnline?: boolean;
  onBack: () => void;
  onUserPress: () => void;
  onMomentPress: () => void;
  onMorePress: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversationId,
  otherUser,
  linkedMoment,
  isOnline = true,
  onBack,
  onUserPress,
  onMomentPress,
  onMorePress,
}) => {
  const insets = useSafeAreaInsets();
  const [isTyping, setIsTyping] = useState(false);
  const [_lastReadAt, setLastReadAt] = useState<Date | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Typing dots animation
  const typingDot1 = useSharedValue(0);
  const typingDot2 = useSharedValue(0);
  const typingDot3 = useSharedValue(0);

  /**
   * Subscribe to Supabase presence channel for typing/read status
   */
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase.channel(`chat:${conversationId}`, {
      config: {
        presence: {
          key: otherUser.id,
        },
      },
    });

    // Listen for typing events
    channel.on('broadcast', { event: 'typing' }, (payload) => {
      if (payload.payload?.user_id === otherUser.id) {
        setIsTyping(true);

        // Clear previous timeout
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }

        // Auto-clear typing after 3 seconds
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
        }, 3000);
      }
    });

    // Listen for read receipts
    channel.on('broadcast', { event: 'read' }, (payload) => {
      if (payload.payload?.user_id === otherUser.id) {
        setLastReadAt(new Date(payload.payload.read_at));
      }
    });

    channel.subscribe();

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, [conversationId, otherUser.id]);

  // Animate typing dots
  useEffect(() => {
    if (isTyping) {
      typingDot1.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 300 }),
          withTiming(0, { duration: 300 }),
        ),
        -1,
        true,
      );
      typingDot2.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 150 }),
          withTiming(1, { duration: 300 }),
          withTiming(0, { duration: 300 }),
        ),
        -1,
        true,
      );
      typingDot3.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 300 }),
          withTiming(1, { duration: 300 }),
          withTiming(0, { duration: 300 }),
        ),
        -1,
        true,
      );
    } else {
      typingDot1.value = 0;
      typingDot2.value = 0;
      typingDot3.value = 0;
    }
  }, [isTyping]);

  const dot1Style = useAnimatedStyle(() => ({
    opacity: 0.4 + typingDot1.value * 0.6,
    transform: [{ scale: 0.8 + typingDot1.value * 0.4 }],
  }));

  const dot2Style = useAnimatedStyle(() => ({
    opacity: 0.4 + typingDot2.value * 0.6,
    transform: [{ scale: 0.8 + typingDot2.value * 0.4 }],
  }));

  const dot3Style = useAnimatedStyle(() => ({
    opacity: 0.4 + typingDot3.value * 0.6,
    transform: [{ scale: 0.8 + typingDot3.value * 0.4 }],
  }));

  const getMomentSubtitle = () => {
    if (!linkedMoment) return '';
    if (linkedMoment.status === 'paid' || linkedMoment.status === 'completed') {
      return linkedMoment.isGiftedByMe ? 'Hediye sizden' : 'Hediye alındı';
    }
    if (linkedMoment.status === 'accepted') {
      return 'Teklif kabul edildi';
    }
    const currencySymbol =
      linkedMoment.currency === 'TRY'
        ? '₺'
        : linkedMoment.currency === 'EUR'
          ? '€'
          : '$';
    return linkedMoment.requested_amount
      ? `${currencySymbol}${linkedMoment.requested_amount}`
      : 'Müzakere edilyor';
  };

  const getStatusText = () => {
    if (isTyping) return null; // Will show typing indicator instead
    return isOnline ? 'Şu an aktif' : 'Çevrimdışı';
  };

  const HeaderContent = () => (
    <>
      <View style={[styles.headerTop, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backButton}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="chevron-back" size={28} color={COLORS.text.primary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.headerUserInfo}
          onPress={onUserPress}
          activeOpacity={0.7}
          accessibilityLabel={`View ${otherUser.name}'s profile`}
          accessibilityRole="button"
        >
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri:
                  otherUser.avatar ||
                  'https://images.unsplash.com/photo-1544025162-d76694265947?w=100',
              }}
              style={styles.headerAvatar}
            />
            {otherUser.isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark" size={10} color={COLORS.white} />
              </View>
            )}
          </View>

          <View style={styles.headerTextInfo}>
            <View style={styles.headerNameRow}>
              <Text style={styles.headerName}>{otherUser.name}</Text>
              {otherUser.isVerified && (
                <MaterialCommunityIcons
                  name="check-decagram"
                  size={16}
                  color={COLORS.primary}
                />
              )}
            </View>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: isOnline
                      ? COLORS.success
                      : COLORS.text.muted,
                  },
                ]}
              />
              {isTyping ? (
                <Animated.View
                  entering={FadeIn.duration(200)}
                  exiting={FadeOut.duration(200)}
                  style={styles.typingIndicator}
                >
                  <Text style={styles.typingText}>yazıyor</Text>
                  <View style={styles.typingDots}>
                    <Animated.View style={[styles.typingDot, dot1Style]} />
                    <Animated.View style={[styles.typingDot, dot2Style]} />
                    <Animated.View style={[styles.typingDot, dot3Style]} />
                  </View>
                </Animated.View>
              ) : (
                <Text style={styles.statusText}>{getStatusText()}</Text>
              )}
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.moreButton}
          onPress={onMorePress}
          activeOpacity={0.6}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityLabel="More chat options"
          accessibilityRole="button"
        >
          <Ionicons
            name="ellipsis-horizontal"
            size={24}
            color={COLORS.text.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Linked Moment Card - Glass Style */}
      {linkedMoment && (
        <TouchableOpacity
          style={styles.linkedMomentCard}
          onPress={onMomentPress}
          activeOpacity={0.7}
          accessibilityLabel={`View linked moment: ${linkedMoment.title}`}
          accessibilityRole="button"
        >
          <Image
            source={{
              uri:
                linkedMoment.image ||
                'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=200',
            }}
            style={styles.momentThumbnail}
          />
          <View style={styles.momentInfo}>
            <Text style={styles.momentTitle} numberOfLines={1}>
              {linkedMoment.title}
            </Text>
            <Text style={styles.momentSubtitle}>{getMomentSubtitle()}</Text>
          </View>
          <View style={styles.viewButton}>
            <Text style={styles.viewButtonText}>View</Text>
          </View>
        </TouchableOpacity>
      )}
    </>
  );

  // Use BlurView on iOS, fallback on Android
  if (Platform.OS === 'ios') {
    return (
      <BlurView intensity={40} tint="light" style={styles.header}>
        <HeaderContent />
      </BlurView>
    );
  }

  return (
    <View style={[styles.header, styles.headerAndroid]}>
      <HeaderContent />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  headerAndroid: {
    backgroundColor: COLORS.bg.primary,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerUserInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
  },
  avatarContainer: {
    position: 'relative',
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextInfo: {
    marginLeft: 12,
    flex: 1,
  },
  headerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerName: {
    fontSize: FONT_SIZES_V2.bodyLarge,
    fontFamily: FONTS.display.bold,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
    // Neon glow for online status
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  statusText: {
    fontSize: FONT_SIZES_V2.tiny,
    color: COLORS.text.secondary,
    fontFamily: FONTS.body.regular,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typingText: {
    fontSize: FONT_SIZES_V2.tiny,
    color: COLORS.brand?.primary || COLORS.primary,
    fontFamily: FONTS.body.medium || FONTS.body.regular,
    fontWeight: '500',
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  typingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.brand?.primary || COLORS.primary,
  },
  moreButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Linked Moment Card
  linkedMomentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    backgroundColor: COLORS.surface.base,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  momentThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 12,
  },
  momentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  momentTitle: {
    fontSize: FONT_SIZES_V2.bodySmall,
    fontFamily: FONTS.body.semibold,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  momentSubtitle: {
    fontSize: FONT_SIZES_V2.caption,
    fontFamily: FONTS.body.regular,
    color: COLORS.text.secondary,
  },
  viewButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: COLORS.primaryMuted,
    borderRadius: 20,
  },
  viewButtonText: {
    fontSize: FONT_SIZES_V2.caption,
    fontFamily: FONTS.body.semibold,
    fontWeight: '600',
    color: COLORS.primary,
  },
});
