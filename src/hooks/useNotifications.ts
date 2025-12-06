/**
 * useNotifications Hook
 * Real-time notifications with badge count
 */
import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/notificationService';
import { logger } from '../utils/logger';
import type {
  Notification,
  NotificationPreferences,
  NotificationType,
} from '../services/notificationService';

interface UseNotificationsReturn {
  // Notifications
  notifications: Notification[];
  loading: boolean;
  error: string | null;
  unreadCount: number;

  // Actions
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAll: () => Promise<void>;

  // Preferences
  preferences: NotificationPreferences | null;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;

  // Pagination
  hasMore: boolean;

  // Filters
  filterByType: (type: NotificationType | null) => void;
  currentFilter: NotificationType | null;
}

const DEFAULT_PAGE_SIZE = 20;

export const useNotifications = (): UseNotificationsReturn => {
  // State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [preferences, setPreferences] =
    useState<NotificationPreferences | null>(null);
  const [currentFilter, setCurrentFilter] = useState<NotificationType | null>(
    null,
  );

  /**
   * Fetch notifications
   */
  const fetchNotifications = useCallback(
    async (pageNum: number, append = false) => {
      try {
        if (!append) setLoading(true);
        setError(null);

        const response = await notificationService.getNotifications({
          page: pageNum,
          pageSize: DEFAULT_PAGE_SIZE,
          type: currentFilter || undefined,
        });

        if (append) {
          setNotifications((prev) => [...prev, ...response.notifications]);
        } else {
          setNotifications(response.notifications);
        }

        setUnreadCount(response.unreadCount);
        setHasMore(response.notifications.length === DEFAULT_PAGE_SIZE);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load notifications',
        );
      } finally {
        setLoading(false);
      }
    },
    [currentFilter],
  );

  /**
   * Refresh notifications
   */
  const refresh = useCallback(async () => {
    setPage(1);
    await fetchNotifications(1, false);
  }, [fetchNotifications]);

  /**
   * Load more notifications
   */
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    const nextPage = page + 1;
    setPage(nextPage);
    await fetchNotifications(nextPage, true);
  }, [page, hasMore, loading, fetchNotifications]);

  /**
   * Mark single notification as read
   */
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
      );

      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      logger.error('Failed to mark notification as read:', err);
    }
  }, []);

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      logger.error('Failed to mark all as read:', err);
    }
  }, []);

  /**
   * Delete a notification
   */
  const deleteNotification = useCallback(
    async (notificationId: string) => {
      try {
        const notification = notifications.find((n) => n.id === notificationId);
        await notificationService.deleteNotification(notificationId);

        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

        if (notification && !notification.read) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } catch (err) {
        logger.error('Failed to delete notification:', err);
      }
    },
    [notifications],
  );

  /**
   * Clear all notifications
   */
  const clearAll = useCallback(async () => {
    try {
      await notificationService.clearAll();
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      logger.error('Failed to clear notifications:', err);
    }
  }, []);

  /**
   * Filter by type
   */
  const filterByType = useCallback((type: NotificationType | null) => {
    setCurrentFilter(type);
    setPage(1);
  }, []);

  /**
   * Fetch preferences
   */
  const fetchPreferences = useCallback(async () => {
    try {
      const response = await notificationService.getPreferences();
      setPreferences(response.preferences);
    } catch (err) {
      // Development mode veya backend yokken sessizce varsayılan kullan
      if (__DEV__) {
        logger.debug(
          '[Notifications] Using default preferences (backend unavailable)',
        );
      } else {
        logger.error('Failed to fetch preferences:', err);
      }
    }
  }, []);

  /**
   * Update preferences
   */
  const updatePreferences = useCallback(
    async (prefs: Partial<NotificationPreferences>) => {
      try {
        const response = await notificationService.updatePreferences(prefs);
        setPreferences(response.preferences);
      } catch (err) {
        logger.error('Failed to update preferences:', err);
        throw err;
      }
    },
    [],
  );

  // Initial load
  useEffect(() => {
    void fetchNotifications(1, false);
    void fetchPreferences();
  }, [fetchNotifications, fetchPreferences]);

  // Refetch when filter changes
  useEffect(() => {
    void fetchNotifications(1, false);
  }, [currentFilter, fetchNotifications]);

  // TODO: Set up real-time subscription
  // useEffect(() => {
  //   const unsubscribe = subscribeToNotifications((notification) => {
  //     setNotifications(prev => [notification, ...prev]);
  //     if (!notification.read) {
  //       setUnreadCount(prev => prev + 1);
  //     }
  //   });
  //   return () => unsubscribe();
  // }, []);

  return {
    // Notifications
    notifications,
    loading,
    error,
    unreadCount,

    // Actions
    refresh,
    loadMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,

    // Preferences
    preferences,
    updatePreferences,

    // Pagination
    hasMore,

    // Filters
    filterByType,
    currentFilter,
  };
};

export default useNotifications;
