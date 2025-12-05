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
  API_URL: z.string().url().optional().default('http://localhost:3000/api'),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  APP_NAME: z.string().default('TravelMatch'),
  APP_VERSION: z.string().default('1.0.0'),
  ENABLE_ANALYTICS: z.boolean().default(false),
  ENABLE_LOGGING: z.boolean().default(true),
  MAX_UPLOAD_SIZE: z.number().default(10485760), // 10MB
  SOCKET_URL: z.string().url().optional(),
  STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  GOOGLE_MAPS_API_KEY: z.string().optional(),
});

/**
 * Parse and validate environment variables
 */
function getEnvVars() {
  // In React Native/Expo, you would typically use:
  // - expo-constants for app.json/app.config.js
  // - react-native-dotenv for .env files
  // For now, using default values

  const rawEnv = {
    API_URL: process.env.EXPO_PUBLIC_API_URL,
    NODE_ENV: process.env.NODE_ENV as 'development' | 'production' | 'test',
    APP_NAME: 'TravelMatch',
    APP_VERSION: '1.0.0',
    ENABLE_ANALYTICS: process.env.EXPO_PUBLIC_ENABLE_ANALYTICS === 'true',
    ENABLE_LOGGING: __DEV__,
    MAX_UPLOAD_SIZE: 10485760,
    SOCKET_URL: process.env.EXPO_PUBLIC_SOCKET_URL,
    STRIPE_PUBLISHABLE_KEY: process.env.EXPO_PUBLIC_STRIPE_KEY,
    GOOGLE_MAPS_API_KEY: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY,
  };

  try {
    return envSchema.parse(rawEnv);
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
  PAYMENTS_ENABLED: !!config.STRIPE_PUBLISHABLE_KEY,
  MAPS_ENABLED: !!config.GOOGLE_MAPS_API_KEY,
} as const;

/**
 * Log configuration (only in development)
 */
if (isDevelopment) {
  // eslint-disable-next-line no-console
  logger.debug('📦 App Configuration:', {
    name: config.APP_NAME,
    version: config.APP_VERSION,
    env: config.NODE_ENV,
    api: config.API_URL,
    features: FEATURES,
  });
}
