// Notifications Feature Exports

// Screens
export { default as GestureReceivedScreen } from './screens/GestureReceivedScreen';
export { NotificationDetailScreen } from './screens/NotificationDetailScreen';
export { NotificationsScreen } from './screens/NotificationsScreen';

// Hooks
export { useNotifications } from '@/hooks/useNotifications';

// Services
export {
  notificationService,
  getNotificationIcon,
  getNotificationColor,
  getNotificationRoute,
} from '@/services/notificationService';

// Types
export type {
  Notification,
  NotificationType,
  NotificationFilters,
  NotificationPreferences,
} from '@/services/notificationService';

// Components (re-export from components folder)
export { NotificationCard } from '@/components/NotificationCard';
export type { NotificationCardProps } from '@/components/NotificationCard';
export { NotificationPermissionModal } from '@/components/NotificationPermissionModal';
