import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import type { Message } from '../hooks/useChatScreen';

interface MessageBubbleProps {
  item: Message;
  proofStatus?: 'pending' | 'verified' | 'rejected' | 'disputed';
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  item,
  proofStatus = 'verified',
}) => {
  // System message
  if (item.type === 'system') {
    return (
      <View style={styles.systemMessageContainer}>
        <Text style={styles.systemMessageText}>{item.text}</Text>
      </View>
    );
  }

  // Proof message
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
                color={COLORS.success}
              />
              <Text style={styles.proofHeaderText}>Proof of Moment</Text>
              <MaterialCommunityIcons
                name="check-decagram"
                size={18}
                color={COLORS.success}
              />
            </View>
            <Text style={styles.proofFilename}>{item.text}</Text>
          </View>
          {/* Status messages based on proof verification */}
          {proofStatus === 'pending' && (
            <View style={styles.proofStatusContainer}>
              <MaterialCommunityIcons
                name="clock-outline"
                size={16}
                color={COLORS.warning}
              />
              <Text style={styles.proofStatusText}>Verifying proof...</Text>
            </View>
          )}
          {proofStatus === 'verified' && (
            <View style={styles.proofStatusContainer}>
              <MaterialCommunityIcons
                name="check-circle"
                size={16}
                color={COLORS.success}
              />
              <Text style={styles.proofStatusVerified}>
                Verified - Funds released
              </Text>
            </View>
          )}
          {proofStatus === 'rejected' && (
            <View style={styles.proofStatusContainer}>
              <MaterialCommunityIcons
                name="close-circle"
                size={16}
                color={COLORS.error}
              />
              <Text style={styles.proofStatusRejected}>
                Verification failed
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
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.messageImage}
            resizeMode="cover"
          />
        </View>
      </View>
    );
  }

  // My message
  if (item.user === 'me') {
    return (
      <View style={styles.myMessageRow}>
        <View style={styles.myMessageBubble}>
          <Text style={styles.myMessageText}>{item.text}</Text>
        </View>
      </View>
    );
  }

  // Other user message
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  systemMessageContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  systemMessageText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
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
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  otherMessageBubble: {
    maxWidth: '80%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderBottomLeftRadius: 0,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  otherMessageText: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
  myMessageBubble: {
    maxWidth: '80%',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    borderBottomRightRadius: 0,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  myMessageText: {
    fontSize: 16,
    color: COLORS.white,
    lineHeight: 24,
  },
  imageMessageContainer: {
    maxWidth: '80%',
    borderRadius: 12,
    borderBottomLeftRadius: 0,
    overflow: 'hidden',
  },
  messageImage: {
    width: 240,
    aspectRatio: 4 / 3,
  },
  proofMessageContainer: {
    maxWidth: '80%',
  },
  proofCard: {
    backgroundColor: COLORS.successLight,
    borderRadius: 12,
    borderBottomLeftRadius: 0,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.success + '30',
  },
  proofHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  proofHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.success,
    flex: 1,
  },
  proofFilename: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '500',
  },
  proofStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.success + '20',
  },
  proofStatusText: {
    fontSize: 13,
    color: COLORS.warning,
    fontWeight: '500',
  },
  proofStatusVerified: {
    fontSize: 13,
    color: COLORS.success,
    fontWeight: '600',
  },
  proofStatusRejected: {
    fontSize: 13,
    color: COLORS.error,
    fontWeight: '600',
  },
});
