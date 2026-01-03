/**
 * @deprecated This component is deprecated. Use TMSkeleton instead.
 *
 * Migration Guide:
 * ================
 *
 * BEFORE:
 * ```tsx
 * import { Skeleton, SkeletonText, SkeletonAvatar } from '@/components/ui/Skeleton';
 *
 * <Skeleton width={100} height={20} />
 * <SkeletonText lines={3} />
 * <SkeletonAvatar size={48} />
 * ```
 *
 * AFTER:
 * ```tsx
 * import { TMSkeleton } from '@/components/ui/TMSkeleton';
 *
 * <TMSkeleton type="base" width={100} height={20} />
 * <TMSkeleton type="text" lines={3} />
 * <TMSkeleton type="avatar" size={48} />
 * ```
 *
 * This file re-exports from TMSkeleton for backward compatibility.
 */

// Re-export everything from TMSkeleton
export {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonMessage,
  TMSkeleton,
} from './TMSkeleton';

// Also export Skeleton as default
export { Skeleton as default } from './TMSkeleton';

// Re-export as SkeletonLoader for API compatibility
export { Skeleton as SkeletonLoader } from './TMSkeleton';

// Export types
export type { TMSkeletonProps, SkeletonVariant } from './TMSkeleton';

// Legacy exports for feed skeleton
import React from 'react';
import type { ViewStyle } from 'react-native';
import { View, StyleSheet } from 'react-native';
import { TMSkeleton } from './TMSkeleton';
import { SPACING } from '@/constants/spacing';

/**
 * @deprecated Use TMSkeleton with type="card" in a list
 */
export const FeedSkeleton: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <View style={[styles.feedContainer, style]}>
    {[1, 2].map((i) => (
      <View key={i} style={styles.feedCard}>
        <TMSkeleton type="base" height={350} borderRadius={20} />
        <View style={styles.feedCardFooter}>
          <TMSkeleton type="base" width={150} height={24} />
          <TMSkeleton type="base" width={60} height={24} />
        </View>
        <TMSkeleton type="base" width={100} height={16} style={styles.mt6} />
      </View>
    ))}
  </View>
);

/**
 * @deprecated Use TMSkeleton with type="list" listType="chat"
 */
export const SkeletonListItem: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <View style={[styles.listItem, style]}>
    <TMSkeleton type="avatar" size={48} />
    <View style={styles.listItemContent}>
      <TMSkeleton type="base" width="60%" height={16} />
      <TMSkeleton type="base" width="80%" height={14} style={styles.mt6} />
    </View>
  </View>
);

const styles = StyleSheet.create({
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
  mt6: {
    marginTop: 6,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  listItemContent: {
    flex: 1,
    marginLeft: 12,
  },
});
