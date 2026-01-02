/**
 * TravelMatch Inbox Chat Item - Awwwards Edition
 *
 * Premium list item with:
 * - Left: Moment context strip (photo with gradient overlay)
 * - Center: User info and last message
 * - Right: Time and status badge with neon accents
 *
 * "Context is King" - Every chat shows the connected Moment.
 */

import React, { memo, useCallback } from 'react';
import { View, Text, Image, Pressable, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  Layout,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import {
  VIBE_ROOM_COLORS,
  INBOX_SPACING,
  INBOX_SPRINGS,
  INBOX_TYPOGRAPHY,
} from '../constants/theme';
import StatusBadge from './StatusBadge';
import type { InboxChat } from '../types/inbox.types';

interface InboxChatItemProps {
  chat: InboxChat;
  index: number;
  onPress: (chat: InboxChat) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const InboxChatItem: React.FC<InboxChatItemProps> = memo(
  ({ chat, index, onPress }) => {
    const scale = useSharedValue(1);

    const handlePressIn = useCallback(() => {
      scale.value = withSpring(0.97, INBOX_SPRINGS.snappy);
    }, [scale]);

    const handlePressOut = useCallback(() => {
      scale.value = withSpring(1, INBOX_SPRINGS.bouncy);
    }, [scale]);

    const handlePress = useCallback(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress(chat);
    }, [chat, onPress]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    // Format relative time (Turkish)
    const formatTime = (dateString: string): string => {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'şimdi';
      if (diffMins < 60) return `${diffMins}dk`;
      if (diffHours < 24) return `${diffHours}sa`;
      if (diffDays === 1) return 'dün';
      if (diffDays < 7) return `${diffDays}g`;
      return date.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short',
      });
    };

    const hasUnread = chat.unreadCount > 0;
    const isTyping = chat.isTyping;

    return (
      <Animated.View
        entering={FadeInRight.delay(index * 60).springify()}
        layout={Layout.springify()}
      >
        <AnimatedPressable
          style={[styles.card, animatedStyle]}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          accessibilityRole="button"
          accessibilityLabel={`${chat.user.name} ile sohbet${chat.moment ? `, ${chat.moment.title}` : ''}`}
        >
          {/* Left: Moment Context Strip */}
          <View style={styles.momentStrip}>
            {chat.moment?.image && (
              <Image
                source={{ uri: chat.moment.image }}
                style={styles.momentImage}
                resizeMode="cover"
              />
            )}
            <LinearGradient
              colors={VIBE_ROOM_COLORS.gradients.momentStrip}
              style={StyleSheet.absoluteFill}
            />
            {/* Moment icon overlay */}
            <View style={styles.momentOverlay}>
              <MaterialCommunityIcons
                name="image-filter-hdr"
                size={12}
                color="white"
              />
            </View>
          </View>

          {/* Center: User & Message Info */}
          <View style={styles.content}>
            {/* User Row */}
            <View style={styles.userRow}>
              <Image source={{ uri: chat.user.avatar }} style={styles.avatar} />
              <View style={styles.userInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {chat.user.name}
                  </Text>
                  {chat.user.isVerified && (
                    <View style={styles.verifiedBadge}>
                      <MaterialCommunityIcons
                        name="check-decagram"
                        size={14}
                        color={VIBE_ROOM_COLORS.neon.cyan}
                      />
                    </View>
                  )}
                  {chat.user.isOnline && <View style={styles.onlineDot} />}
                </View>
                <Text style={styles.momentTitle} numberOfLines={1}>
                  {chat.moment?.emoji || '✨'} {chat.moment?.title || 'Sohbet'}
                </Text>
              </View>
            </View>

            {/* Last Message */}
            {isTyping ? (
              <View style={styles.typingRow}>
                <Text style={styles.typingText}>yazıyor</Text>
                <View style={styles.typingDots}>
                  <View style={[styles.typingDot, styles.dot1]} />
                  <View style={[styles.typingDot, styles.dot2]} />
                  <View style={[styles.typingDot, styles.dot3]} />
                </View>
              </View>
            ) : (
              <Text
                style={[
                  styles.lastMessage,
                  hasUnread && styles.lastMessageUnread,
                ]}
                numberOfLines={1}
              >
                {chat.lastMessage}
              </Text>
            )}
          </View>

          {/* Right: Meta & Status */}
          <View style={styles.metaColumn}>
            <Text style={styles.timeText}>
              {formatTime(chat.lastMessageAt)}
            </Text>

            {/* Status Badge or Unread Count */}
            {chat.status !== 'matched' || chat.offerAmount ? (
              <StatusBadge
                status={chat.status}
                amount={chat.offerAmount}
                currency={chat.currency}
                compact
              />
            ) : hasUnread ? (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>
                  {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                </Text>
              </View>
            ) : null}
          </View>
        </AnimatedPressable>
      </Animated.View>
    );
  },
);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: VIBE_ROOM_COLORS.glass.backgroundLight,
    borderRadius: 20,
    marginBottom: INBOX_SPACING.cardGap,
    height: 92,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: VIBE_ROOM_COLORS.glass.border,
  },

  // Moment Strip (Left)
  momentStrip: {
    width: INBOX_SPACING.momentStripWidth,
    height: '100%',
    position: 'relative',
    backgroundColor: VIBE_ROOM_COLORS.background.tertiary,
  },
  momentImage: {
    width: '100%',
    height: '100%',
  },
  momentOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Content (Center)
  content: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 10,
  },
  avatar: {
    width: INBOX_SPACING.avatarSize,
    height: INBOX_SPACING.avatarSize,
    borderRadius: INBOX_SPACING.avatarSize / 2,
    borderWidth: 2,
    borderColor: VIBE_ROOM_COLORS.glass.borderActive,
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  userName: {
    ...INBOX_TYPOGRAPHY.cardTitle,
    color: VIBE_ROOM_COLORS.text.primary,
    maxWidth: 140,
  },
  verifiedBadge: {
    ...Platform.select({
      ios: {
        shadowColor: VIBE_ROOM_COLORS.neon.cyan,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
      },
      android: {},
    }),
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: VIBE_ROOM_COLORS.neon.emerald,
    marginLeft: 2,
    ...Platform.select({
      ios: {
        shadowColor: VIBE_ROOM_COLORS.neon.emerald,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 4,
      },
      android: {},
    }),
  },
  momentTitle: {
    ...INBOX_TYPOGRAPHY.caption,
    color: VIBE_ROOM_COLORS.text.tertiary,
    marginTop: 2,
  },
  lastMessage: {
    ...INBOX_TYPOGRAPHY.cardSubtitle,
    color: VIBE_ROOM_COLORS.text.secondary,
  },
  lastMessageUnread: {
    color: VIBE_ROOM_COLORS.text.primary,
    fontWeight: '600',
  },

  // Typing indicator
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  typingText: {
    ...INBOX_TYPOGRAPHY.cardSubtitle,
    color: VIBE_ROOM_COLORS.neon.lime,
    fontStyle: 'italic',
  },
  typingDots: {
    flexDirection: 'row',
    gap: 3,
  },
  typingDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: VIBE_ROOM_COLORS.neon.lime,
  },
  dot1: { opacity: 0.4 },
  dot2: { opacity: 0.6 },
  dot3: { opacity: 0.9 },

  // Meta Column (Right)
  metaColumn: {
    width: 72,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingRight: 14,
  },
  timeText: {
    ...INBOX_TYPOGRAPHY.badge,
    color: VIBE_ROOM_COLORS.text.muted,
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: VIBE_ROOM_COLORS.neon.lime,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    ...Platform.select({
      ios: {
        shadowColor: VIBE_ROOM_COLORS.neon.lime,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  unreadText: {
    color: VIBE_ROOM_COLORS.text.inverse,
    fontSize: 11,
    fontWeight: '800',
  },
});

InboxChatItem.displayName = 'InboxChatItem';

export default InboxChatItem;
