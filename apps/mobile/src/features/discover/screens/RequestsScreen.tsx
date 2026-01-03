/**
 * TravelMatch Awwwards Edition - Requests Screen
 * Gelen teklifleri ve giden istekleri ipeksi bir hiyerarşiyle listeler.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/constants/colors';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { TMAvatar } from '@/components/ui/TMAvatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { NotificationCard } from '@/components/NotificationCard';
import { withErrorBoundary } from '@/components/withErrorBoundary';
import { useRequestsScreen } from '@/hooks/useRequestsScreen';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/routeParams';
import type { NotificationType } from '@/components/NotificationCard';

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

const RequestsScreen = ({ navigation }: any) => {
  const insets = useSafeAreaInsets();
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
  };

  const renderRequestItem = ({ item }: { item: (typeof requests)[0] }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => navigation.navigate('ReceiverApproval', { requestId: item.id })}
    >
      <GlassCard intensity={15} style={styles.requestCard}>
        <View style={styles.cardHeader}>
          <View style={styles.userInfo}>
            <TMAvatar
              size="md"
              imageUrl={item.person?.avatar}
              name={item.person?.name || 'User'}
            />
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{item.person?.name || 'Unknown'}</Text>
              <Text style={styles.momentTitle}>{item.momentTitle}</Text>
            </View>
          </View>
          <Badge label="Bekliyor" variant="warning" size="sm" />
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.timeText}>{item.timeAgo}</Text>
          <View style={styles.actionPrompt}>
            <Text style={styles.promptText}>İncelemek için dokun</Text>
            <Ionicons name="chevron-forward" size={14} color={COLORS.primary} />
          </View>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Premium Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={styles.title}>İstekler</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabs} accessibilityRole="tablist">
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'pending' && styles.tabActive]}
          onPress={() => setSelectedTab('pending')}
          accessibilityRole="tab"
          accessibilityState={{ selected: selectedTab === 'pending' }}
          accessibilityLabel={`Talepler${newRequestsCount > 0 ? `, ${newRequestsCount} yeni` : ''}`}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'pending' && styles.tabTextActive,
            ]}
          >
            Talepler
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
          accessibilityRole="tab"
          accessibilityState={{ selected: selectedTab === 'notifications' }}
          accessibilityLabel={`Aktivite${unreadNotificationsCount > 0 ? `, ${unreadNotificationsCount} okunmamış` : ''}`}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'notifications' && styles.tabTextActive,
            ]}
          >
            Aktivite
          </Text>
          {unreadNotificationsCount > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{unreadNotificationsCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Content */}
      {selectedTab === 'pending' ? (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          renderItem={renderRequestItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="paper-plane-outline"
                size={64}
                color={COLORS.text.muted}
              />
              <Text style={styles.emptyText}>Henüz bir istek bulunmuyor.</Text>
              <Text style={styles.emptySubtext}>
                Moment'lere katılım istekleri burada görünecek.
              </Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.primary}
            />
          }
          renderItem={({ item }) => (
            <NotificationCard
              id={item.id}
              type={mapNotificationType(item.type)}
              title={item.title}
              message={item.body}
              timestamp={item.timeAgo}
              read={item.isRead}
              avatar={item.avatar}
              onPress={() => handleNotificationPress(item)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="notifications-off-outline"
                size={64}
                color={COLORS.text.muted}
              />
              <Text style={styles.emptyText}>Bildirim yok</Text>
              <Text style={styles.emptySubtext}>
                Tüm bildirimler okundu. Yeni aktiviteler burada görünecek.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text.inverse,
    letterSpacing: -0.5,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.hairlineLight,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 12,
    paddingHorizontal: 4,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: COLORS.text.secondary,
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
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  requestCard: {
    padding: 16,
    borderRadius: 24,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    color: COLORS.text.inverse,
    fontSize: 16,
    fontWeight: '700',
  },
  momentTitle: {
    color: COLORS.text.secondary,
    fontSize: 12,
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.hairlineLight,
  },
  timeText: {
    color: COLORS.text.muted,
    fontSize: 11,
  },
  actionPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  promptText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
    paddingHorizontal: 40,
  },
  emptyText: {
    color: COLORS.text.secondary,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubtext: {
    color: COLORS.text.muted,
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default withErrorBoundary(RequestsScreen, {
  fallbackType: 'generic',
  displayName: 'RequestsScreen',
});
