import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { COLORS } from '@/constants/colors';
import BottomNav from '@/components/BottomNav';
import { EmptyState } from '@/components/ui/EmptyState';
import { RequestCard } from '@/components/RequestCard';
import { NotificationCard } from '@/components/NotificationCard';
import { useRequestsScreen } from '@/hooks/useRequestsScreen';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { NotificationType } from '@/components/NotificationCard';
import { withErrorBoundary } from '../../../components/withErrorBoundary';

type RequestsRouteProp = RouteProp<RootStackParamList, 'Requests'>;

// Map hook notification types to NotificationCard types
const mapNotificationType = (type: string): NotificationType => {
  const typeMap: Record<string, NotificationType> = {
    new_request: 'gift_received',
    accepted: 'request_accepted',
    completed: 'request_accepted',
    review: 'new_review',
    payment: 'system',
  };
  return typeMap[type] || 'system';
};

const RequestsScreen = () => {
  const route = useRoute<RequestsRouteProp>();
  const {
    selectedTab,
    setSelectedTab,
    requests,
    notifications,
    newRequestsCount,
    unreadNotificationsCount,
    refreshing,
    handleAccept,
    handleDecline,
    handleRefresh,
    markNotificationAsRead,
  } = useRequestsScreen(route.params?.initialTab || 'pending');

  const handleNotificationPress = async (item: (typeof notifications)[0]) => {
    if (!item.isRead) {
      await markNotificationAsRead(item.id);
    }
    // TODO: Navigate based on targetType
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'pending' && styles.tabActive]}
            onPress={() => setSelectedTab('pending')}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === 'pending' && styles.tabTextActive,
              ]}
            >
              Requests
            </Text>
            {newRequestsCount > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{newRequestsCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              selectedTab === 'notifications' && styles.tabActive,
            ]}
            onPress={() => setSelectedTab('notifications')}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === 'notifications' && styles.tabTextActive,
              ]}
            >
              Activity
            </Text>
            {unreadNotificationsCount > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>
                  {unreadNotificationsCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.primary}
            />
          }
        >
          {selectedTab === 'pending' ? (
            requests.length > 0 ? (
              requests.map((request) => (
                <RequestCard
                  key={request.id}
                  id={request.id}
                  userAvatar={request.person.avatar}
                  userName={request.person.name}
                  momentTitle={request.momentTitle}
                  status="pending"
                  date={request.timeAgo}
                  message={request.message}
                  onAccept={() => handleAccept(request)}
                  onReject={() => handleDecline(request)}
                />
              ))
            ) : (
              <EmptyState
                icon="inbox"
                title="No requests"
                subtitle="You don't have any pending requests at the moment."
              />
            )
          ) : notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                id={notification.id}
                type={mapNotificationType(notification.type)}
                title={notification.title}
                message={notification.body}
                timestamp={notification.timeAgo}
                read={notification.isRead}
                avatar={notification.avatar}
                onPress={() => handleNotificationPress(notification)}
              />
            ))
          ) : (
            <EmptyState
              icon="bell-off"
              title="No notifications"
              subtitle="You're all caught up! No new activity."
            />
          )}
        </ScrollView>
      </SafeAreaView>

      <BottomNav activeTab="Requests" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  tabs: {
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  tab: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingBottom: 12,
    paddingHorizontal: 4,
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
    borderBottomWidth: 2,
  },
  tabText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '500',
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  tabBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 20,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tabBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
});

// Wrap with ErrorBoundary for requests/notifications screen
export default withErrorBoundary(RequestsScreen, {
  fallbackType: 'generic',
  displayName: 'RequestsScreen',
});
