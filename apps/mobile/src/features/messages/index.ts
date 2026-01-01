/**
 * Messages Feature - Barrel Exports
 */
export { default as MessagesScreen } from './screens/MessagesScreen';
export { default as ChatScreen } from './screens/ChatScreen';
export { default as ArchivedChatsScreen } from './screens/ArchivedChatsScreen';
export { ChatCameraScreen } from './screens/ChatCameraScreen';

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
export { messagesApi } from './services/messagesApi';
