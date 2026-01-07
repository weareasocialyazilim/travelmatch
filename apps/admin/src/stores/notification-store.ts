import { create } from 'zustand';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],

  addNotification: (notification) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };

    set((state) => ({
      notifications: [...state.notifications, newNotification],
    }));

    // Auto remove after duration (default 5 seconds)
    const duration = notification.duration ?? 5000;
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      }, duration);
    }
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },
}));

// Helper functions for common notification types
export const notify = {
  success: (title: string, message?: string) => {
    useNotificationStore
      .getState()
      .addNotification({ type: 'success', title, message });
  },
  error: (title: string, message?: string) => {
    useNotificationStore
      .getState()
      .addNotification({ type: 'error', title, message });
  },
  warning: (title: string, message?: string) => {
    useNotificationStore
      .getState()
      .addNotification({ type: 'warning', title, message });
  },
  info: (title: string, message?: string) => {
    useNotificationStore
      .getState()
      .addNotification({ type: 'info', title, message });
  },
};
