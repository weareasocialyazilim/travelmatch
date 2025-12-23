import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { COLORS } from '../../constants/colors';
import { Skeleton } from './Skeleton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Skeleton for a chat/conversation list item
 */
export const ChatItemSkeleton: React.FC = () => (
  <View style={styles.chatItem}>
    <Skeleton width={52} height={52} borderRadius={26} />
    <View style={styles.chatContent}>
      <View style={styles.chatHeader}>
        <Skeleton width={120} height={16} />
        <Skeleton width={40} height={12} />
      </View>
      <Skeleton
        width={80}
        height={20}
        borderRadius={6}
        style={styles.marginTop6}
      />
      <Skeleton width="90%" height={14} style={styles.marginTop6} />
    </View>
  </View>
);

/**
 * Skeleton for a moment/card item
 */
export const MomentCardSkeleton: React.FC = () => (
  <View style={styles.momentCard}>
    <Skeleton width="100%" height={160} borderRadius={12} />
    <View style={styles.momentInfo}>
      <Skeleton width="70%" height={16} style={styles.marginTop12} />
      <Skeleton width="40%" height={14} style={styles.marginTop8} />
      <View style={styles.momentFooter}>
        <Skeleton width={60} height={14} />
        <Skeleton width={40} height={14} />
      </View>
    </View>
  </View>
);

/**
 * Skeleton for a user profile header
 */
export const ProfileHeaderSkeleton: React.FC = () => (
  <View style={styles.profileHeader}>
    <Skeleton width={90} height={90} borderRadius={45} />
    <View style={styles.profileInfo}>
      <Skeleton width={150} height={20} style={styles.marginTop12} />
      <Skeleton width={100} height={14} style={styles.marginTop8} />
      <View style={styles.profileStats}>
        <Skeleton width={60} height={30} borderRadius={8} />
        <Skeleton width={60} height={30} borderRadius={8} />
        <Skeleton width={60} height={30} borderRadius={8} />
      </View>
    </View>
  </View>
);

/**
 * Skeleton for a transaction item
 */
export const TransactionItemSkeleton: React.FC = () => (
  <View style={styles.transactionItem}>
    <Skeleton width={40} height={40} borderRadius={20} />
    <View style={styles.transactionContent}>
      <Skeleton width="60%" height={16} />
      <Skeleton width="40%" height={12} style={styles.marginTop4} />
    </View>
    <View style={styles.transactionAmount}>
      <Skeleton width={60} height={16} />
    </View>
  </View>
);

/**
 * Skeleton for a notification item
 */
export const NotificationItemSkeleton: React.FC = () => (
  <View style={styles.notificationItem}>
    <Skeleton width={48} height={48} borderRadius={24} />
    <View style={styles.notificationContent}>
      <Skeleton width="80%" height={14} />
      <Skeleton width="60%" height={12} style={styles.marginTop4} />
      <Skeleton width={50} height={10} style={styles.marginTop6} />
    </View>
  </View>
);

/**
 * Skeleton for a request card
 */
export const RequestCardSkeleton: React.FC = () => (
  <View style={styles.requestCard}>
    <View style={styles.requestHeader}>
      <Skeleton width={56} height={56} borderRadius={28} />
      <View style={styles.requestInfo}>
        <Skeleton width={120} height={16} />
        <Skeleton width={80} height={12} style={styles.marginTop4} />
      </View>
      <Skeleton width={60} height={24} borderRadius={12} />
    </View>
    <Skeleton
      width="100%"
      height={40}
      borderRadius={8}
      style={styles.marginTop12}
    />
    <View style={styles.requestActions}>
      <Skeleton width="48%" height={44} borderRadius={10} />
      <Skeleton width="48%" height={44} borderRadius={10} />
    </View>
  </View>
);

/**
 * Full page loading skeleton for messages
 */
export const MessagesListSkeleton: React.FC = () => (
  <View style={styles.listContainer}>
    {[1, 2, 3, 4, 5].map((i) => (
      <ChatItemSkeleton key={i} />
    ))}
  </View>
);

/**
 * Full page loading skeleton for moments feed
 */
export const MomentsFeedSkeleton: React.FC = () => (
  <View style={styles.momentsGrid}>
    {[1, 2, 3, 4].map((i) => (
      <View key={i} style={styles.momentGridItem}>
        <MomentCardSkeleton />
      </View>
    ))}
  </View>
);

/**
 * Full page loading skeleton for requests
 */
export const RequestsListSkeleton: React.FC = () => (
  <View style={styles.listContainer}>
    {[1, 2, 3].map((i) => (
      <RequestCardSkeleton key={i} />
    ))}
  </View>
);

const styles = StyleSheet.create({
  marginTop4: {
    marginTop: 4,
  },
  marginTop6: {
    marginTop: 6,
  },
  marginTop8: {
    marginTop: 8,
  },
  marginTop12: {
    marginTop: 12,
  },
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
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  momentCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
  },
  momentInfo: {
    padding: 12,
  },
  momentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.white,
  },
  profileInfo: {
    alignItems: 'center',
    width: '100%',
  },
  profileStats: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
  },
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
  listContainer: {
    flex: 1,
  },
  momentsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  momentGridItem: {
    width: (SCREEN_WIDTH - 32) / 2,
    padding: 8,
  },
});
