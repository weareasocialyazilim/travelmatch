/**
 * TMProofCard - TravelMatch Ultimate Design System 2026
 * Proof card component for chat messages
 *
 * Displays a proof submission with:
 * - Moment title
 * - Media preview (photo/video)
 * - Completion date
 * - Verification status
 * - Share action
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, SHADOWS, primitives } from '@/constants/colors';
import { TYPOGRAPHY } from '@/theme/typography';
import { RADIUS, SPACING } from '@/constants/spacing';
import { SPRING, HAPTIC } from '@/utils/motion';

export type ProofStatus = 'pending' | 'verified' | 'rejected';
export type MediaType = 'photo' | 'video';

export interface TMProofCardProps {
  /** Title of the completed moment */
  momentTitle: string;
  /** When the moment was completed */
  completedAt: Date;
  /** Media URL (image or video thumbnail) */
  mediaUrl: string;
  /** Type of media */
  mediaType: MediaType;
  /** Verification status */
  status: ProofStatus;
  /** When the proof was verified */
  verifiedAt?: Date;
  /** Callback when share button is pressed */
  onShare?: () => void;
  /** Callback when media is pressed (to view full) */
  onMediaPress?: () => void;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID */
  testID?: string;
}

/**
 * Get status configuration
 */
const getStatusConfig = (
  status: ProofStatus,
): {
  label: string;
  color: string;
  bgColor: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
} => {
  switch (status) {
    case 'verified':
      return {
        label: 'Verified',
        color: COLORS.success,
        bgColor: `${COLORS.success}15`,
        icon: 'check-decagram',
      };
    case 'rejected':
      return {
        label: 'Rejected',
        color: COLORS.error,
        bgColor: `${COLORS.error}15`,
        icon: 'close-circle',
      };
    case 'pending':
    default:
      return {
        label: 'Pending Review',
        color: COLORS.warning,
        bgColor: `${COLORS.warning}15`,
        icon: 'clock-outline',
      };
  }
};

/**
 * Format date to readable string
 */
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export const TMProofCard: React.FC<TMProofCardProps> = ({
  momentTitle,
  completedAt,
  mediaUrl,
  mediaType,
  status,
  verifiedAt,
  onShare,
  onMediaPress,
  style,
  testID,
}) => {
  const scale = useSharedValue(1);
  const statusConfig = getStatusConfig(status);
  const isVerified = status === 'verified';

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.98, SPRING.snappy);
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, SPRING.default);
  }, []);

  const handleShare = useCallback(() => {
    HAPTIC.light();
    onShare?.();
  }, [onShare]);

  const handleMediaPress = useCallback(() => {
    HAPTIC.light();
    onMediaPress?.();
  }, [onMediaPress]);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[styles.container, cardAnimatedStyle, style]}
      testID={testID}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.card}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <MaterialCommunityIcons
              name="camera-marker-outline"
              size={20}
              color={COLORS.trust.primary}
            />
            <Text style={styles.headerTitle}>Proof Submitted</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusConfig.bgColor },
            ]}
          >
            <MaterialCommunityIcons
              name={statusConfig.icon}
              size={14}
              color={statusConfig.color}
            />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        {/* Media Preview */}
        <Pressable
          onPress={handleMediaPress}
          style={styles.mediaContainer}
          testID={testID ? `${testID}-media` : undefined}
        >
          <Image
            source={{ uri: mediaUrl }}
            style={styles.media}
            resizeMode="cover"
          />

          {/* Media type indicator */}
          <View style={styles.mediaTypeIndicator}>
            <MaterialCommunityIcons
              name={mediaType === 'video' ? 'play-circle' : 'image'}
              size={24}
              color={COLORS.white}
            />
          </View>

          {/* Verified overlay */}
          {isVerified && (
            <View style={styles.verifiedOverlay}>
              <MaterialCommunityIcons
                name="check-decagram"
                size={48}
                color={COLORS.success}
              />
            </View>
          )}
        </Pressable>

        {/* Content */}
        <View style={styles.content}>
          {/* Moment Title */}
          <Text style={styles.momentTitle} numberOfLines={2}>
            {momentTitle}
          </Text>

          {/* Timestamps */}
          <View style={styles.timestampRow}>
            <MaterialCommunityIcons
              name="calendar-check"
              size={14}
              color={primitives.stone[400]}
            />
            <Text style={styles.timestampText}>
              Completed {formatDate(completedAt)}
            </Text>
          </View>

          {verifiedAt && isVerified && (
            <View style={styles.timestampRow}>
              <MaterialCommunityIcons
                name="check-circle"
                size={14}
                color={COLORS.success}
              />
              <Text style={[styles.timestampText, { color: COLORS.success }]}>
                Verified {formatDate(verifiedAt)}
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable
            onPress={handleMediaPress}
            style={styles.actionButton}
            testID={testID ? `${testID}-view` : undefined}
          >
            <MaterialCommunityIcons
              name="eye"
              size={18}
              color={COLORS.text.primary}
            />
            <Text style={styles.actionText}>View Proof</Text>
          </Pressable>

          {onShare && isVerified && (
            <Pressable
              onPress={handleShare}
              style={[styles.actionButton, styles.shareButton]}
              testID={testID ? `${testID}-share` : undefined}
            >
              <MaterialCommunityIcons
                name="share-variant"
                size={18}
                color={COLORS.primary}
              />
              <Text style={[styles.actionText, styles.shareText]}>Share</Text>
            </Pressable>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    maxWidth: 300,
    ...SHADOWS.card,
  },
  card: {
    backgroundColor: COLORS.surface.base,
    borderRadius: RADIUS.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.hairline,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.hairline,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  headerTitle: {
    ...TYPOGRAPHY.labelLarge,
    color: COLORS.text.primary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.chip,
  },
  statusText: {
    ...TYPOGRAPHY.captionMedium,
  },
  mediaContainer: {
    position: 'relative',
    height: 160,
    backgroundColor: primitives.stone[200],
  },
  media: {
    width: '100%',
    height: '100%',
  },
  mediaTypeIndicator: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: RADIUS.full,
    padding: 4,
  },
  verifiedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: SPACING.base,
  },
  momentTitle: {
    ...TYPOGRAPHY.h4,
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  timestampText: {
    ...TYPOGRAPHY.captionSmall,
    color: primitives.stone[400],
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    padding: SPACING.base,
    paddingTop: 0,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.button,
    backgroundColor: primitives.stone[100],
  },
  shareButton: {
    backgroundColor: COLORS.primaryMuted,
  },
  actionText: {
    ...TYPOGRAPHY.labelSmall,
    color: COLORS.text.primary,
  },
  shareText: {
    color: COLORS.primary,
  },
});

export default TMProofCard;
