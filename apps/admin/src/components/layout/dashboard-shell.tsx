'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { CommandPalette } from '@/components/layout/command-palette';
import { useAuthStore } from '@/stores/auth-store';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, is2FAVerified, user, setUser, _hasHydrated } =
    useAuthStore();
  const [isReady, setIsReady] = useState(false);

  // Wait for store hydration then optionally check session
  useEffect(() => {
    if (!_hasHydrated) return;

    const init = async () => {
      // If already authenticated from store, no need to check session
      if (isAuthenticated && user) {
        setIsReady(true);
        return;
      }

      // Try to restore session from cookie
      try {
        const response = await fetch('/api/auth/session', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUser(data.user);
          }
        }
      } catch (error) {
        console.error('Session check failed:', error);
      }

      setIsReady(true);
    };

    init();
  }, [_hasHydrated, isAuthenticated, user, setUser]);

  useEffect(() => {
    if (!isReady) return;

    if (!isAuthenticated) {
      router.push('/login');
    } else if (user?.requires_2fa && user?.totp_enabled && !is2FAVerified) {
      router.push('/2fa');
    }
  }, [isReady, isAuthenticated, is2FAVerified, user, router]);

  // Show loading state
  if (!isReady) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6">
          {children}
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
