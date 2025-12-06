import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { logger } from '../utils/logger';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Alert,
  LayoutAnimation,
  Platform,
  UIManager,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NavigationProp, RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/AppNavigator';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BottomNav from '../components/BottomNav';
import { COLORS } from '../constants/colors';
import { useRequests } from '../hooks/useRequests';
import { useNotifications } from '../hooks/useNotifications';
import {
  RequestsListSkeleton as _RequestsListSkeleton,
  ErrorState as _ErrorState,
} from '../components';
import { FadeInView as _FadeInView } from '../components/AnimatedComponents';

const { width: _SCREEN_WIDTH } = Dimensions.get('window');

// Enable LayoutAnimation for Android
if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const STORAGE_KEYS = {
  HIDDEN_REQUESTS: '@requests_hidden_items',
};

type TabType = 'pending' | 'notifications';

interface Person {
  id: string;
  name: string;
  age: number;
  avatar: string;
  rating: number;
  isVerified: boolean;
  tripCount: number;
  city: string;
}

interface RequestItem {
  id: string;
  person: Person;
  momentTitle: string;
  momentEmoji: string;
  amount: number;
  message: string;
  createdAt: string;
  timeAgo: string;
  isNew: boolean;
  proofRequired: boolean;
  proofUploaded: boolean;
}

interface NotificationItem {
  id: string;
  type: 'new_request' | 'accepted' | 'completed' | 'review' | 'payment';
  title: string;
  body: string;
  avatar?: string;
  timeAgo: string;
  isRead: boolean;
  momentId?: string;
  // Navigation targets
  targetType?: 'moment' | 'wallet' | 'profile' | 'request';
  targetData?: {
    momentId?: string;
    momentTitle?: string;
    userId?: string;
    transactionId?: string;
    reviewerId?: string;
    reviewerName?: string;
    reviewRating?: number;
  };
}

type RequestsRouteProp = RouteProp<RootStackParamList, 'Requests'>;

const RequestsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RequestsRouteProp>();
  const [selectedTab, setSelectedTab] = useState<TabType>(
    route.params?.initialTab || 'pending',
  );
  const [hiddenRequestIds, setHiddenRequestIds] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Use requests hook for API integration
  const {
    receivedRequests: _receivedRequests,
    receivedLoading: requestsLoading,
    receivedError: _requestsError,
    refreshReceived: fetchReceivedRequests,
    acceptRequest,
    declineRequest,
  } = useRequests();

  // Use notifications hook for API integration
  const {
    notifications: _apiNotifications,
    loading: notificationsLoading,
    refresh: fetchNotifications,
    markAsRead: _markAsRead,
  } = useNotifications();

  // Fetch data on mount
  useEffect(() => {
    fetchReceivedRequests();
    fetchNotifications();
  }, [fetchReceivedRequests, fetchNotifications]);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchReceivedRequests(), fetchNotifications()]);
    setRefreshing(false);
  }, [fetchReceivedRequests, fetchNotifications]);

  // Loading state based on selected tab
  const isLoading =
    selectedTab === 'pending' ? requestsLoading : notificationsLoading;
  // Use isLoading for future loading indicator
  void isLoading;

  // Mock Data - Pending Requests (fallback)
  const [requests, setRequests] = useState<RequestItem[]>([
    {
      id: 'r1',
      person: {
        id: 'mehmet-1',
        name: 'Mehmet',
        age: 32,
        avatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
        rating: 4.8,
        isVerified: true,
        tripCount: 12,
        city: 'Istanbul',
      },
      momentTitle: 'Dinner',
      momentEmoji: '🍽️',
      amount: 120,
      message: 'Best local food! I know great places in Kadikoy',
      createdAt: '2024-01-15T10:30:00Z',
      timeAgo: '1h ago',
      isNew: true,
      proofRequired: true,
      proofUploaded: false,
    },
    {
      id: 'r2',
      person: {
        id: 'sarah-1',
        name: 'Sarah',
        age: 25,
        avatar:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
        rating: 4.9,
        isVerified: true,
        tripCount: 8,
        city: 'London',
      },
      momentTitle: 'Museum Tour',
      momentEmoji: '🎭',
      amount: 50,
      message: 'Would love to explore the art galleries together!',
      createdAt: '2024-01-15T09:00:00Z',
      timeAgo: '2h ago',
      isNew: true,
      proofRequired: false,
      proofUploaded: false,
    },
    {
      id: 'r3',
      person: {
        id: 'alex-1',
        name: 'Alex',
        age: 28,
        avatar:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        rating: 4.7,
        isVerified: true,
        tripCount: 15,
        city: 'Istanbul',
      },
      momentTitle: 'Coffee',
      momentEmoji: '☕',
      amount: 25,
      message: 'Let&apos;s grab a coffee at the best local spot!',
      createdAt: '2024-01-15T08:00:00Z',
      timeAgo: '30m ago',
      isNew: true,
      proofRequired: false,
      proofUploaded: false,
    },
  ]);

  // Mock Data - Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n1',
      type: 'completed',
      title: 'Experience Completed! 🎉',
      body: 'Your coffee date with Maria was marked as complete.',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
      timeAgo: '1h ago',
      isRead: false,
      momentId: 'moment-1',
      targetType: 'moment',
      targetData: {
        momentId: 'moment-1',
        momentTitle: 'Coffee Date',
      },
    },
    {
      id: 'n2',
      type: 'review',
      title: 'New Review',
      body: 'James left you a 5-star review! ⭐',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
      timeAgo: '3h ago',
      isRead: false,
      targetType: 'moment',
      targetData: {
        momentId: 'moment-museum',
        momentTitle: 'Museum Tour',
        reviewerId: 'james-1',
        reviewerName: 'James',
        reviewRating: 5,
      },
    },
    {
      id: 'n3',
      type: 'payment',
      title: 'Payment Received',
      body: 'You received €50 from your museum tour.',
      timeAgo: '1d ago',
      isRead: true,
      targetType: 'wallet',
      targetData: {
        transactionId: 'tx-123',
      },
    },
    {
      id: 'n4',
      type: 'new_request',
      title: 'New Request',
      body: 'Emma wants to join your city walk tour.',
      avatar:
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
      timeAgo: '2d ago',
      isRead: true,
      targetType: 'moment',
      targetData: {
        momentId: 'moment-2',
        momentTitle: 'City Walk Tour',
      },
    },
  ]);

  useEffect(() => {
    loadHiddenIds();
  }, []);

  const loadHiddenIds = async () => {
    try {
      const hidden = await AsyncStorage.getItem(STORAGE_KEYS.HIDDEN_REQUESTS);
      if (hidden) setHiddenRequestIds(JSON.parse(hidden));
    } catch (error) {
      logger.error('Error loading hidden IDs:', error);
    }
  };

  const saveHiddenIds = async (ids: string[]) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.HIDDEN_REQUESTS,
        JSON.stringify(ids),
      );
    } catch (error) {
      logger.error('Error saving hidden IDs:', error);
    }
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((item) => !hiddenRequestIds.includes(item.id));
  }, [requests, hiddenRequestIds]);

  const newRequestsCount = useMemo(() => {
    return filteredRequests.filter((r) => r.isNew).length;
  }, [filteredRequests]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const handleAccept = async (item: RequestItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (item.proofRequired && !item.proofUploaded) {
      Alert.alert(
        'Proof Required',
        'This request requires proof before accepting. Would you like to upload proof now?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Upload Proof',
            onPress: () => handleUploadProof(item),
          },
        ],
      );
      return;
    }

    // Accept via API
    const success = await acceptRequest(item.id);
    if (success) {
      // Update local state
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setRequests((prev) => prev.filter((r) => r.id !== item.id));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleDecline = async (item: RequestItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    Alert.alert('Decline Request?', `Decline ${item.person.name}'s request?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Decline',
        style: 'destructive',
        onPress: async () => {
          const success = await declineRequest(item.id);
          if (success) {
            LayoutAnimation.configureNext(
              LayoutAnimation.Presets.easeInEaseOut,
            );
            const newHidden = [...hiddenRequestIds, item.id];
            setHiddenRequestIds(newHidden);
            saveHiddenIds(newHidden);
          }
        },
      },
    ]);
  };

  const handleUploadProof = (item: RequestItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Upload Proof', 'Take a photo or select from gallery', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Camera',
        onPress: () => {
          setRequests((prev) =>
            prev.map((r) =>
              r.id === item.id ? { ...r, proofUploaded: true } : r,
            ),
          );
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
      {
        text: 'Gallery',
        onPress: () => {
          setRequests((prev) =>
            prev.map((r) =>
              r.id === item.id ? { ...r, proofUploaded: true } : r,
            ),
          );
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        },
      },
    ]);
  };

  const handleNotificationPress = (notification: NotificationItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n)),
    );

    // Navigate based on targetType
    switch (notification.targetType) {
      case 'moment':
        // Navigate to MomentDetail with mock moment data
        if (notification.targetData?.momentId) {
          navigation.navigate('MomentDetail', {
            moment: {
              id: notification.targetData.momentId,
              title: notification.targetData.momentTitle || 'Experience',
              story: `Your ${
                notification.targetData.momentTitle || 'experience'
              } details.`,
              imageUrl:
                notification.type === 'review'
                  ? 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800'
                  : 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
              price: 25,
              availability:
                notification.type === 'completed' ? 'Completed' : 'Available',
              status:
                notification.type === 'completed' ||
                notification.type === 'review'
                  ? 'completed'
                  : 'active',
              location: {
                name: 'Local Experience',
                city: 'Istanbul',
                country: 'Turkey',
              },
              user: {
                id: 'current-user',
                name: 'You',
                avatar:
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
                isVerified: true,
              },
              // Include review info if this is a review notification
              ...(notification.type === 'review' &&
              notification.targetData?.reviewerName
                ? {
                    latestReview: {
                      reviewerId: notification.targetData.reviewerId,
                      reviewerName: notification.targetData.reviewerName,
                      rating: notification.targetData.reviewRating || 5,
                    },
                  }
                : {}),
            },
            isOwner: true,
            pendingRequests: notification.type === 'new_request' ? 1 : 0,
          });
        }
        break;

      case 'wallet':
        navigation.navigate('Wallet');
        break;

      case 'profile':
        // Navigate to a specific user's profile
        if (notification.targetData?.userId) {
          navigation.navigate('ProfileDetail', {
            userId: notification.targetData.userId,
          });
        } else {
          navigation.navigate('Profile');
        }
        break;

      case 'request':
        // Switch to pending tab
        setSelectedTab('pending');
        break;

      default:
        // Fallback - just mark as read
        break;
    }
  };

  const renderRequestCard = (item: RequestItem) => (
    <View key={item.id} style={styles.requestCard}>
      {/* Compact Header - Name + Category + Price on same row */}
      <View style={styles.cardHeader}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('ProfileDetail', { userId: item.person.id })
          }
          style={styles.avatarContainer}
        >
          <Image source={{ uri: item.person.avatar }} style={styles.avatar} />
          {item.person.isVerified && (
            <View style={styles.verifiedBadge}>
              <MaterialCommunityIcons
                name="check-decagram"
                size={12}
                color={COLORS.primary}
              />
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.personName}>
              {item.person.name}, {item.person.age}
            </Text>
            <Text style={styles.categoryInline}>
              {item.momentEmoji} {item.momentTitle}
            </Text>
            {item.isNew && <View style={styles.newDot} />}
          </View>
          <View style={styles.metaRow}>
            <MaterialCommunityIcons name="star" size={12} color={COLORS.gold} />
            <Text style={styles.rating}>{item.person.rating}</Text>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.city}>{item.person.city}</Text>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.timeAgo}>{item.timeAgo}</Text>
          </View>
        </View>

        <View style={styles.amountBadge}>
          <Text style={styles.amountText}>€{item.amount}</Text>
        </View>
      </View>

      {/* Compact Message - single line */}
      <Text style={styles.message} numberOfLines={1}>
        &quot;{item.message}&quot;
      </Text>

      {/* Compact Proof Status + Actions */}
      <View style={styles.actionsRow}>
        {item.proofRequired && (
          <View
            style={[
              styles.proofStatusCompact,
              item.proofUploaded && styles.proofUploadedCompact,
            ]}
          >
            <MaterialCommunityIcons
              name={
                item.proofUploaded ? 'check-circle' : 'alert-circle-outline'
              }
              size={14}
              color={item.proofUploaded ? COLORS.success : COLORS.warning}
            />
            <Text
              style={[
                styles.proofTextCompact,
                item.proofUploaded && styles.proofTextUploadedCompact,
              ]}
            >
              {item.proofUploaded ? 'Proof Uploaded' : 'Proof Required'}
            </Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.declineButton}
            onPress={() => handleDecline(item)}
          >
            <Text style={styles.declineButtonText}>Decline</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.acceptButton,
              item.proofRequired &&
                !item.proofUploaded &&
                styles.acceptButtonDisabled,
            ]}
            onPress={() => handleAccept(item)}
          >
            <Text style={styles.acceptButtonText}>
              {item.proofRequired && !item.proofUploaded
                ? 'Upload Proof'
                : 'Accept'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderNotificationItem = (item: NotificationItem) => {
    const getIcon = () => {
      switch (item.type) {
        case 'completed':
          return 'check-circle';
        case 'review':
          return 'star';
        case 'payment':
          return 'cash';
        case 'new_request':
          return 'account-plus';
        default:
          return 'bell';
      }
    };

    const getIconColor = () => {
      switch (item.type) {
        case 'completed':
          return COLORS.success;
        case 'review':
          return COLORS.gold;
        case 'payment':
          return COLORS.primary;
        case 'new_request':
          return COLORS.info;
        default:
          return COLORS.textSecondary;
      }
    };

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.notificationItem,
          !item.isRead && styles.notificationUnread,
        ]}
        onPress={() => handleNotificationPress(item)}
      >
        {item.avatar ? (
          <Image
            source={{ uri: item.avatar }}
            style={styles.notificationAvatar}
          />
        ) : (
          <View
            style={[
              styles.notificationIcon,
              { backgroundColor: `${getIconColor()}20` },
            ]}
          >
            <MaterialCommunityIcons
              name={getIcon()}
              size={20}
              color={getIconColor()}
            />
          </View>
        )}

        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationBody}>{item.body}</Text>
          <Text style={styles.notificationTime}>{item.timeAgo}</Text>
        </View>

        {!item.isRead && <View style={styles.unreadIndicator} />}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Tabs - No title header, tabs are self-explanatory */}
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
            Pending
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
            Notifications
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {selectedTab === 'pending' ? (
          filteredRequests.length > 0 ? (
            filteredRequests.map(renderRequestCard)
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="inbox-outline"
                size={64}
                color={COLORS.textSecondary}
              />
              <Text style={styles.emptyTitle}>No Pending Requests</Text>
              <Text style={styles.emptySubtitle}>
                When travelers request to join your moments, they&apos;ll appear
                here.
              </Text>
            </View>
          )
        ) : notifications.length > 0 ? (
          notifications.map(renderNotificationItem)
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="bell-outline"
              size={64}
              color={COLORS.textSecondary}
            />
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptySubtitle}>
              You&apos;re all caught up! New updates will appear here.
            </Text>
          </View>
        )}
      </ScrollView>

      <BottomNav activeTab="Requests" requestsBadge={newRequestsCount} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  acceptButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    flex: 1,
    paddingVertical: 10,
  },
  acceptButtonDisabled: {
    backgroundColor: COLORS.warning,
  },
  acceptButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  amountBadge: {
    backgroundColor: `${COLORS.primary}15`,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  amountText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  avatar: {
    borderRadius: 20,
    height: 40,
    width: 40,
  },
  avatarContainer: {
    position: 'relative',
  },
  cardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  city: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  container: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  declineButton: {
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: 8,
    flex: 1,
    paddingVertical: 10,
  },
  declineButtonText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  emptySubtitle: {
    color: COLORS.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    textAlign: 'center',
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
  },
  headerInfo: {
    flex: 1,
  },
  message: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
    marginTop: 8,
    marginBottom: 8,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginTop: 2,
  },
  nameRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  newDot: {
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  notificationAvatar: {
    borderRadius: 20,
    height: 40,
    width: 40,
  },
  notificationBody: {
    color: COLORS.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationIcon: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  notificationItem: {
    alignItems: 'flex-start',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
    padding: 16,
  },
  notificationTime: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  notificationTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
  },
  notificationUnread: {
    backgroundColor: `${COLORS.primary}08`,
    borderColor: `${COLORS.primary}20`,
    borderWidth: 1,
  },
  personName: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
  },
  rating: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '500',
  },
  requestCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginBottom: 8,
    padding: 12,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  separator: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  categoryInline: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  proofStatusCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: `${COLORS.warning}15`,
    borderRadius: 6,
  },
  proofUploadedCompact: {
    backgroundColor: `${COLORS.success}15`,
  },
  proofTextCompact: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.warning,
  },
  proofTextUploadedCompact: {
    color: COLORS.success,
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
  tabText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '500',
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  tabs: {
    borderBottomColor: COLORS.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  timeAgo: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  unreadIndicator: {
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  verifiedBadge: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    bottom: -2,
    position: 'absolute',
    right: -2,
  },
});

export default RequestsScreen;
