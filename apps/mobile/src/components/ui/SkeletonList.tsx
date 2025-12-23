/**
 * SkeletonList - Unified Skeleton Loading System
 *
 * Provides consistent skeleton loading states across all list views
 * with configurable minimum display time for better UX
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { Skeleton } from './Skeleton';

// ============================================================================
// TYPES
// ============================================================================

export type SkeletonItemType =
  | 'chat'
  | 'moment'
  | 'gift'
  | 'transaction'
  | 'notification'
  | 'request'
  | 'trip';

interface SkeletonListProps {
  /**
   * Type of skeleton item to render
   */
  type: SkeletonItemType;

  /**
   * Number of skeleton items to show
   * @default 5
   */
  count?: number;

  /**
   * Minimum display time in ms (prevents flash)
   * @default 400
   */
  minDisplayTime?: number;

  /**
   * Whether to show the skeleton
   * If false and minDisplayTime has passed, hides immediately
   */
  show?: boolean;

  /**
   * Test ID for testing
   */
  testID?: string;
}

// ============================================================================
// SKELETON ITEM COMPONENTS
// ============================================================================

/**
 * Chat/Message item skeleton
 */
const ChatSkeleton: React.FC = () => (
  <View style={styles.chatItem}>
    <Skeleton width={52} height={52} borderRadius={26} />
    <View style={styles.chatContent}>
      <View style={styles.row}>
        <Skeleton width={120} height={16} />
        <Skeleton width={40} height={12} />
      </View>
      <Skeleton width={80} height={20} borderRadius={6} style={styles.mt6} />
      <Skeleton width="85%" height={14} style={styles.mt6} />
    </View>
  </View>
);

/**
 * Moment card skeleton
 */
const MomentSkeleton: React.FC = () => (
  <View style={styles.momentCard}>
    <Skeleton width="100%" height={200} borderRadius={12} />
    <View style={styles.momentInfo}>
      <Skeleton width="70%" height={18} style={styles.mt12} />
      <Skeleton width="40%" height={14} style={styles.mt8} />
      <View style={styles.momentFooter}>
        <Skeleton width={80} height={14} />
        <Skeleton width={50} height={14} />
      </View>
    </View>
  </View>
);

/**
 * Gift inbox item skeleton
 */
const GiftSkeleton: React.FC = () => (
  <View style={styles.giftItem}>
    <Skeleton width={64} height={64} borderRadius={32} />
    <View style={styles.giftContent}>
      <View style={styles.row}>
        <Skeleton width={140} height={16} />
        <Skeleton width={60} height={14} />
      </View>
      <Skeleton width="90%" height={14} style={styles.mt6} />
      <View style={styles.giftFooter}>
        <Skeleton width={100} height={12} />
        <Skeleton width={70} height={24} borderRadius={12} />
      </View>
    </View>
  </View>
);

/**
 * Transaction item skeleton
 */
const TransactionSkeleton: React.FC = () => (
  <View style={styles.transactionItem}>
    <Skeleton width={40} height={40} borderRadius={20} />
    <View style={styles.transactionContent}>
      <Skeleton width="60%" height={16} />
      <Skeleton width="40%" height={12} style={styles.mt4} />
    </View>
    <View style={styles.transactionAmount}>
      <Skeleton width={70} height={18} />
      <Skeleton width={50} height={12} style={styles.mt4} />
    </View>
  </View>
);

/**
 * Notification item skeleton
 */
const NotificationSkeleton: React.FC = () => (
  <View style={styles.notificationItem}>
    <Skeleton width={48} height={48} borderRadius={24} />
    <View style={styles.notificationContent}>
      <Skeleton width="75%" height={14} />
      <Skeleton width="55%" height={12} style={styles.mt4} />
      <Skeleton width={50} height={10} style={styles.mt6} />
    </View>
  </View>
);

/**
 * Request card skeleton
 */
const RequestSkeleton: React.FC = () => (
  <View style={styles.requestCard}>
    <View style={styles.requestHeader}>
      <Skeleton width={56} height={56} borderRadius={28} />
      <View style={styles.requestInfo}>
        <Skeleton width={120} height={16} />
        <Skeleton width={80} height={12} style={styles.mt4} />
      </View>
      <Skeleton width={60} height={24} borderRadius={12} />
    </View>
    <Skeleton width="100%" height={40} borderRadius={8} style={styles.mt12} />
    <View style={styles.requestActions}>
      <Skeleton width="48%" height={44} borderRadius={10} />
      <Skeleton width="48%" height={44} borderRadius={10} />
    </View>
  </View>
);

/**
 * Trip item skeleton
 */
const TripSkeleton: React.FC = () => (
  <View style={styles.tripCard}>
    <Skeleton width="100%" height={140} borderRadius={12} />
    <View style={styles.tripInfo}>
      <Skeleton width="80%" height={18} style={styles.mt12} />
      <Skeleton width="50%" height={14} style={styles.mt6} />
      <View style={styles.tripFooter}>
        <Skeleton width={90} height={14} />
        <Skeleton width={60} height={14} />
      </View>
    </View>
  </View>
);

// ============================================================================
// SKELETON ITEM RENDERER
// ============================================================================

const SkeletonItem: React.FC<{ type: SkeletonItemType }> = ({ type }) => {
  switch (type) {
    case 'chat':
      return <ChatSkeleton />;
    case 'moment':
      return <MomentSkeleton />;
    case 'gift':
      return <GiftSkeleton />;
    case 'transaction':
      return <TransactionSkeleton />;
    case 'notification':
      return <NotificationSkeleton />;
    case 'request':
      return <RequestSkeleton />;
    case 'trip':
      return <TripSkeleton />;
    default:
      return <ChatSkeleton />;
  }
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * SkeletonList - Renders a list of skeleton items with minimum display time
 *
 * @example
 * // Basic usage
 * {loading && <SkeletonList type="moment" count={3} />}
 *
 * @example
 * // With controlled visibility
 * <SkeletonList
 *   type="chat"
 *   count={5}
 *   show={isLoading}
 *   minDisplayTime={500}
 * />
 *
 * @example
 * // Prevent flash on fast responses
 * <SkeletonList type="transaction" minDisplayTime={300} />
 */
export const SkeletonList: React.FC<SkeletonListProps> = ({
  type,
  count = 5,
  minDisplayTime = 400,
  show = true,
  testID,
}) => {
  const [shouldShow, setShouldShow] = useState(show);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (show) {
      // Show immediately
      setShouldShow(true);
      setHasShown(true);
    } else if (hasShown) {
      // Hide after minimum display time
      timeout = setTimeout(() => {
        setShouldShow(false);
      }, minDisplayTime);
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [show, minDisplayTime, hasShown]);

  if (!shouldShow) {
    return null;
  }

  return (
    <View style={styles.container} testID={testID}>
      {Array.from({ length: count }, (_, i) => (
        <SkeletonItem key={`skeleton-${type}-${i}`} type={type} />
      ))}
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mt4: {
    marginTop: 4,
  },
  mt6: {
    marginTop: 6,
  },
  mt8: {
    marginTop: 8,
  },
  mt12: {
    marginTop: 12,
  },

  // Chat Item
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  chatContent: {
    flex: 1,
  },

  // Moment Card
  momentCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  momentInfo: {
    padding: 12,
  },
  momentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },

  // Gift Item
  giftItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  giftContent: {
    flex: 1,
  },
  giftFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },

  // Transaction Item
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  transactionContent: {
    flex: 1,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },

  // Notification Item
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  notificationContent: {
    flex: 1,
  },

  // Request Card
  requestCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  requestInfo: {
    flex: 1,
  },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },

  // Trip Card
  tripCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  tripInfo: {
    padding: 12,
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
});

export default SkeletonList;
