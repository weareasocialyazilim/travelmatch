/**
 * StatsRow Component - Edition
 *
 * Premium stats display with Twilight Zinc dark theme.
 */
import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const STATS_COLORS = {
  text: {
    primary: '#F8FAFC',
    secondary: '#94A3B8',
  },
  neon: {
    lime: '#DFFF00',
    violet: '#A855F7',
    cyan: '#06B6D4',
  },
  glass: {
    border: 'rgba(255, 255, 255, 0.08)',
  },
};

const SPRINGS = {
  snappy: { damping: 20, stiffness: 300, mass: 0.5 },
  bouncy: { damping: 15, stiffness: 150, mass: 0.5 },
};

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface StatsRowProps {
  momentsCount: number;
  activeMoments: number;
  onMomentsPress: () => void;
}

interface StatItemProps {
  value: number | string;
  label: string;
  accentColor?: string;
  onPress?: () => void;
}

const StatItem: React.FC<StatItemProps> = memo(
  ({ value, label, accentColor, onPress }) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
      if (onPress) {
        scale.value = withSpring(0.95, SPRINGS.snappy);
      }
    };

    const handlePressOut = () => {
      if (onPress) {
        scale.value = withSpring(1, SPRINGS.bouncy);
      }
    };

    const content = (
      <View style={styles.statItem}>
        <Text
          style={[styles.statNumber, accentColor && { color: accentColor }]}
        >
          {value}
        </Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    );

    if (onPress) {
      return (
        <AnimatedTouchable
          style={animatedStyle}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          accessibilityLabel={`${label} ${value}. Tap to view`}
          accessibilityRole="button"
          activeOpacity={0.8}
        >
          {content}
        </AnimatedTouchable>
      );
    }

    return <Animated.View style={animatedStyle}>{content}</Animated.View>;
  },
);

StatItem.displayName = 'StatItem';

const StatsRow: React.FC<StatsRowProps> = memo(
  ({ momentsCount, activeMoments, onMomentsPress }) => {
    return (
      <View style={styles.statsRow}>
        <StatItem
          value={momentsCount}
          label="Anlar"
          accentColor={STATS_COLORS.neon.lime}
          onPress={onMomentsPress}
        />
        <View style={styles.statDivider} />
        <StatItem
          value={activeMoments}
          label="Aktif"
          accentColor={STATS_COLORS.neon.violet}
        />
      </View>
    );
  },
  (prevProps, nextProps) =>
    prevProps.momentsCount === nextProps.momentsCount &&
    prevProps.activeMoments === nextProps.activeMoments,
);

StatsRow.displayName = 'StatsRow';

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    gap: 10,
    minWidth: 0,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: STATS_COLORS.text.primary,
    letterSpacing: -0.02 * 28, // -0.02em for modern technical look
    includeFontPadding: false,
    ...Platform.select({
      ios: { marginBottom: 0 },
      android: { marginBottom: 0 },
    }),
  },
  statLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: STATS_COLORS.text.secondary,
    letterSpacing: 0.2,
    marginLeft: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: STATS_COLORS.glass.border,
    marginHorizontal: 4,
  },
});

export { StatsRow };
export default StatsRow;
