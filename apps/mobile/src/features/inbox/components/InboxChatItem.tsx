/**
 * TravelMatch Vibe Room - Inbox Chat Item
 *
 * Smart list item with:
 * - Left: Moment context strip (photo with gradient overlay)
 * - Center: User info and last message
 * - Right: Time and status badge
 *
 * "Context is King" - Every chat shows the connected Moment.
 */

import React, { memo, useCallback } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
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
      scale.value = withSpring(0.98, INBOX_SPRINGS.snappy);
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

    // Format relative time
    const formatTime = (dateString: string): string => {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return 'now';
      if (diffMins < 60) return `${diffMins}m`;
      if (diffHours < 24) return `${diffHours}h`;
      if (diffDays === 1) return '1d';
      if (diffDays < 7) return `${diffDays}d`;
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    };

    const hasUnread = chat.unreadCount > 0;
    const isTyping = chat.isTyping;

    return (
      <Animated.View
        entering={FadeInRight.delay(index * 80).springify()}
        layout={Layout.springify()}
      >
        <AnimatedPressable
          style={[styles.card, animatedStyle]}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          accessibilityRole="button"
          accessibilityLabel={`Chat with ${chat.user.name} about ${chat.moment.title}`}
        >
          {/* Left: Moment Context Strip */}
          <View style={styles.momentStrip}>
            <Image
              source={{ uri: chat.moment.image }}
              style={styles.momentImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={VIBE_ROOM_COLORS.gradients.momentStrip}
              style={StyleSheet.absoluteFill}
            />
            {/* Moment icon/emoji overlay */}
            <View style={styles.momentOverlay}>
              <MaterialCommunityIcons
                name="image-filter-hdr"
                size={14}
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
                    <MaterialCommunityIcons
                      name="check-decagram"
                      size={14}
                      color={VIBE_ROOM_COLORS.neon.amber}
                    />
                  )}
                  {chat.user.isOnline && <View style={styles.onlineDot} />}
                </View>
                <Text style={styles.momentTitle} numberOfLines={1}>
                  {chat.moment.emoji || '✨'} {chat.moment.title}
                </Text>
              </View>
            </View>

            {/* Last Message */}
            {isTyping ? (
              <View style={styles.typingRow}>
                <Text style={styles.typingText}>typing</Text>
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
    height: 88,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: VIBE_ROOM_COLORS.glass.border,
  },

  // Moment Strip (Left)
  momentStrip: {
    width: INBOX_SPACING.momentStripWidth,
    height: '100%',
    position: 'relative',
  },
  momentImage: {
    width: '100%',
    height: '100%',
  },
  momentOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Content (Center)
  content: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
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
    borderWidth: 1.5,
    borderColor: VIBE_ROOM_COLORS.glass.borderActive,
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  userName: {
    color: VIBE_ROOM_COLORS.text.primary,
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: VIBE_ROOM_COLORS.neon.emerald,
    marginLeft: 2,
  },
  momentTitle: {
    color: VIBE_ROOM_COLORS.text.tertiary,
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 1,
  },
  lastMessage: {
    color: VIBE_ROOM_COLORS.text.secondary,
    fontSize: 13,
    lineHeight: 18,
  },
  lastMessageUnread: {
    color: VIBE_ROOM_COLORS.text.primary,
    fontWeight: '600',
  },

  // Typing indicator
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  typingText: {
    color: VIBE_ROOM_COLORS.neon.amber,
    fontSize: 13,
    fontStyle: 'italic',
  },
  typingDots: {
    flexDirection: 'row',
    gap: 2,
  },
  typingDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: VIBE_ROOM_COLORS.neon.amber,
  },
  dot1: { opacity: 0.4 },
  dot2: { opacity: 0.6 },
  dot3: { opacity: 0.9 },

  // Meta Column (Right)
  metaColumn: {
    width: 72,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingRight: 12,
  },
  timeText: {
    color: VIBE_ROOM_COLORS.text.muted,
    fontSize: 11,
    fontWeight: '600',
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: VIBE_ROOM_COLORS.neon.magenta,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: VIBE_ROOM_COLORS.text.primary,
    fontSize: 10,
    fontWeight: '800',
  },
});

InboxChatItem.displayName = 'InboxChatItem';

export default InboxChatItem;
