/**
 * Messages Feature - Barrel Exports
 */
export { default as MessagesScreen } from './screens/MessagesScreen';
export { default as ChatScreen } from './screens/ChatScreen';
export { default as ArchivedChatsScreen } from './screens/ArchivedChatsScreen';
export { default as ChatDetailScreen } from './screens/ChatDetailScreen';

// Services
export { messagesApi as messagesService } from './services/messagesService';
/** @deprecated Use messagesService instead */
export { messagesApi } from './services/messagesService';
