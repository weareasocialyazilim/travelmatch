/**
 * useConversationsRealtime - Live Conversation Updates
 *
 * Handles realtime updates for conversations while respecting archive state
 * New messages do NOT auto-unarchive conversations (consistent behavior)
 */
import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/config/supabase';
import { logger } from '@/utils/logger';

interface ConversationUpdate {
  id: string;
  last_message_at: string;
  last_message: string;
}

interface UseConversationsRealtimeOptions {
  userId: string | undefined;
  onNewMessage?: (conversationId: string, message: unknown) => void;
  onConversationUpdate?: (conversation: ConversationUpdate) => void;
  enabled?: boolean;
}

export const useConversationsRealtime = (
  options: UseConversationsRealtimeOptions,
) => {
  const { userId, onNewMessage, onConversationUpdate, enabled = true } = options;
  const archivedConversationsRef = useRef<Set<string>>(new Set());

  const isConversationArchived = useCallback((conversationId: string) => {
    return archivedConversationsRef.current.has(conversationId);
  }, []);

  const markConversationArchived = useCallback((conversationId: string) => {
    archivedConversationsRef.current.add(conversationId);
  }, []);

  const markConversationActive = useCallback((conversationId: string) => {
    archivedConversationsRef.current.delete(conversationId);
  }, []);

  const setupRealtimeSubscription = useCallback(() => {
    if (!userId || !enabled) return null;

    const channel = supabase
      .channel(`conversations-realtime:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        async (payload) => {
          const message = payload.new as { conversation_id?: string; content?: string };
          const conversationId = message?.conversation_id;

          if (!conversationId) return;

          logger.info('[Realtime] New message received:', {
            conversationId,
            messagePreview: message?.content?.substring(0, 50),
          });

          // Check if conversation is archived for this user
          if (isConversationArchived(conversationId)) {
            logger.info('[Realtime] Message in archived conversation, not unarchiving:', {
              conversationId,
            });
            // Do NOT auto-unarchive - consistent behavior
            return;
          }

          // Notify about new message
          if (onNewMessage) {
            onNewMessage(conversationId, payload.new);
          }

          // Notify about conversation update
          if (onConversationUpdate) {
            const { data: conversation } = await supabase
              .from('conversations')
              .select('id, last_message_at, last_message')
              .eq('id', conversationId)
              .single();

            if (conversation) {
              onConversationUpdate(conversation as ConversationUpdate);
            }
          }
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversation_archive_state',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const { new: newState } = payload as { new: { conversation_id?: string; archived_at?: string } };
          const conversationId = newState?.conversation_id;

          if (!conversationId) return;

          if (newState?.archived_at) {
            // Conversation was archived
            markConversationArchived(conversationId);
            logger.info('[Realtime] Conversation archived:', { conversationId });
          } else {
            // Conversation was unarchived
            markConversationActive(conversationId);
            logger.info('[Realtime] Conversation unarchived:', { conversationId });
          }
        },
      )
      .subscribe((status) => {
        logger.info('[Realtime] Conversations subscription status:', status);
      });

    return channel;
  }, [userId, enabled, onNewMessage, onConversationUpdate, isConversationArchived]);

  useEffect(() => {
    const channel = setupRealtimeSubscription();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [setupRealtimeSubscription]);

  return {
    isConversationArchived,
    markConversationArchived,
    markConversationActive,
  };
};

export default useConversationsRealtime;
