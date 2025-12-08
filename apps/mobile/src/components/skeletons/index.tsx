/**
 * Skeleton Components for Moments Feed
 * 
 * Provides shimmer loading placeholders to improve perceived performance:
 * - Shows instant feedback when loading
 * - Maintains layout stability (no layout shifts)
 * - Smooth shimmer animation
 * - Preload pipeline for images
 */

import React from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Shimmer animation hook
function useShimmer() {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1200,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-350, 350],
  });

  return { translateX };
}

// Base skeleton box component
interface SkeletonBoxProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
}

function SkeletonBox({ width, height, borderRadius = 8, style }: SkeletonBoxProps) {
  const { translateX } = useShimmer();

  return (
    <View
      style={[
        styles.skeletonBox,
        {
          width,
          height,
          borderRadius,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <LinearGradient
          colors={['#E1E9EE', '#F2F8FC', '#E1E9EE']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

// Moment card skeleton
export function MomentCardSkeleton() {
  return (
    <View style={styles.momentCard}>
      {/* Header with avatar and name */}
      <View style={styles.header}>
        <SkeletonBox width={48} height={48} borderRadius={24} />
        <View style={styles.headerText}>
          <SkeletonBox width={120} height={16} />
          <View style={{ height: 4 }} />
          <SkeletonBox width={80} height={12} />
        </View>
      </View>

      {/* Image */}
      <SkeletonBox width="100%" height={400} borderRadius={12} style={styles.momentImage} />

      {/* Footer with stats */}
      <View style={styles.footer}>
        <View style={styles.stats}>
          <SkeletonBox width={60} height={20} />
          <SkeletonBox width={60} height={20} />
          <SkeletonBox width={60} height={20} />
        </View>
        <SkeletonBox width="100%" height={14} style={{ marginTop: 8 }} />
        <SkeletonBox width="80%" height={14} style={{ marginTop: 4 }} />
      </View>
    </View>
  );
}

// Profile skeleton
export function ProfileSkeleton() {
  return (
    <View style={styles.profile}>
      {/* Header */}
      <View style={styles.profileHeader}>
        <SkeletonBox width={120} height={120} borderRadius={60} />
        <View style={{ height: 16 }} />
        <SkeletonBox width={180} height={24} />
        <View style={{ height: 8 }} />
        <SkeletonBox width={140} height={16} />
      </View>

      {/* Stats */}
      <View style={styles.profileStats}>
        <View style={styles.statItem}>
          <SkeletonBox width={50} height={28} />
          <View style={{ height: 4 }} />
          <SkeletonBox width={70} height={14} />
        </View>
        <View style={styles.statItem}>
          <SkeletonBox width={50} height={28} />
          <View style={{ height: 4 }} />
          <SkeletonBox width={70} height={14} />
        </View>
        <View style={styles.statItem}>
          <SkeletonBox width={50} height={28} />
          <View style={{ height: 4 }} />
          <SkeletonBox width={70} height={14} />
        </View>
      </View>

      {/* Bio */}
      <View style={styles.profileBio}>
        <SkeletonBox width="100%" height={14} />
        <View style={{ height: 6 }} />
        <SkeletonBox width="100%" height={14} />
        <View style={{ height: 6 }} />
        <SkeletonBox width="70%" height={14} />
      </View>

      {/* Action buttons */}
      <View style={styles.profileActions}>
        <SkeletonBox width="48%" height={48} borderRadius={24} />
        <SkeletonBox width="48%" height={48} borderRadius={24} />
      </View>

      {/* Moments grid */}
      <View style={styles.momentsGrid}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkeletonBox
            key={i}
            width="31%"
            height={120}
            borderRadius={8}
            style={styles.momentGridItem}
          />
        ))}
      </View>
    </View>
  );
}

// Feed skeleton (multiple cards)
interface FeedSkeletonProps {
  count?: number;
}

export function FeedSkeleton({ count = 3 }: FeedSkeletonProps) {
  return (
    <View style={styles.feed}>
      {Array.from({ length: count }).map((_, i) => (
        <MomentCardSkeleton key={i} />
      ))}
    </View>
  );
}

// Match card skeleton
export function MatchCardSkeleton() {
  return (
    <View style={styles.matchCard}>
      <SkeletonBox width={80} height={80} borderRadius={40} />
      <View style={{ height: 8 }} />
      <SkeletonBox width={100} height={18} />
      <View style={{ height: 4 }} />
      <SkeletonBox width={80} height={14} />
    </View>
  );
}

// Message skeleton
export function MessageSkeleton() {
  return (
    <View style={styles.message}>
      <SkeletonBox width={40} height={40} borderRadius={20} />
      <View style={styles.messageContent}>
        <SkeletonBox width={120} height={16} />
        <View style={{ height: 6 }} />
        <SkeletonBox width="100%" height={14} />
        <View style={{ height: 4 }} />
        <SkeletonBox width="80%" height={14} />
      </View>
    </View>
  );
}

// List skeleton (generic)
interface ListSkeletonProps {
  itemHeight: number;
  itemCount?: number;
  ItemSkeleton?: React.ComponentType;
}

export function ListSkeleton({
  itemHeight,
  itemCount = 5,
  ItemSkeleton = () => <SkeletonBox width="100%" height={itemHeight} />,
}: ListSkeletonProps) {
  return (
    <View>
      {Array.from({ length: itemCount }).map((_, i) => (
        <View key={i} style={{ marginBottom: 12 }}>
          <ItemSkeleton />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeletonBox: {
    backgroundColor: '#E1E9EE',
  },
  
  // Moment card
  momentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerText: {
    marginLeft: 12,
    flex: 1,
  },
  momentImage: {
    marginVertical: 12,
  },
  footer: {
    paddingTop: 12,
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
  },
  
  // Profile
  profile: {
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  profileStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E1E9EE',
  },
  statItem: {
    alignItems: 'center',
  },
  profileBio: {
    paddingVertical: 20,
  },
  profileActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  momentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 16,
  },
  momentGridItem: {
    marginBottom: 8,
  },
  
  // Feed
  feed: {
    padding: 16,
  },
  
  // Match card
  matchCard: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginRight: 12,
    width: 140,
  },
  
  // Message
  message: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
  },
  messageContent: {
    flex: 1,
    marginLeft: 12,
  },
});
