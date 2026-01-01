/**
 * TravelMatch Vibe Room - Inbox Feature
 *
 * Phase 4: THE VIBE ROOM (INBOX & CHAT)
 *
 * Exports:
 * - Screens: InboxScreen
 * - Components: InboxChatItem, GlassSegmentedControl, StatusBadge
 * - Hooks: useInbox
 * - Types: InboxChat, InboxTab, ChatStatus, etc.
 * - Constants: VIBE_ROOM_COLORS, INBOX_SPACING
 */

// Screens
export { default as InboxScreen } from './screens/InboxScreen';

// Components
export { default as InboxChatItem } from './components/InboxChatItem';
export { default as GlassSegmentedControl } from './components/GlassSegmentedControl';
export { default as StatusBadge } from './components/StatusBadge';

// Hooks
export { useInbox } from './hooks/useInbox';

// Types
export type {
  ChatStatus,
  RequestStatus,
  MomentContext,
  ChatUser,
  InboxChat,
  InboxRequest,
  InboxTab,
  StatusBadgeConfig,
} from './types/inbox.types';
export { STATUS_BADGE_CONFIG } from './types/inbox.types';

// Constants
export { VIBE_ROOM_COLORS, INBOX_SPACING, INBOX_SPRINGS } from './constants/theme';
