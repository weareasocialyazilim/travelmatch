/**
 * Skeleton Loader Components
 * Provides loading placeholders for better UX
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, Animated, Dimensions } from 'react-native';
import { COLORS } from '@/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
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
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: width as number | `${number}%`,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

interface SkeletonCardProps {
  style?: ViewStyle;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ style }) => {
  return (
    <View style={[styles.card, style]}>
      <SkeletonLoader width={SCREEN_WIDTH - 32} height={200} borderRadius={12} />
      <View style={styles.cardContent}>
        <SkeletonLoader width="70%" height={24} style={styles.marginBottom} />
        <SkeletonLoader width="50%" height={16} style={styles.marginBottom} />
        <SkeletonLoader width="40%" height={16} />
      </View>
    </View>
  );
};

interface SkeletonListItemProps {
  style?: ViewStyle;
  showAvatar?: boolean;
}

export const SkeletonListItem: React.FC<SkeletonListItemProps> = ({
  style,
  showAvatar = true,
}) => {
  return (
    <View style={[styles.listItem, style]}>
      {showAvatar && (
        <SkeletonLoader width={48} height={48} borderRadius={24} style={styles.avatar} />
      )}
      <View style={styles.listItemContent}>
        <SkeletonLoader width="80%" height={16} style={styles.marginBottom} />
        <SkeletonLoader width="60%" height={14} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: COLORS.gray[200],
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardContent: {
    marginTop: 12,
  },
  marginBottom: {
    marginBottom: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    marginBottom: 8,
  },
  avatar: {
    marginRight: 12,
  },
  listItemContent: {
    flex: 1,
  },
});

export default SkeletonLoader;
