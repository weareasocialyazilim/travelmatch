'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { getClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import { logger } from '@/lib/logger';
import type { AdminUser } from '@/types/admin';

export function useAuth() {
  const router = useRouter();
  const {
    user,
    isAuthenticated,
    is2FAVerified,
    isLoading,
    setUser,
    set2FAVerified,
    setLoading,
    logout: logoutStore,
  } = useAuthStore();
  const supabase = getClient();

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          // Fetch admin user profile
          const { data: adminUser } = await (
            supabase.from('admin_users') as any
          )
            .select('*')
            .eq('email', session.user.email || '')
            .eq('is_active', true)
            .single();

          if (adminUser) {
            setUser(adminUser as AdminUser);

            // Update last login
            await (supabase.from('admin_users') as any)
              .update({ last_login_at: new Date().toISOString() })
              .eq('id', (adminUser as any).id);
          } else {
            // User exists in auth but not admin_users
            await supabase.auth.signOut();
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        logger.error('Session check error', error);
        setUser(null);
      }
    };

    checkSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (event === 'SIGNED_OUT') {
          logoutStore();
          router.push('/login');
        }
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, setUser, setLoading, logoutStore, router]);

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        // Use API route for login to set admin_session cookie
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Giriş başarısız');
        }

        // If 2FA is required
        if (result.requires_2fa) {
          // Store temp token for 2FA verification
          sessionStorage.setItem('2fa_temp_token', result.temp_token);
          sessionStorage.setItem('2fa_admin_id', result.admin_id);
          set2FAVerified(false);
          return { success: true, requires2FA: true };
        }

        // Set user from response
        setUser(result.user as AdminUser);
        set2FAVerified(true);
        return { success: true };
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },
    [setUser, setLoading, set2FAVerified],
  );

  const verify2FA = useCallback(
    async (code: string) => {
      if (!user) throw new Error('Kullanıcı bulunamadı');

      // Verify TOTP code via API route
      const response = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, code }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || '2FA doğrulama başarısız');
      }

      set2FAVerified(true);
      return { success: true };
    },
    [user, set2FAVerified],
  );

  const logout = useCallback(async () => {
    // Call logout API to clear session cookie
    await fetch('/api/auth/logout', { method: 'POST' });
    await supabase.auth.signOut();
    logoutStore();
    router.push('/login');
  }, [supabase, logoutStore, router]);

  return {
    user,
    isAuthenticated,
    is2FAVerified,
    isLoading,
    login,
    verify2FA,
    logout,
  };
}
