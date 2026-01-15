/**
 * LovendoSkeleton - Lovendo Ultimate Design System 2026
 * Consolidated skeleton loading component for all skeleton types
 *
 * Replaces:
 * - Skeleton.tsx (base skeleton with shimmer)
 * - SkeletonList.tsx (list skeletons by type)
 * - NavigationSkeleton.tsx (screen layout skeletons)
 *
 * @example
 * ```tsx
 * // Basic skeleton shape
 * <LovendoSkeleton type="base" width={100} height={20} />
 *
 * // Avatar skeleton
 * <LovendoSkeleton type="avatar" size={48} />
 *
 * // Text lines skeleton
 * <LovendoSkeleton type="text" lines={3} />
 *
 * // List of items
 * <LovendoSkeleton type="list" listType="chat" count={5} />
 *
 * // Full screen skeleton
 * <LovendoSkeleton type="screen" screenType="profile" />
 * ```
 */

import React, { memo, useEffect, useState } from 'react';
import type { ViewStyle } from 'react-native';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, primitives } from '@/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ═══════════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════════

export type LovendoSkeletonType =
  | 'base'
  | 'avatar'
  | 'text'
  | 'card'
  | 'message'
  | 'list'
  | 'screen';

export type SkeletonListType =
  | 'chat'
  | 'moment'
  | 'gift'
  | 'transaction'
  | 'notification'
  | 'request'
  | 'trip';

export type SkeletonScreenType =
  | 'generic'
  | 'profile'
  | 'chat'
  | 'detail'
  | 'form'
  | 'grid';

export type SkeletonVariant = 'rect' | 'circle';

export interface LovendoSkeletonProps {
  /** Skeleton type determines rendering style */
  type?: LovendoSkeletonType;

  // Base props
  /** Width for base skeleton */
  width?: number | string;
  /** Height for base skeleton */
  height?: number;
  /** Border radius */
  borderRadius?: number;
  /** Shape variant */
  variant?: SkeletonVariant;
  /** Enable shimmer animation */
  shimmer?: boolean;

  // Avatar props
  /** Avatar size */
  size?: number;

  // Text props
  /** Number of text lines */
  lines?: number;
  /** Line height */
  lineHeight?: number;
  /** Last line width */
  lastLineWidth?: string;

  // Message props
  /** Is own message */
  isOwn?: boolean;

  // List props
  /** List skeleton type */
  listType?: SkeletonListType;
  /** Number of items */
  count?: number;
  /** Minimum display time */
  minDisplayTime?: number;
  /** Show/hide control */
  show?: boolean;

  // Screen props
  /** Screen skeleton type */
  screenType?: SkeletonScreenType;
  /** Show header */
  showHeader?: boolean;
  /** Show tab bar */
  showTabBar?: boolean;

  /** Custom style */
  style?: ViewStyle;
  /** Test ID */
  testID?: string;
}

// ═══════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════

export const LovendoSkeleton: React.FC<LovendoSkeletonProps> = ({
  type = 'base',
  width = '100%',
  height = 20,
  borderRadius = 8,
  variant = 'rect',
  shimmer = true,
  size = 48,
  lines = 3,
  lineHeight = 14,
  lastLineWidth = '60%',
  isOwn = false,
  listType = 'chat',
  count = 5,
  minDisplayTime = 400,
  show = true,
  screenType = 'generic',
  showHeader = true,
  showTabBar = true,
  style,
  testID,
}) => {
  switch (type) {
    case 'avatar':
      return (
        <SkeletonBase
          width={size}
          height={size}
          borderRadius={size / 2}
          shimmer={shimmer}
          style={style}
          testID={testID}
        />
      );

    case 'text':
      return (
        <SkeletonTextInternal
          lines={lines}
          lineHeight={lineHeight}
          lastLineWidth={lastLineWidth}
          style={style}
          testID={testID}
        />
      );

    case 'card':
      return <SkeletonCardInternal style={style} testID={testID} />;

    case 'message':
      return (
        <SkeletonMessageInternal isOwn={isOwn} style={style} testID={testID} />
      );

    case 'list':
      return (
        <SkeletonListInternal
          type={listType}
          count={count}
          minDisplayTime={minDisplayTime}
          show={show}
          style={style}
          testID={testID}
        />
      );

    case 'screen':
      return (
        <ScreenSkeletonInternal
          screenType={screenType}
          showHeader={showHeader}
          showTabBar={showTabBar}
          style={style}
          testID={testID}
        />
      );

    case 'base':
    default:
      return (
        <SkeletonBase
          width={width}
          height={height}
          borderRadius={
            variant === 'circle'
              ? typeof height === 'number'
                ? height / 2
                : 8
              : borderRadius
          }
          shimmer={shimmer}
          style={style}
          testID={testID}
        />
      );
  }
};

// ═══════════════════════════════════════════════════════════════════
// Base Skeleton Component
// ═══════════════════════════════════════════════════════════════════

interface SkeletonBaseProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  shimmer?: boolean;
  style?: ViewStyle;
  testID?: string;
}

const SkeletonBase = memo<SkeletonBaseProps>(function SkeletonBase({
  width = '100%',
  height = 20,
  borderRadius = 8,
  shimmer = true,
  style,
  testID,
}) {
  const opacity = useSharedValue(0.4);
  const translateX = useSharedValue(-SCREEN_WIDTH);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );

    if (shimmer) {
      // Enhanced flowing shimmer effect (right-to-left)
      translateX.value = withRepeat(
        withTiming(SCREEN_WIDTH * 2, {
          duration: 1800,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        }),
        -1,
        false,
      );
    }

    return () => {
      cancelAnimation(opacity);
      cancelAnimation(translateX);
    };
  }, [opacity, translateX, shimmer]);

  const opacityStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    backgroundColor: primitives.stone[200],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View
      style={[
        styles.skeleton,
        { width: width as number, height, borderRadius },
        style,
      ]}
      testID={testID}
    >
      <Animated.View style={[StyleSheet.absoluteFillObject, opacityStyle]} />
      {shimmer && (
        <Animated.View style={[styles.shimmerContainer, shimmerStyle]}>
          <LinearGradient
            colors={[
              'transparent',
              'rgba(255, 255, 255, 0.15)',
              'rgba(255, 255, 255, 0.5)',
              'rgba(255, 255, 255, 0.15)',
              'transparent',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.shimmerGradient}
          />
        </Animated.View>
      )}
    </View>
  );
});

// ═══════════════════════════════════════════════════════════════════
// Skeleton Text
// ═══════════════════════════════════════════════════════════════════

interface SkeletonTextInternalProps {
  lines: number;
  lineHeight: number;
  lastLineWidth: string;
  style?: ViewStyle;
  testID?: string;
}

const SkeletonTextInternal: React.FC<SkeletonTextInternalProps> = ({
  lines,
  lineHeight,
  lastLineWidth,
  style,
  testID,
}) => (
  <View style={style} testID={testID}>
    {Array.from({ length: lines }).map((_, index) => (
      <SkeletonBase
        key={index}
        width={index === lines - 1 ? lastLineWidth : '100%'}
        height={lineHeight}
        borderRadius={4}
        style={index > 0 ? styles.lineSpacing : undefined}
      />
    ))}
  </View>
);

// ═══════════════════════════════════════════════════════════════════
// Skeleton Card
// ═══════════════════════════════════════════════════════════════════

interface SkeletonCardInternalProps {
  style?: ViewStyle;
  testID?: string;
}

const SkeletonCardInternal: React.FC<SkeletonCardInternalProps> = ({
  style,
  testID,
}) => (
  <View style={[styles.card, style]} testID={testID}>
    <SkeletonBase width="100%" height={160} borderRadius={0} />
    <View style={styles.cardContent}>
      <View style={styles.cardUserRow}>
        <SkeletonBase width={40} height={40} borderRadius={20} />
        <View style={styles.cardUserInfo}>
          <SkeletonBase width={100} height={14} />
          <SkeletonBase width={60} height={10} style={styles.mt6} />
        </View>
      </View>
      <SkeletonBase width="80%" height={20} style={styles.mt12} />
      <SkeletonTextInternal
        lines={2}
        lineHeight={14}
        lastLineWidth="60%"
        style={styles.mt12}
      />
      <SkeletonBase
        width="100%"
        height={48}
        borderRadius={24}
        style={styles.mt16}
      />
    </View>
  </View>
);

// ═══════════════════════════════════════════════════════════════════
// Skeleton Message
// ═══════════════════════════════════════════════════════════════════

interface SkeletonMessageInternalProps {
  isOwn: boolean;
  style?: ViewStyle;
  testID?: string;
}

const SkeletonMessageInternal: React.FC<SkeletonMessageInternalProps> = ({
  isOwn,
  style,
  testID,
}) => (
  <View
    style={[
      styles.message,
      isOwn ? styles.messageOwn : styles.messageOther,
      style,
    ]}
    testID={testID}
  >
    {!isOwn && (
      <SkeletonBase
        width={32}
        height={32}
        borderRadius={16}
        style={styles.messageAvatar}
      />
    )}
    <View style={[styles.messageBubble, isOwn && styles.messageBubbleOwn]}>
      <SkeletonBase width={isOwn ? 120 : 180} height={14} />
      <SkeletonBase width={isOwn ? 80 : 140} height={14} style={styles.mt6} />
    </View>
  </View>
);

// ═══════════════════════════════════════════════════════════════════
// Skeleton List
// ═══════════════════════════════════════════════════════════════════

interface SkeletonListInternalProps {
  type: SkeletonListType;
  count: number;
  minDisplayTime: number;
  show: boolean;
  style?: ViewStyle;
  testID?: string;
}

const SkeletonListInternal: React.FC<SkeletonListInternalProps> = ({
  type,
  count,
  minDisplayTime,
  show,
  style,
  testID,
}) => {
  const [shouldShow, setShouldShow] = useState(show);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (show) {
      setShouldShow(true);
      setHasShown(true);
    } else if (hasShown) {
      timeout = setTimeout(() => setShouldShow(false), minDisplayTime);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [show, minDisplayTime, hasShown]);

  if (!shouldShow) return null;

  const renderItem = () => {
    switch (type) {
      case 'chat':
        return <ChatSkeletonItem />;
      case 'moment':
        return <MomentSkeletonItem />;
      case 'gift':
        return <GiftSkeletonItem />;
      case 'transaction':
        return <TransactionSkeletonItem />;
      case 'notification':
        return <NotificationSkeletonItem />;
      case 'request':
        return <RequestSkeletonItem />;
      case 'trip':
        return <TripSkeletonItem />;
      default:
        return <ChatSkeletonItem />;
    }
  };

  return (
    <View style={[styles.listContainer, style]} testID={testID}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i}>{renderItem()}</View>
      ))}
    </View>
  );
};

// List item components
const ChatSkeletonItem: React.FC = () => (
  <View style={styles.chatItem}>
    <SkeletonBase width={52} height={52} borderRadius={26} />
    <View style={styles.chatContent}>
      <View style={styles.row}>
        <SkeletonBase width={120} height={16} />
        <SkeletonBase width={40} height={12} />
      </View>
      <SkeletonBase
        width={80}
        height={20}
        borderRadius={6}
        style={styles.mt6}
      />
      <SkeletonBase width="85%" height={14} style={styles.mt6} />
    </View>
  </View>
);

const MomentSkeletonItem: React.FC = () => (
  <View style={styles.momentCard}>
    <SkeletonBase width="100%" height={200} borderRadius={12} />
    <View style={styles.momentInfo}>
      <SkeletonBase width="70%" height={18} style={styles.mt12} />
      <SkeletonBase width="40%" height={14} style={styles.mt8} />
      <View style={styles.momentFooter}>
        <SkeletonBase width={80} height={14} />
        <SkeletonBase width={50} height={14} />
      </View>
    </View>
  </View>
);

const GiftSkeletonItem: React.FC = () => (
  <View style={styles.giftItem}>
    <SkeletonBase width={64} height={64} borderRadius={32} />
    <View style={styles.giftContent}>
      <View style={styles.row}>
        <SkeletonBase width={140} height={16} />
        <SkeletonBase width={60} height={14} />
      </View>
      <SkeletonBase width="90%" height={14} style={styles.mt6} />
      <View style={styles.giftFooter}>
        <SkeletonBase width={100} height={12} />
        <SkeletonBase width={70} height={24} borderRadius={12} />
      </View>
    </View>
  </View>
);

const TransactionSkeletonItem: React.FC = () => (
  <View style={styles.transactionItem}>
    <SkeletonBase width={40} height={40} borderRadius={20} />
    <View style={styles.transactionContent}>
      <SkeletonBase width="60%" height={16} />
      <SkeletonBase width="40%" height={12} style={styles.mt4} />
    </View>
    <View style={styles.transactionAmount}>
      <SkeletonBase width={70} height={18} />
      <SkeletonBase width={50} height={12} style={styles.mt4} />
    </View>
  </View>
);

const NotificationSkeletonItem: React.FC = () => (
  <View style={styles.notificationItem}>
    <SkeletonBase width={48} height={48} borderRadius={24} />
    <View style={styles.notificationContent}>
      <SkeletonBase width="75%" height={14} />
      <SkeletonBase width="55%" height={12} style={styles.mt4} />
      <SkeletonBase width={50} height={10} style={styles.mt6} />
    </View>
  </View>
);

const RequestSkeletonItem: React.FC = () => (
  <View style={styles.requestCard}>
    <View style={styles.requestHeader}>
      <SkeletonBase width={56} height={56} borderRadius={28} />
      <View style={styles.requestInfo}>
        <SkeletonBase width={120} height={16} />
        <SkeletonBase width={80} height={12} style={styles.mt4} />
      </View>
      <SkeletonBase width={60} height={24} borderRadius={12} />
    </View>
    <SkeletonBase
      width="100%"
      height={40}
      borderRadius={8}
      style={styles.mt12}
    />
    <View style={styles.requestActions}>
      <SkeletonBase width="48%" height={44} borderRadius={10} />
      <SkeletonBase width="48%" height={44} borderRadius={10} />
    </View>
  </View>
);

const TripSkeletonItem: React.FC = () => (
  <View style={styles.tripCard}>
    <SkeletonBase width="100%" height={140} borderRadius={12} />
    <View style={styles.tripInfo}>
      <SkeletonBase width="80%" height={18} style={styles.mt12} />
      <SkeletonBase width="50%" height={14} style={styles.mt6} />
      <View style={styles.tripFooter}>
        <SkeletonBase width={90} height={14} />
        <SkeletonBase width={60} height={14} />
      </View>
    </View>
  </View>
);

// ═══════════════════════════════════════════════════════════════════
// Screen Skeleton
// ═══════════════════════════════════════════════════════════════════

interface ScreenSkeletonInternalProps {
  screenType: SkeletonScreenType;
  showHeader: boolean;
  showTabBar: boolean;
  style?: ViewStyle;
  testID?: string;
}

const ScreenSkeletonInternal: React.FC<ScreenSkeletonInternalProps> = ({
  screenType,
  showHeader,
  showTabBar,
  style,
  testID,
}) => {
  const renderContent = () => {
    switch (screenType) {
      case 'profile':
        return <ProfileSkeletonContent />;
      case 'chat':
        return <ChatScreenSkeletonContent />;
      case 'detail':
        return <DetailSkeletonContent />;
      case 'form':
        return <FormSkeletonContent />;
      case 'grid':
        return <GridSkeletonContent />;
      default:
        return <ListSkeletonContent />;
    }
  };

  return (
    <View style={[styles.screenContainer, style]} testID={testID}>
      {showHeader && <HeaderSkeletonContent />}
      <View style={styles.screenContent}>{renderContent()}</View>
      {showTabBar && <TabBarSkeletonContent />}
    </View>
  );
};

// Screen skeleton sub-components
const HeaderSkeletonContent: React.FC = () => (
  <View style={styles.header}>
    <SkeletonBase width={100} height={24} borderRadius={4} />
    <View style={styles.headerRight}>
      <SkeletonBase width={32} height={32} borderRadius={16} />
      <SkeletonBase
        width={32}
        height={32}
        borderRadius={16}
        style={styles.ml8}
      />
    </View>
  </View>
);

const TabBarSkeletonContent: React.FC = () => (
  <View style={styles.tabBar}>
    {[1, 2, 3, 4, 5].map((i) => (
      <View key={i} style={styles.tabItem}>
        <SkeletonBase width={24} height={24} borderRadius={4} />
        <SkeletonBase
          width={40}
          height={10}
          borderRadius={4}
          style={styles.mt4}
        />
      </View>
    ))}
  </View>
);

const ListSkeletonContent: React.FC = () => (
  <View style={styles.listSkeletonContainer}>
    {Array.from({ length: 5 }).map((_, i) => (
      <View key={i} style={styles.listSkeletonItem}>
        <SkeletonBase width={56} height={56} borderRadius={28} />
        <View style={styles.listSkeletonItemContent}>
          <SkeletonBase
            width={SCREEN_WIDTH * 0.5}
            height={16}
            borderRadius={4}
          />
          <SkeletonBase
            width={SCREEN_WIDTH * 0.7}
            height={12}
            borderRadius={4}
            style={styles.mt8}
          />
          <SkeletonBase
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

const GridSkeletonContent: React.FC = () => {
  const itemWidth = (SCREEN_WIDTH - 48) / 2;
  const itemHeight = itemWidth * 1.3;

  return (
    <View style={styles.gridContainer}>
      {Array.from({ length: 6 }).map((_, i) => (
        <View key={i} style={[styles.gridItem, { width: itemWidth }]}>
          <SkeletonBase
            width={itemWidth - 8}
            height={itemHeight}
            borderRadius={12}
          />
          <SkeletonBase
            width={itemWidth * 0.8}
            height={14}
            borderRadius={4}
            style={styles.mt8}
          />
          <SkeletonBase
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

const DetailSkeletonContent: React.FC = () => (
  <View style={styles.detailContainer}>
    <SkeletonBase
      width={SCREEN_WIDTH}
      height={SCREEN_WIDTH * 0.75}
      borderRadius={0}
    />
    <View style={styles.detailUserRow}>
      <SkeletonBase width={48} height={48} borderRadius={24} />
      <View style={styles.ml12}>
        <SkeletonBase width={120} height={16} borderRadius={4} />
        <SkeletonBase
          width={80}
          height={12}
          borderRadius={4}
          style={styles.mt4}
        />
      </View>
    </View>
    <View style={styles.detailContent}>
      <SkeletonBase width={SCREEN_WIDTH * 0.8} height={24} borderRadius={4} />
      <SkeletonBase
        width={SCREEN_WIDTH * 0.6}
        height={16}
        borderRadius={4}
        style={styles.mt12}
      />
      <SkeletonBase
        width={SCREEN_WIDTH - 32}
        height={14}
        borderRadius={4}
        style={styles.mt16}
      />
      <SkeletonBase
        width={SCREEN_WIDTH - 32}
        height={14}
        borderRadius={4}
        style={styles.mt8}
      />
      <SkeletonBase
        width={SCREEN_WIDTH * 0.7}
        height={14}
        borderRadius={4}
        style={styles.mt8}
      />
    </View>
  </View>
);

const FormSkeletonContent: React.FC = () => (
  <View style={styles.formContainer}>
    <SkeletonBase
      width={SCREEN_WIDTH - 32}
      height={120}
      borderRadius={12}
      style={styles.mb16}
    />
    {[1, 2, 3, 4].map((i) => (
      <View key={i} style={styles.formField}>
        <SkeletonBase width={100} height={14} borderRadius={4} />
        <SkeletonBase
          width={SCREEN_WIDTH - 32}
          height={48}
          borderRadius={8}
          style={styles.mt8}
        />
      </View>
    ))}
    <SkeletonBase
      width={SCREEN_WIDTH - 32}
      height={52}
      borderRadius={26}
      style={styles.mt24}
    />
  </View>
);

const ProfileSkeletonContent: React.FC = () => (
  <View>
    <View style={styles.profileHeader}>
      <SkeletonBase width={100} height={100} borderRadius={50} />
      <SkeletonBase
        width={160}
        height={24}
        borderRadius={4}
        style={styles.mt16}
      />
      <SkeletonBase
        width={200}
        height={14}
        borderRadius={4}
        style={styles.mt8}
      />
      <View style={styles.statsRow}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.statItem}>
            <SkeletonBase width={40} height={20} borderRadius={4} />
            <SkeletonBase
              width={50}
              height={12}
              borderRadius={4}
              style={styles.mt4}
            />
          </View>
        ))}
      </View>
    </View>
    <View style={styles.profileTabs}>
      {[1, 2, 3].map((i) => (
        <SkeletonBase key={i} width={80} height={32} borderRadius={16} />
      ))}
    </View>
    <GridSkeletonContent />
  </View>
);

const ChatScreenSkeletonContent: React.FC = () => (
  <View style={styles.chatScreenContainer}>
    <View style={styles.chatScreenHeader}>
      <SkeletonBase width={40} height={40} borderRadius={20} />
      <View style={styles.ml12}>
        <SkeletonBase width={120} height={16} borderRadius={4} />
        <SkeletonBase
          width={60}
          height={12}
          borderRadius={4}
          style={styles.mt4}
        />
      </View>
    </View>
    <View style={styles.chatMessages}>
      <View style={styles.messageReceived}>
        <SkeletonBase width={24} height={24} borderRadius={12} />
        <SkeletonBase
          width={SCREEN_WIDTH * 0.6}
          height={60}
          borderRadius={16}
          style={styles.ml8}
        />
      </View>
      <View style={styles.messageSent}>
        <SkeletonBase
          width={SCREEN_WIDTH * 0.5}
          height={40}
          borderRadius={16}
        />
      </View>
      <View style={styles.messageReceived}>
        <SkeletonBase width={24} height={24} borderRadius={12} />
        <SkeletonBase
          width={SCREEN_WIDTH * 0.4}
          height={40}
          borderRadius={16}
          style={styles.ml8}
        />
      </View>
    </View>
    <View style={styles.chatInput}>
      <SkeletonBase width={SCREEN_WIDTH - 80} height={44} borderRadius={22} />
      <SkeletonBase
        width={44}
        height={44}
        borderRadius={22}
        style={styles.ml8}
      />
    </View>
  </View>
);

// ═══════════════════════════════════════════════════════════════════
// Styles
// ═══════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
  // Base skeleton
  skeleton: {
    backgroundColor: primitives.stone[200],
    overflow: 'hidden',
  },
  shimmerContainer: {
    ...StyleSheet.absoluteFillObject,
    width: SCREEN_WIDTH,
  },
  shimmerGradient: {
    flex: 1,
    width: '100%',
  },
  lineSpacing: { marginTop: 8 },

  // Card
  card: {
    backgroundColor: COLORS.utility.white,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: { padding: 16 },
  cardUserRow: { flexDirection: 'row', alignItems: 'center' },
  cardUserInfo: { marginLeft: 12 },

  // Message
  message: { flexDirection: 'row', marginBottom: 12, paddingHorizontal: 16 },
  messageOwn: { justifyContent: 'flex-end' },
  messageOther: { justifyContent: 'flex-start' },
  messageAvatar: { marginRight: 8 },
  messageBubble: {
    backgroundColor: primitives.stone[100],
    borderRadius: 16,
    padding: 12,
    maxWidth: '70%',
  },
  messageBubbleOwn: { backgroundColor: COLORS.primaryMuted },

  // List container
  listContainer: { flex: 1 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // List items
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    backgroundColor: COLORS.utility.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  chatContent: { flex: 1 },
  momentCard: {
    backgroundColor: COLORS.utility.white,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  momentInfo: { padding: 12 },
  momentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  giftItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 12,
    backgroundColor: COLORS.utility.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  giftContent: { flex: 1 },
  giftFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    backgroundColor: COLORS.utility.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  transactionContent: { flex: 1 },
  transactionAmount: { alignItems: 'flex-end' },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 12,
    backgroundColor: COLORS.utility.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  notificationContent: { flex: 1 },
  requestCard: {
    backgroundColor: COLORS.utility.white,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  requestHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  requestInfo: { flex: 1 },
  requestActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  tripCard: {
    backgroundColor: COLORS.utility.white,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  tripInfo: { padding: 12 },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },

  // Screen skeleton
  screenContainer: { flex: 1, backgroundColor: COLORS.bg.primary },
  screenContent: { flex: 1, paddingTop: 8 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
    paddingBottom: 16,
    backgroundColor: COLORS.utility.white,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
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
  tabItem: { alignItems: 'center' },
  listSkeletonContainer: { paddingHorizontal: 16 },
  listSkeletonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  listSkeletonItemContent: { flex: 1, marginLeft: 12 },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  gridItem: { padding: 4, marginBottom: 16 },
  detailContainer: { flex: 1 },
  detailUserRow: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  detailContent: { paddingHorizontal: 16 },
  formContainer: { padding: 16 },
  formField: { marginBottom: 16 },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: COLORS.utility.white,
  },
  statsRow: { flexDirection: 'row', marginTop: 24 },
  statItem: { alignItems: 'center', marginHorizontal: 24 },
  profileTabs: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    backgroundColor: COLORS.utility.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  chatScreenContainer: { flex: 1 },
  chatScreenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.utility.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  chatMessages: { flex: 1, padding: 16 },
  messageReceived: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  messageSent: { alignItems: 'flex-end', marginBottom: 16 },
  chatInput: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    paddingBottom: Platform.OS === 'ios' ? 28 : 8,
    backgroundColor: COLORS.utility.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
  },

  // Spacing
  mt4: { marginTop: 4 },
  mt6: { marginTop: 6 },
  mt8: { marginTop: 8 },
  mt12: { marginTop: 12 },
  mt16: { marginTop: 16 },
  mt24: { marginTop: 24 },
  mb16: { marginBottom: 16 },
  ml8: { marginLeft: 8 },
  ml12: { marginLeft: 12 },
});

// ═══════════════════════════════════════════════════════════════════
// Convenience Exports (for direct use)
// ═══════════════════════════════════════════════════════════════════

/** @deprecated Use LovendoSkeleton with type="base" */
export const Skeleton = SkeletonBase;

/** @deprecated Use LovendoSkeleton with type="avatar" */
export const SkeletonAvatar: React.FC<{ size?: number; style?: ViewStyle }> = ({
  size = 48,
  style,
}) => <LovendoSkeleton type="avatar" size={size} style={style} />;

/** @deprecated Use LovendoSkeleton with type="text" */
export const SkeletonText: React.FC<{
  lines?: number;
  lineHeight?: number;
  lastLineWidth?: string;
  style?: ViewStyle;
}> = (props) => <LovendoSkeleton type="text" {...props} />;

/** @deprecated Use LovendoSkeleton with type="card" */
export const SkeletonCard: React.FC<{ style?: ViewStyle }> = ({ style }) => (
  <LovendoSkeleton type="card" style={style} />
);

/** @deprecated Use LovendoSkeleton with type="message" */
export const SkeletonMessage: React.FC<{
  isOwn?: boolean;
  style?: ViewStyle;
}> = ({ isOwn, style }) => (
  <LovendoSkeleton type="message" isOwn={isOwn} style={style} />
);

/** @deprecated Use LovendoSkeleton with type="list" */
export const SkeletonList: React.FC<{
  type: SkeletonListType;
  count?: number;
  minDisplayTime?: number;
  show?: boolean;
}> = (props) => (
  <LovendoSkeleton
    type="list"
    listType={props.type}
    count={props.count}
    minDisplayTime={props.minDisplayTime}
    show={props.show}
  />
);

/** @deprecated Use LovendoSkeleton with type="screen" */
export const ScreenSkeleton: React.FC<{
  showHeader?: boolean;
  showTabBar?: boolean;
  contentType?: string;
}> = ({ showHeader, showTabBar, contentType = 'list' }) => (
  <LovendoSkeleton
    type="screen"
    screenType={contentType as SkeletonScreenType}
    showHeader={showHeader}
    showTabBar={showTabBar}
  />
);

export default LovendoSkeleton;
