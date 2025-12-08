/**
 * Messages Feature - Barrel Exports
 */
export { default as MessagesScreen } from './screens/MessagesScreen';
export { default as ChatScreen } from './screens/ChatScreen';
export { default as ArchivedChatsScreen } from './screens/ArchivedChatsScreen';

// Hooks
export {
  useConversations,
  useConversation,
  useMessages,
  useRealtimeMessages,
  useSendMessage,
  useCreateConversation,
  useArchiveConversation,
  useDeleteConversation,
  useMarkAsRead
} from './hooks/useMessages';

// Services
export { messagesApi } from './services/messagesApi';
