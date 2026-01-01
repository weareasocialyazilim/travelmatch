/**
 * Skeleton Component
 *
 * Enhanced shimmer loading placeholder for content loading states.
 * Part of iOS 26.3 design system for TravelMatch.
 * Uses react-native-reanimated for native-thread animations.
 */
import React, { memo, useEffect } from 'react';
import type { ViewStyle } from 'react-native';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, primitives } from '../../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  /** Enable shimmer animation (default: true) */
  shimmer?: boolean;
  /** Shape variant: 'rect' for rectangle, 'circle' for circular */
  variant?: 'rect' | 'circle';
}

export const Skeleton = memo<SkeletonLoaderProps>(function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
  shimmer = true,
  variant = 'rect',
}) {
  // Calculate borderRadius based on variant
  const computedBorderRadius = variant === 'circle' ? (typeof height === 'number' ? height / 2 : 8) : borderRadius;
  const opacity = useSharedValue(0.4);
  const translateX = useSharedValue(-SCREEN_WIDTH);

  useEffect(() => {
    // Opacity animation - pulse between 0.4 and 0.7
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1, // infinite
      false,
    );

    // Shimmer animation
    if (shimmer) {
      translateX.value = withRepeat(
        withTiming(SCREEN_WIDTH, {
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
        }),
        -1, // infinite
        false,
      );
    }

    return () => {
      cancelAnimation(opacity);
      cancelAnimation(translateX);
    };
  }, [opacity, translateX, shimmer]);

  const opacityStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    backgroundColor: primitives.stone[200],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View
      style={[
        styles.skeleton,
        {
          width: width as number,
          height,
          borderRadius: computedBorderRadius,
        },
        style,
      ]}
    >
      <Animated.View style={[StyleSheet.absoluteFillObject, opacityStyle]} />
      {shimmer && (
        <Animated.View style={[styles.shimmerContainer, shimmerStyle]}>
          <LinearGradient
            colors={['transparent', 'rgba(255, 255, 255, 0.4)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.shimmerGradient}
          />
        </Animated.View>
      )}
    </View>
  );
});

/**
 * SkeletonText - Multiple line skeleton for text content
 */
interface SkeletonTextProps {
  lines?: number;
  lineHeight?: number;
  lastLineWidth?: string;
  style?: ViewStyle;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  lineHeight = 14,
  lastLineWidth = '60%',
  style,
}) => (
  <View style={style}>
    {Array.from({ length: lines }).map((_, index) => (
      <Skeleton
        key={index}
        width={index === lines - 1 ? lastLineWidth : '100%'}
        height={lineHeight}
        borderRadius={4}
        style={index > 0 ? styles.lineSpacing : undefined}
      />
    ))}
  </View>
);

/**
 * SkeletonAvatar - Circular skeleton for avatars
 */
interface SkeletonAvatarProps {
  size?: number;
  style?: ViewStyle;
}

export const SkeletonAvatar: React.FC<SkeletonAvatarProps> = ({
  size = 48,
  style,
}) => (
  <Skeleton width={size} height={size} borderRadius={size / 2} style={style} />
);

// Preset skeletons
export const SkeletonCard: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <View style={[styles.card, style]}>
    <Skeleton width="100%" height={160} borderRadius={0} />
    <View style={styles.cardContent}>
      <View style={styles.cardUserRow}>
        <SkeletonAvatar size={40} />
        <View style={styles.cardUserInfo}>
          <Skeleton width={100} height={14} />
          <Skeleton width={60} height={10} style={styles.marginTopSm} />
        </View>
      </View>
      <Skeleton width="80%" height={20} style={styles.marginTop} />
      <SkeletonText lines={2} style={styles.marginTop} />
      <Skeleton
        width="100%"
        height={48}
        borderRadius={24}
        style={styles.marginTopLg}
      />
    </View>
  </View>
);

export const SkeletonListItem: React.FC<{ style?: ViewStyle }> = ({
  style,
}) => (
  <View style={[styles.listItem, style]}>
    <Skeleton width={48} height={48} borderRadius={24} />
    <View style={styles.listItemContent}>
      <Skeleton width="60%" height={16} />
      <Skeleton width="80%" height={14} style={styles.marginTopSm} />
    </View>
  </View>
);

/**
 * SkeletonWishCard - Skeleton for WishCard component
 */
export const SkeletonWishCard: React.FC<{ style?: ViewStyle }> = ({
  style,
}) => {
  const cardWidth = SCREEN_WIDTH - 32;
  const cardHeight = cardWidth * 1.25;

  return (
    <View style={[styles.wishCard, { width: cardWidth }, style]}>
      {/* Hero image */}
      <Skeleton width="100%" height={cardHeight} borderRadius={0} />

      {/* Bottom section */}
      <View style={styles.wishCardBottom}>
        <View>
          <Skeleton width={50} height={12} />
          <Skeleton width={80} height={24} style={styles.marginTopSm} />
        </View>
        <Skeleton width={140} height={52} borderRadius={26} />
      </View>
    </View>
  );
};

/**
 * SkeletonMessage - Skeleton for chat message
 */
export const SkeletonMessage: React.FC<{
  isOwn?: boolean;
  style?: ViewStyle;
}> = ({ isOwn = false, style }) => (
  <View
    style={[
      styles.message,
      isOwn ? styles.messageOwn : styles.messageOther,
      style,
    ]}
  >
    {!isOwn && <SkeletonAvatar size={32} style={styles.messageAvatar} />}
    <View style={[styles.messageBubble, isOwn && styles.messageBubbleOwn]}>
      <Skeleton width={isOwn ? 120 : 180} height={14} />
      <Skeleton
        width={isOwn ? 80 : 140}
        height={14}
        style={styles.marginTopSm}
      />
    </View>
  </View>
);

/**
 * FeedSkeleton - Skeleton for feed/discover card layout
 * Pre-built layout showing 2 cards with image, title, and metadata
 */
export const FeedSkeleton: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <View style={[styles.feedContainer, style]}>
    {[1, 2].map(i => (
      <View key={i} style={styles.feedCard}>
        <Skeleton height={350} borderRadius={20} />
        <View style={styles.feedCardFooter}>
          <Skeleton width={150} height={24} />
          <Skeleton width={60} height={24} />
        </View>
        <Skeleton width={100} height={16} style={styles.marginTopSm} />
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  lineSpacing: {
    marginTop: 8,
  },
  skeleton: {
    backgroundColor: primitives.stone[200],
    overflow: 'hidden',
  },
  shimmerContainer: {
    ...StyleSheet.absoluteFillObject,
    width: SCREEN_WIDTH,
  },
  shimmerGradient: {
    flex: 1,
    width: '100%',
  },
  card: {
    backgroundColor: COLORS.utility.white,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    padding: 16,
  },
  cardUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardUserInfo: {
    marginLeft: 12,
  },
  marginTop: {
    marginTop: 12,
  },
  marginTopSm: {
    marginTop: 6,
  },
  marginTopLg: {
    marginTop: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.utility.white,
  },
  listItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  wishCard: {
    backgroundColor: COLORS.utility.white,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 16,
  },
  wishCardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  message: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  messageOwn: {
    justifyContent: 'flex-end',
  },
  messageOther: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    marginRight: 8,
  },
  messageBubble: {
    backgroundColor: primitives.stone[100],
    borderRadius: 16,
    padding: 12,
    maxWidth: '70%',
  },
  messageBubbleOwn: {
    backgroundColor: COLORS.primaryMuted,
  },
  // Feed skeleton styles
  feedContainer: {
    padding: 20,
    gap: 20,
  },
  feedCard: {
    gap: 10,
  },
  feedCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});

// Alias for SkeletonLoader API compatibility
export const SkeletonLoader = Skeleton;

export default Skeleton;
