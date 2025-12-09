/**
 * Session Manager
 * 
 * Unified token & session management layer
 * - Stores tokens securely (SecureStore + memory cache)
 * - Handles token refresh automatically
 * - Provides session validation
 * - Manages session expiry
 * 
 * @example
 * ```typescript
 * // Get valid token (auto-refreshes if needed)
 * const token = await sessionManager.getValidToken();
 * 
 * // Check if session is valid
 * const isValid = await sessionManager.isSessionValid();
 * 
 * // Clear session on logout
 * await sessionManager.clearSession();
 * ```
 */

import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/supabase';
import { secureStorage, AUTH_STORAGE_KEYS, StorageKeys } from '../utils/secureStorage';
import { logger } from '../utils/logger';
import type { User } from '../types';

/**
 * Authentication tokens with metadata
 */
export interface SessionTokens {
  /** JWT access token for API requests */
  accessToken: string;
  /** Token used to refresh the access token */
  refreshToken: string;
  /** Unix timestamp (ms) when access token expires */
  expiresAt: number;
}

/**
 * Complete session data
 */
export interface SessionData {
  user: User;
  tokens: SessionTokens;
}

/**
 * Session state
 */
export type SessionState = 'valid' | 'expired' | 'invalid' | 'unknown';

/**
 * Session Manager Events
 */
export type SessionEvent = 
  | 'session_created'
  | 'session_refreshed'
  | 'session_expired'
  | 'session_cleared'
  | 'refresh_failed';

export type SessionEventListener = (event: SessionEvent, data?: any) => void;

/**
 * Singleton Session Manager
 * Handles all token and session operations
 */
class SessionManager {
  private tokens: SessionTokens | null = null;
  private user: User | null = null;
  private refreshPromise: Promise<string | null> | null = null;
  private listeners: Set<SessionEventListener> = new Set();
  
  // Token refresh buffer: refresh 5 minutes before expiry
  private readonly REFRESH_BUFFER_MS = 5 * 60 * 1000;
  
  /**
   * Initialize session from storage
   * Call this on app startup
   */
  async initialize(): Promise<SessionState> {
    try {
      logger.info('[SessionManager] Initializing...');
      
      // Load from storage
      const [storedUser, accessToken, refreshToken, expiresAtStr] = await Promise.all([
        AsyncStorage.getItem(StorageKeys.PUBLIC.USER_PROFILE),
        secureStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN),
        secureStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN),
        secureStorage.getItem(AUTH_STORAGE_KEYS.TOKEN_EXPIRES_AT),
      ]);
      
      // Check if we have all required data
      if (!storedUser || !accessToken || !refreshToken || !expiresAtStr) {
        logger.info('[SessionManager] No stored session found');
        return 'invalid';
      }
      
      const user = JSON.parse(storedUser) as User;
      const expiresAt = parseInt(expiresAtStr, 10);
      
      // Store in memory
      this.user = user;
      this.tokens = {
        accessToken,
        refreshToken,
        expiresAt,
      };
      
      // Check if token is still valid
      if (this.isTokenExpired(expiresAt)) {
        logger.info('[SessionManager] Session expired, needs refresh');
        return 'expired';
      }
      
      logger.info('[SessionManager] Valid session restored');
      return 'valid';
    } catch (error) {
      logger.error('[SessionManager] Initialize failed:', error);
      return 'unknown';
    }
  }
  
  /**
   * Save new session
   */
  async saveSession(sessionData: SessionData): Promise<void> {
    try {
      logger.info('[SessionManager] Saving session...');
      
      const { user, tokens } = sessionData;
      
      // Save to storage
      await Promise.all([
        AsyncStorage.setItem(StorageKeys.PUBLIC.USER_PROFILE, JSON.stringify(user)),
        secureStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken),
        secureStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken),
        secureStorage.setItem(AUTH_STORAGE_KEYS.TOKEN_EXPIRES_AT, tokens.expiresAt.toString()),
      ]);
      
      // Store in memory
      this.user = user;
      this.tokens = tokens;
      
      this.emit('session_created', { user });
      logger.info('[SessionManager] Session saved successfully');
    } catch (error) {
      logger.error('[SessionManager] Save session failed:', error);
      throw new Error('Failed to save session');
    }
  }
  
  /**
   * Get valid access token
   * Automatically refreshes if expired or near expiry
   * 
   * @returns Access token or null if refresh failed
   */
  async getValidToken(): Promise<string | null> {
    // No tokens at all
    if (!this.tokens) {
      logger.warn('[SessionManager] No tokens available');
      return null;
    }
    
    // Token is still valid (with buffer)
    if (!this.isTokenExpiringSoon(this.tokens.expiresAt)) {
      return this.tokens.accessToken;
    }
    
    // Token is expired or expiring soon - refresh it
    logger.info('[SessionManager] Token expiring soon, refreshing...');
    return this.refreshToken();
  }
  
  /**
   * Refresh access token using refresh token
   * Deduplicates multiple refresh calls
   */
  private async refreshToken(): Promise<string | null> {
    // If refresh is already in progress, return the existing promise
    if (this.refreshPromise) {
      logger.info('[SessionManager] Refresh already in progress, waiting...');
      return this.refreshPromise;
    }
    
    // Start new refresh
    this.refreshPromise = this.performRefresh();
    
    try {
      const token = await this.refreshPromise;
      return token;
    } finally {
      this.refreshPromise = null;
    }
  }
  
  /**
   * Actual token refresh logic
   */
  private async performRefresh(): Promise<string | null> {
    try {
      // Check network first
      const netState = await NetInfo.fetch();
      const isOnline = netState.isConnected && netState.isInternetReachable !== false;
      
      if (!isOnline) {
        logger.warn('[SessionManager] Offline, cannot refresh token');
        // Return current token even if expired (offline mode)
        return this.tokens?.accessToken || null;
      }
      
      logger.info('[SessionManager] Refreshing token...');
      
      // Call Supabase refresh
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error || !data.session) {
        logger.error('[SessionManager] Refresh failed:', error);
        this.emit('refresh_failed', { error });
        
        // Clear invalid session
        await this.clearSession();
        this.emit('session_expired');
        
        return null;
      }
      
      const { session } = data;
      
      // Update tokens
      const newTokens: SessionTokens = {
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        expiresAt: (session.expires_at || 0) * 1000,
      };
      
      // Save to storage and memory
      await Promise.all([
        secureStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, newTokens.accessToken),
        secureStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, newTokens.refreshToken),
        secureStorage.setItem(AUTH_STORAGE_KEYS.TOKEN_EXPIRES_AT, newTokens.expiresAt.toString()),
      ]);
      
      this.tokens = newTokens;
      
      this.emit('session_refreshed', { expiresAt: newTokens.expiresAt });
      logger.info('[SessionManager] Token refreshed successfully');
      
      return newTokens.accessToken;
    } catch (error) {
      logger.error('[SessionManager] Refresh exception:', error);
      this.emit('refresh_failed', { error });
      
      // Clear session on critical error
      await this.clearSession();
      this.emit('session_expired');
      
      return null;
    }
  }
  
  /**
   * Clear session (logout)
   */
  async clearSession(): Promise<void> {
    try {
      logger.info('[SessionManager] Clearing session...');
      
      // Clear storage
      await Promise.all([
        AsyncStorage.removeItem(StorageKeys.PUBLIC.USER_PROFILE),
        secureStorage.deleteItems([
          AUTH_STORAGE_KEYS.ACCESS_TOKEN,
          AUTH_STORAGE_KEYS.REFRESH_TOKEN,
          AUTH_STORAGE_KEYS.TOKEN_EXPIRES_AT,
        ]),
      ]);
      
      // Clear memory
      this.tokens = null;
      this.user = null;
      
      this.emit('session_cleared');
      logger.info('[SessionManager] Session cleared');
    } catch (error) {
      logger.error('[SessionManager] Clear session failed:', error);
      // Force clear memory even if storage fails
      this.tokens = null;
      this.user = null;
    }
  }
  
  /**
   * Check if session is valid
   */
  async isSessionValid(): Promise<boolean> {
    if (!this.tokens || !this.user) {
      return false;
    }
    
    // Check if token is expired
    if (this.isTokenExpired(this.tokens.expiresAt)) {
      // Try to refresh
      const token = await this.refreshToken();
      return token !== null;
    }
    
    return true;
  }
  
  /**
   * Get current user
   */
  getUser(): User | null {
    return this.user;
  }
  
  /**
   * Get current tokens
   */
  getTokens(): SessionTokens | null {
    return this.tokens;
  }
  
  /**
   * Update user profile in session
   */
  async updateUser(updates: Partial<User>): Promise<void> {
    if (!this.user) {
      throw new Error('No active session');
    }
    
    const updatedUser = { ...this.user, ...updates };
    
    await AsyncStorage.setItem(
      StorageKeys.PUBLIC.USER_PROFILE,
      JSON.stringify(updatedUser)
    );
    
    this.user = updatedUser;
    logger.info('[SessionManager] User updated');
  }
  
  /**
   * Check if token is expired
   */
  private isTokenExpired(expiresAt: number): boolean {
    return Date.now() >= expiresAt;
  }
  
  /**
   * Check if token is expiring soon (within buffer)
   */
  private isTokenExpiringSoon(expiresAt: number): boolean {
    return Date.now() >= expiresAt - this.REFRESH_BUFFER_MS;
  }
  
  /**
   * Subscribe to session events
   */
  addListener(listener: SessionEventListener): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }
  
  /**
   * Emit event to all listeners
   */
  private emit(event: SessionEvent, data?: any): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event, data);
      } catch (error) {
        logger.error('[SessionManager] Listener error:', error);
      }
    });
  }
  
  /**
   * Get session state summary
   */
  getSessionSummary() {
    if (!this.tokens || !this.user) {
      return {
        state: 'invalid' as SessionState,
        user: null,
        expiresAt: null,
        isExpired: true,
      };
    }
    
    const isExpired = this.isTokenExpired(this.tokens.expiresAt);
    
    return {
      state: isExpired ? ('expired' as SessionState) : ('valid' as SessionState),
      user: this.user,
      expiresAt: new Date(this.tokens.expiresAt),
      isExpired,
    };
  }
}

/**
 * Singleton instance
 */
export const sessionManager = new SessionManager();
