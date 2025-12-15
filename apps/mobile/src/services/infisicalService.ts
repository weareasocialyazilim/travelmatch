/**
 * Infisical Secrets Management Service
 * 
 * Secure secrets management for TravelMatch
 * Replaces hardcoded keys and environment variables with encrypted secrets
 * 
 * Features:
 * - Encrypted secrets storage
 * - Environment-specific secrets (dev, staging, prod)
 * - Automatic secret rotation support
 * - Audit logging of secret access
 * 
 * @see https://infisical.com/docs
 */

import * as SecureStore from 'expo-secure-store';
import { logger } from '../utils/logger';

// Infisical configuration
const INFISICAL_CONFIG = {
  // Organization details from your Infisical setup
  siteUrl: 'https://app.infisical.com',
  organizationId: 'cafe77a6-a1d6-4725-89d4-e1ec88c0f2b9',
  organizationSlug: 'travelmatch-w-mw-u',
  
  // Cache duration for secrets (5 minutes)
  cacheDuration: 5 * 60 * 1000,
  
  // Secret paths
  paths: {
    supabase: '/supabase',
    encryption: '/encryption',
    cloudflare: '/cloudflare',
    stripe: '/stripe',
    analytics: '/analytics',
  },
} as const;

// Secret keys we manage through Infisical
export const SECRET_KEYS = {
  // Supabase (ANON key only - Service key NEVER on client)
  SUPABASE_URL: 'SUPABASE_URL',
  SUPABASE_ANON_KEY: 'SUPABASE_ANON_KEY',
  
  // Encryption
  CACHE_ENCRYPTION_KEY: 'CACHE_ENCRYPTION_KEY',
  
  // Analytics (public keys only)
  POSTHOG_API_KEY: 'POSTHOG_API_KEY',
  SENTRY_DSN: 'SENTRY_DSN',
  
  // Feature flags
  FEATURE_FLAGS_KEY: 'FEATURE_FLAGS_KEY',
} as const;

// In-memory cache for secrets
interface SecretCache {
  value: string;
  expiresAt: number;
}

const secretCache = new Map<string, SecretCache>();

/**
 * Infisical Secrets Service
 * 
 * IMPORTANT: This service only fetches CLIENT-SAFE secrets.
 * Service Role Keys, API secrets, and other sensitive keys
 * must ONLY be accessed via Edge Functions.
 */
class InfisicalService {
  private initialized = false;
  private machineIdentityToken: string | null = null;

  /**
   * Initialize the service with machine identity
   * Called once at app startup
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Get machine identity token from secure storage
      // This token should be set during app provisioning
      this.machineIdentityToken = await SecureStore.getItemAsync('INFISICAL_TOKEN');
      
      if (!this.machineIdentityToken) {
        // In development, use environment variable as fallback
        this.machineIdentityToken = process.env.EXPO_PUBLIC_INFISICAL_TOKEN ?? null;
        
        if (this.machineIdentityToken) {
          // Store for future use
          await SecureStore.setItemAsync('INFISICAL_TOKEN', this.machineIdentityToken);
        }
      }

      this.initialized = true;
      logger.info('[Infisical] Service initialized');
    } catch (error) {
      logger.error('[Infisical] Initialization failed', error);
      throw error;
    }
  }

  /**
   * Get a secret value
   * 
   * @param key - Secret key name
   * @param options - Optional configuration
   * @returns Secret value or null if not found
   */
  async getSecret(
    key: keyof typeof SECRET_KEYS,
    options: {
      environment?: 'development' | 'staging' | 'production';
      bypassCache?: boolean;
    } = {}
  ): Promise<string | null> {
    const { environment = this.getEnvironment(), bypassCache = false } = options;

    // Check cache first
    if (!bypassCache) {
      const cached = this.getCachedSecret(key);
      if (cached) return cached;
    }

    try {
      // For mobile apps, we fetch secrets via a secure endpoint
      // The actual Infisical SDK call happens on the backend
      const secret = await this.fetchSecretFromBackend(key, environment);
      
      if (secret) {
        this.cacheSecret(key, secret);
      }
      
      return secret;
    } catch (error) {
      logger.error(`[Infisical] Failed to fetch secret: ${key}`, error);
      
      // Fallback to environment variable in development
      if (__DEV__) {
        const envKey = `EXPO_PUBLIC_${key}`;
        return process.env[envKey] ?? null;
      }
      
      return null;
    }
  }

  /**
   * Get multiple secrets at once
   */
  async getSecrets(
    keys: Array<keyof typeof SECRET_KEYS>,
    environment?: 'development' | 'staging' | 'production'
  ): Promise<Record<string, string | null>> {
    const results: Record<string, string | null> = {};
    
    // Fetch in parallel
    await Promise.all(
      keys.map(async (key) => {
        results[key] = await this.getSecret(key, { environment });
      })
    );
    
    return results;
  }

  /**
   * Fetch secret from backend (Edge Function)
   * Backend has access to Infisical SDK with proper authentication
   */
  private async fetchSecretFromBackend(
    key: string,
    environment: string
  ): Promise<string | null> {
    // In development, use environment variables directly
    if (__DEV__) {
      const envKey = `EXPO_PUBLIC_${key}`;
      return process.env[envKey] ?? null;
    }

    try {
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !anonKey) {
        throw new Error('Missing Supabase configuration');
      }

      const response = await fetch(
        `${supabaseUrl}/functions/v1/get-secret`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': anonKey,
            'Authorization': `Bearer ${this.machineIdentityToken}`,
          },
          body: JSON.stringify({
            key,
            environment,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch secret: ${response.status}`);
      }

      const data = await response.json();
      return data.value ?? null;
    } catch (error) {
      logger.error('[Infisical] Backend fetch failed', error);
      return null;
    }
  }

  /**
   * Get cached secret if not expired
   */
  private getCachedSecret(key: string): string | null {
    const cached = secretCache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }
    secretCache.delete(key);
    return null;
  }

  /**
   * Cache a secret value
   */
  private cacheSecret(key: string, value: string): void {
    secretCache.set(key, {
      value,
      expiresAt: Date.now() + INFISICAL_CONFIG.cacheDuration,
    });
  }

  /**
   * Clear all cached secrets
   */
  clearCache(): void {
    secretCache.clear();
    logger.info('[Infisical] Cache cleared');
  }

  /**
   * Get current environment
   */
  private getEnvironment(): 'development' | 'staging' | 'production' {
    if (__DEV__) return 'development';
    
    const env = process.env.EXPO_PUBLIC_APP_ENV;
    if (env === 'staging') return 'staging';
    if (env === 'production') return 'production';
    
    return 'development';
  }

  /**
   * Check if service is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

// Export singleton instance
export const infisicalService = new InfisicalService();

/**
 * Helper hook for using secrets in components
 */
export async function getSecureConfig(): Promise<{
  supabaseUrl: string;
  supabaseAnonKey: string;
  cacheEncryptionKey: string;
}> {
  await infisicalService.initialize();
  
  const secrets = await infisicalService.getSecrets([
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY', 
    'CACHE_ENCRYPTION_KEY',
  ]);

  return {
    supabaseUrl: secrets.SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
    supabaseAnonKey: secrets.SUPABASE_ANON_KEY ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
    cacheEncryptionKey: secrets.CACHE_ENCRYPTION_KEY ?? generateFallbackKey(),
  };
}

/**
 * Generate a fallback encryption key (development only)
 * Production MUST use Infisical-managed key
 */
function generateFallbackKey(): string {
  if (!__DEV__) {
    throw new Error('CACHE_ENCRYPTION_KEY must be configured in Infisical for production');
  }
  
  // Development fallback - NOT secure, just for local testing
  logger.warn('[Infisical] Using fallback encryption key - NOT FOR PRODUCTION');
  return 'dev-fallback-key-not-for-production-use';
}
