'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { CommandPalette } from '@/components/layout/command-palette';
import { useAuthStore } from '@/stores/auth-store';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, setUser, _hasHydrated, is2FAVerified } = useAuthStore();
  const [isReady, setIsReady] = useState(false);
  const [sessionUser, setSessionUser] = useState<typeof user>(null);

  // Wait for store hydration then check session from server
  useEffect(() => {
    if (!_hasHydrated) return;

    const init = async () => {
      // Always check server session - cookie is the source of truth
      try {
        const response = await fetch('/api/auth/session', {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUser(data.user);
            setSessionUser(data.user);
            setIsReady(true);
            return;
          }
        }
      } catch (error) {
        console.error('Session check failed:', error);
      }

      // No valid session from server
      setSessionUser(null);
      setIsReady(true);
    };

    init();
  }, [_hasHydrated, setUser]);

  useEffect(() => {
    if (!isReady) return;

    if (!sessionUser) {
      router.push('/login');
    } else if (
      sessionUser?.requires_2fa &&
      sessionUser?.totp_enabled &&
      !is2FAVerified
    ) {
      router.push('/2fa');
    }
  }, [isReady, sessionUser, is2FAVerified, router]);

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
  if (!sessionUser) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar user={sessionUser} />
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
