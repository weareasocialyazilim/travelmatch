import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { messagesApi } from '../services/messagesApi';
import { supabase } from '@/services/api/supabaseClient';

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
 * useConversation Hook
 * 
 * Tek bir konuşma detayı
 */
export function useConversation(conversationId: string) {
  return useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: () => messagesApi.getConversation(conversationId),
    enabled: !!conversationId,
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
        (payload) => {
          queryClient.setQueryData(
            ['messages', conversationId],
            (old: any[] = []) => [...old, payload.new]
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
    mutationFn: ({ conversationId, content }: { conversationId: string; content: string }) =>
      messagesApi.sendMessage(conversationId, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

/**
 * useCreateConversation Hook
 * 
 * Yeni konuşma başlat
 */
export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recipientId: string) => messagesApi.createConversation(recipientId),
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
    mutationFn: (conversationId: string) => messagesApi.archiveConversation(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}

/**
 * useDeleteConversation Hook
 * 
 * Konuşmayı sil
 */
export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId: string) => messagesApi.deleteConversation(conversationId),
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
    mutationFn: (conversationId: string) => messagesApi.markAsRead(conversationId),
    onSuccess: (_, conversationId) => {
      queryClient.invalidateQueries({ queryKey: ['conversation', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
}
