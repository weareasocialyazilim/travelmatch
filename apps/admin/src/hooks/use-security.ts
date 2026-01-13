'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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

// Mock data for fallback
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
  {
    id: '3',
    device: 'Firefox on Windows',
    device_type: 'desktop',
    ip_address: '10.0.0.15',
    location: 'Ankara, Türkiye',
    last_active: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
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
    status: 'success',
    ip_address: '192.168.1.50',
    location: 'İstanbul, Türkiye',
    device: 'Safari on iPhone',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: '3',
    status: 'failed',
    ip_address: '45.33.32.156',
    location: 'Unknown',
    device: 'Unknown Browser',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    reason: 'Yanlış şifre',
  },
  {
    id: '4',
    status: 'success',
    ip_address: '10.0.0.15',
    location: 'Ankara, Türkiye',
    device: 'Firefox on Windows',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: '5',
    status: 'failed',
    ip_address: '185.220.101.1',
    location: 'Germany',
    device: 'Unknown',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    reason: 'Engelli IP',
  },
];

// Fetch functions
async function fetchSessions(): Promise<SessionsResponse> {
  // try {
  //   const response = await fetch('/api/security/sessions');
  //   if (!response.ok) {
  //     throw new Error('Oturumlar yüklenemedi');
  //   }
  //   return response.json();
  // } catch {
  // Return mock data on error
  return { sessions: mockSessions, total: mockSessions.length };
  // }
}

async function fetchLoginHistory(
  limit = 30,
  offset = 0,
): Promise<LoginHistoryResponse> {
  // try {
  //   const params = new URLSearchParams();
  //   params.set('limit', limit.toString());
  //   params.set('offset', offset.toString());
  //
  //   const response = await fetch(
  //     `/api/security/login-history?${params.toString()}`,
  //   );
  //   if (!response.ok) {
  //     throw new Error('Giriş geçmişi yüklenemedi');
  //   }
  //   return response.json();
  // } catch {
  // Return mock data on error
  return {
    history: mockLoginHistory,
    total: mockLoginHistory.length,
    limit,
    offset,
  };
  // }
}

async function fetch2FAStatus(): Promise<TwoFAStatus> {
  // try {
  //   const response = await fetch('/api/security/2fa-status');
  //   if (!response.ok) {
  //     throw new Error('2FA durumu yüklenemedi');
  //   }
  //   return response.json();
  // } catch {
  // Return mock data on error
  return { enabled: false };
  // }
}

async function revokeSession(
  sessionId: string,
): Promise<{ success: boolean; message: string }> {
  // const response = await fetch('/api/security/sessions', {
  //   method: 'DELETE',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ sessionId }),
  // });
  // if (!response.ok) {
  //   throw new Error('Oturum sonlandırılamadı');
  // }
  // return response.json();
  return { success: true, message: 'Oturum kapatıldı' };
}

async function revokeAllSessions(): Promise<{
  success: boolean;
  message: string;
}> {
  // const response = await fetch('/api/security/sessions', {
  //   method: 'DELETE',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ all: true }),
  // });
  return { success: true, message: 'Tüm oturumlar kapatıldı' };
  if (!response.ok) {
    throw new Error('Oturumlar sonlandırılamadı');
  }
  return response.json();
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
