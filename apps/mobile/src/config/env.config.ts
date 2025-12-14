/**
 * Environment Variable Validation with Zod
 * 
 * Validates all environment variables at startup to prevent runtime errors.
 * Provides type-safe access to configuration across the app.
 * 
 * Security Features:
 * - Separates client-safe vs sensitive variables
 * - Validates required variables in production
 * - Prevents accidental exposure of secrets
 * - Type-safe configuration
 * 
 * Usage:
 * ```typescript
 * import { env } from '@/config/env.config';
 * 
 * // Type-safe access
 * const supabaseUrl = env.SUPABASE_URL;
 * const isDev = env.NODE_ENV === 'development';
 * ```
 */

import { z } from 'zod';

/**
 * Client-safe environment variables (EXPO_PUBLIC_*)
 * These are embedded in the client bundle and publicly accessible
 */
const clientEnvSchema = z.object({
  // App Configuration
  APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  APP_NAME: z.string().default('TravelMatch'),
  APP_VERSION: z.string().default('1.0.0'),

  // Supabase (anon key is safe to expose)
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(20),

  // API Configuration
  API_URL: z.string().url().optional(),

  // Analytics (tracking IDs are public)
  SENTRY_DSN: z.string().url().optional(),
  GOOGLE_ANALYTICS_ID: z.string().optional(),

  // Feature Flags
  ENABLE_ANALYTICS: z
    .string()
    .default('false')
    .transform((val) => val === 'true'),
});

/**
 * Server-side only environment variables
 * These should NEVER be prefixed with EXPO_PUBLIC_
 * Access via Edge Functions only
 */
const serverEnvSchema = z.object({
  // Supabase Admin (NEVER expose to client)
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20).optional(),

  // Stripe Secrets (NEVER expose to client)
  STRIPE_SECRET_KEY: z.string().startsWith('sk_').optional(),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_').optional(),

  // Third-party API Keys (NEVER expose to client)
  OPENAI_API_KEY: z.string().startsWith('sk-').optional(),
  CLOUDFLARE_STREAM_API_KEY: z.string().optional(),
  CLOUDFLARE_STREAM_ACCOUNT_ID: z.string().optional(),
  GOOGLE_MAPS_SERVER_KEY: z.string().optional(),

  // Upstash Redis (server-side only)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // OAuth Secrets (NEVER expose to client)
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  APPLE_CLIENT_SECRET: z.string().optional(),
});

/**
 * Combined environment schema
 */
const envSchema = z.object({
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Merge client and server schemas
  ...clientEnvSchema.shape,
});

/**
 * Variables required in production
 */
const REQUIRED_IN_PRODUCTION = [
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
] as const;

/**
 * Sensitive keys that should NEVER use EXPO_PUBLIC_ prefix
 */
const FORBIDDEN_PUBLIC_VARS = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'OPENAI_API_KEY',
  'CLOUDFLARE_STREAM_API_KEY',
  'GOOGLE_CLIENT_SECRET',
  'APPLE_CLIENT_SECRET',
  'UPSTASH_REDIS_REST_TOKEN',
] as const;

/**
 * Parse and validate environment variables
 */
function parseEnv() {
  // Extract EXPO_PUBLIC_* variables
  const rawClientEnv = {
    APP_ENV: process.env.EXPO_PUBLIC_APP_ENV,
    APP_NAME: process.env.EXPO_PUBLIC_APP_NAME || 'TravelMatch',
    APP_VERSION: process.env.EXPO_PUBLIC_APP_VERSION || '1.0.0',
    SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    API_URL: process.env.EXPO_PUBLIC_API_URL,
    SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN,
    GOOGLE_ANALYTICS_ID: process.env.EXPO_PUBLIC_GOOGLE_ANALYTICS_ID,
    ENABLE_ANALYTICS: process.env.EXPO_PUBLIC_ENABLE_ANALYTICS || 'false',
  };

  const rawEnv = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    ...rawClientEnv,
  };

  // Security check: Ensure sensitive variables are not exposed
  const exposedSecrets: string[] = [];
  FORBIDDEN_PUBLIC_VARS.forEach((key) => {
    const publicKey = `EXPO_PUBLIC_${key}`;
    if (process.env[publicKey]) {
      exposedSecrets.push(publicKey);
    }
  });

  if (exposedSecrets.length > 0) {
    throw new Error(
      `🚨 SECURITY ERROR: Sensitive variables exposed with EXPO_PUBLIC_ prefix!\n` +
      `The following variables MUST NOT use EXPO_PUBLIC_:\n` +
      exposedSecrets.map(k => `  - ${k}`).join('\n') +
      `\n\nThese secrets would be embedded in the client bundle and publicly accessible.` +
      `\nRemove the EXPO_PUBLIC_ prefix and access them server-side only.`
    );
  }

  try {
    const parsed = envSchema.parse(rawEnv);

    // Production validation
    if (parsed.NODE_ENV === 'production') {
      const missing = REQUIRED_IN_PRODUCTION.filter(
        (key) => !rawEnv[key as keyof typeof rawEnv]
      );

      if (missing.length > 0) {
        throw new Error(
          `🚨 Missing required environment variables in production:\n` +
          missing.map(k => `  - EXPO_PUBLIC_${k}`).join('\n')
        );
      }
    }

    return parsed;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map(
        (issue) => `  ❌ ${issue.path.join('.')}: ${issue.message}`
      );
      
      throw new Error(
        `🚨 Invalid environment configuration:\n${errorMessages.join('\n')}\n\n` +
        `Check your .env file and ensure all required variables are set.`
      );
    }
    throw error;
  }
}

/**
 * Validated environment configuration
 * Use this throughout the app instead of process.env
 */
export const env = parseEnv();

/**
 * Type-safe environment getter
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Helper to check if running in development
 */
export const isDevelopment = env.NODE_ENV === 'development';

/**
 * Helper to check if running in production
 */
export const isProduction = env.NODE_ENV === 'production';

/**
 * Helper to check if running in test
 */
export const isTest = env.NODE_ENV === 'test';

/**
 * Get API base URL (with fallback)
 */
export function getApiUrl(): string {
  return env.API_URL || `${env.SUPABASE_URL}/functions/v1`;
}

/**
 * Validate environment on app startup
 * Call this in your app entry point (App.tsx)
 */
export function validateEnvironment(): void {
  try {
    parseEnv();
    if (isDevelopment) {
      console.log('✅ Environment validation passed');
      console.log(`📱 Running in ${env.APP_ENV} mode`);
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
}
