'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { getClient } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth-store';
import { resetCSRFToken } from '@/lib/api-client';
import { logger } from '@/lib/logger';
import type { AdminUser } from '@/types/admin';
import type { Database } from '@/types/database';

type AdminUserRow = Database['public']['Tables']['admin_users']['Row'];

/**
 * 2FA temporary credentials stored in memory (not sessionStorage)
 * This prevents XSS attacks from accessing these sensitive values
 */
interface TwoFACredentials {
  tempToken: string;
  adminId: string;
  expiresAt: number;
}

let twoFACredentials: TwoFACredentials | null = null;

// Clear credentials after expiry
function clearExpiredCredentials(): void {
  if (twoFACredentials && Date.now() > twoFACredentials.expiresAt) {
    twoFACredentials = null;
  }
}

// Get 2FA credentials (only if not expired)
function getTwoFACredentials(): TwoFACredentials | null {
  clearExpiredCredentials();
  return twoFACredentials;
}

// Set 2FA credentials with 5 minute expiry
function setTwoFACredentials(tempToken: string, adminId: string): void {
  twoFACredentials = {
    tempToken,
    adminId,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
  };
}

// Clear 2FA credentials
function clearTwoFACredentials(): void {
  twoFACredentials = null;
}

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

  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!isMountedRef.current) return;

        if (session?.user) {
          // Fetch admin user profile
          const { data: adminUser } = await supabase
            .from('admin_users')
            .select('*')
            .eq('email', session.user.email || '')
            .eq('is_active', true)
            .single<AdminUserRow>();

          if (!isMountedRef.current) return;

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
        logger.error('Session check error', error);
        if (isMountedRef.current) {
          setUser(null);
        }
      }
    };

    checkSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (event === 'SIGNED_OUT') {
          if (isMountedRef.current) {
            logoutStore();
            clearTwoFACredentials();
            resetCSRFToken();
          }
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
          credentials: 'include', // Important: include cookies
          body: JSON.stringify({ email, password }),
        });

        const result = await response.json();

        if (!response.ok) {
          setLoading(false);
          throw new Error(result.error || 'Giriş başarısız');
        }

        // If 2FA is required
        if (result.requires_2fa) {
          // Store temp token in memory (NOT sessionStorage - XSS protection)
          setTwoFACredentials(result.temp_token, result.admin_id);
          set2FAVerified(false);
          setLoading(false);
          return { success: true, requires2FA: true };
        }

        // Set user from response
        setUser(result.user as AdminUser);
        set2FAVerified(true);
        setLoading(false);
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
      setLoading(true);

      try {
        // Get credentials from memory
        const credentials = getTwoFACredentials();

        if (!credentials) {
          setLoading(false);
          throw new Error('2FA oturumu süresi doldu. Lütfen tekrar giriş yapın.');
        }

        // Verify TOTP code via API route
        const response = await fetch('/api/auth/verify-2fa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            tempToken: credentials.tempToken,
            adminId: credentials.adminId,
            code,
          }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          setLoading(false);
          throw new Error(result.error || '2FA doğrulama başarısız');
        }

        // Clear temporary credentials
        clearTwoFACredentials();

        // Set user if returned
        if (result.user) {
          setUser(result.user as AdminUser);
        }

        set2FAVerified(true);
        setLoading(false);
        return { success: true };
      } catch (error) {
        setLoading(false);
        throw error;
      }
    },
    [set2FAVerified, setLoading, setUser],
  );

  const logout = useCallback(async () => {
    try {
      // Call logout API to clear session cookie
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      logger.error('Logout API error', error);
      // Continue with local logout even if API fails
    }

    try {
      await supabase.auth.signOut();
    } catch (error) {
      logger.error('Supabase signOut error', error);
    }

    // Clear local state
    logoutStore();
    clearTwoFACredentials();
    resetCSRFToken();

    router.push('/login');
  }, [supabase, logoutStore, router]);

  // Function to check if 2FA is pending
  const has2FAPending = useCallback(() => {
    return getTwoFACredentials() !== null;
  }, []);

  return {
    user,
    isAuthenticated,
    is2FAVerified,
    isLoading,
    login,
    verify2FA,
    logout,
    has2FAPending,
  };
}
