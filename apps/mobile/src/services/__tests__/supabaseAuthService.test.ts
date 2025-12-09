/**
 * Supabase Auth Service Tests
 * Tests for authentication flows, token refresh, session management, and password reset
 * Target Coverage: 90%+
 */

import {
  signUpWithEmail,
  signInWithEmail,
  signInWithOAuth,
  signOut,
  getSession,
  getCurrentUser,
  resetPassword,
  updatePassword,
  updateProfile,
  deleteAccount,
  onAuthStateChange,
} from '@/services/supabaseAuthService';
import { auth, supabase } from '@/config/supabase';
import { logger } from '@/utils/logger';
import type { User, Session, AuthError } from '@supabase/supabase-js';

// Mock dependencies
jest.mock('@/config/supabase', () => ({
  auth: {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signInWithOAuth: jest.fn(),
    signOut: jest.fn(),
    getSession: jest.fn(),
    getUser: jest.fn(),
    resetPasswordForEmail: jest.fn(),
    updateUser: jest.fn(),
    onAuthStateChange: jest.fn(),
  },
  supabase: {
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(),
  },
  isSupabaseConfigured: jest.fn(() => true),
}));

jest.mock('@/utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

describe('supabaseAuthService', () => {
  // Mock data
  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    aud: 'authenticated',
    role: 'authenticated',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    app_metadata: {},
    user_metadata: { name: 'Test User' },
  } as User;

  const mockSession: Session = {
    access_token: 'access-token-123',
    refresh_token: 'refresh-token-123',
    expires_in: 3600,
    expires_at: Date.now() + 3600000,
    token_type: 'bearer',
    user: mockUser,
  } as Session;

  const mockAuthError: AuthError = {
    name: 'AuthError',
    message: 'Invalid credentials',
    status: 400,
  } as AuthError;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========================================
  // SIGN UP TESTS
  // ========================================
  describe('signUpWithEmail', () => {
    it('should successfully sign up with valid credentials', async () => {
      (auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const result = await signUpWithEmail('test@example.com', 'Password123!');

      expect(result.user).toEqual(mockUser);
      expect(result.session).toEqual(mockSession);
      expect(result.error).toBeNull();
      expect(auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123!',
        options: {
          data: undefined,
        },
      });
      expect(logger.info).toHaveBeenCalledWith('[Auth] Sign up successful', {
        userId: mockUser.id,
      });
    });

    it('should sign up with metadata', async () => {
      (auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const metadata = { name: 'John Doe', avatar_url: 'https://example.com/avatar.jpg' };
      await signUpWithEmail('test@example.com', 'Password123!', metadata);

      expect(auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123!',
        options: {
          data: metadata,
        },
      });
    });

    it('should handle sign up errors', async () => {
      (auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: mockAuthError,
      });

      const result = await signUpWithEmail('test@example.com', 'weak');

      expect(result.user).toBeNull();
      expect(result.session).toBeNull();
      expect(result.error).toEqual(mockAuthError);
      expect(logger.error).toHaveBeenCalledWith('[Auth] Sign up error:', mockAuthError);
    });

    it('should handle exceptions during sign up', async () => {
      const exception = new Error('Network error');
      (auth.signUp as jest.Mock).mockRejectedValue(exception);

      const result = await signUpWithEmail('test@example.com', 'Password123!');

      expect(result.user).toBeNull();
      expect(result.session).toBeNull();
      expect(result.error).toEqual(exception);
      expect(logger.error).toHaveBeenCalledWith('[Auth] Sign up exception:', exception);
    });

    it('should return error when Supabase is not configured', async () => {
      const { isSupabaseConfigured } = require('@/config/supabase');
      (isSupabaseConfigured as jest.Mock).mockReturnValue(false);

      const result = await signUpWithEmail('test@example.com', 'Password123!');

      expect(result.error?.message).toBe('Supabase not configured');
      expect(logger.warn).toHaveBeenCalledWith('[Auth] Supabase not configured');

      // Restore
      (isSupabaseConfigured as jest.Mock).mockReturnValue(true);
    });
  });

  // ========================================
  // SIGN IN TESTS
  // ========================================
  describe('signInWithEmail', () => {
    it('should successfully sign in with valid credentials', async () => {
      (auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      const result = await signInWithEmail('test@example.com', 'Password123!');

      expect(result.user).toEqual(mockUser);
      expect(result.session).toEqual(mockSession);
      expect(result.error).toBeNull();
      expect(auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123!',
      });
      expect(logger.info).toHaveBeenCalledWith('[Auth] Sign in successful', {
        userId: mockUser.id,
      });
    });

    it('should handle invalid credentials', async () => {
      (auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: mockAuthError,
      });

      const result = await signInWithEmail('test@example.com', 'wrongpassword');

      expect(result.user).toBeNull();
      expect(result.session).toBeNull();
      expect(result.error).toEqual(mockAuthError);
      expect(logger.error).toHaveBeenCalledWith('[Auth] Sign in error:', mockAuthError);
    });

    it('should handle network errors during sign in', async () => {
      const networkError = new Error('Network request failed');
      (auth.signInWithPassword as jest.Mock).mockRejectedValue(networkError);

      const result = await signInWithEmail('test@example.com', 'Password123!');

      expect(result.error).toEqual(networkError);
      expect(logger.error).toHaveBeenCalledWith('[Auth] Sign in exception:', networkError);
    });

    it('should return error when Supabase is not configured', async () => {
      const { isSupabaseConfigured } = require('@/config/supabase');
      (isSupabaseConfigured as jest.Mock).mockReturnValue(false);

      const result = await signInWithEmail('test@example.com', 'Password123!');

      expect(result.error?.message).toBe('Supabase not configured');

      // Restore
      (isSupabaseConfigured as jest.Mock).mockReturnValue(true);
    });
  });

  // ========================================
  // OAUTH TESTS
  // ========================================
  describe('signInWithOAuth', () => {
    it('should generate OAuth URL for Google', async () => {
      (auth.signInWithOAuth as jest.Mock).mockResolvedValue({
        data: { url: 'https://google.com/oauth', provider: 'google' },
        error: null,
      });

      const result = await signInWithOAuth('google');

      expect(result.url).toBe('https://google.com/oauth');
      expect(result.error).toBeNull();
      expect(auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: {
          redirectTo: 'travelmatch://auth/callback',
          skipBrowserRedirect: true,
        },
      });
      expect(logger.info).toHaveBeenCalledWith('[Auth] OAuth URL generated for', 'google');
    });

    it('should generate OAuth URL for Apple', async () => {
      (auth.signInWithOAuth as jest.Mock).mockResolvedValue({
        data: { url: 'https://apple.com/oauth', provider: 'apple' },
        error: null,
      });

      const result = await signInWithOAuth('apple');

      expect(result.url).toBe('https://apple.com/oauth');
      expect(auth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'apple',
        options: {
          redirectTo: 'travelmatch://auth/callback',
          skipBrowserRedirect: true,
        },
      });
    });

    it('should handle OAuth errors', async () => {
      (auth.signInWithOAuth as jest.Mock).mockResolvedValue({
        data: { url: null, provider: null },
        error: mockAuthError,
      });

      const result = await signInWithOAuth('google');

      expect(result.url).toBeNull();
      expect(result.error).toEqual(mockAuthError);
      expect(logger.error).toHaveBeenCalledWith('[Auth] OAuth error:', mockAuthError);
    });

    it('should handle OAuth exceptions', async () => {
      const exception = new Error('OAuth provider unavailable');
      (auth.signInWithOAuth as jest.Mock).mockRejectedValue(exception);

      const result = await signInWithOAuth('facebook');

      expect(result.url).toBeNull();
      expect(result.error).toEqual(exception);
    });
  });

  // ========================================
  // SIGN OUT TESTS
  // ========================================
  describe('signOut', () => {
    it('should successfully sign out', async () => {
      (auth.signOut as jest.Mock).mockResolvedValue({ error: null });

      const result = await signOut();

      expect(result.error).toBeNull();
      expect(auth.signOut).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('[Auth] Sign out successful');
    });

    it('should handle sign out errors', async () => {
      (auth.signOut as jest.Mock).mockResolvedValue({ error: mockAuthError });

      const result = await signOut();

      expect(result.error).toEqual(mockAuthError);
      expect(logger.error).toHaveBeenCalledWith('[Auth] Sign out error:', mockAuthError);
    });

    it('should handle sign out exceptions', async () => {
      const exception = new Error('Sign out failed');
      (auth.signOut as jest.Mock).mockRejectedValue(exception);

      const result = await signOut();

      expect(result.error).toEqual(exception);
      expect(logger.error).toHaveBeenCalledWith('[Auth] Sign out exception:', exception);
    });
  });

  // ========================================
  // SESSION MANAGEMENT TESTS
  // ========================================
  describe('getSession', () => {
    it('should retrieve current session', async () => {
      (auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      const result = await getSession();

      expect(result.session).toEqual(mockSession);
      expect(result.error).toBeNull();
      expect(auth.getSession).toHaveBeenCalled();
    });

    it('should handle missing session', async () => {
      (auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      const result = await getSession();

      expect(result.session).toBeNull();
      expect(result.error).toBeNull();
    });

    it('should handle session errors', async () => {
      (auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: mockAuthError,
      });

      const result = await getSession();

      expect(result.session).toBeNull();
      expect(result.error).toEqual(mockAuthError);
    });
  });

  describe('getCurrentUser', () => {
    it('should retrieve current user', async () => {
      (auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const user = await getCurrentUser();

      expect(user).toEqual(mockUser);
      expect(auth.getUser).toHaveBeenCalled();
    });

    it('should return null when no user is authenticated', async () => {
      (auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const user = await getCurrentUser();

      expect(user).toBeNull();
    });

    it('should handle errors and return null', async () => {
      (auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: mockAuthError,
      });

      const user = await getCurrentUser();

      expect(user).toBeNull();
      expect(logger.error).toHaveBeenCalledWith('[Auth] Get user error:', mockAuthError);
    });

    it('should handle exceptions and return null', async () => {
      const exception = new Error('User fetch failed');
      (auth.getUser as jest.Mock).mockRejectedValue(exception);

      const user = await getCurrentUser();

      expect(user).toBeNull();
      expect(logger.error).toHaveBeenCalledWith('[Auth] Get user exception:', exception);
    });
  });

  // ========================================
  // PASSWORD RESET TESTS
  // ========================================
  describe('resetPassword', () => {
    it('should send password reset email successfully', async () => {
      (auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({ error: null });

      const result = await resetPassword('test@example.com');

      expect(result.error).toBeNull();
      expect(auth.resetPasswordForEmail).toHaveBeenCalledWith('test@example.com', {
        redirectTo: 'travelmatch://auth/reset-password',
      });
      expect(logger.info).toHaveBeenCalledWith(
        '[Auth] Password reset email sent to',
        'test@example.com'
      );
    });

    it('should handle reset password errors', async () => {
      (auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
        error: mockAuthError,
      });

      const result = await resetPassword('invalid@example.com');

      expect(result.error).toEqual(mockAuthError);
      expect(logger.error).toHaveBeenCalledWith('[Auth] Reset password error:', mockAuthError);
    });

    it('should handle reset password exceptions', async () => {
      const exception = new Error('Email service unavailable');
      (auth.resetPasswordForEmail as jest.Mock).mockRejectedValue(exception);

      const result = await resetPassword('test@example.com');

      expect(result.error).toEqual(exception);
    });

    it('should return error when Supabase is not configured', async () => {
      const { isSupabaseConfigured } = require('@/config/supabase');
      (isSupabaseConfigured as jest.Mock).mockReturnValue(false);

      const result = await resetPassword('test@example.com');

      expect(result.error?.message).toBe('Supabase not configured');

      // Restore
      (isSupabaseConfigured as jest.Mock).mockReturnValue(true);
    });
  });

  describe('updatePassword', () => {
    it('should successfully update password', async () => {
      (auth.updateUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await updatePassword('NewPassword123!');

      expect(result.error).toBeNull();
      expect(auth.updateUser).toHaveBeenCalledWith({
        password: 'NewPassword123!',
      });
      expect(logger.info).toHaveBeenCalledWith('[Auth] Password updated successfully');
    });

    it('should handle update password errors', async () => {
      (auth.updateUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: mockAuthError,
      });

      const result = await updatePassword('weak');

      expect(result.error).toEqual(mockAuthError);
      expect(logger.error).toHaveBeenCalledWith('[Auth] Update password error:', mockAuthError);
    });

    it('should handle update password exceptions', async () => {
      const exception = new Error('Password update failed');
      (auth.updateUser as jest.Mock).mockRejectedValue(exception);

      const result = await updatePassword('NewPassword123!');

      expect(result.error).toEqual(exception);
    });
  });

  // ========================================
  // PROFILE UPDATE TESTS
  // ========================================
  describe('updateProfile', () => {
    it('should successfully update user profile', async () => {
      const updatedUser = { ...mockUser, user_metadata: { name: 'John Updated' } };
      (auth.updateUser as jest.Mock).mockResolvedValue({
        data: { user: updatedUser },
        error: null,
      });

      const result = await updateProfile({ name: 'John Updated' });

      expect(result.user).toEqual(updatedUser);
      expect(result.error).toBeNull();
      expect(auth.updateUser).toHaveBeenCalledWith({
        data: { name: 'John Updated' },
      });
      expect(logger.info).toHaveBeenCalledWith('[Auth] Profile updated successfully');
    });

    it('should update avatar URL', async () => {
      (auth.updateUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      await updateProfile({ avatar_url: 'https://example.com/new-avatar.jpg' });

      expect(auth.updateUser).toHaveBeenCalledWith({
        data: { avatar_url: 'https://example.com/new-avatar.jpg' },
      });
    });

    it('should handle profile update errors', async () => {
      (auth.updateUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: mockAuthError,
      });

      const result = await updateProfile({ name: 'Invalid' });

      expect(result.user).toBeNull();
      expect(result.error).toEqual(mockAuthError);
    });

    it('should handle profile update exceptions', async () => {
      const exception = new Error('Profile update failed');
      (auth.updateUser as jest.Mock).mockRejectedValue(exception);

      const result = await updateProfile({ name: 'John' });

      expect(result.user).toBeNull();
      expect(result.error).toEqual(exception);
    });
  });

  // ========================================
  // DELETE ACCOUNT TESTS
  // ========================================
  describe('deleteAccount', () => {
    beforeEach(() => {
      // Reset mocks for deleteAccount tests
      jest.clearAllMocks();
    });

    it('should successfully delete account and sign out', async () => {
      // Mock auth.getUser (used in deleteAccount)
      (auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      
      // Create mock chain for from().update().eq()
      const mockEq = jest.fn().mockResolvedValue({ error: null });
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = jest.fn().mockReturnValue({ update: mockUpdate });

      (supabase.from as jest.Mock) = mockFrom;
      (auth.signOut as jest.Mock).mockResolvedValue({ error: null });

      const result = await deleteAccount();

      expect(result.error).toBeNull();
      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(mockUpdate).toHaveBeenCalledWith({ deleted_at: expect.any(String) });
      expect(mockEq).toHaveBeenCalledWith('id', mockUser.id);
      expect(auth.signOut).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith('[Auth] Account deletion initiated');
    });

    it('should sign out even if database update fails', async () => {
      (auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockEq = jest.fn().mockResolvedValue({ error: new Error('DB error') });
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = jest.fn().mockReturnValue({ update: mockUpdate });

      (supabase.from as jest.Mock) = mockFrom;
      (auth.signOut as jest.Mock).mockResolvedValue({ error: null });

      const result = await deleteAccount();

      expect(result.error).toBeNull();
      expect(auth.signOut).toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledWith('[Auth] Delete account DB error:', expect.any(Error));
    });

    it('should handle sign out errors during account deletion', async () => {
      (auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockEq = jest.fn().mockResolvedValue({ error: null });
      const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });
      const mockFrom = jest.fn().mockReturnValue({ update: mockUpdate });

      (supabase.from as jest.Mock) = mockFrom;
      (auth.signOut as jest.Mock).mockResolvedValue({ error: mockAuthError });

      const result = await deleteAccount();

      expect(result.error).toEqual(mockAuthError);
      expect(logger.error).toHaveBeenCalledWith('[Auth] Delete account error:', mockAuthError);
    });

    it('should handle exceptions during account deletion', async () => {
      const exception = new Error('Account deletion failed');
      (auth.getUser as jest.Mock).mockRejectedValue(exception);

      const result = await deleteAccount();

      expect(result.error).toEqual(exception);
      expect(logger.error).toHaveBeenCalledWith('[Auth] Delete account exception:', exception);
    });
  });

  // ========================================
  // AUTH STATE CHANGE LISTENER TESTS
  // ========================================
  describe('onAuthStateChange', () => {
    it('should register auth state change listener', () => {
      const mockCallback = jest.fn();
      const mockUnsubscribe = jest.fn();

      (auth.onAuthStateChange as jest.Mock).mockImplementation((callback) => {
        // Simulate auth state change
        callback('SIGNED_IN', mockSession);
        return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
      });

      onAuthStateChange(mockCallback);

      expect(auth.onAuthStateChange).toHaveBeenCalled();
      expect(mockCallback).toHaveBeenCalledWith('SIGNED_IN', mockSession);
      expect(logger.debug).toHaveBeenCalledWith('[Auth] State change:', 'SIGNED_IN');
    });

    it('should handle SIGNED_OUT event', () => {
      const mockCallback = jest.fn();

      (auth.onAuthStateChange as jest.Mock).mockImplementation((callback) => {
        callback('SIGNED_OUT', null);
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      });

      onAuthStateChange(mockCallback);

      expect(mockCallback).toHaveBeenCalledWith('SIGNED_OUT', null);
    });

    it('should handle TOKEN_REFRESHED event', () => {
      const mockCallback = jest.fn();

      (auth.onAuthStateChange as jest.Mock).mockImplementation((callback) => {
        callback('TOKEN_REFRESHED', mockSession);
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      });

      onAuthStateChange(mockCallback);

      expect(mockCallback).toHaveBeenCalledWith('TOKEN_REFRESHED', mockSession);
    });
  });
});
