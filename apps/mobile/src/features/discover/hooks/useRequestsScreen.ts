import { useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LayoutAnimation, Platform, UIManager } from 'react-native';
import * as Haptics from 'expo-haptics';
import { logger } from '@/utils/logger';
import { showAlert } from '@/stores/modalStore';
import { useRequests as useRequestsAPI } from '@/hooks/useRequests';
import { useNotifications as useNotificationsAPI } from '@/hooks/useNotifications';
import { formatTimeAgo } from '../utils/timeFormat';
import type {
  RequestItem,
  NotificationItem,
  TabType,
} from '../types/requests.types';
import { useToast } from '@/context/ToastContext';

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

export const useRequestsScreen = (initialTab: TabType = 'pending') => {
  const { showToast: _showToast } = useToast();
  const [selectedTab, setSelectedTab] = useState<TabType>(initialTab);
  const [hiddenRequestIds, setHiddenRequestIds] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // API hooks
  const {
    receivedRequests: apiRequests,
    receivedLoading: requestsLoading,
    refreshReceived: fetchReceivedRequests,
    acceptRequest: apiAcceptRequest,
    declineRequest: apiDeclineRequest,
  } = useRequestsAPI();

  const {
    notifications: apiNotifications,
    loading: notificationsLoading,
    refresh: fetchNotifications,
    markAsRead: apiMarkAsRead,
  } = useNotificationsAPI();

  // Mapped UI data
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Map API requests to UI format
  useEffect(() => {
    if (apiRequests) {
      const mappedRequests: RequestItem[] = apiRequests.map((req) => ({
        id: req.id,
        person: {
          id: req.requesterId,
          name: req.requesterName,
          age: 0,
          avatar: req.requesterAvatar,
          rating: req.requesterRating || 0,
          isVerified: req.requesterVerified || false,
          tripCount: 0,
          city: req.requesterLocation || '',
        },
        momentTitle: req.momentTitle,
        momentEmoji: '🎁',
        amount: req.totalPrice ?? 0,
        message: req.message || '',
        createdAt: req.createdAt ?? '',
        timeAgo: formatTimeAgo(req.createdAt ?? ''),
        isNew: req.status === 'pending',
        proofRequired: false,
        proofUploaded: false,
      }));
      setRequests(mappedRequests);
    }
  }, [apiRequests]);

  // Map API notifications to UI format
  useEffect(() => {
    if (apiNotifications) {
      const mappedNotifications: NotificationItem[] = apiNotifications.map(
        (notif) => {
          let type: NotificationItem['type'] = 'new_request';
          if (notif.type === 'request_accepted') type = 'accepted';
          if (notif.type === 'request_completed') type = 'completed';
          if (notif.type === 'review_received') type = 'review';
          if (notif.type === 'payment_received') type = 'payment';

          let targetType: NotificationItem['targetType'] = 'request';
          if (notif.type === 'payment_received') targetType = 'wallet';
          if (notif.type === 'review_received') targetType = 'moment';

          return {
            id: notif.id,
            type,
            title: notif.title,
            body: notif.body,
            avatar: notif.userAvatar,
            timeAgo: formatTimeAgo(notif.createdAt),
            isRead: notif.read,
            momentId: notif.momentId,
            targetType,
            targetData: {
              momentId: notif.momentId,
              userId: notif.userId,
            },
          };
        },
      );
      setNotifications(mappedNotifications);
    }
  }, [apiNotifications]);

  // Load hidden IDs from storage
  useEffect(() => {
    loadHiddenIds();
  }, []);

  const loadHiddenIds = async () => {
    try {
      const hidden = await AsyncStorage.getItem(STORAGE_KEYS.HIDDEN_REQUESTS);
      if (hidden) {
        setHiddenRequestIds(JSON.parse(hidden) as string[]);
      }
    } catch (error) {
      logger.error('Error loading hidden IDs:', error);
    }
  };

  // Computed values
  const filteredRequests = useMemo(() => {
    return requests.filter((item) => !hiddenRequestIds.includes(item.id));
  }, [requests, hiddenRequestIds]);

  const newRequestsCount = useMemo(() => {
    return filteredRequests.filter((r) => r.isNew).length;
  }, [filteredRequests]);

  const unreadNotificationsCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const isLoading =
    selectedTab === 'pending' ? requestsLoading : notificationsLoading;

  // Handlers
  const handleAccept = async (item: RequestItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (item.proofRequired && !item.proofUploaded) {
      showAlert({
        title: 'Proof Required',
        message:
          'This request requires proof before accepting. Would you like to upload proof now?',
        buttons: [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Upload Proof', onPress: () => handleUploadProof(item) },
        ],
      });
      return;
    }

    const success = await apiAcceptRequest(item.id);
    if (success) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setRequests((prev) => prev.filter((r) => r.id !== item.id));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleDecline = async (item: RequestItem) => {
    showAlert({
      title: 'Decline Request',
      message: 'Are you sure you want to decline this request?',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: async () => {
            const success = await apiDeclineRequest(item.id);
            if (success) {
              LayoutAnimation.configureNext(
                LayoutAnimation.Presets.easeInEaseOut,
              );
              setRequests((prev) => prev.filter((r) => r.id !== item.id));
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
              );
            }
          },
        },
      ],
    });
  };

  const handleUploadProof = (
    item: RequestItem,
    onNavigate?: (requestId: string) => void,
  ) => {
    logger.info('Upload proof for:', item.id);
    if (onNavigate) {
      onNavigate(item.id);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchReceivedRequests(), fetchNotifications()]);
    setRefreshing(false);
  };

  const markNotificationAsRead = async (notificationId: string) => {
    await apiMarkAsRead(notificationId);
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
    );
  };

  return {
    selectedTab,
    setSelectedTab,
    requests: filteredRequests,
    notifications,
    newRequestsCount,
    unreadNotificationsCount,
    isLoading,
    refreshing,
    handleAccept,
    handleDecline,
    handleUploadProof,
    handleRefresh,
    markNotificationAsRead,
  };
};
