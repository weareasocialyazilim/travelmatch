/**
 * Skeleton Loaders for different components
 * Çeşitli component'ler için hazır skeleton loader'lar
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from './Skeleton';
import { spacing } from '../../constants/spacing';
import { radii } from '../../constants/radii';

/**
 * Card Skeleton
 */
export const SkeletonCard: React.FC = () => {
  return (
    <View style={styles.card}>
      <Skeleton height={200} borderRadius={radii.lg} />
      <View style={styles.cardContent}>
        <Skeleton height={24} width="70%" style={styles.spacing} />
        <Skeleton height={16} width="50%" style={styles.spacing} />
        <View style={styles.row}>
          <Skeleton height={16} width={60} borderRadius={radii.full} />
          <Skeleton height={16} width={60} borderRadius={radii.full} />
        </View>
      </View>
    </View>
  );
};

/**
 * List Item Skeleton
 */
export const SkeletonListItem: React.FC = () => {
  return (
    <View style={styles.listItem}>
      <Skeleton height={60} width={60} borderRadius={radii.full} />
      <View style={styles.listItemContent}>
        <Skeleton height={18} width="80%" style={styles.spacing} />
        <Skeleton height={14} width="60%" />
      </View>
    </View>
  );
};

/**
 * Profile Header Skeleton
 */
export const SkeletonProfileHeader: React.FC = () => {
  return (
    <View style={styles.profileHeader}>
      <Skeleton
        height={120}
        width={120}
        borderRadius={radii.full}
        style={styles.spacing}
      />
      <Skeleton height={28} width="60%" style={styles.spacing} />
      <Skeleton height={16} width="40%" style={styles.spacing} />
      <View style={styles.row}>
        <Skeleton height={40} width={100} borderRadius={radii.lg} />
        <Skeleton height={40} width={100} borderRadius={radii.lg} />
      </View>
    </View>
  );
};

/**
 * Moment Detail Skeleton
 */
export const SkeletonMomentDetail: React.FC = () => {
  return (
    <View style={styles.momentDetail}>
      <Skeleton height={300} borderRadius={radii.lg} style={styles.spacing} />
      <Skeleton height={32} width="80%" style={styles.spacing} />
      <View style={styles.row}>
        <Skeleton height={24} width={80} borderRadius={radii.full} />
        <Skeleton height={24} width={80} borderRadius={radii.full} />
      </View>
      <Skeleton height={60} style={styles.spacing} />
      <Skeleton height={60} style={styles.spacing} />
      <View style={styles.row}>
        <Skeleton height={50} borderRadius={radii.lg} style={styles.flex1} />
        <Skeleton height={50} width={50} borderRadius={radii.lg} />
      </View>
    </View>
  );
};

/**
 * Grid Skeleton (3 columns)
 */
interface SkeletonGridProps {
  count?: number;
}

export const SkeletonGrid: React.FC<SkeletonGridProps> = ({ count = 6 }) => {
  return (
    <View style={styles.grid}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.gridItem}>
          <Skeleton height={150} borderRadius={radii.md} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  cardContent: {
    padding: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    marginBottom: spacing.md,
    width: '48%',
  },
  listItem: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  listItemContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  momentDetail: {
    padding: spacing.md,
  },
  profileHeader: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  spacing: {
    marginBottom: spacing.sm,
  },
  flex1: {
    flex: 1,
  },
});
