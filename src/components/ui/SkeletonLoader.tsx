import React, { memo, useEffect, useRef } from 'react';
import type { ViewStyle } from 'react-native';
import { View, Animated, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const SkeletonLoader = memo<SkeletonLoaderProps>(
  function SkeletonLoader({
    width = '100%',
    height = 20,
    borderRadius = 8,
    style,
  }) {
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
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
        ]),
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
            width: width as number,
            height,
            borderRadius,
            opacity,
          },
          style,
        ]}
      />
    );
  },
);

// Preset skeletons
export const SkeletonCard: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <View style={[styles.card, style]}>
    <SkeletonLoader width="100%" height={160} borderRadius={12} />
    <View style={styles.cardContent}>
      <SkeletonLoader width="70%" height={20} />
      <SkeletonLoader width="50%" height={16} style={styles.marginTop} />
      <SkeletonLoader width="30%" height={16} style={styles.marginTop} />
    </View>
  </View>
);

export const SkeletonListItem: React.FC<{ style?: ViewStyle }> = ({
  style,
}) => (
  <View style={[styles.listItem, style]}>
    <SkeletonLoader width={48} height={48} borderRadius={24} />
    <View style={styles.listItemContent}>
      <SkeletonLoader width="60%" height={16} />
      <SkeletonLoader width="80%" height={14} style={styles.marginTopSm} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: COLORS.gray[300],
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  cardContent: {
    padding: 16,
  },
  marginTop: {
    marginTop: 12,
  },
  marginTopSm: {
    marginTop: 8,
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
});

export default SkeletonLoader;
