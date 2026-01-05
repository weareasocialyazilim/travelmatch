/**
 * Message Adapters
 *
 * Normalizes Message API responses (snake_case) to canonical types (camelCase)
 */

// ============================================
// TYPES
// ============================================

export interface Message {
  id: string;
  conversation_id?: string;
  conversationId?: string;
  sender_id?: string;
  senderId?: string;
  receiver_id?: string;
  receiverId?: string;
  text?: string;
  content: string;
  attachment_url?: string;
  attachmentUrl?: string;
  timestamp?: string | null;
  created_at?: string | null;
  createdAt?: string | null;
  read_at?: string | null;
  readAt?: string | null;
  isRead?: boolean;
}

// ============================================
// API TYPES (snake_case from backend)
// ============================================

export interface ApiMessage {
  id: string;
  conversation_id?: string;
  conversationId?: string;
  sender_id?: string;
  senderId?: string;
  receiver_id?: string;
  receiverId?: string;
  text?: string;
  content?: string;
  attachment_url?: string;
  attachmentUrl?: string;
  timestamp?: string;
  created_at?: string;
  createdAt?: string;
  read_at?: string;
  readAt?: string;
  is_read?: boolean;
  isRead?: boolean;
}

// ============================================
// NORMALIZER FUNCTIONS
// ============================================

/**
 * Normalize message from API response
 */
export function normalizeMessageFromAPI(apiMessage: ApiMessage): Message {
  return {
    id: apiMessage.id,
    conversationId: apiMessage.conversation_id ?? apiMessage.conversationId,
    senderId: apiMessage.sender_id ?? apiMessage.senderId,
    receiverId: apiMessage.receiver_id ?? apiMessage.receiverId,
    text: apiMessage.text ?? apiMessage.content,
    content: apiMessage.content ?? apiMessage.text ?? '',
    attachmentUrl: apiMessage.attachment_url ?? apiMessage.attachmentUrl,
    timestamp:
      apiMessage.timestamp ??
      apiMessage.created_at ??
      apiMessage.createdAt ??
      null,
    createdAt: apiMessage.created_at ?? apiMessage.createdAt ?? null,
    readAt: apiMessage.read_at ?? apiMessage.readAt ?? null,
    isRead:
      apiMessage.isRead ??
      apiMessage.is_read ??
      !!(apiMessage.read_at ?? apiMessage.readAt),
  };
}

/**
 * Normalize array of messages from API
 */
export function normalizeMessagesFromAPI(apiMessages: ApiMessage[]): Message[] {
  return apiMessages.map(normalizeMessageFromAPI);
}
