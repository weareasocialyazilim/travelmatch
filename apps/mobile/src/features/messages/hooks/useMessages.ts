import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { messageService as messagesApi, type SendMessageRequest } from '@/services/messageService';
import { supabase } from '@/config/supabase';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

/**
 * useConversations Hook
 * 
 * Tüm konuşmaları getir
 */
export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: () => messagesApi.getConversations(),
  });
}

/**
 * useMessages Hook
 * 
 * Konuşmadaki mesajlar
 */
export function useMessages(conversationId: string) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => messagesApi.getMessages(conversationId),
    enabled: !!conversationId,
  });
}

/**
 * useRealtimeMessages Hook
 * 
 * Real-time mesaj güncellemeleri
 */
export function useRealtimeMessages(conversationId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
          queryClient.setQueryData(
            ['messages', conversationId],
            (old: unknown[] | undefined) => [...(old ?? []), payload.new]
          );
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [conversationId, queryClient]);

  return useMessages(conversationId);
}

/**
 * useSendMessage Hook
 * 
 * Mesaj gönderme
 */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<SendMessageRequest, 'type'> & { type?: SendMessageRequest['type'] }) =>
      messagesApi.sendMessage({ ...data, type: data.type ?? 'text' }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

/**
 * useGetOrCreateConversation Hook
 * 
 * Yeni konuşma başlat veya mevcut olanı getir
 */
export function useGetOrCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, momentId }: { userId: string; momentId?: string }) => 
      messagesApi.getOrCreateConversation(userId, momentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

/**
 * useArchiveConversation Hook
 * 
 * Konuşmayı arşivle
 */
export function useArchiveConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => messagesApi.archiveConversation(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

/**
 * useMarkAsRead Hook
 * 
 * Mesajları okundu işaretle
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId: string) => messagesApi.markAsRead(conversationId),
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
