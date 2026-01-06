/**
 * Auth API Error Scenarios Tests
 * Tests for authentication error handling (401, 403, 500, rate limiting)
 * Target Coverage: Comprehensive error handling
 */

import { authApi } from '../authService';

// Mock dependencies
jest.mock('@/config/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      resetPasswordForEmail: jest.fn(),
      updateUser: jest.fn(),
      resend: jest.fn(),
      getSession: jest.fn(),
      refreshSession: jest.fn(),
    },
  },
}));

import { supabase } from '@/config/supabase';

describe('authApi - Error Scenarios', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========================================
  // LOGIN ERRORS
  // ========================================
  describe('login errors', () => {
    it('should throw on invalid credentials (401)', async () => {
      const authError = {
        message: 'Invalid login credentials',
        status: 400,
        code: 'invalid_credentials',
      };

      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: authError,
      });

      await expect(
        authApi.login('test@example.com', 'wrongpassword'),
      ).rejects.toMatchObject({
        message: 'Invalid login credentials',
        code: 'invalid_credentials',
      });
    });

    it('should throw on email not confirmed', async () => {
      const authError = {
        message: 'Email not confirmed',
        status: 400,
        code: 'email_not_confirmed',
      };

      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: authError,
      });

      await expect(
        authApi.login('test@example.com', 'password123'),
      ).rejects.toMatchObject({
        code: 'email_not_confirmed',
      });
    });

    it('should throw on user banned/disabled', async () => {
      const authError = {
        message: 'User is banned',
        status: 403,
        code: 'user_banned',
      };

      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: authError,
      });

      await expect(
        authApi.login('banned@example.com', 'password123'),
      ).rejects.toMatchObject({
        code: 'user_banned',
      });
    });

    it('should throw on rate limiting', async () => {
      const rateLimitError = {
        message:
          'For security purposes, you can only request this after X seconds',
        status: 429,
        code: 'over_request_rate_limit',
      };

      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: rateLimitError,
      });

      await expect(
        authApi.login('test@example.com', 'password'),
      ).rejects.toMatchObject({
        status: 429,
        code: 'over_request_rate_limit',
      });
    });

    it('should throw on network error', async () => {
      const networkError = new Error('Network request failed');
      (supabase.auth.signInWithPassword as jest.Mock).mockRejectedValue(
        networkError,
      );

      await expect(
        authApi.login('test@example.com', 'password'),
      ).rejects.toThrow('Network request failed');
    });

    it('should throw on server error (500)', async () => {
      const serverError = {
        message: 'Internal server error',
        status: 500,
      };

      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: serverError,
      });

      await expect(
        authApi.login('test@example.com', 'password'),
      ).rejects.toMatchObject({
        status: 500,
      });
    });
  });

  // ========================================
  // SIGNUP ERRORS
  // ========================================
  describe('signup errors', () => {
    it('should throw on email already registered', async () => {
      const authError = {
        message: 'User already registered',
        status: 400,
        code: 'user_already_exists',
      };

      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: authError,
      });

      await expect(
        authApi.signup('existing@example.com', 'password123'),
      ).rejects.toMatchObject({
        code: 'user_already_exists',
      });
    });

    it('should throw on weak password', async () => {
      const authError = {
        message: 'Password should be at least 6 characters',
        status: 400,
        code: 'weak_password',
      };

      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: authError,
      });

      await expect(
        authApi.signup('test@example.com', '123'),
      ).rejects.toMatchObject({
        code: 'weak_password',
      });
    });

    it('should throw on invalid email format', async () => {
      const authError = {
        message: 'Invalid email format',
        status: 400,
        code: 'validation_failed',
      };

      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: authError,
      });

      await expect(
        authApi.signup('invalid-email', 'password123'),
      ).rejects.toMatchObject({
        code: 'validation_failed',
      });
    });

    it('should throw on signup disabled', async () => {
      const authError = {
        message: 'Signups not allowed for this instance',
        status: 403,
        code: 'signup_disabled',
      };

      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: authError,
      });

      await expect(
        authApi.signup('test@example.com', 'password123'),
      ).rejects.toMatchObject({
        code: 'signup_disabled',
      });
    });

    it('should throw on rate limiting for signup', async () => {
      const rateLimitError = {
        message: 'Email rate limit exceeded',
        status: 429,
        code: 'over_email_send_rate_limit',
      };

      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: rateLimitError,
      });

      await expect(
        authApi.signup('test@example.com', 'password123'),
      ).rejects.toMatchObject({
        status: 429,
      });
    });
  });

  // ========================================
  // LOGOUT ERRORS
  // ========================================
  describe('logout errors', () => {
    it('should throw on logout failure', async () => {
      const authError = {
        message: 'Session not found',
        status: 400,
        code: 'session_not_found',
      };

      (supabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: authError,
      });

      await expect(authApi.logout()).rejects.toMatchObject({
        code: 'session_not_found',
      });
    });

    it('should throw on network error during logout', async () => {
      const networkError = new Error('Network request failed');
      (supabase.auth.signOut as jest.Mock).mockRejectedValue(networkError);

      await expect(authApi.logout()).rejects.toThrow('Network request failed');
    });
  });

  // ========================================
  // PASSWORD RESET ERRORS
  // ========================================
  describe('password reset errors', () => {
    it('should throw on email rate limit for password reset', async () => {
      const rateLimitError = {
        message:
          'For security purposes, you can only request this once every 60 seconds',
        status: 429,
        code: 'over_email_send_rate_limit',
      };

      (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
        data: null,
        error: rateLimitError,
      });

      await expect(
        authApi.sendPasswordResetEmail('test@example.com'),
      ).rejects.toMatchObject({
        status: 429,
      });
    });

    it('should throw on user not found for password reset', async () => {
      // Note: Supabase typically doesn't reveal if email exists for security
      const authError = {
        message: 'Unable to send password reset email',
        status: 400,
      };

      (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
        data: null,
        error: authError,
      });

      await expect(
        authApi.sendPasswordResetEmail('nonexistent@example.com'),
      ).rejects.toMatchObject({
        status: 400,
      });
    });
  });

  // ========================================
  // UPDATE PASSWORD ERRORS
  // ========================================
  describe('update password errors', () => {
    it('should throw when not authenticated', async () => {
      const authError = {
        message: 'Auth session missing!',
        status: 401,
        code: 'session_not_found',
      };

      (supabase.auth.updateUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: authError,
      });

      await expect(
        authApi.updatePassword('newPassword123'),
      ).rejects.toMatchObject({
        status: 401,
      });
    });

    it('should throw on same password', async () => {
      const authError = {
        message: 'New password should be different from the old password',
        status: 400,
        code: 'same_password',
      };

      (supabase.auth.updateUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: authError,
      });

      await expect(
        authApi.updatePassword('samePassword123'),
      ).rejects.toMatchObject({
        code: 'same_password',
      });
    });

    it('should throw on weak new password', async () => {
      const authError = {
        message: 'Password should be at least 6 characters',
        status: 400,
        code: 'weak_password',
      };

      (supabase.auth.updateUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: authError,
      });

      await expect(authApi.updatePassword('123')).rejects.toMatchObject({
        code: 'weak_password',
      });
    });
  });

  // ========================================
  // RESEND VERIFICATION ERRORS
  // ========================================
  describe('resend verification errors', () => {
    it('should throw on rate limiting', async () => {
      const rateLimitError = {
        message:
          'For security purposes, you can only request this once every 60 seconds',
        status: 429,
        code: 'over_email_send_rate_limit',
      };

      (supabase.auth.resend as jest.Mock).mockResolvedValue({
        data: null,
        error: rateLimitError,
      });

      await expect(
        authApi.resendVerificationEmail('test@example.com'),
      ).rejects.toMatchObject({
        status: 429,
      });
    });

    it('should throw on already confirmed email', async () => {
      const authError = {
        message: 'Email already confirmed',
        status: 400,
        code: 'email_already_confirmed',
      };

      (supabase.auth.resend as jest.Mock).mockResolvedValue({
        data: null,
        error: authError,
      });

      await expect(
        authApi.resendVerificationEmail('confirmed@example.com'),
      ).rejects.toMatchObject({
        code: 'email_already_confirmed',
      });
    });
  });

  // ========================================
  // SESSION ERRORS
  // ========================================
  describe('session errors', () => {
    it('should throw on getSession failure', async () => {
      const authError = {
        message: 'Failed to get session',
        status: 500,
      };

      (supabase.auth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: authError,
      });

      await expect(authApi.getSession()).rejects.toMatchObject({
        status: 500,
      });
    });

    it('should throw on refresh with invalid refresh token', async () => {
      const authError = {
        message: 'Invalid refresh token',
        status: 401,
        code: 'invalid_grant',
      };

      (supabase.auth.refreshSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: authError,
      });

      await expect(authApi.refreshSession()).rejects.toMatchObject({
        code: 'invalid_grant',
      });
    });

    it('should throw on refresh with expired refresh token', async () => {
      const authError = {
        message: 'Refresh token expired',
        status: 401,
        code: 'refresh_token_expired',
      };

      (supabase.auth.refreshSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: authError,
      });

      await expect(authApi.refreshSession()).rejects.toMatchObject({
        code: 'refresh_token_expired',
      });
    });

    it('should throw on session revoked', async () => {
      const authError = {
        message: 'Session has been revoked',
        status: 401,
        code: 'session_revoked',
      };

      (supabase.auth.refreshSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: authError,
      });

      await expect(authApi.refreshSession()).rejects.toMatchObject({
        code: 'session_revoked',
      });
    });
  });

  // ========================================
  // NETWORK AND TIMEOUT ERRORS
  // ========================================
  describe('network and timeout errors', () => {
    it('should handle timeout error', async () => {
      const timeoutError = new Error('Request timed out');
      timeoutError.name = 'TimeoutError';

      (supabase.auth.signInWithPassword as jest.Mock).mockRejectedValue(
        timeoutError,
      );

      await expect(
        authApi.login('test@example.com', 'password'),
      ).rejects.toThrow('Request timed out');
    });

    it('should handle DNS resolution error', async () => {
      const dnsError = new Error('getaddrinfo ENOTFOUND auth.supabase.co');

      (supabase.auth.signInWithPassword as jest.Mock).mockRejectedValue(
        dnsError,
      );

      await expect(
        authApi.login('test@example.com', 'password'),
      ).rejects.toThrow('ENOTFOUND');
    });

    it('should handle connection refused', async () => {
      const connectionError = new Error('connect ECONNREFUSED');

      (supabase.auth.signUp as jest.Mock).mockRejectedValue(connectionError);

      await expect(
        authApi.signup('test@example.com', 'password'),
      ).rejects.toThrow('ECONNREFUSED');
    });

    it('should handle SSL/TLS errors', async () => {
      const sslError = new Error('SSL certificate problem');

      (supabase.auth.refreshSession as jest.Mock).mockRejectedValue(sslError);

      await expect(authApi.refreshSession()).rejects.toThrow('SSL certificate');
    });
  });

  // ========================================
  // EDGE CASES
  // ========================================
  describe('edge cases', () => {
    it('should handle empty credentials', async () => {
      const authError = {
        message: 'Email and password are required',
        status: 400,
        code: 'validation_failed',
      };

      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: authError,
      });

      await expect(authApi.login('', '')).rejects.toMatchObject({
        code: 'validation_failed',
      });
    });

    it('should handle special characters in email', async () => {
      const authError = {
        message: 'Invalid email format',
        status: 400,
        code: 'validation_failed',
      };

      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: authError,
      });

      await expect(
        authApi.login('<script>alert(1)</script>@test.com', 'password'),
      ).rejects.toMatchObject({
        code: 'validation_failed',
      });
    });

    it('should handle very long password', async () => {
      const authError = {
        message: 'Password too long',
        status: 400,
        code: 'validation_failed',
      };

      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: authError,
      });

      const longPassword = 'a'.repeat(10000);
      await expect(
        authApi.signup('test@example.com', longPassword),
      ).rejects.toMatchObject({
        code: 'validation_failed',
      });
    });
  });
});
