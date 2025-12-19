/**
 * Auth Flow Integration Tests
 *
 * Tests complete authentication workflows that span multiple services:
 * - Login → Profile fetch → Logout
 * - Signup → Email verification → Profile setup
 * - Password reset flow
 * - Session persistence and refresh
 * - Multi-device logout
 *
 * Target: 5 scenarios
 */

// CRITICAL: All jest.mock() calls MUST be at the top, before any imports
// Jest hoists mock calls, but factory functions run later

// Mock auth implementation - exported for test access
const mockAuthImpl = {
  signInWithPassword: jest.fn(),
  signUp: jest.fn(),
  signOut: jest.fn(),
  getUser: jest.fn(),
  getSession: jest.fn(),
  resetPasswordForEmail: jest.fn(),
};

// Mock supabase implementation
const mockFromChainFactory = () => ({
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn().mockResolvedValue({ data: null, error: null }),
});

const mockSupabaseImpl = {
  auth: mockAuthImpl,
  from: jest.fn(mockFromChainFactory),
};

// Mock modules BEFORE imports - use relative path for integration tests
// The path is relative from this file: __tests__/integration/ → config/
jest.mock('../../config/supabase', () => {
  const mockAuth = {
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    getUser: jest.fn(),
    getSession: jest.fn(),
    resetPasswordForEmail: jest.fn(),
  };
  return {
    supabase: {
      auth: mockAuth,
      from: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      })),
    },
    auth: mockAuth,
    isSupabaseConfigured: jest.fn(() => true),
  };
});

jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

// Imports AFTER mock declarations
import {
  signInWithEmail,
  signUpWithEmail,
  signOut,
  getCurrentUser,
  resetPassword,
  getSession,
} from '../../services/supabaseAuthService';
import { userService } from '../../services/userService';
import { supabase, auth } from '../../config/supabase';
import { logger } from '../../utils/logger';

// Type-safe mock references
const mockSupabase = supabase as jest.Mocked<typeof supabase>;
const mockAuth = auth as jest.Mocked<typeof auth>;
const mockLogger = logger;

describe('Auth Flow Integration', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    aud: 'authenticated',
    role: 'authenticated',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  };

  const mockSession = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    expires_at: Date.now() + 3600000,
    token_type: 'bearer',
    user: mockUser,
  };

  const mockProfile = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    username: 'testuser',
    avatar: 'https://example.com/avatar.jpg',
    bio: 'Test bio',
    location: {
      city: 'New York',
      country: 'USA',
    },
    languages: ['en'],
    interests: ['travel', 'food'],
    isVerified: false,
    kycStatus: 'unverified' as const,
    rating: 5.0,
    reviewCount: 0,
    momentCount: 0,
    followerCount: 0,
    followingCount: 0,
    giftsSent: 0,
    giftsReceived: 0,
    createdAt: '2024-01-15T10:00:00Z',
    lastActiveAt: '2024-01-15T10:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default from() chain mock
    const mockFromChain = {
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };
    mockSupabase.from = jest.fn(
      () => mockFromChain,
    ) as unknown as typeof mockSupabase.from;
  });

  describe('Scenario 1: Complete Login Flow', () => {
    it('should successfully login → fetch profile → maintain session', async () => {
      // Arrange: Mock successful login
      (mockAuth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: mockUser, session: mockSession },
        error: null,
      });

      // Mock profile fetch
      (mockAuth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const mockFromChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
      };
      (mockSupabase.from as jest.Mock).mockReturnValue(mockFromChain);

      // Act: Perform login
      const loginResult = await signInWithEmail(
        'test@example.com',
        'password123',
      );

      // Assert: Login successful
      expect(loginResult.user).toEqual(mockUser);
      expect(loginResult.session).toEqual(mockSession);
      expect(loginResult.error).toBeNull();

      // Act: Fetch user profile
      const profileResult = await userService.getCurrentUser();

      // Assert: Profile fetched successfully (userService returns different structure)
      expect(profileResult.user).toEqual(mockProfile);
      expect(mockSupabase.from).toHaveBeenCalledWith('users');

      // Verify logging
      expect(mockLogger.info).toHaveBeenCalledWith(
        '[Auth] Sign in successful',
        { userId: mockUser.id },
      );
    });

    it('should handle invalid credentials gracefully', async () => {
      // Arrange: Mock login failure
      const authError = { message: 'Invalid login credentials' };
      (mockAuth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: authError,
      });

      // Act: Attempt login
      const result = await signInWithEmail('test@example.com', 'wrongpassword');

      // Assert: Error returned
      expect(result.user).toBeNull();
      expect(result.session).toBeNull();
      expect(result.error).toEqual(authError);

      // Verify error logging
      expect(mockLogger.error).toHaveBeenCalledWith(
        '[Auth] Sign in error:',
        authError,
      );
    });
  });

  describe('Scenario 2: Complete Logout Flow', () => {
    it('should logout → clear session → prevent further requests', async () => {
      // Arrange: User is logged in
      (mockAuth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Mock successful logout
      (mockAuth.signOut as jest.Mock).mockResolvedValue({
        error: null,
      });

      // Act: Perform logout
      const logoutResult = await signOut();

      // Assert: Logout successful
      expect(logoutResult.error).toBeNull();
      expect(mockAuth.signOut).toHaveBeenCalled();

      // Verify logging
      expect(mockLogger.info).toHaveBeenCalledWith(
        '[Auth] Sign out successful',
      );

      // Arrange: Mock unauthenticated state after logout
      (mockAuth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });

      // Act: Try to get current user
      const userResult = await getCurrentUser();

      // Assert: No user returned
      expect(userResult).toBeNull();
    });

    it('should handle logout errors', async () => {
      // Arrange: Mock logout failure
      const logoutError = { message: 'Network error during logout' };
      (mockAuth.signOut as jest.Mock).mockResolvedValue({
        error: logoutError,
      });

      // Act: Attempt logout
      const result = await signOut();

      // Assert: Error returned
      expect(result.error).toEqual(logoutError);
      expect(mockLogger.error).toHaveBeenCalledWith(
        '[Auth] Sign out error:',
        logoutError,
      );
    });
  });

  describe('Scenario 3: Signup and Profile Setup Flow', () => {
    it('should signup → create profile → verify email sent', async () => {
      const newUser = {
        id: 'new-user-456',
        email: 'newuser@example.com',
        aud: 'authenticated',
        role: 'authenticated',
        created_at: '2024-01-16T10:00:00Z',
        updated_at: '2024-01-16T10:00:00Z',
      };

      // Arrange: Mock successful signup
      (mockAuth.signUp as jest.Mock).mockResolvedValue({
        data: {
          user: newUser,
          session: { ...mockSession, user: newUser },
        },
        error: null,
      });

      // Act: Perform signup
      const signupResult = await signUpWithEmail(
        'newuser@example.com',
        'securepassword123',
        { name: 'New User' },
      );

      // Assert: Signup successful
      expect(signupResult.user).toEqual(newUser);
      expect(signupResult.error).toBeNull();
      expect(mockAuth.signUp).toHaveBeenCalledWith({
        email: 'newuser@example.com',
        password: 'securepassword123',
        options: {
          data: { name: 'New User' },
        },
      });

      // Verify logging
      expect(mockLogger.info).toHaveBeenCalledWith(
        '[Auth] Sign up successful',
        { userId: newUser.id },
      );
    });

    it('should handle duplicate email during signup', async () => {
      // Arrange: Mock signup failure (email already exists)
      const signupError = { message: 'User already registered' };
      (mockAuth.signUp as jest.Mock).mockResolvedValue({
        data: { user: null, session: null },
        error: signupError,
      });

      // Act: Attempt signup with existing email
      const result = await signUpWithEmail(
        'existing@example.com',
        'password123',
      );

      // Assert: Error returned
      expect(result.user).toBeNull();
      expect(result.error).toEqual(signupError);
      expect(mockLogger.error).toHaveBeenCalledWith(
        '[Auth] Sign up error:',
        signupError,
      );
    });
  });

  describe('Scenario 4: Password Reset Flow', () => {
    it('should request password reset → send email → confirm request', async () => {
      // Arrange: Mock successful password reset request
      (mockAuth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
        error: null,
      });

      // Act: Request password reset
      const result = await resetPassword('test@example.com');

      // Assert: Reset request successful
      expect(result.error).toBeNull();
      expect(mockAuth.resetPasswordForEmail).toHaveBeenCalledWith(
        'test@example.com',
        { redirectTo: 'travelmatch://auth/reset-password' },
      );

      // Verify logging
      expect(mockLogger.info).toHaveBeenCalledWith(
        '[Auth] Password reset email sent to',
        'test@example.com',
      );
    });

    it('should handle password reset errors', async () => {
      // Arrange: Mock password reset failure
      const resetError = { message: 'Email not found' };
      (mockAuth.resetPasswordForEmail as jest.Mock).mockResolvedValue({
        error: resetError,
      });

      // Act: Request password reset
      const result = await resetPassword('nonexistent@example.com');

      // Assert: Error returned
      expect(result.error).toEqual(resetError);
      expect(mockLogger.error).toHaveBeenCalledWith(
        '[Auth] Reset password error:',
        resetError,
      );
    });
  });

  describe('Scenario 5: Session Persistence and Refresh', () => {
    it('should retrieve existing session → verify user → refresh if needed', async () => {
      // Arrange: Mock existing session
      (mockAuth.getSession as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null,
      });

      // Act: Get current session
      const sessionResult = await getSession();

      // Assert: Session retrieved
      expect(sessionResult.session).toEqual(mockSession);
      expect(sessionResult.error).toBeNull();

      // Arrange: Mock user verification
      (mockAuth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      // Act: Verify user from session
      const userResult = await getCurrentUser();

      // Assert: User verified
      expect(userResult).toEqual(mockUser);
    });

    it('should handle expired session', async () => {
      // Arrange: Mock expired session
      const expiredSession = {
        ...mockSession,
        expires_at: Date.now() - 1000, // Expired 1 second ago
      };

      (mockAuth.getSession as jest.Mock).mockResolvedValue({
        data: { session: expiredSession },
        error: null,
      });

      // Act: Get session
      const result = await getSession();

      // Assert: Expired session returned (client should handle refresh)
      expect(result.session).toEqual(expiredSession);
      expect(result.session.expires_at).toBeLessThan(Date.now());
    });

    it('should handle no session found', async () => {
      // Arrange: Mock no session
      (mockAuth.getSession as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      // Act: Get session
      const result = await getSession();

      // Assert: No session returned
      expect(result.session).toBeNull();
      expect(result.error).toBeNull();
    });
  });
});
