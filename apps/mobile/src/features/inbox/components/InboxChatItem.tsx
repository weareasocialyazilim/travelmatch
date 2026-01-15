/**
 * Lovendo Vibe Room - Inbox Chat Item
 *
 * Smart list item with:
 * - Left: Moment context strip (photo with gradient overlay)
 * - Center: User info and last message
 * - Right: Time and status badge
 *
 * "Context is King" - Every chat shows the connected Moment.
 *
 * Also includes AwwwardsInboxChatItem variant:
 * - Minimalist hierarchy design
 * - Neon notification glow effect
 * - TYPOGRAPHY_SYSTEM integration
 * - Premium "Soft Glass" aesthetic
 */

import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  Layout,
} from 'react-native-reanimated';
import { HapticManager } from '@/services/HapticManager';

import {
  VIBE_ROOM_COLORS,
  INBOX_SPACING,
  INBOX_SPRINGS,
} from '../constants/theme';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY_SYSTEM } from '@/constants/typography';
import StatusBadge from './StatusBadge';
import { LovendoAvatar } from '@/components/ui/LovendoAvatar';
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
      HapticManager.buttonPress();
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
          accessibilityLabel={`Chat with ${chat.user.name}${chat.moment ? ` about ${chat.moment.title}` : ''}`}
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
              <LovendoAvatar
                source={chat.user.avatar}
                name={chat.user.name}
                size="md"
                style={styles.avatar}
              />
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
                </View>
                <Text style={styles.momentTitle} numberOfLines={1}>
                  {chat.moment?.emoji || '✨'} {chat.moment?.title || 'Chat'}
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

// ═══════════════════════════════════════════════════════════════════════════
// AwwwardsInboxChatItem - Minimalist Design Variant
// "Soft Glass" aesthetic with neon notification glow
// ═══════════════════════════════════════════════════════════════════════════

interface AwwwardsInboxChatItemProps {
  chat: {
    id: string;
    name: string;
    avatar: string;
    lastMessage: string;
    time: string;
    unread: number;
    isVerified?: boolean;
  };
  onPress: () => void;
}

/**
 * Awwwards-style Inbox Chat Item
 *
 * Minimalist hierarchy with:
 * - Neon glow for unread notifications
 * - Premium typography from TYPOGRAPHY_SYSTEM
 * - "Soft Glass" card aesthetic
 * - Haptic feedback on press
 */
export const AwwwardsInboxChatItem: React.FC<AwwwardsInboxChatItemProps> = memo(
  ({ chat, onPress }) => {
    const handlePress = useCallback(() => {
      HapticManager.buttonPress();
      onPress();
    }, [onPress]);

    const hasUnread = chat.unread > 0;

    return (
      <TouchableOpacity
        style={awwwardsStyles.container}
        onPress={handlePress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Chat with ${chat.name}`}
      >
        {/* Avatar with Neon Glow */}
        <View style={awwwardsStyles.avatarContainer}>
          <Image source={{ uri: chat.avatar }} style={awwwardsStyles.avatar} />
          {hasUnread && <View style={awwwardsStyles.unreadGlow} />}
        </View>

        {/* Content */}
        <View style={awwwardsStyles.content}>
          {/* Name Row */}
          <View style={awwwardsStyles.nameRow}>
            <Text style={awwwardsStyles.name} numberOfLines={1}>
              {chat.name}
            </Text>
            {chat.isVerified && (
              <MaterialCommunityIcons
                name="check-decagram"
                size={14}
                color={COLORS.brand.primary}
              />
            )}
            <Text style={awwwardsStyles.time}>{chat.time}</Text>
          </View>

          {/* Last Message Row */}
          <View style={awwwardsStyles.messageRow}>
            <Text
              style={[
                awwwardsStyles.lastMessage,
                hasUnread && awwwardsStyles.lastMessageUnread,
              ]}
              numberOfLines={1}
            >
              {chat.lastMessage}
            </Text>
            {hasUnread && (
              <View style={awwwardsStyles.unreadBadge}>
                <Text style={awwwardsStyles.unreadText}>
                  {chat.unread > 99 ? '99+' : chat.unread}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  },
);

AwwwardsInboxChatItem.displayName = 'AwwwardsInboxChatItem';

const awwwardsStyles = StyleSheet.create({
  // Container - Soft Glass card
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface.base,
    borderRadius: 16,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },

  // Avatar with neon glow container
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.bg.secondary,
  },

  // Neon glow effect for unread
  unreadGlow: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: COLORS.brand.primary,
    // Glow effect via shadow
    shadowColor: COLORS.brand.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 4,
  },

  // Content area
  content: {
    flex: 1,
    justifyContent: 'center',
  },

  // Name row with time
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  name: {
    flex: 1,
    fontSize: TYPOGRAPHY_SYSTEM.sizes.bodyM,
    fontFamily: TYPOGRAPHY_SYSTEM.families.heading,
    fontWeight: '600',
    color: COLORS.text.primary,
    letterSpacing: TYPOGRAPHY_SYSTEM.letterSpacing.tight,
  },
  time: {
    fontSize: TYPOGRAPHY_SYSTEM.sizes.caption,
    fontFamily: TYPOGRAPHY_SYSTEM.families.body,
    color: COLORS.text.tertiary,
  },

  // Message row with badge
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lastMessage: {
    flex: 1,
    fontSize: TYPOGRAPHY_SYSTEM.sizes.bodyS,
    fontFamily: TYPOGRAPHY_SYSTEM.families.body,
    color: COLORS.text.secondary,
    lineHeight:
      TYPOGRAPHY_SYSTEM.sizes.bodyS * TYPOGRAPHY_SYSTEM.lineHeights.normal,
  },
  lastMessageUnread: {
    color: COLORS.text.primary,
    fontWeight: '500',
  },

  // Unread badge - Neon magenta
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.brand.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    // Neon glow
    shadowColor: COLORS.brand.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 3,
  },
  unreadText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

export default InboxChatItem;
