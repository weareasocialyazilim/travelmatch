import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/colors';

interface StatsRowProps {
  momentsCount: number;
  exchangesCount: number;
  responseRate: number;
  onMomentsPress: () => void;
  onExchangesPress: () => void;
}

const StatsRow: React.FC<StatsRowProps> = memo(
  ({
    momentsCount,
    exchangesCount,
    responseRate,
    onMomentsPress,
    onExchangesPress,
  }) => {
    return (
      <View style={styles.statsRow}>
        <TouchableOpacity
          style={styles.statItem}
          onPress={onMomentsPress}
          accessibilityLabel={`${momentsCount} Moments. Tap to view`}
          accessibilityRole="button"
        >
          <Text style={styles.statNumber}>{momentsCount}</Text>
          <Text style={styles.statLabel}>Moments</Text>
        </TouchableOpacity>
        <View style={styles.statDivider} />
        <TouchableOpacity
          style={styles.statItem}
          onPress={onExchangesPress}
          accessibilityLabel={`${exchangesCount} Exchanges. Tap to view`}
          accessibilityRole="button"
        >
          <Text style={styles.statNumber}>{exchangesCount}</Text>
          <Text style={styles.statLabel}>Exchanges</Text>
        </TouchableOpacity>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{responseRate}%</Text>
          <Text style={styles.statLabel}>Response</Text>
        </View>
      </View>
    );
  },
  (prevProps, nextProps) =>
    prevProps.momentsCount === nextProps.momentsCount &&
    prevProps.exchangesCount === nextProps.exchangesCount &&
    prevProps.responseRate === nextProps.responseRate,
);

StatsRow.displayName = 'StatsRow';

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: COLORS.border.default,
  },
});

export { StatsRow };
export default StatsRow;
