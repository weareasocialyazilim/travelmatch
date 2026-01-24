/**
 * Production Environment Validator
 *
 * SECURITY: Ensures critical environment variables are set in production
 * before Edge Functions start serving requests.
 *
 * Usage:
 * ```typescript
 * import { validateProductionEnv } from '../_shared/env-validator.ts';
 *
 * serve(async (req) => {
 *   const envError = validateProductionEnv(['CRITICAL_SECRET', 'API_KEY']);
 *   if (envError) return envError;
 *
 *   // ... rest of handler
 * });
 * ```
 */

export interface EnvValidationOptions {
  /**
   * Required environment variables
   */
  required: string[];

  /**
   * Optional environment variables to warn about if missing
   */
  optional?: string[];

  /**
   * Custom environment name (defaults to Deno.env.get('DENO_ENV') || 'development')
   */
  environment?: string;
}

/**
 * Validate required environment variables
 *
 * @param requiredVars - Array of required environment variable names
 * @returns Response with 500 error if validation fails, null if valid
 */
export function validateProductionEnv(
  requiredVars: string[]
): Response | null {
  const environment = Deno.env.get('DENO_ENV') || 'development';
  const missing: string[] = [];
  const empty: string[] = [];

  for (const varName of requiredVars) {
    const value = Deno.env.get(varName);

    if (value === undefined) {
      missing.push(varName);
    } else if (value.trim() === '') {
      empty.push(varName);
    }
  }

  if (missing.length > 0 || empty.length > 0) {
    const errors: string[] = [];

    if (missing.length > 0) {
      errors.push(`Missing: ${missing.join(', ')}`);
    }

    if (empty.length > 0) {
      errors.push(`Empty: ${empty.join(', ')}`);
    }

    console.error(
      `[ENV VALIDATION FAILED] Environment: ${environment}`,
      errors.join('; ')
    );

    // In production, fail hard to prevent serving requests with missing config
    if (environment === 'production') {
      return new Response(
        JSON.stringify({
          error: 'Server misconfigured',
          message: 'Critical environment variables are missing',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // In development, log warning but allow through
    console.warn('[ENV VALIDATION WARNING] Some environment variables are missing');
  }

  return null;
}

/**
 * Validate environment variables with detailed options
 *
 * @param options - Validation options
 * @returns Response with 500 error if validation fails, null if valid
 */
export function validateEnv(options: EnvValidationOptions): Response | null {
  const environment = options.environment || Deno.env.get('DENO_ENV') || 'development';
  const issues: string[] = [];

  // Check required variables
  for (const varName of options.required) {
    const value = Deno.env.get(varName);

    if (value === undefined) {
      issues.push(`MISSING: ${varName}`);
    } else if (value.trim() === '') {
      issues.push(`EMPTY: ${varName}`);
    }
  }

  // Check optional variables (warning only)
  if (options.optional) {
    for (const varName of options.optional) {
      const value = Deno.env.get(varName);

      if (!value) {
        console.warn(`[ENV WARNING] Optional variable missing: ${varName}`);
      }
    }
  }

  if (issues.length > 0) {
    console.error(
      `[ENV VALIDATION FAILED] Environment: ${environment}`,
      issues.join('; ')
    );

    // In production, fail hard
    if (environment === 'production') {
      return new Response(
        JSON.stringify({
          error: 'Server misconfigured',
          message: 'Critical environment variables are not properly configured',
          environment,
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // In development, log warning
    console.warn('[ENV VALIDATION WARNING]', issues.join('; '));
  }

  return null;
}

/**
 * Get current environment name
 */
export function getEnvironment(): string {
  return Deno.env.get('DENO_ENV') || 'development';
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return getEnvironment() === 'production';
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return getEnvironment() === 'development';
}
