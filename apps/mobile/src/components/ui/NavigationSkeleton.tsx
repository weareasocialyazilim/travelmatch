/**
 * Navigation Skeleton Components
 * Skeleton loading states for lazy-loaded screens
 *
 * DEFCON 3.3 FIX: Replace ActivityIndicator with skeleton screens
 * for better perceived performance
 */

import React from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { Skeleton } from './Skeleton';
import { COLORS } from '@travelmatch/shared';

const { width: SCREEN_WIDTH, height: _SCREEN_HEIGHT } =
  Dimensions.get('window');

/**
 * Generic screen skeleton with header and content areas
 */
export const ScreenSkeleton: React.FC<{
  showHeader?: boolean;
  showTabBar?: boolean;
  contentType?: 'list' | 'grid' | 'detail' | 'form';
}> = ({ showHeader = true, showTabBar = true, contentType = 'list' }) => {
  return (
    <View style={styles.container}>
      {showHeader && <HeaderSkeleton />}
      <View style={styles.content}>
        {contentType === 'list' && <ListSkeleton />}
        {contentType === 'grid' && <GridSkeleton />}
        {contentType === 'detail' && <DetailSkeleton />}
        {contentType === 'form' && <FormSkeleton />}
      </View>
      {showTabBar && <TabBarSkeleton />}
    </View>
  );
};

/**
 * Header skeleton
 */
export const HeaderSkeleton: React.FC = () => (
  <View style={styles.header}>
    <Skeleton width={100} height={24} borderRadius={4} />
    <View style={styles.headerRight}>
      <Skeleton width={32} height={32} borderRadius={16} />
      <Skeleton width={32} height={32} borderRadius={16} style={styles.ml8} />
    </View>
  </View>
);

/**
 * Tab bar skeleton
 */
export const TabBarSkeleton: React.FC = () => (
  <View style={styles.tabBar}>
    {[1, 2, 3, 4, 5].map((i) => (
      <View key={i} style={styles.tabItem}>
        <Skeleton width={24} height={24} borderRadius={4} />
        <Skeleton width={40} height={10} borderRadius={4} style={styles.mt4} />
      </View>
    ))}
  </View>
);

/**
 * List content skeleton (for feed, inbox, etc.)
 */
export const ListSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <View style={styles.listContainer}>
    {Array.from({ length: count }).map((_, i) => (
      <View key={i} style={styles.listItem}>
        <Skeleton width={56} height={56} borderRadius={28} />
        <View style={styles.listItemContent}>
          <Skeleton width={SCREEN_WIDTH * 0.5} height={16} borderRadius={4} />
          <Skeleton
            width={SCREEN_WIDTH * 0.7}
            height={12}
            borderRadius={4}
            style={styles.mt8}
          />
          <Skeleton
            width={SCREEN_WIDTH * 0.4}
            height={12}
            borderRadius={4}
            style={styles.mt4}
          />
        </View>
      </View>
    ))}
  </View>
);

/**
 * Grid content skeleton (for discover, explore)
 */
export const GridSkeleton: React.FC<{ columns?: number }> = ({
  columns = 2,
}) => {
  const itemWidth = (SCREEN_WIDTH - 48) / columns;
  const itemHeight = itemWidth * 1.3;

  return (
    <View style={styles.gridContainer}>
      {Array.from({ length: 6 }).map((_, i) => (
        <View key={i} style={[styles.gridItem, { width: itemWidth }]}>
          <Skeleton
            width={itemWidth - 8}
            height={itemHeight}
            borderRadius={12}
          />
          <Skeleton
            width={itemWidth * 0.8}
            height={14}
            borderRadius={4}
            style={styles.mt8}
          />
          <Skeleton
            width={itemWidth * 0.5}
            height={12}
            borderRadius={4}
            style={styles.mt4}
          />
        </View>
      ))}
    </View>
  );
};

/**
 * Detail content skeleton (for moment detail, profile)
 */
export const DetailSkeleton: React.FC = () => (
  <View style={styles.detailContainer}>
    {/* Hero image */}
    <Skeleton
      width={SCREEN_WIDTH}
      height={SCREEN_WIDTH * 0.75}
      borderRadius={0}
    />

    {/* User info */}
    <View style={styles.detailUserRow}>
      <Skeleton width={48} height={48} borderRadius={24} />
      <View style={styles.ml12}>
        <Skeleton width={120} height={16} borderRadius={4} />
        <Skeleton width={80} height={12} borderRadius={4} style={styles.mt4} />
      </View>
    </View>

    {/* Title */}
    <View style={styles.detailContent}>
      <Skeleton width={SCREEN_WIDTH * 0.8} height={24} borderRadius={4} />
      <Skeleton
        width={SCREEN_WIDTH * 0.6}
        height={16}
        borderRadius={4}
        style={styles.mt12}
      />

      {/* Description lines */}
      <Skeleton
        width={SCREEN_WIDTH - 32}
        height={14}
        borderRadius={4}
        style={styles.mt16}
      />
      <Skeleton
        width={SCREEN_WIDTH - 32}
        height={14}
        borderRadius={4}
        style={styles.mt8}
      />
      <Skeleton
        width={SCREEN_WIDTH * 0.7}
        height={14}
        borderRadius={4}
        style={styles.mt8}
      />
    </View>

    {/* Action button */}
    <View style={styles.detailAction}>
      <Skeleton width={SCREEN_WIDTH - 32} height={52} borderRadius={26} />
    </View>
  </View>
);

/**
 * Form skeleton (for create, edit screens)
 */
export const FormSkeleton: React.FC = () => (
  <View style={styles.formContainer}>
    {/* Image upload area */}
    <Skeleton
      width={SCREEN_WIDTH - 32}
      height={120}
      borderRadius={12}
      style={styles.mb16}
    />

    {/* Form fields */}
    {[1, 2, 3, 4].map((i) => (
      <View key={i} style={styles.formField}>
        <Skeleton width={100} height={14} borderRadius={4} />
        <Skeleton
          width={SCREEN_WIDTH - 32}
          height={48}
          borderRadius={8}
          style={styles.mt8}
        />
      </View>
    ))}

    {/* Submit button */}
    <Skeleton
      width={SCREEN_WIDTH - 32}
      height={52}
      borderRadius={26}
      style={styles.mt24}
    />
  </View>
);

/**
 * Profile screen skeleton
 */
export const ProfileSkeleton: React.FC = () => (
  <View style={styles.container}>
    <View style={styles.profileHeader}>
      <Skeleton width={100} height={100} borderRadius={50} />
      <Skeleton width={160} height={24} borderRadius={4} style={styles.mt16} />
      <Skeleton width={200} height={14} borderRadius={4} style={styles.mt8} />

      {/* Stats row */}
      <View style={styles.statsRow}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.statItem}>
            <Skeleton width={40} height={20} borderRadius={4} />
            <Skeleton
              width={50}
              height={12}
              borderRadius={4}
              style={styles.mt4}
            />
          </View>
        ))}
      </View>
    </View>

    {/* Tab bar */}
    <View style={styles.profileTabs}>
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} width={80} height={32} borderRadius={16} />
      ))}
    </View>

    {/* Content grid */}
    <GridSkeleton columns={3} />
  </View>
);

/**
 * Chat screen skeleton
 */
export const ChatSkeleton: React.FC = () => (
  <View style={styles.container}>
    {/* Chat header */}
    <View style={styles.chatHeader}>
      <Skeleton width={40} height={40} borderRadius={20} />
      <View style={styles.ml12}>
        <Skeleton width={120} height={16} borderRadius={4} />
        <Skeleton width={60} height={12} borderRadius={4} style={styles.mt4} />
      </View>
    </View>

    {/* Messages */}
    <View style={styles.chatMessages}>
      {/* Received message */}
      <View style={styles.messageReceived}>
        <Skeleton width={24} height={24} borderRadius={12} />
        <Skeleton
          width={SCREEN_WIDTH * 0.6}
          height={60}
          borderRadius={16}
          style={styles.ml8}
        />
      </View>

      {/* Sent message */}
      <View style={styles.messageSent}>
        <Skeleton width={SCREEN_WIDTH * 0.5} height={40} borderRadius={16} />
      </View>

      {/* Received message */}
      <View style={styles.messageReceived}>
        <Skeleton width={24} height={24} borderRadius={12} />
        <Skeleton
          width={SCREEN_WIDTH * 0.4}
          height={40}
          borderRadius={16}
          style={styles.ml8}
        />
      </View>
    </View>

    {/* Input area */}
    <View style={styles.chatInput}>
      <Skeleton width={SCREEN_WIDTH - 80} height={44} borderRadius={22} />
      <Skeleton width={44} height={44} borderRadius={22} style={styles.ml8} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  content: {
    flex: 1,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
    paddingBottom: 16,
    backgroundColor: COLORS.utility.white,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
    backgroundColor: COLORS.utility.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
  },
  tabItem: {
    alignItems: 'center',
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  listItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  gridItem: {
    padding: 4,
    marginBottom: 16,
  },
  detailContainer: {
    flex: 1,
  },
  detailUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  detailContent: {
    paddingHorizontal: 16,
  },
  detailAction: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 16,
    left: 16,
    right: 16,
  },
  formContainer: {
    padding: 16,
  },
  formField: {
    marginBottom: 16,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: COLORS.utility.white,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 24,
  },
  statItem: {
    alignItems: 'center',
    marginHorizontal: 24,
  },
  profileTabs: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    backgroundColor: COLORS.utility.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.utility.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  chatMessages: {
    flex: 1,
    padding: 16,
  },
  messageReceived: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  messageSent: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  chatInput: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
    backgroundColor: COLORS.utility.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
  },
  mt4: { marginTop: 4 },
  mt8: { marginTop: 8 },
  mt12: { marginTop: 12 },
  mt16: { marginTop: 16 },
  mt24: { marginTop: 24 },
  mb16: { marginBottom: 16 },
  ml8: { marginLeft: 8 },
  ml12: { marginLeft: 12 },
});

export default ScreenSkeleton;
