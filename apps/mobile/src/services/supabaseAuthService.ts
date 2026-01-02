/**
 * Supabase Auth Service
 * Authentication methods using Supabase
 */

import { auth, supabase, isSupabaseConfigured } from '../config/supabase';
import { logger } from '../utils/logger';
import { VALUES } from '../constants/values';
import { secureStorage, StorageKeys } from '../utils/secureStorage';
import type { User, Session, AuthError } from '@supabase/supabase-js';

/**
 * Generate a cryptographically secure random state for CSRF protection
 */
const generateOAuthState = (): string => {
  const array = new Uint8Array(32);
  // Use crypto.getRandomValues for secure random generation
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    // Fallback for environments without crypto
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  // Convert to base64-like string
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
};

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
 * Includes CSRF protection via state parameter
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
    // Generate and store a random state for CSRF protection
    const state = generateOAuthState();
    await secureStorage.setItem(StorageKeys.SECURE.OAUTH_STATE, state);
    logger.debug('[Auth] OAuth state generated and stored');

    const { data, error } = await auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: VALUES.DEEP_LINKS.AUTH_CALLBACK,
        skipBrowserRedirect: true,
        queryParams: {
          state, // Include state for CSRF protection
        },
      },
    });

    if (error) {
      // Clean up stored state on error
      await secureStorage.deleteItem(StorageKeys.SECURE.OAUTH_STATE);
      logger.error('[Auth] OAuth error:', error);
      return { url: null, error };
    }

    logger.info('[Auth] OAuth URL generated for', provider);
    return { url: data.url, error: null };
  } catch (error) {
    // Clean up stored state on exception
    await secureStorage.deleteItem(StorageKeys.SECURE.OAUTH_STATE);
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
 * Extracts session from OAuth callback URL and validates state for CSRF protection
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
    // Extract tokens and state from URL hash/query
    // Supabase returns tokens in URL hash after OAuth redirect
    const urlObj = new URL(url);
    const hashParams = new URLSearchParams(urlObj.hash.substring(1));
    const queryParams = urlObj.searchParams;

    // Validate state parameter for CSRF protection
    const receivedState = hashParams.get('state') || queryParams.get('state');
    const storedState = await secureStorage.getItem(StorageKeys.SECURE.OAUTH_STATE);

    // Clean up stored state immediately (one-time use)
    await secureStorage.deleteItem(StorageKeys.SECURE.OAUTH_STATE);

    if (!receivedState || !storedState || receivedState !== storedState) {
      logger.error('[Auth] OAuth state validation failed - potential CSRF attack', {
        hasReceivedState: !!receivedState,
        hasStoredState: !!storedState,
        match: receivedState === storedState,
      });
      return {
        session: null,
        error: { message: 'OAuth state validation failed. Please try again.' } as AuthError,
      };
    }

    logger.debug('[Auth] OAuth state validated successfully');

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
    // Ensure state is cleaned up on any error
    await secureStorage.deleteItem(StorageKeys.SECURE.OAUTH_STATE);
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
      redirectTo: VALUES.DEEP_LINKS.RESET_PASSWORD,
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
 * Update password (without current password verification)
 * Use changePasswordWithVerification for secure password change
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
 * Change password with current password verification
 * This is the secure way to change password - requires re-authentication
 */
export const changePasswordWithVerification = async (
  currentPassword: string,
  newPassword: string,
): Promise<{ error: AuthError | null }> => {
  if (!isSupabaseConfigured()) {
    return { error: { message: 'Supabase not configured' } as AuthError };
  }

  try {
    // Get current user's email
    const { data: userData } = await auth.getUser();
    if (!userData?.user?.email) {
      return { error: { message: 'User email not found' } as AuthError };
    }

    // Verify current password by re-authenticating
    const { error: signInError } = await auth.signInWithPassword({
      email: userData.user.email,
      password: currentPassword,
    });

    if (signInError) {
      logger.error('[Auth] Current password verification failed:', signInError);
      return { error: { message: 'Mevcut şifre yanlış' } as AuthError };
    }

    // Current password verified, now update to new password
    const { error: updateError } = await auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      logger.error('[Auth] Update password error:', updateError);
      return { error: updateError };
    }

    logger.info('[Auth] Password changed successfully with verification');
    return { error: null };
  } catch (error) {
    logger.error('[Auth] Change password exception:', error);
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
 * Sign in with phone number (OTP)
 * Sends an OTP SMS to the provided phone number
 */
export const signInWithPhone = async (
  phone: string,
): Promise<{ error: AuthError | null }> => {
  if (!isSupabaseConfigured()) {
    logger.warn('[Auth] Supabase not configured');
    return { error: { message: 'Supabase not configured' } as AuthError };
  }

  try {
    const { error } = await auth.signInWithOtp({ phone });

    if (error) {
      logger.error('[Auth] Send OTP error:', error);
      return { error };
    }

    logger.info('[Auth] OTP sent successfully', { phone: phone.slice(-4) });
    return { error: null };
  } catch (error) {
    logger.error('[Auth] Send OTP exception:', error);
    return { error: error as AuthError };
  }
};

/**
 * Verify phone OTP code
 */
export const verifyPhoneOtp = async (
  phone: string,
  token: string,
): Promise<{ error: AuthError | null }> => {
  if (!isSupabaseConfigured()) {
    logger.warn('[Auth] Supabase not configured');
    return { error: { message: 'Supabase not configured' } as AuthError };
  }

  try {
    const { error } = await auth.verifyOtp({
      phone,
      token,
      type: 'sms',
    });

    if (error) {
      logger.error('[Auth] Verify OTP error:', error);
      return { error };
    }

    logger.info('[Auth] Phone verified successfully');
    return { error: null };
  } catch (error) {
    logger.error('[Auth] Verify OTP exception:', error);
    return { error: error as AuthError };
  }
};

/**
 * Verify email OTP code
 * Used for email-based verification during password reset or signup
 */
export const verifyOtp = async (
  token: string,
): Promise<{ error: AuthError | null }> => {
  if (!isSupabaseConfigured()) {
    logger.warn('[Auth] Supabase not configured');
    return { error: { message: 'Supabase not configured' } as AuthError };
  }

  try {
    // For email OTP, we need to get the email from current session or storage
    const { data: sessionData } = await auth.getSession();
    const email = sessionData?.session?.user?.email;

    if (!email) {
      logger.error('[Auth] No email found for OTP verification');
      return {
        error: { message: 'No email found for verification' } as AuthError,
      };
    }

    const { error } = await auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (error) {
      logger.error('[Auth] Verify email OTP error:', error);
      return { error };
    }

    logger.info('[Auth] Email verified successfully');
    return { error: null };
  } catch (error) {
    logger.error('[Auth] Verify email OTP exception:', error);
    return { error: error as AuthError };
  }
};

/**
 * Resend OTP code to email
 * Used to request a new verification code
 */
export const resendOtp = async (): Promise<{ error: AuthError | null }> => {
  if (!isSupabaseConfigured()) {
    logger.warn('[Auth] Supabase not configured');
    return { error: { message: 'Supabase not configured' } as AuthError };
  }

  try {
    // Get email from current session
    const { data: sessionData } = await auth.getSession();
    const email = sessionData?.session?.user?.email;

    if (!email) {
      logger.error('[Auth] No email found for resending OTP');
      return { error: { message: 'No email found' } as AuthError };
    }

    const { error } = await auth.signInWithOtp({ email });

    if (error) {
      logger.error('[Auth] Resend OTP error:', error);
      return { error };
    }

    logger.info('[Auth] OTP resent successfully to', email);
    return { error: null };
  } catch (error) {
    logger.error('[Auth] Resend OTP exception:', error);
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
  changePasswordWithVerification,
  updateProfile,
  deleteAccount,
  signInWithPhone,
  verifyPhoneOtp,
  verifyOtp,
  resendOtp,
  onAuthStateChange,
};
