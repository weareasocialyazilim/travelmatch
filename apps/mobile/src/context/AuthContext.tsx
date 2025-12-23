/**
 * AuthContext
 *
 * Provides authentication state and operations throughout the application.
 * Handles user login, registration, social auth, logout, and token management.
 *
 * @module context/AuthContext
 *
 * @example
 * ```tsx
 * // In a component
 * const { user, isAuthenticated, login, logout } = useAuth();
 *
 * // Login
 * const result = await login({ email: 'user@example.com', password: 'secret' });
 * if (result.success) {
 *   console.log('Logged in as:', user?.name);
 * }
 *
 * // Logout
 * await logout();
 * ```
 */

import type { ReactNode } from 'react';
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authService from '../services/supabaseAuthService';
import {
  secureStorage,
  AUTH_STORAGE_KEYS,
  StorageKeys,
} from '../utils/secureStorage';
import { logger } from '../utils/logger';
import type { User, KYCStatus, Role } from '../types/index';

/**
 * Helper to create a valid User object with defaults
 */
const createUser = (data: {
  id: string;
  email?: string;
  name?: string;
  avatar?: string;
}): User => ({
  id: data.id,
  email: data.email || '',
  name: data.name || '',
  avatar: data.avatar,
  role: 'Traveler' as Role,
  kycStatus: 'Unverified' as KYCStatus,
  location: { latitude: 0, longitude: 0 },
});

/**
 * Authentication tokens stored securely
 */
interface AuthTokens {
  /** JWT access token for API requests */
  accessToken: string;
  /** Token used to refresh the access token */
  refreshToken: string;
  /** Unix timestamp when access token expires */
  expiresAt: number;
}

/**
 * Current authentication state
 * - 'loading': Initial state while checking stored credentials
 * - 'authenticated': User is logged in with valid session
 * - 'unauthenticated': User is not logged in
 */
type AuthState = 'loading' | 'authenticated' | 'unauthenticated';

/**
 * Credentials for email/password or phone/password login
 */
interface LoginCredentials {
  /** User's email address (optional if phone is provided) */
  email?: string;
  /** User's phone number (optional if email is provided) */
  phone?: string;
  /** User's password */
  password: string;
}

/**
 * Data for new user registration
 */
interface RegisterData {
  /** User's email address */
  email: string;
  /** User's phone number */
  phone?: string;
  /** User's password (min 8 chars) */
  password: string;
  /** User's display name */
  name: string;
}

/**
 * Data for social authentication (Google, Apple, Facebook)
 */
interface SocialAuthData {
  /** OAuth provider */
  provider: 'google' | 'apple' | 'facebook';
  /** OAuth token from provider */
  token: string;
}

/**
 * Auth context value interface
 */
interface AuthContextType {
  // State
  /** Currently authenticated user, null if not logged in */
  user: User | null;
  /** Current authentication state */
  authState: AuthState;
  /** Whether user is authenticated */
  isAuthenticated: boolean;
  /** Whether auth state is loading */
  isLoading: boolean;

  // Actions
  /** Login with email/password */
  login: (
    credentials: LoginCredentials,
  ) => Promise<{ success: boolean; error?: string }>;
  /** Register a new account */
  register: (
    data: RegisterData,
  ) => Promise<{ success: boolean; error?: string }>;
  /** Login with social provider */
  socialAuth: (
    data: SocialAuthData,
  ) => Promise<{ success: boolean; error?: string }>;
  /** Logout and clear session */
  logout: () => Promise<void>;
  /** Refresh user data from API */
  refreshUser: () => Promise<void>;
  /** Update local user data */
  updateUser: (data: Partial<User>) => void;

  // OAuth
  /** Handle OAuth callback from deep link */
  handleOAuthCallback: (url: string) => Promise<void>;

  // Token management
  /** Get current access token (refreshing if needed) */
  getAccessToken: () => Promise<string | null>;

  // Password
  /** Request password reset email */
  forgotPassword: (
    email: string,
  ) => Promise<{ success: boolean; error?: string }>;
  /** Reset password with token */
  resetPassword: (
    token: string,
    newPassword: string,
  ) => Promise<{ success: boolean; error?: string }>;
  /** Change password while logged in */
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage keys - Non-sensitive user profile in AsyncStorage, tokens in SecureStore
const STORAGE_KEYS = {
  USER: StorageKeys.PUBLIC.USER_PROFILE, // Non-sensitive profile data
};

/**
 * Authentication provider component
 *
 * @param props - Component props
 * @param props.children - Child components that will have access to auth context
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [authState, setAuthState] = useState<AuthState>('loading');
  const [tokens, setTokens] = useState<AuthTokens | null>(null);

  // Derived state
  const isAuthenticated = authState === 'authenticated' && user !== null;
  const isLoading = authState === 'loading';

  /**
   * Save tokens to secure storage
   */
  const saveTokens = async (newTokens: AuthTokens) => {
    try {
      await Promise.all([
        secureStorage.setItem(
          AUTH_STORAGE_KEYS.ACCESS_TOKEN,
          newTokens.accessToken,
        ),
        secureStorage.setItem(
          AUTH_STORAGE_KEYS.REFRESH_TOKEN,
          newTokens.refreshToken,
        ),
        secureStorage.setItem(
          AUTH_STORAGE_KEYS.TOKEN_EXPIRES_AT,
          newTokens.expiresAt.toString(),
        ),
      ]);
      setTokens(newTokens);
    } catch {
      // Silent fail - tokens will be re-fetched on next login
    }
  };

  /**
   * Save user to storage (non-sensitive, uses AsyncStorage)
   */
  const saveUser = async (userData: User) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
      setUser(userData);
    } catch {
      // Silent fail
    }
  };

  /**
   * Clear auth data from all storage
   */
  const clearAuthData = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.USER),
        secureStorage.deleteItems([
          AUTH_STORAGE_KEYS.ACCESS_TOKEN,
          AUTH_STORAGE_KEYS.REFRESH_TOKEN,
          AUTH_STORAGE_KEYS.TOKEN_EXPIRES_AT,
        ]),
      ]);
      setUser(null);
      setTokens(null);
      setAuthState('unauthenticated');
    } catch {
      // Force clear state even if storage fails
      setUser(null);
      setTokens(null);
      setAuthState('unauthenticated');
    }
  };

  /**
   * Get access token (with refresh if needed)
   */
  const getAccessToken = useCallback(async (): Promise<string | null> => {
    if (!tokens) return null;

    // Check if token is expired (with 5 min buffer)
    const now = Date.now();
    const buffer = 5 * 60 * 1000; // 5 minutes

    if (tokens.expiresAt - buffer > now) {
      return tokens.accessToken;
    }

    // Token expired, try to refresh
    try {
      const { session } = await authService.getSession();

      if (!session) {
        throw new Error('Session expired');
      }

      const newTokens: AuthTokens = {
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresAt: (session.expires_at || 0) * 1000,
      };

      await saveTokens(newTokens);
      return newTokens.accessToken;
    } catch {
      await clearAuthData();
      return null;
    }
  }, [tokens]);

  /**
   * Load auth state from storage on mount
   */
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        // Load user from AsyncStorage and tokens from SecureStore
        const [storedUser, accessToken, refreshToken, expiresAtStr] =
          await Promise.all([
            AsyncStorage.getItem(STORAGE_KEYS.USER),
            secureStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN),
            secureStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN),
            secureStorage.getItem(AUTH_STORAGE_KEYS.TOKEN_EXPIRES_AT),
          ]);

        if (storedUser && accessToken && refreshToken && expiresAtStr) {
          const parsedUser = JSON.parse(storedUser) as User;
          const expiresAt = parseInt(expiresAtStr, 10);

          // Check if tokens are still valid
          if (expiresAt > Date.now()) {
            const parsedTokens: AuthTokens = {
              accessToken,
              refreshToken,
              expiresAt,
            };

            // Ensure user profile exists in public.users (for users created before trigger)
            await authService.ensureUserProfile(
              parsedUser.id,
              parsedUser.email,
              parsedUser.name || 'User',
              parsedUser.avatar,
            );

            setUser(parsedUser);
            setTokens(parsedTokens);
            setAuthState('authenticated');
          } else {
            // Tokens expired, clear data
            await clearAuthData();
          }
        } else {
          setAuthState('unauthenticated');
        }
      } catch {
        setAuthState('unauthenticated');
      }
    };

    void loadAuthState();
  }, []);

  /**
   * Login with email/password or phone/password
   */
  const login = async (
    credentials: LoginCredentials,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Determine login method
      const identifier = credentials.email || credentials.phone;
      if (!identifier) {
        return { success: false, error: 'Email or phone is required' };
      }

      const {
        user: authUser,
        session,
        error,
      } = await authService.signInWithEmail(
        credentials.email || credentials.phone || '',
        credentials.password,
      );

      if (error) throw error;
      if (!authUser || !session) throw new Error('Login failed');

      // Ensure user exists in public.users table (for RLS to work)
      const { error: upsertError } = await authService.ensureUserProfile(
        authUser.id,
        authUser.email || '',
        authUser.user_metadata?.name ||
          authUser.user_metadata?.full_name ||
          'User',
        authUser.user_metadata?.avatar_url,
      );

      if (upsertError) {
        logger.warn('[Auth] Failed to ensure user profile:', upsertError);
        // Continue anyway - profile might already exist
      }

      const newUser = createUser({
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.user_metadata?.name || '',
        avatar: authUser.user_metadata?.avatar_url,
      });

      const newTokens: AuthTokens = {
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresAt: (session.expires_at || 0) * 1000,
      };

      await saveTokens(newTokens);
      await saveUser(newUser);
      setAuthState('authenticated');

      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      return { success: false, error: message };
    }
  };

  /**
   * Register new account
   */
  const register = async (
    data: RegisterData,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const {
        user: authUser,
        session,
        error,
      } = await authService.signUpWithEmail(data.email, data.password, {
        name: data.name,
        phone: data.phone,
      });

      if (error) throw error;
      if (!authUser) throw new Error('Registration failed');

      // Ensure user profile exists in public.users table
      await authService.ensureUserProfile(
        authUser.id,
        authUser.email || '',
        data.name,
        authUser.user_metadata?.avatar_url,
      );

      if (session) {
        const newUser = createUser({
          id: authUser.id,
          email: authUser.email || '',
          name: authUser.user_metadata?.name || '',
          avatar: authUser.user_metadata?.avatar_url,
        });

        const newTokens: AuthTokens = {
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          expiresAt: (session.expires_at || 0) * 1000,
        };

        await saveTokens(newTokens);
        await saveUser(newUser);
        setAuthState('authenticated');
      }

      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Registration failed';
      return { success: false, error: message };
    }
  };

  /**
   * Social authentication (Google, Apple, Facebook)
   */
  const socialAuth = async (
    data: SocialAuthData,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      setAuthState('loading');

      // Get OAuth URL from Supabase
      const { url, error: oauthError } = await authService.signInWithOAuth(
        data.provider,
      );

      if (oauthError || !url) {
        logger.error('[Auth] OAuth error:', oauthError);
        setAuthState('unauthenticated');
        return {
          success: false,
          error: oauthError?.message || 'Failed to start OAuth flow',
        };
      }

      // Open OAuth URL in browser
      // The callback will be handled by deep linking (travelmatch://auth/callback)
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        logger.error('[Auth] Cannot open OAuth URL:', url);
        setAuthState('unauthenticated');
        return { success: false, error: 'Cannot open authentication page' };
      }

      await Linking.openURL(url);

      // Success is determined by the deep link callback handler
      // The actual session setup happens in handleOAuthCallback
      return { success: true };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Social auth failed';
      logger.error('[Auth] Social auth error:', message);
      setAuthState('unauthenticated');
      return { success: false, error: message };
    }
  };

  /**
   * Logout user
   */
  const logout = async (): Promise<void> => {
    try {
      await authService.signOut();
    } catch {
      // Server logout failed, but continue with local cleanup
    } finally {
      // Clear local data regardless of server response
      await clearAuthData();
    }
  };

  /**
   * Handle OAuth callback from deep link
   */
  const handleOAuthCallback = async (url: string): Promise<void> => {
    try {
      logger.info('[Auth] Handling OAuth callback');
      setAuthState('loading');

      const { session, error } = await authService.handleOAuthCallback(url);

      if (error || !session) {
        logger.error('[Auth] OAuth callback error:', error);
        setAuthState('unauthenticated');
        return;
      }

      // Get user data
      const authUser = session.user;
      if (!authUser) {
        setAuthState('unauthenticated');
        return;
      }

      // Ensure user profile exists in public.users table
      await authService.ensureUserProfile(
        authUser.id,
        authUser.email || '',
        authUser.user_metadata?.name ||
          authUser.user_metadata?.full_name ||
          authUser.email?.split('@')[0] ||
          'User',
        authUser.user_metadata?.avatar_url,
      );

      const newUser = createUser({
        id: authUser.id,
        email: authUser.email || '',
        name:
          authUser.user_metadata?.name || authUser.email?.split('@')[0] || '',
        avatar: authUser.user_metadata?.avatar_url,
      });

      const newTokens: AuthTokens = {
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresAt: (session.expires_at || 0) * 1000,
      };

      await Promise.all([saveUser(newUser), saveTokens(newTokens)]);
      setUser(newUser);
      setAuthState('authenticated');

      logger.info('[Auth] OAuth login successful');
    } catch (error) {
      logger.error('[Auth] OAuth callback exception:', error);
      setAuthState('unauthenticated');
    }
  };

  /**
   * Refresh user data from server
   */
  const refreshUser = async (): Promise<void> => {
    try {
      const authUser = await authService.getCurrentUser();
      if (authUser) {
        const refreshedUser = createUser({
          id: authUser.id,
          email: authUser.email || '',
          name: authUser.user_metadata?.name || '',
          avatar: authUser.user_metadata?.avatar_url,
        });
        await saveUser(refreshedUser);
      }
    } catch {
      // Silent fail - user data will be refreshed on next successful request
    }
  };

  /**
   * Update user locally (for optimistic updates)
   */
  const updateUser = (data: Partial<User>): void => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      void AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    }
  };

  /**
   * Forgot password
   */
  const forgotPassword = async (
    email: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await authService.resetPassword(email);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Request failed';
      return { success: false, error: message };
    }
  };

  /**
   * Reset password with token
   */
  const resetPassword = async (
    _token: string,
    newPassword: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const { error } = await authService.updatePassword(newPassword);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Reset failed';
      return { success: false, error: message };
    }
  };

  /**
   * Change password (when logged in)
   */
  const changePassword = async (
    _currentPassword: string,
    newPassword: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Note: Supabase doesn't verify current password, just updates to new
      const { error } = await authService.updatePassword(newPassword);
      if (error) throw error;
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Change failed';
      return { success: false, error: message };
    }
  };

  // Memoize context value to prevent unnecessary re-renders of consumers
  // Only re-create when the actual values change
  const contextValue = useMemo<AuthContextType>(
    () => ({
      // State
      user,
      authState,
      isAuthenticated,
      isLoading,

      // Actions
      login,
      register,
      socialAuth,
      logout,
      refreshUser,
      updateUser,

      // OAuth
      handleOAuthCallback,

      // Token
      getAccessToken,

      // Password
      forgotPassword,
      resetPassword,
      changePassword,
    }),
    [
      user,
      authState,
      isAuthenticated,
      isLoading,
      login,
      register,
      socialAuth,
      logout,
      refreshUser,
      updateUser,
      handleOAuthCallback,
      getAccessToken,
      forgotPassword,
      resetPassword,
      changePassword,
    ],
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
