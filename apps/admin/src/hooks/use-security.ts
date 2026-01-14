'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { logger } from '@/lib/logger';

// Types
export interface Session {
  id: string;
  device: string;
  device_type: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  ip_address: string;
  location: string;
  last_active: string;
  created_at: string;
  is_current: boolean;
}

export interface LoginHistoryEntry {
  id: string;
  status: 'success' | 'failed';
  ip_address: string;
  location: string;
  device: string;
  created_at: string;
  reason?: string;
}

export interface TwoFAStatus {
  enabled: boolean;
  enabled_at?: string;
  backup_codes_remaining?: number;
}

interface SessionsResponse {
  sessions: Session[];
  total: number;
}

interface LoginHistoryResponse {
  history: LoginHistoryEntry[];
  total: number;
  limit: number;
  offset: number;
}

// Mock data for fallback (only used when API fails)
const mockSessions: Session[] = [
  {
    id: '1',
    device: 'Chrome on MacOS',
    device_type: 'desktop',
    ip_address: '192.168.1.1',
    location: 'İstanbul, Türkiye',
    last_active: new Date().toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    is_current: true,
  },
  {
    id: '2',
    device: 'Safari on iPhone',
    device_type: 'mobile',
    ip_address: '192.168.1.50',
    location: 'İstanbul, Türkiye',
    last_active: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    is_current: false,
  },
];

const mockLoginHistory: LoginHistoryEntry[] = [
  {
    id: '1',
    status: 'success',
    ip_address: '192.168.1.1',
    location: 'İstanbul, Türkiye',
    device: 'Chrome on MacOS',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    status: 'failed',
    ip_address: '45.33.32.156',
    location: 'Unknown',
    device: 'Unknown Browser',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    reason: 'Yanlış şifre',
  },
];

// Fetch functions - Real API calls with fallback
async function fetchSessions(): Promise<SessionsResponse> {
  try {
    const response = await apiClient.get<SessionsResponse>('/security/sessions');

    if (response.error) {
      logger.warn('Sessions fetch failed, using fallback:', response.error);
      return { sessions: mockSessions, total: mockSessions.length };
    }

    return response.data || { sessions: mockSessions, total: mockSessions.length };
  } catch (error) {
    logger.error('Sessions fetch error:', error);
    return { sessions: mockSessions, total: mockSessions.length };
  }
}

async function fetchLoginHistory(
  limit = 30,
  offset = 0,
): Promise<LoginHistoryResponse> {
  try {
    const response = await apiClient.get<LoginHistoryResponse>('/security/login-history', {
      params: { limit, offset },
    });

    if (response.error) {
      logger.warn('Login history fetch failed, using fallback:', response.error);
      return {
        history: mockLoginHistory,
        total: mockLoginHistory.length,
        limit,
        offset,
      };
    }

    return response.data || {
      history: mockLoginHistory,
      total: mockLoginHistory.length,
      limit,
      offset,
    };
  } catch (error) {
    logger.error('Login history fetch error:', error);
    return {
      history: mockLoginHistory,
      total: mockLoginHistory.length,
      limit,
      offset,
    };
  }
}

async function fetch2FAStatus(): Promise<TwoFAStatus> {
  try {
    const response = await apiClient.get<TwoFAStatus>('/security/2fa-status');

    if (response.error) {
      logger.warn('2FA status fetch failed, using fallback:', response.error);
      return { enabled: false };
    }

    return response.data || { enabled: false };
  } catch (error) {
    logger.error('2FA status fetch error:', error);
    return { enabled: false };
  }
}

async function revokeSession(
  sessionId: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      '/security/sessions',
      { params: { sessionId } },
    );

    if (response.error) {
      throw new Error(response.error);
    }

    return response.data || { success: true, message: 'Oturum kapatıldı' };
  } catch (error) {
    logger.error('Revoke session error:', error);
    throw new Error('Oturum sonlandırılamadı');
  }
}

async function revokeAllSessions(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const response = await apiClient.delete<{ success: boolean; message: string }>(
      '/security/sessions',
      { params: { all: true } },
    );

    if (response.error) {
      throw new Error(response.error);
    }

    return response.data || { success: true, message: 'Tüm oturumlar kapatıldı' };
  } catch (error) {
    logger.error('Revoke all sessions error:', error);
    throw new Error('Oturumlar sonlandırılamadı');
  }
}

// Hooks
export function useSessions() {
  return useQuery({
    queryKey: ['security', 'sessions'],
    queryFn: fetchSessions,
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
  });
}

export function useLoginHistory(limit = 30, offset = 0) {
  return useQuery({
    queryKey: ['security', 'login-history', limit, offset],
    queryFn: () => fetchLoginHistory(limit, offset),
    staleTime: 60 * 1000, // 1 minute
  });
}

export function use2FAStatus() {
  return useQuery({
    queryKey: ['security', '2fa-status'],
    queryFn: fetch2FAStatus,
    staleTime: 30 * 1000, // 30 seconds
  });
}

export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security', 'sessions'] });
    },
  });
}

export function useRevokeAllSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeAllSessions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['security', 'sessions'] });
    },
  });
}
