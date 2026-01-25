/**
 * Environment Configuration
 * .env dosyası için type-safe configuration
 */

import { z } from 'zod';
import { logger } from '../utils/logger';

/**
 * Environment Schema
 */
const envSchema = z.object({
  API_URL: z.string().url().optional(), // ✅ FIXED: Removed localhost fallback - will use Supabase Functions URL
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  APP_NAME: z.string().default('Lovendo'),
  APP_VERSION: z.string().default('1.0.0'),
  ENABLE_ANALYTICS: z.boolean().default(false),
  ENABLE_LOGGING: z.boolean().default(true),
  MAX_UPLOAD_SIZE: z.number().default(10485760), // 10MB
  SOCKET_URL: z.string().url().optional(),
  MAPBOX_PUBLIC_TOKEN: z.string().optional(),
  // Supabase configuration
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
});

/**
 * Production environment validation
 * These variables MUST be set in production
 */
const REQUIRED_IN_PRODUCTION = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'] as const;

/**
 * Parse and validate environment variables
 */
function getEnvVars() {
  // In React Native/Expo, you would typically use:
  // - expo-constants for app.json/app.config.js
  // - react-native-dotenv for .env files
  // For now, using default values

  const rawEnv = {
    API_URL: process.env.EXPO_PUBLIC_API_URL as string | undefined,
    NODE_ENV: process.env.NODE_ENV as 'development' | 'production' | 'test',
    APP_NAME: 'Lovendo' as const,
    APP_VERSION: '1.0.0' as const,
    ENABLE_ANALYTICS: process.env.EXPO_PUBLIC_ENABLE_ANALYTICS === 'true',
    ENABLE_LOGGING: __DEV__,
    MAX_UPLOAD_SIZE: 10485760 as const,
    SOCKET_URL: process.env.EXPO_PUBLIC_SOCKET_URL as string | undefined,
    MAPBOX_PUBLIC_TOKEN: process.env.EXPO_PUBLIC_MAPBOX_PUBLIC_TOKEN as
      | string
      | undefined,
    SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL as string | undefined,
    SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as
      | string
      | undefined,
  };

  try {
    const parsed = envSchema.parse(rawEnv);

    // Validate required variables in production
    if (parsed.NODE_ENV === 'production') {
      const missing = REQUIRED_IN_PRODUCTION.filter(
        (key) => !rawEnv[key as keyof typeof rawEnv],
      );
      if (missing.length > 0) {
        throw new Error(
          `Missing required environment variables in production: ${missing.join(
            ', ',
          )}`,
        );
      }
    }

    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('❌ Invalid environment variables:');
      error.issues.forEach((err) => {
        logger.error(`  ${err.path.join('.')}: ${err.message}`);
      });
      throw new Error('Invalid environment configuration');
    }
    throw error;
  }
}

/**
 * Validated environment configuration
 */
export const config = getEnvVars();

/**
 * Type-safe environment variables
 */
export type Config = z.infer<typeof envSchema>;

/**
 * Check if running in development mode
 */
export const isDevelopment = config.NODE_ENV === 'development';
export const isProduction = config.NODE_ENV === 'production';
export const isTest = config.NODE_ENV === 'test';

/**
 * API Configuration
 */
export const API_CONFIG = {
  BASE_URL: config.API_URL,
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

/**
 * Upload Configuration
 */
export const UPLOAD_CONFIG = {
  MAX_SIZE: config.MAX_UPLOAD_SIZE,
  MAX_FILES: 10,
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'] as const,
} as const;

/**
 * Feature Flags
 */
export const FEATURES = {
  ANALYTICS: config.ENABLE_ANALYTICS,
  LOGGING: config.ENABLE_LOGGING,
  SOCKET_ENABLED: !!config.SOCKET_URL,
  PAYMENTS_ENABLED: true, // PayTR payment provider
  MAPS_ENABLED: !!config.MAPBOX_PUBLIC_TOKEN,
  SUPABASE_ENABLED: !!config.SUPABASE_URL && !!config.SUPABASE_ANON_KEY,
} as const;

/**
 * Log configuration (only in development)
 */
if (isDevelopment) {
  logger.debug('📦 App Configuration:', {
    name: config.APP_NAME,
    version: config.APP_VERSION,
    env: config.NODE_ENV,
    api: config.API_URL,
    features: FEATURES,
  });
}
