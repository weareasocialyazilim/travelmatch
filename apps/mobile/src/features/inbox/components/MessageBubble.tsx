/**
 * MessageBubble Component
 *
 * Liquid Glass etkili mesaj balonu.
 * Gönderen için neon kontur, alan için soft yüzey.
 *
 * Features:
 * - Neon glow border for sender's messages
 * - Soft surface for received messages
 * - Premium typography with TYPOGRAPHY_SYSTEM
 * - "Liquid Glass" aesthetic
 *
 * Part of TravelMatch "Cinematic Trust Jewelry" Design System.
 */

import React, { memo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { COLORS } from '@/constants/colors';
import { TYPOGRAPHY_SYSTEM } from '@/constants/typography';

interface MessageBubbleProps {
  message: {
    id?: string;
    text: string;
    sender: 'me' | 'other';
    time: string;
  };
}

/**
 * MessageBubble - Liquid Glass Chat Bubble
 *
 * Premium chat message bubble with:
 * - Neon glow outline for sent messages
 * - Soft glass surface for received messages
 * - Tail direction based on sender
 */
export const MessageBubble: React.FC<MessageBubbleProps> = memo(
  ({ message }) => {
    const isMe = message.sender === 'me';

    return (
      <View
        style={[styles.wrapper, isMe ? styles.myWrapper : styles.otherWrapper]}
      >
        <View
          style={[styles.container, isMe ? styles.myBubble : styles.otherBubble]}
        >
          <Text style={[styles.text, isMe ? styles.myText : styles.otherText]}>
            {message.text}
          </Text>
        </View>
        <Text style={styles.time}>{message.time}</Text>
      </View>
    );
  },
);

MessageBubble.displayName = 'MessageBubble';

const styles = StyleSheet.create({
  // Wrapper for alignment
  wrapper: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  myWrapper: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherWrapper: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },

  // Bubble container
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },

  // Sent message - Neon glow border
  myBubble: {
    backgroundColor: COLORS.surface.base,
    borderWidth: 1,
    borderColor: COLORS.brand.primary,
    borderBottomRightRadius: 4,
    // Soft neon glow
    shadowColor: COLORS.brand.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },

  // Received message - Soft glass surface
  otherBubble: {
    backgroundColor: COLORS.surface.elevated,
    borderBottomLeftRadius: 4,
  },

  // Text styling
  text: {
    fontSize: TYPOGRAPHY_SYSTEM.sizes.bodyM,
    fontFamily: TYPOGRAPHY_SYSTEM.families.body,
    lineHeight: TYPOGRAPHY_SYSTEM.sizes.bodyM * TYPOGRAPHY_SYSTEM.lineHeights.normal,
  },
  myText: {
    color: COLORS.text.primary,
  },
  otherText: {
    color: COLORS.text.primary,
  },

  // Timestamp
  time: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY_SYSTEM.families.body,
    color: COLORS.text.tertiary,
    marginTop: 4,
    paddingHorizontal: 4,
  },
});

export default MessageBubble;
