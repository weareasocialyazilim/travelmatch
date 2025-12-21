/**
 * Cache Invalidation Service
 *
 * Centralized cache management for payment-related data
 * Supports multiple cache backends: AsyncStorage, Redis (via Supabase)
 *
 * Features:
 * - Time-based invalidation (TTL)
 * - Tag-based invalidation (invalidate all user payments)
 * - Wildcard invalidation patterns
 * - Automatic cleanup of expired entries
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

// Cache key prefixes
export const CACHE_KEYS = {
  WALLET: 'wallet',
  TRANSACTIONS: 'transactions',
  PAYMENT_METHODS: 'payment_methods',
  PAYMENT_INTENT: 'payment_intent',
  MOMENT_PAYMENTS: 'moment_payments',
  USER_BALANCE: 'user_balance',
} as const;

// Cache TTL (Time To Live) in seconds
export const CACHE_TTL = {
  WALLET: 60, // 1 minute
  TRANSACTIONS: 300, // 5 minutes
  PAYMENT_METHODS: 600, // 10 minutes
  PAYMENT_INTENT: 180, // 3 minutes
  MOMENT_PAYMENTS: 120, // 2 minutes
} as const;

interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  tags?: string[];
}

class CacheInvalidationService {
  private invalidationChecks = new Map<string, number>();

  /**
   * Build cache key with prefix and identifier
   */
  private buildKey(prefix: string, identifier: string): string {
    return `cache:${prefix}:${identifier}`;
  }

  /**
   * Get cached data with automatic invalidation check
   */
  async get<T>(prefix: string, identifier: string): Promise<T | null> {
    try {
      const key = this.buildKey(prefix, identifier);

      // Check if cache was invalidated server-side
      if (await this.wasInvalidated(key)) {
        await this.remove(prefix, identifier);
        return null;
      }

      const cached = await AsyncStorage.getItem(key);
      if (!cached) return null;

      const entry: CacheEntry<T> = JSON.parse(cached);
      const now = Date.now();

      // Check if expired
      if (entry.timestamp + entry.ttl * 1000 < now) {
        await this.remove(prefix, identifier);
        return null;
      }

      return entry.data;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Set cached data with TTL and tags
   */
  async set<T>(
    prefix: string,
    identifier: string,
    data: T,
    ttl: number,
    tags?: string[],
  ): Promise<void> {
    try {
      const key = this.buildKey(prefix, identifier);
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
        tags,
      };

      await AsyncStorage.setItem(key, JSON.stringify(entry));
    } catch (error) {
      logger.error('Cache set error:', error);
    }
  }

  /**
   * Remove cached data
   */
  async remove(prefix: string, identifier: string): Promise<void> {
    try {
      const key = this.buildKey(prefix, identifier);
      await AsyncStorage.removeItem(key);
    } catch (error) {
      logger.error('Cache remove error:', error);
    }
  }

  /**
   * Invalidate cache locally
   */
  async invalidate(prefix: string, identifier: string): Promise<void> {
    await this.remove(prefix, identifier);

    // Also mark as invalidated in Supabase for other devices
    await this.markInvalidated(this.buildKey(prefix, identifier));
  }

  /**
   * Invalidate all cache entries for a user
   */
  async invalidateUser(userId: string): Promise<void> {
    try {
      const keys = [
        this.buildKey(CACHE_KEYS.WALLET, userId),
        this.buildKey(CACHE_KEYS.TRANSACTIONS, userId),
        this.buildKey(CACHE_KEYS.PAYMENT_METHODS, userId),
        this.buildKey(CACHE_KEYS.USER_BALANCE, userId),
      ];

      await AsyncStorage.multiRemove(keys);

      // Mark all as invalidated server-side
      await this.markMultipleInvalidated(keys);
    } catch (error) {
      logger.error('Cache invalidate user error:', error);
    }
  }

  /**
   * Invalidate cache by tag
   */
  async invalidateByTag(tag: string): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter((key) => key.startsWith('cache:'));

      const keysToRemove: string[] = [];

      for (const key of cacheKeys) {
        try {
          const cached = await AsyncStorage.getItem(key);
          if (cached) {
            const entry: CacheEntry = JSON.parse(cached);
            if (entry.tags?.includes(tag)) {
              keysToRemove.push(key);
            }
          }
        } catch {
          // Skip invalid entries
        }
      }

      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
        await this.markMultipleInvalidated(keysToRemove);
      }
    } catch (error) {
      logger.error('Cache invalidate by tag error:', error);
    }
  }

  /**
   * Invalidate cache with wildcard pattern
   */
  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const regex = new RegExp(
        pattern.replace(/\*/g, '.*').replace(/\?/g, '.'),
      );
      const keysToRemove = allKeys.filter((key) => regex.test(key));

      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
        await this.markMultipleInvalidated(keysToRemove);
      }
    } catch (error) {
      logger.error('Cache invalidate pattern error:', error);
    }
  }

  /**
   * Clear all cache entries
   */
  async clearAll(): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter((key) => key.startsWith('cache:'));

      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
      }
    } catch (error) {
      logger.error('Cache clear all error:', error);
    }
  }

  /**
   * Check if cache was invalidated server-side
   */
  private async wasInvalidated(key: string): Promise<boolean> {
    try {
      // Only check server-side invalidation every 30 seconds to reduce queries
      const lastCheck = this.invalidationChecks.get(key);
      const now = Date.now();
      if (lastCheck && now - lastCheck < 30000) {
        return false;
      }

      this.invalidationChecks.set(key, now);

      // Get local cache timestamp
      const cached = await AsyncStorage.getItem(key);
      if (!cached) return false;

      const entry: CacheEntry = JSON.parse(cached);

      // Check Supabase for invalidation record
      const { data, error } = await supabase
        .from('cache_invalidation')
        .select('invalidated_at')
        .eq('cache_key', key)
        .order('invalidated_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) return false;

      const invalidatedAt = data.invalidated_at
        ? new Date(data.invalidated_at).getTime()
        : 0;
      return invalidatedAt > entry.timestamp;
    } catch {
      // Don't fail if invalidation check fails
      return false;
    }
  }

  /**
   * Mark cache as invalidated in Supabase
   */
  private async markInvalidated(key: string): Promise<void> {
    try {
      await supabase.from('cache_invalidation').insert({
        cache_key: key,
        invalidated_at: new Date().toISOString(),
      });
    } catch (error) {
      logger.error('Failed to mark cache invalidated:', error);
    }
  }

  /**
   * Mark multiple caches as invalidated
   */
  private async markMultipleInvalidated(keys: string[]): Promise<void> {
    try {
      const timestamp = new Date().toISOString();
      const records = keys.map((key) => ({
        cache_key: key,
        invalidated_at: timestamp,
      }));

      await supabase.from('cache_invalidation').insert(records);
    } catch (error) {
      logger.error('Failed to mark caches invalidated:', error);
    }
  }

  /**
   * Cleanup expired invalidation records (should be run periodically)
   */
  async cleanupInvalidationRecords(): Promise<void> {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      await supabase
        .from('cache_invalidation')
        .delete()
        .lt('invalidated_at', oneWeekAgo.toISOString());
    } catch (error) {
      logger.error('Failed to cleanup invalidation records:', error);
    }
  }
}

export const cacheInvalidationService = new CacheInvalidationService();

/**
 * Convenience functions for common cache operations
 */

// Wallet cache
export async function getCachedWallet(userId: string) {
  return cacheInvalidationService.get(CACHE_KEYS.WALLET, userId);
}

// Cache data types
interface WalletData {
  balance: number;
  currency: string;
  pendingBalance?: number;
}

interface TransactionData {
  id: string;
  amount: number;
  type: string;
  status: string;
  createdAt: string;
}

interface PaymentMethodData {
  id: string;
  type: 'card' | 'bank';
  last4?: string;
  brand?: string;
}

export async function setCachedWallet(userId: string, data: WalletData) {
  return cacheInvalidationService.set(
    CACHE_KEYS.WALLET,
    userId,
    data,
    CACHE_TTL.WALLET,
    ['user', `user:${userId}`],
  );
}

export async function invalidateWallet(userId: string) {
  return cacheInvalidationService.invalidate(CACHE_KEYS.WALLET, userId);
}

// Transactions cache
export async function getCachedTransactions(userId: string) {
  return cacheInvalidationService.get(CACHE_KEYS.TRANSACTIONS, userId);
}

export async function setCachedTransactions(
  userId: string,
  data: TransactionData[],
) {
  return cacheInvalidationService.set(
    CACHE_KEYS.TRANSACTIONS,
    userId,
    data,
    CACHE_TTL.TRANSACTIONS,
    ['user', `user:${userId}`, 'transactions'],
  );
}

export async function invalidateTransactions(userId: string) {
  return cacheInvalidationService.invalidate(CACHE_KEYS.TRANSACTIONS, userId);
}

// Payment methods cache
export async function getCachedPaymentMethods(userId: string) {
  return cacheInvalidationService.get(CACHE_KEYS.PAYMENT_METHODS, userId);
}

export async function setCachedPaymentMethods(
  userId: string,
  data: PaymentMethodData[],
) {
  return cacheInvalidationService.set(
    CACHE_KEYS.PAYMENT_METHODS,
    userId,
    data,
    CACHE_TTL.PAYMENT_METHODS,
    ['user', `user:${userId}`, 'payment_methods'],
  );
}

export async function invalidatePaymentMethods(userId: string) {
  return cacheInvalidationService.invalidate(
    CACHE_KEYS.PAYMENT_METHODS,
    userId,
  );
}

// Invalidate all payment-related cache for user
export async function invalidateAllPaymentCache(userId: string) {
  return cacheInvalidationService.invalidateUser(userId);
}
