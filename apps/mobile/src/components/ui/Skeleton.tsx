/**
 * Skeleton Component
 *
 * Enhanced shimmer loading placeholder for content loading states.
 * Part of iOS 26.3 design system for TravelMatch.
 */
import React, { memo, useEffect, useRef } from 'react';
import type { ViewStyle } from 'react-native';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  /** Enable shimmer animation (default: true) */
  shimmer?: boolean;
}

export const Skeleton = memo<SkeletonLoaderProps>(function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
  shimmer = true,
}) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const shimmerPosition = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    // Opacity animation
    const opacityAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    opacityAnimation.start();

    // Shimmer animation
    if (shimmer) {
      const shimmerAnimation = Animated.loop(
        Animated.timing(shimmerPosition, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      );
      shimmerAnimation.start();
    }

    return () => {
      opacityAnimation.stop();
    };
  }, [animatedValue, shimmerPosition, shimmer]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.7],
  });

  const translateX = shimmerPosition.interpolate({
    inputRange: [-1, 1],
    outputRange: [-SCREEN_WIDTH, SCREEN_WIDTH],
  });

  return (
    <View
      style={[
        styles.skeleton,
        {
          width: width as number,
          height,
          borderRadius,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          { opacity },
          { backgroundColor: COLORS.gray[200] },
        ]}
      />
      {shimmer && (
        <Animated.View
          style={[
            styles.shimmerContainer,
            { transform: [{ translateX }] },
          ]}
        >
          <LinearGradient
            colors={[
              'transparent',
              'rgba(255, 255, 255, 0.4)',
              'transparent',
            ]}
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
        style={index > 0 ? { marginTop: 8 } : undefined}
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
  <Skeleton
    width={size}
    height={size}
    borderRadius={size / 2}
    style={style}
  />
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
      <Skeleton width="100%" height={48} borderRadius={24} style={styles.marginTopLg} />
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
export const SkeletonWishCard: React.FC<{ style?: ViewStyle }> = ({ style }) => {
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
      <Skeleton width={isOwn ? 80 : 140} height={14} style={styles.marginTopSm} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: COLORS.gray[200],
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
    backgroundColor: COLORS.white,
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
    backgroundColor: COLORS.white,
  },
  listItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  wishCard: {
    backgroundColor: COLORS.white,
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
    backgroundColor: COLORS.gray[100],
    borderRadius: 16,
    padding: 12,
    maxWidth: '70%',
  },
  messageBubbleOwn: {
    backgroundColor: COLORS.primaryMuted,
  },
});

export default Skeleton;
