/**
 * Auth Service
 *
 * Consolidated authentication service for Lovendo.
 * Handles email/password, OAuth, phone OTP, and session management.
 */

import { supabase } from '@/config/supabase';
import { auth, isSupabaseConfigured } from '@/config/supabase';
import { logger } from '@/utils/logger';
import { VALUES } from '@/constants/values';
import { secureStorage, StorageKeys } from '@/utils/secureStorage';
import type { User, Session, AuthError } from '@supabase/supabase-js';

// ============================================
// Types
// ============================================

export interface AuthResult {
  user: User | null;
  session: Session | null;
  error: AuthError | null;
}

export interface SignUpMetadata {
  name?: string;
  avatar_url?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  date_of_birth?: string;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Generate a cryptographically secure random state for CSRF protection
 */
const generateOAuthState = (): string => {
  const array = new Uint8Array(32);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(
    '',
  );
};

// ============================================
// Session Management
// ============================================

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
 * Refresh session
 */
export const refreshSession = async (): Promise<Session | null> => {
  const { data, error } = await auth.refreshSession();
  if (error) throw error;
  return data.session;
};

const extractGatewayError = async (
  response?: Response,
): Promise<AuthError | null> => {
  if (!response) return null;

  try {
    const contentType = response.headers.get('Content-Type') || '';
    if (contentType.includes('application/json')) {
      const body = await response
        .clone()
        .json()
        .catch(() => null);
      if (body?.error) {
        return {
          message: body.error,
          name: 'AuthGatewayError',
          status: response.status,
        } as AuthError;
      }
    } else {
      const text = await response
        .clone()
        .text()
        .catch(() => '');
      if (text) {
        return {
          message: text,
          name: 'AuthGatewayError',
          status: response.status,
        } as AuthError;
      }
    }
  } catch {
    // Ignore parsing errors and fall back to generic error
  }

  return null;
};

// ============================================
// Email/Password Authentication
// ============================================

/**
 * Sign up with email and password
 */
export const signUpWithEmail = async (
  email: string,
  password: string,
  metadata?: SignUpMetadata,
): Promise<AuthResult> => {
  if (!isSupabaseConfigured()) {
    return {
      user: null,
      session: null,
      error: { message: 'Supabase not configured' } as AuthError,
    };
  }

  try {
    // Use Auth Gateway (Edge Function)
    logger.info('[Auth] Attempting sign up via auth-proxy');

    const {
      data: proxyData,
      error: proxyError,
      response,
    } = await supabase.functions.invoke('auth-proxy', {
      body: {
        email,
        password,
        type: 'signup',
        options: { data: metadata },
      },
    });

    if (proxyError) {
      const gatewayError = await extractGatewayError(response);
      const errorToReturn = (gatewayError || proxyError) as AuthError;
      const errorMessage = errorToReturn?.message?.toLowerCase?.() || '';

      if (errorMessage.includes('email not confirmed')) {
        logger.warn('[Auth] Gateway sign up requires email confirmation');
      } else if (errorMessage.includes('password is known to be weak')) {
        logger.warn('[Auth] Gateway sign up rejected weak password');
      } else {
        logger.error('[Auth] Gateway sign up error:', errorToReturn);
      }

      return {
        user: null,
        session: null,
        error: errorToReturn,
      };
    }

    if (!proxyData?.user && !proxyData?.session) {
      // It might be email confirmation mode where session is null but user is not null
      // But if both are missing, it's an error
      if (proxyData?.error) {
        return {
          user: null,
          session: null,
          error: { message: proxyData.error, status: 400 } as AuthError,
        };
      }
    }

    // Set session if returned (auto-confirm enabled)
    if (proxyData.session) {
      const { data: sessionData, error: sessionError } = await auth.setSession({
        access_token: proxyData.session.access_token,
        refresh_token: proxyData.session.refresh_token,
      });

      if (sessionError) {
        logger.error(
          '[Auth] Session handling error during signup:',
          sessionError,
        );
        return { user: null, session: null, error: sessionError };
      }

      logger.info('[Auth] Sign up successful via gateway (auto-login)', {
        userId: sessionData.user?.id,
      });
      return {
        user: sessionData.user,
        session: sessionData.session,
        error: null,
      };
    }

    // Email confirmation required case
    logger.info(
      '[Auth] Sign up successful via gateway (confirmation required)',
      { userId: proxyData.user?.id },
    );
    return { user: proxyData.user, session: null, error: null };
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
    return {
      user: null,
      session: null,
      error: { message: 'Supabase not configured' } as AuthError,
    };
  }

  try {
    // Use Auth Gateway (Edge Function) for rate limiting and security
    logger.info('[Auth] Attempting sign in via auth-proxy');

    const {
      data: proxyData,
      error: proxyError,
      response,
    } = await supabase.functions.invoke('auth-proxy', {
      body: { email, password, type: 'signin' },
    });

    if (proxyError) {
      const gatewayError = await extractGatewayError(response);
      const errorToReturn = (gatewayError || proxyError) as AuthError;
      const errorMessage = errorToReturn?.message?.toLowerCase?.() || '';

      if (errorMessage.includes('email not confirmed')) {
        logger.warn('[Auth] Gateway sign in requires email confirmation');
      } else {
        logger.error('[Auth] Gateway error:', errorToReturn);
      }

      return {
        user: null,
        session: null,
        error: errorToReturn,
      };
    }

    if (!proxyData?.session) {
      logger.error('[Auth] Gateway returned no session:', proxyData);
      return {
        user: null,
        session: null,
        error: {
          message: proxyData?.error || 'Authentication failed via gateway',
          name: 'AuthGatewayError',
          status: 400,
        } as AuthError,
      };
    }

    // Set the session locally so the client is authenticated
    const { data: sessionData, error: sessionError } = await auth.setSession({
      access_token: proxyData.session.access_token,
      refresh_token: proxyData.session.refresh_token,
    });

    if (sessionError) {
      logger.error('[Auth] Session handling error:', sessionError);
      return { user: null, session: null, error: sessionError };
    }

    logger.info('[Auth] Sign in successful via gateway', {
      userId: sessionData.user?.id,
    });
    return {
      user: sessionData.user,
      session: sessionData.session,
      error: null,
    };
  } catch (error) {
    logger.error('[Auth] Sign in exception:', error);
    return { user: null, session: null, error: error as AuthError };
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

// ============================================
// OAuth Authentication
// ============================================

/**
 * Sign in with OAuth provider (Google, Apple, etc.)
 * Includes CSRF protection via state parameter
 */
export const signInWithOAuth = async (
  provider: 'google' | 'apple' | 'facebook',
): Promise<{ url: string | null; error: AuthError | null }> => {
  if (!isSupabaseConfigured()) {
    return {
      url: null,
      error: { message: 'Supabase not configured' } as AuthError,
    };
  }

  try {
    const state = generateOAuthState();
    await secureStorage.setItem(StorageKeys.SECURE.OAUTH_STATE, state);

    const { data, error } = await auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: VALUES.DEEP_LINKS.AUTH_CALLBACK,
        skipBrowserRedirect: true,
        queryParams: { state },
      },
    });

    if (error) {
      await secureStorage.deleteItem(StorageKeys.SECURE.OAUTH_STATE);
      logger.error('[Auth] OAuth error:', error);
      return { url: null, error };
    }

    logger.info('[Auth] OAuth URL generated for', provider);
    return { url: data.url, error: null };
  } catch (error) {
    await secureStorage.deleteItem(StorageKeys.SECURE.OAUTH_STATE);
    logger.error('[Auth] OAuth exception:', error);
    return { url: null, error: error as AuthError };
  }
};

/**
 * Handle OAuth callback from deep link
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
    const urlObj = new URL(url);
    const hashParams = new URLSearchParams(urlObj.hash.substring(1));
    const queryParams = urlObj.searchParams;

    const receivedState = hashParams.get('state') || queryParams.get('state');
    const storedState = await secureStorage.getItem(
      StorageKeys.SECURE.OAUTH_STATE,
    );
    await secureStorage.deleteItem(StorageKeys.SECURE.OAUTH_STATE);

    if (!receivedState || !storedState || receivedState !== storedState) {
      logger.error(
        '[Auth] OAuth state validation failed - potential CSRF attack',
      );
      return {
        session: null,
        error: {
          message: 'OAuth state validation failed. Please try again.',
        } as AuthError,
      };
    }

    const accessToken = hashParams.get('access_token');
    const refreshToken = hashParams.get('refresh_token');

    if (!accessToken || !refreshToken) {
      return {
        session: null,
        error: { message: 'Missing tokens in OAuth callback' } as AuthError,
      };
    }

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
    await secureStorage.deleteItem(StorageKeys.SECURE.OAUTH_STATE);
    logger.error('[Auth] OAuth callback exception:', error);
    return { session: null, error: error as AuthError };
  }
};

// ============================================
// Phone OTP Authentication
// ============================================

/**
 * Sign in with phone number (OTP)
 * Includes captcha token for bot protection
 */
export const signInWithPhone = async (
  phone: string,
  captchaToken?: string,
): Promise<{ error: AuthError | null }> => {
  if (!isSupabaseConfigured()) {
    return { error: { message: 'Supabase not configured' } as AuthError };
  }

  try {
    const options: { phone: string; options?: { captchaToken?: string } } = {
      phone,
    };

    // Add captcha token if provided for bot protection
    if (captchaToken) {
      options.options = { captchaToken };
    }

    const { error } = await auth.signInWithOtp(options);
    if (error) {
      logger.error('[Auth] Send OTP error:', error);
      return { error };
    }
    logger.info('[Auth] OTP sent successfully');
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
  token: string,
  phone?: string,
): Promise<AuthResult> => {
  if (!isSupabaseConfigured()) {
    return {
      user: null,
      session: null,
      error: { message: 'Supabase not configured' } as AuthError,
    };
  }

  try {
    // If phone is provided, verify with phone number
    // Otherwise, use email OTP verification
    const verifyOptions = phone
      ? { phone, token, type: 'sms' as const }
      : { email: '', token, type: 'email' as const };

    const { data, error } = await auth.verifyOtp(verifyOptions);
    if (error) {
      logger.error('[Auth] Verify OTP error:', error);
      return { user: null, session: null, error };
    }
    logger.info('[Auth] OTP verified successfully');
    return { user: data.user, session: data.session, error: null };
  } catch (error) {
    logger.error('[Auth] Verify OTP exception:', error);
    return { user: null, session: null, error: error as AuthError };
  }
};

// ============================================
// Password Management
// ============================================

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
 * Update password
 */
export const updatePassword = async (
  newPassword: string,
): Promise<{ error: AuthError | null }> => {
  try {
    const { error } = await auth.updateUser({ password: newPassword });
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
 */
export const changePasswordWithVerification = async (
  currentPassword: string,
  newPassword: string,
): Promise<{ error: AuthError | null }> => {
  if (!isSupabaseConfigured()) {
    return { error: { message: 'Supabase not configured' } as AuthError };
  }

  try {
    const { data: userData } = await auth.getUser();
    if (!userData?.user?.email) {
      return { error: { message: 'User email not found' } as AuthError };
    }

    const { error: signInError } = await auth.signInWithPassword({
      email: userData.user.email,
      password: currentPassword,
    });

    if (signInError) {
      return { error: { message: 'Mevcut şifre yanlış' } as AuthError };
    }

    const { error: updateError } = await auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      return { error: updateError };
    }

    logger.info('[Auth] Password changed successfully with verification');
    return { error: null };
  } catch (error) {
    logger.error('[Auth] Change password exception:', error);
    return { error: error as AuthError };
  }
};

// ============================================
// Profile Management
// ============================================

/**
 * Update user profile
 */
export const updateProfile = async (data: {
  name?: string;
  avatar_url?: string;
}): Promise<{ user: User | null; error: AuthError | null }> => {
  try {
    const { data: result, error } = await auth.updateUser({ data });
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
 * Delete account (soft delete)
 */
export const deleteAccount = async (): Promise<{ error: AuthError | null }> => {
  try {
    const { data: userData } = await auth.getUser();
    if (userData?.user) {
      await supabase
        .from('users')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', userData.user.id);
    }

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

// ============================================
// Email Verification
// ============================================

/**
 * Resend verification email
 */
export const resendVerificationEmail = async (
  email: string,
): Promise<{ error: AuthError | null }> => {
  try {
    const { error } = await auth.resend({ type: 'signup', email });
    if (error) {
      logger.error('[Auth] Resend verification error:', error);
      return { error };
    }
    return { error: null };
  } catch (error) {
    logger.error('[Auth] Resend verification exception:', error);
    return { error: error as AuthError };
  }
};

// ============================================
// Auth State Listener
// ============================================

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

// ============================================
// Default Export - Clean API
// ============================================

export default {
  signUpWithEmail,
  signInWithEmail,
  signInWithOAuth,
  handleOAuthCallback,
  signOut,
  getSession,
  getCurrentUser,
  refreshSession,
  resetPassword,
  updatePassword,
  changePasswordWithVerification,
  updateProfile,
  deleteAccount,
  signInWithPhone,
  verifyPhoneOtp,
  resendVerificationEmail,
  onAuthStateChange,
};

// ============================================
// Backward Compatible API (for legacy tests)
// ============================================

/**
 * Legacy authApi interface for backward compatibility
 * These wrappers throw errors instead of returning them (legacy behavior)
 */
const throwingLogin = async (email: string, password: string) => {
  const result = await signInWithEmail(email, password);
  if (result.error) {
    throw result.error;
  }
  return result;
};

const throwingSignup = async (
  email: string,
  password: string,
  metadata?: SignUpMetadata,
) => {
  const result = await signUpWithEmail(email, password, metadata);
  if (result.error) {
    throw result.error;
  }
  return result;
};

const throwingLogout = async () => {
  const result = await signOut();
  if (result.error) {
    throw result.error;
  }
  return result;
};

const throwingResetPassword = async (email: string) => {
  const result = await resetPassword(email);
  if (result.error) {
    throw result.error;
  }
  return result;
};

const throwingUpdatePassword = async (newPassword: string) => {
  const result = await updatePassword(newPassword);
  if (result.error) {
    throw result.error;
  }
  return result;
};

const throwingGetSession = async () => {
  const result = await getSession();
  if (result.error) {
    throw result.error;
  }
  return result;
};

const throwingRefreshSession = async () => {
  const result = await refreshSession();
  if (!result) {
    throw { message: 'Session refresh failed', code: 'refresh_failed' };
  }
  return result;
};

const throwingResendVerification = async (email: string) => {
  const result = await resendVerificationEmail(email);
  if (result.error) {
    throw result.error;
  }
  return result;
};

export const authApi = {
  login: throwingLogin,
  register: throwingSignup,
  signup: throwingSignup,
  logout: throwingLogout,
  getSession: throwingGetSession,
  getCurrentUser,
  refreshSession: throwingRefreshSession,
  resetPassword: throwingResetPassword,
  updatePassword: throwingUpdatePassword,
  updateProfile,
  deleteAccount,
  signInWithPhone,
  verifyPhoneOtp,
  resendVerificationEmail: throwingResendVerification,
  onAuthStateChange,
};
