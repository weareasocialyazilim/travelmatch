/**
 * Supabase Auth Service
 * Authentication methods using Supabase
 */

import { auth, supabase, isSupabaseConfigured } from '../config/supabase';
import { logger } from '../utils/logger';
import type { User, Session, AuthError } from '@supabase/supabase-js';

export interface AuthResult {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

/**
 * Get current session
 */
export const getSession = async (): Promise<{
  session: Session | null;
  error: AuthError | null;
}> => {
  const { data, error } = await auth.getSession();
  return { session: data.session, error };
};

/**
 * User metadata for registration
 */
interface SignUpMetadata {
  name?: string;
  avatar_url?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  date_of_birth?: string; // YYYY-MM-DD format
}

/**
 * Sign up with email and password
 */
export const signUpWithEmail = async (
  email: string,
  password: string,
  metadata?: SignUpMetadata,
): Promise<AuthResult> => {
  if (!isSupabaseConfigured()) {
    logger.warn('[Auth] Supabase not configured');
    return {
      user: null,
      session: null,
      error: { message: 'Supabase not configured' } as AuthError,
    };
  }

  try {
    const { data, error } = await auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    if (error) {
      logger.error('[Auth] Sign up error:', error);
      return { user: null, session: null, error };
    }

    logger.info('[Auth] Sign up successful', { userId: data.user?.id });
    return { user: data.user, session: data.session, error: null };
  } catch (error) {
    logger.error('[Auth] Sign up exception:', error);
    return { user: null, session: null, error: error as AuthError };
  }
};

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (
  email: string,
  password: string,
): Promise<AuthResult> => {
  if (!isSupabaseConfigured()) {
    logger.warn('[Auth] Supabase not configured');
    return {
      user: null,
      session: null,
      error: { message: 'Supabase not configured' } as AuthError,
    };
  }

  try {
    const { data, error } = await auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      logger.error('[Auth] Sign in error:', error);
      return { user: null, session: null, error };
    }

    logger.info('[Auth] Sign in successful', { userId: data.user?.id });
    return { user: data.user, session: data.session, error: null };
  } catch (error) {
    logger.error('[Auth] Sign in exception:', error);
    return { user: null, session: null, error: error as AuthError };
  }
};

/**
 * Sign in with OAuth provider (Google, Apple, etc.)
 */
export const signInWithOAuth = async (
  provider: 'google' | 'apple' | 'facebook',
): Promise<{ url: string | null; error: AuthError | null }> => {
  if (!isSupabaseConfigured()) {
    logger.warn('[Auth] Supabase not configured');
    return {
      url: null,
      error: { message: 'Supabase not configured' } as AuthError,
    };
  }

  try {
    const { data, error } = await auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: 'travelmatch://auth/callback',
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      logger.error('[Auth] OAuth error:', error);
      return { url: null, error };
    }

    logger.info('[Auth] OAuth URL generated for', provider);
    return { url: data.url, error: null };
  } catch (error) {
    logger.error('[Auth] OAuth exception:', error);
    return { url: null, error: error as AuthError };
  }
};

/**
 * Sign out
 */
export const signOut = async (): Promise<{ error: AuthError | null }> => {
  try {
    const { error } = await auth.signOut();

    if (error) {
      logger.error('[Auth] Sign out error:', error);
      return { error };
    }

    logger.info('[Auth] Sign out successful');
    return { error: null };
  } catch (error) {
    logger.error('[Auth] Sign out exception:', error);
    return { error: error as AuthError };
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data, error } = await auth.getUser();

    if (error) {
      logger.error('[Auth] Get user error:', error);
      return null;
    }

    return data.user;
  } catch (error) {
    logger.error('[Auth] Get user exception:', error);
    return null;
  }
};

/**
 * Handle OAuth callback from deep link
 * Extracts session from OAuth callback URL
 */
export const handleOAuthCallback = async (
  url: string,
): Promise<{ session: Session | null; error: AuthError | null }> => {
  if (!isSupabaseConfigured()) {
    return {
      session: null,
      error: { message: 'Supabase not configured' } as AuthError,
    };
  }

  try {
    // Extract tokens from URL hash/query
    // Supabase returns tokens in URL hash after OAuth redirect
    const urlObj = new URL(url);
    const hashParams = new URLSearchParams(urlObj.hash.substring(1));
    
    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');

    if (!accessToken || !refreshToken) {
      logger.error('[Auth] OAuth callback missing tokens');
      return {
        session: null,
        error: { message: 'Missing tokens in OAuth callback' } as AuthError,
      };
    }

    // Set session with tokens
    const { data, error } = await auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (error) {
      logger.error('[Auth] OAuth session setup error:', error);
      return { session: null, error };
    }

    logger.info('[Auth] OAuth session established successfully');
    return { session: data.session, error: null };
  } catch (error) {
    logger.error('[Auth] OAuth callback exception:', error);
    return { session: null, error: error as AuthError };
  }
};

/**
 * Request password reset
 */
export const resetPassword = async (
  email: string,
): Promise<{ error: AuthError | null }> => {
  if (!isSupabaseConfigured()) {
    return { error: { message: 'Supabase not configured' } as AuthError };
  }

  try {
    const { error } = await auth.resetPasswordForEmail(email, {
      redirectTo: 'travelmatch://auth/reset-password',
    });

    if (error) {
      logger.error('[Auth] Reset password error:', error);
      return { error };
    }

    logger.info('[Auth] Password reset email sent to', email);
    return { error: null };
  } catch (error) {
    logger.error('[Auth] Reset password exception:', error);
    return { error: error as AuthError };
  }
};

/**
 * Update password
 */
export const updatePassword = async (
  newPassword: string,
): Promise<{ error: AuthError | null }> => {
  try {
    const { error } = await auth.updateUser({
      password: newPassword,
    });

    if (error) {
      logger.error('[Auth] Update password error:', error);
      return { error };
    }

    logger.info('[Auth] Password updated successfully');
    return { error: null };
  } catch (error) {
    logger.error('[Auth] Update password exception:', error);
    return { error: error as AuthError };
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (data: {
  name?: string;
  avatar_url?: string;
}): Promise<{ user: User | null; error: AuthError | null }> => {
  try {
    const { data: result, error } = await auth.updateUser({
      data,
    });

    if (error) {
      logger.error('[Auth] Update profile error:', error);
      return { user: null, error };
    }

    logger.info('[Auth] Profile updated successfully');
    return { user: result.user, error: null };
  } catch (error) {
    logger.error('[Auth] Update profile exception:', error);
    return { user: null, error: error as AuthError };
  }
};

/**
 * Delete account
 */
export const deleteAccount = async (): Promise<{ error: AuthError | null }> => {
  try {
    // 1. Mark user as deleted in public.users
    const { data: userData } = await auth.getUser();
    if (userData?.user) {
      const { error: dbError } = await supabase
        .from('users')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', userData.user.id);

      if (dbError) {
        logger.error('[Auth] Delete account DB error:', dbError);
        // We continue to sign out to ensure user cannot access the app
      }
    }

    // 2. Sign out
    const { error } = await auth.signOut();

    if (error) {
      logger.error('[Auth] Delete account error:', error);
      return { error };
    }

    logger.info('[Auth] Account deletion initiated');
    return { error: null };
  } catch (error) {
    logger.error('[Auth] Delete account exception:', error);
    return { error: error as AuthError };
  }
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (
  callback: (event: string, session: Session | null) => void,
) => {
  return auth.onAuthStateChange((event, session) => {
    logger.debug('[Auth] State change:', event);
    callback(event, session);
  });
};

export default {
  signUpWithEmail,
  signInWithEmail,
  signInWithOAuth,
  handleOAuthCallback,
  signOut,
  getSession,
  getCurrentUser,
  resetPassword,
  updatePassword,
  updateProfile,
  deleteAccount,
  onAuthStateChange,
};
