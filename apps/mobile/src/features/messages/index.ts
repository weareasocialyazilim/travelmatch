/**
 * Messages Feature - Barrel Exports
 */
export { default as MessagesScreen } from './screens/MessagesScreen';
export { default as ChatScreen } from './screens/ChatScreen';
export { default as ArchivedChatsScreen } from './screens/ArchivedChatsScreen';
export { default as ChatDetailScreen } from './screens/ChatDetailScreen';

// Hooks
export {
  useConversations,
  useMessages,
  useRealtimeMessages,
  useSendMessage,
  useGetOrCreateConversation,
  useArchiveConversation,
  useMarkAsRead,
} from './hooks/useMessages';

// Services
export { messagesApi as messagesService } from './services/messagesService';
/** @deprecated Use messagesService instead */
export { messagesApi } from './services/messagesService';
