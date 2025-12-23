'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
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

        if (session?.user?.email) {
          // Fetch admin user profile
          const { data: adminUser } = await supabase
            .from('admin_users')
            .select('*')
            .eq('email', session.user.email)
            .eq('is_active', true)
            .single();

          if (adminUser) {
            setUser(adminUser as AdminUser);

            // Update last login
            await supabase
              .from('admin_users')
              .update({ last_login_at: new Date().toISOString() })
              .eq('id', adminUser.id);
          } else {
            // User exists in auth but not admin_users
            await supabase.auth.signOut();
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Session check error:', error);
        setUser(null);
      }
    };

    checkSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        logoutStore();
        router.push('/login');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, setUser, setLoading, logoutStore, router]);

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Check if user is an admin
        const { data: adminUser, error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('email', email)
          .eq('is_active', true)
          .single();

        if (adminError || !adminUser) {
          await supabase.auth.signOut();
          throw new Error(
            'Bu hesap admin paneline erişim yetkisine sahip değil.',
          );
        }

        setUser(adminUser as AdminUser);

        // If 2FA is required and enabled, redirect to 2FA page
        if (adminUser.requires_2fa && adminUser.totp_enabled) {
          set2FAVerified(false);
          return { success: true, requires2FA: true };
        }

        // If 2FA is required but not set up, redirect to setup
        if (adminUser.requires_2fa && !adminUser.totp_enabled) {
          set2FAVerified(false);
          return { success: true, requires2FASetup: true };
        }

        set2FAVerified(true);
        return { success: true };
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },
    [supabase, setUser, setLoading, set2FAVerified],
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
