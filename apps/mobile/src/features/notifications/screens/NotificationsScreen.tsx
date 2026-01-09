import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { GlassCard } from '@/components/ui/GlassCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { COLORS } from '@/constants/colors';
import { TYPE_SCALE, FONTS } from '@/constants/typography';
import { useNotifications } from '@/hooks/useNotifications';
import { useTranslation } from '@/hooks/useTranslation';
import {
  getNotificationRoute,
  type Notification,
  type NotificationType as ServiceNotificationType,
} from '@/services/notificationService';

/**
 * Awwwards standardında Bildirim Merkezi.
 * Gerçek backend verilerini kullanan liste yapısı.
 * Her bildirim bir "aktivite kartı" olarak tasarlandı.
 */

// Map backend notification types to UI display types
type UINotificationType =
  | 'gift'
  | 'trust'
  | 'comment'
  | 'social'
  | 'system'
  | 'offer'
  | 'payment';

const mapNotificationType = (
  type: ServiceNotificationType
): UINotificationType => {
  switch (type) {
    case 'gesture_received':
    case 'high_value_offer':
    case 'subscriber_offer_received':
    case 'premium_offer_received':
      return 'offer';
    case 'payment_confirmed':
    case 'payment_completed':
    case 'payment_received':
    case 'payment_sent':
    case 'paytr_authorized':
    case 'payment_captured':
    case 'proof_approved_payment_released':
      return 'payment';
    case 'trust_level_up':
    case 'milestone_reached':
    case 'achievement_unlocked':
    case 'kyc_approved':
      return 'trust';
    case 'message':
    case 'moment_comment':
    case 'review_received':
      return 'comment';
    case 'moment_liked':
    case 'moment_saved':
      return 'social';
    default:
      return 'system';
  }
};

// Format relative time
const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Az önce';
  if (diffMins < 60) return `${diffMins}dk önce`;
  if (diffHours < 24) return `${diffHours}sa önce`;
  if (diffDays < 7) return `${diffDays}g önce`;
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
};

export const NotificationsScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { t } = useTranslation();

  // Use real notifications from backend
  const {
    notifications,
    loading,
    error,
    unreadCount,
    refresh,
    loadMore,
    markAsRead,
    markAllAsRead,
    hasMore,
  } = useNotifications();

  const handleMarkAllRead = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await markAllAsRead();
  }, [markAllAsRead]);

  const handleNotificationPress = useCallback(
    async (notification: Notification) => {
      // Mark as read
      if (!notification.read) {
        await markAsRead(notification.id);
      }

      // Navigate to relevant screen
      const route = getNotificationRoute(notification);
      if (route) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        navigation.navigate(route.name, route.params);
      }
    },
    [markAsRead, navigation]
  );

  const getIconData = (type: UINotificationType, isUnread: boolean) => {
    const baseColor = isUnread ? COLORS.brand.primary : COLORS.text.muted;

    switch (type) {
      case 'gift':
      case 'offer':
        return {
          name: 'gift' as const,
          color: isUnread ? COLORS.brand.primary : COLORS.text.muted,
          bg: isUnread
            ? 'rgba(245, 158, 11, 0.15)'
            : 'rgba(168, 162, 158, 0.1)',
        };
      case 'payment':
        return {
          name: 'cash' as const,
          color: isUnread ? '#4CAF50' : COLORS.text.muted,
          bg: isUnread ? 'rgba(76, 175, 80, 0.15)' : 'rgba(168, 162, 158, 0.1)',
        };
      case 'trust':
        return {
          name: 'shield-check' as const,
          color: isUnread ? COLORS.trust.primary : COLORS.text.muted,
          bg: isUnread
            ? 'rgba(16, 185, 129, 0.15)'
            : 'rgba(168, 162, 158, 0.1)',
        };
      case 'comment':
        return {
          name: 'message-text' as const,
          color: isUnread ? COLORS.accent.primary : COLORS.text.muted,
          bg: isUnread
            ? 'rgba(20, 184, 166, 0.15)'
            : 'rgba(168, 162, 158, 0.1)',
        };
      case 'social':
        return {
          name: 'heart' as const,
          color: isUnread ? COLORS.brand.secondary : COLORS.text.muted,
          bg: isUnread
            ? 'rgba(236, 72, 153, 0.15)'
            : 'rgba(168, 162, 158, 0.1)',
        };
      case 'system':
      default:
        return {
          name: 'bell' as const,
          color: baseColor,
          bg: 'rgba(168, 162, 158, 0.1)',
        };
    }
  };

  const renderItem = useCallback(
    ({ item, index }: { item: Notification; index: number }) => {
      const uiType = mapNotificationType(item.type);
      const iconData = getIconData(uiType, !item.read);
      const displayTime = formatRelativeTime(item.createdAt);

      return (
        <Animated.View
          entering={FadeInDown.delay(index * 80).springify()}
          layout={Layout.springify()}
          style={styles.notifWrapper}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleNotificationPress(item)}
          >
            <GlassCard
              intensity={item.read ? 5 : 15}
              style={[styles.card, !item.read && styles.unreadCard]}
              padding={16}
              borderRadius={20}
              showBorder={true}
            >
              {/* Icon Container */}
              <View
                style={[styles.iconContainer, { backgroundColor: iconData.bg }]}
              >
                <MaterialCommunityIcons
                  name={iconData.name}
                  size={22}
                  color={iconData.color}
                />
              </View>

              {/* Content */}
              <View style={styles.content}>
                <Text style={styles.title} numberOfLines={1}>
                  {item.title}
                </Text>
                <Text style={styles.message} numberOfLines={2}>
                  {item.body}
                </Text>
                <Text style={styles.time}>{displayTime}</Text>
              </View>

              {/* Unread Dot */}
              {!item.read && <View style={styles.unreadDot} />}
            </GlassCard>
          </TouchableOpacity>
        </Animated.View>
      );
    },
    [handleNotificationPress]
  );

  const renderFooter = useCallback(() => {
    if (!hasMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={COLORS.brand.primary} />
      </View>
    );
  }, [hasMore]);

  const renderEmpty = useCallback(() => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.brand.primary} />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      );
    }

    if (error) {
      return (
        <EmptyState
          icon="alert-circle-outline"
          title={t('notifications.error.title')}
          description={error}
          actionLabel={t('common.retry')}
          onAction={refresh}
        />
      );
    }

    return (
      <EmptyState
        icon="bell-sleep-outline"
        title={t('notifications.empty.title')}
        description={t('notifications.empty.description')}
        actionLabel={t('discover.cta')}
        onAction={() => navigation.navigate('MainTabs', { screen: 'Discover' })}
      />
    );
  }, [loading, error, refresh, navigation, t]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityLabel={t('common.back')}
          accessibilityRole="button"
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={28}
            color={COLORS.text.primary}
          />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t('notifications.title')}</Text>
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={handleMarkAllRead}
          style={styles.markReadButton}
          accessibilityLabel={t('notifications.markAllRead')}
          accessibilityRole="button"
          disabled={unreadCount === 0}
        >
          <Text
            style={[
              styles.markReadText,
              unreadCount === 0 && styles.markReadTextDisabled,
            ]}
          >
            {t('notifications.markAllRead')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Notification List */}
      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          refreshControl={
            <RefreshControl
              refreshing={loading && notifications.length > 0}
              onRefresh={refresh}
              tintColor={COLORS.brand.primary}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      ) : (
        renderEmpty()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.display.bold,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  badge: {
    backgroundColor: COLORS.brand.primary,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: 11,
    fontFamily: FONTS.mono.medium,
    fontWeight: '600',
    color: COLORS.white,
  },
  markReadButton: {
    padding: 4,
  },
  markReadText: {
    color: COLORS.brand.primary,
    fontSize: 12,
    fontFamily: FONTS.body.semibold,
    fontWeight: '600',
  },
  markReadTextDisabled: {
    color: COLORS.text.muted,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  separator: {
    height: 12,
  },
  notifWrapper: {
    width: '100%',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: COLORS.border.light,
  },
  unreadCard: {
    borderColor: 'rgba(245, 158, 11, 0.25)',
    borderWidth: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  content: {
    flex: 1,
  },
  title: {
    fontFamily: FONTS.body.bold,
    fontWeight: '700',
    fontSize: 14,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  message: {
    ...TYPE_SCALE.body.small,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  time: {
    fontSize: 11,
    fontFamily: FONTS.mono.regular,
    color: COLORS.text.muted,
    marginTop: 6,
    letterSpacing: 0.3,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.brand.primary,
    marginLeft: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: COLORS.text.muted,
    fontSize: 14,
    fontFamily: FONTS.body.regular,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default NotificationsScreen;
