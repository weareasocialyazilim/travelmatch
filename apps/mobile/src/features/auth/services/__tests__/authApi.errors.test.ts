/**
 * Auth API Error Scenarios Tests
 * Tests for authentication error handling
 */

// Mock supabase BEFORE any imports that use it
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
      setSession: jest.fn(),
    },
    functions: {
      invoke: jest.fn(),
    },
  },
  auth: {
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    resetPasswordForEmail: jest.fn(),
    updateUser: jest.fn(),
    resend: jest.fn(),
    getSession: jest.fn(),
    refreshSession: jest.fn(),
    setSession: jest.fn(),
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

jest.mock('@/utils/secureStorage', () => ({
  secureStorage: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
  },
  StorageKeys: {
    AUTH_TOKEN: 'auth_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_ID: 'user_id',
  },
}));

// Now import modules that depend on mocks
import { authApi } from '../authService';
import { supabase, auth } from '@/config/supabase';

// Type the mocks
const mockSupabaseAuth = supabase.auth as jest.Mocked<typeof supabase.auth>;
const mockSupabaseFunctions = supabase.functions as jest.Mocked<
  typeof supabase.functions
>;
const mockAuth = auth as jest.Mocked<typeof auth>;

describe('authApi - Error Scenarios', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========================================
  // LOGIN ERRORS
  // ========================================
  describe('login errors', () => {
    it('should throw on invalid credentials', async () => {
      // Mock Gateway Response (Function returns data.error for logical errors)
      mockSupabaseFunctions.invoke.mockResolvedValue({
        data: { error: 'Invalid login credentials' },
        error: null,
      } as never);

      await expect(
        authApi.login('test@example.com', 'wrongpassword'),
      ).rejects.toMatchObject({
        message: 'Invalid login credentials',
      });
    });

    it('should throw on email not confirmed', async () => {
      mockSupabaseFunctions.invoke.mockResolvedValue({
        data: { error: 'Email not confirmed' },
        error: null,
      } as never);

      await expect(
        authApi.login('test@example.com', 'password123'),
      ).rejects.toMatchObject({
        message: 'Email not confirmed',
      });
    });

    it('should throw on rate limit exceeded', async () => {
      const authError = {
        message: 'Too many requests',
        status: 429,
        code: 'over_request_rate_limit',
      };

      mockSupabaseFunctions.invoke.mockResolvedValue({
        data: null,
        error: authError,
      } as never);

      await expect(
        authApi.login('test@example.com', 'password123'),
      ).rejects.toMatchObject({
        status: 429,
      });
    });
  });

  // ========================================
  // REGISTRATION ERRORS
  // ========================================
  describe('registration errors', () => {
    it('should throw on email already registered', async () => {
      mockSupabaseFunctions.invoke.mockResolvedValue({
        data: { error: 'User already registered' },
        error: null,
      } as never);

      await expect(
        authApi.register('existing@example.com', 'password123'),
      ).rejects.toMatchObject({
        message: 'User already registered',
      });
    });

    it('should throw on weak password', async () => {
      mockSupabaseFunctions.invoke.mockResolvedValue({
        data: { error: 'Password should be at least 6 characters' },
        error: null,
      } as never);

      await expect(
        authApi.register('test@example.com', '123'),
      ).rejects.toMatchObject({
        message: expect.stringContaining('Password'),
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

      mockSupabaseAuth.signOut.mockResolvedValue({
        error: authError,
      } as never);
      mockAuth.signOut.mockResolvedValue({
        error: authError,
      } as never);

      await expect(authApi.logout()).rejects.toMatchObject({
        message: 'Session not found',
      });
    });
  });

  // ========================================
  // PASSWORD RESET ERRORS
  // ========================================
  describe('password reset errors', () => {
    it('should throw on email rate limit', async () => {
      const rateLimitError = {
        message: 'Rate limit exceeded',
        status: 429,
        code: 'over_email_send_rate_limit',
      };

      mockSupabaseAuth.resetPasswordForEmail.mockResolvedValue({
        data: null,
        error: rateLimitError,
      } as never);
      mockAuth.resetPasswordForEmail.mockResolvedValue({
        data: null,
        error: rateLimitError,
      } as never);

      await expect(
        authApi.resetPassword('test@example.com'),
      ).rejects.toMatchObject({
        status: 429,
      });
    });
  });

  // ========================================
  // SESSION ERRORS
  // ========================================
  describe('session errors', () => {
    it('should return null session when not authenticated', async () => {
      mockSupabaseAuth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      } as never);
      mockAuth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      } as never);

      const result = await authApi.getSession();

      // API returns { session: null, error: null } when not authenticated
      expect(result).toMatchObject({ session: null });
    });

    it('should throw on session retrieval error', async () => {
      const sessionError = {
        message: 'Session expired',
        status: 401,
        code: 'session_expired',
      };

      mockSupabaseAuth.getSession.mockResolvedValue({
        data: { session: null },
        error: sessionError,
      } as never);
      mockAuth.getSession.mockResolvedValue({
        data: { session: null },
        error: sessionError,
      } as never);

      await expect(authApi.getSession()).rejects.toMatchObject({
        message: 'Session expired',
      });
    });

    it('should throw on session refresh failure', async () => {
      const refreshError = {
        message: 'Refresh token expired',
        status: 401,
        code: 'refresh_token_expired',
      };

      mockSupabaseAuth.refreshSession.mockResolvedValue({
        data: { session: null, user: null },
        error: refreshError,
      } as never);
      mockAuth.refreshSession.mockResolvedValue({
        data: { session: null, user: null },
        error: refreshError,
      } as never);

      await expect(authApi.refreshSession()).rejects.toMatchObject({
        message: 'Refresh token expired',
      });
    });
  });
});
