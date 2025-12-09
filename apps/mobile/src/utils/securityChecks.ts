/**
 * Runtime Security Checks
 * 
 * Performs security validation at runtime to prevent common vulnerabilities:
 * - Environment variable exposure
 * - Sensitive data in logs
 * - API key leakage
 * - Insecure storage usage
 * 
 * Run this in development mode to catch security issues early
 */

import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SecurityIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'env' | 'storage' | 'logging' | 'api';
  message: string;
  fix?: string;
}

interface SecurityCheckResult {
  passed: boolean;
  issues: SecurityIssue[];
  timestamp: string;
}

/**
 * Patterns that should NEVER appear in environment variables
 */
const SENSITIVE_PATTERNS = {
  // Stripe keys
  STRIPE_SECRET: /sk_live_|sk_test_/,
  STRIPE_WEBHOOK: /whsec_/,
  
  // OpenAI keys
  OPENAI_KEY: /sk-[a-zA-Z0-9]{20,}/,
  
  // AWS keys
  AWS_SECRET: /AKIA[0-9A-Z]{16}/,
  
  // Generic secrets
  PRIVATE_KEY: /-----BEGIN (RSA |EC |DSA )?PRIVATE KEY-----/,
  JWT_SECRET: /jwt.*secret/i,
  
  // Database credentials
  DB_PASSWORD: /password.*[:=].*[a-zA-Z0-9]/i,
  
  // Cloudflare tokens
  CF_TOKEN: /cloudflare.*token/i,
};

/**
 * Keys that are SAFE to expose (public, non-sensitive)
 */
const SAFE_ENV_KEYS = [
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY',
  'EXPO_PUBLIC_APP_ENV',
  'EXPO_PUBLIC_API_URL',
  'EXPO_PUBLIC_SENTRY_DSN',
  'EXPO_PUBLIC_GOOGLE_ANALYTICS_ID',
  'EXPO_PUBLIC_CLOUDFLARE_ACCOUNT_ID',
];

/**
 * Check environment variables for exposed secrets
 */
export function checkEnvironmentVariables(): SecurityIssue[] {
  const issues: SecurityIssue[] = [];
  const env = Constants.expoConfig?.extra || {};

  // Check all environment variables
  Object.entries(env).forEach(([key, value]) => {
    const valueStr = String(value);

    // Check if key starts with EXPO_PUBLIC_ but isn't in safe list
    if (key.startsWith('EXPO_PUBLIC_') && !SAFE_ENV_KEYS.includes(key)) {
      // Check if value matches sensitive patterns
      Object.entries(SENSITIVE_PATTERNS).forEach(([name, pattern]) => {
        if (pattern.test(valueStr)) {
          issues.push({
            severity: 'critical',
            category: 'env',
            message: `🚨 CRITICAL: Sensitive ${name} detected in ${key}`,
            fix: `Remove ${key} from .env and use server-side Edge Function instead`,
          });
        }
      });

      // Warn about any non-whitelisted EXPO_PUBLIC_ variable
      issues.push({
        severity: 'medium',
        category: 'env',
        message: `⚠️ WARNING: ${key} is exposed to client bundle`,
        fix: `Verify this variable contains only public, non-sensitive data`,
      });
    }

    // Check if any variable contains sensitive patterns (even non-EXPO_PUBLIC)
    if (!key.startsWith('EXPO_PUBLIC_')) {
      Object.entries(SENSITIVE_PATTERNS).forEach(([name, pattern]) => {
        if (pattern.test(valueStr)) {
          issues.push({
            severity: 'high',
            category: 'env',
            message: `🔒 HIGH: Potential ${name} in environment variable ${key}`,
            fix: 'Ensure this variable is only used server-side',
          });
        }
      });
    }
  });

  return issues;
}

/**
 * Check AsyncStorage for sensitive data that should be in SecureStore
 */
export async function checkAsyncStorageUsage(): Promise<SecurityIssue[]> {
  const issues: SecurityIssue[] = [];

  try {
    const keys = await AsyncStorage.getAllKeys();
    const items = await AsyncStorage.multiGet(keys);

    const sensitiveKeywords = [
      'token',
      'password',
      'secret',
      'key',
      'auth',
      'credential',
      'pin',
      'biometric',
      'payment',
      'card',
      'ssn',
    ];

    items.forEach(([key, value]) => {
      // Check if key contains sensitive keywords
      const keyLower = key.toLowerCase();
      const containsSensitiveKeyword = sensitiveKeywords.some(keyword =>
        keyLower.includes(keyword)
      );

      if (containsSensitiveKeyword) {
        issues.push({
          severity: 'critical',
          category: 'storage',
          message: `🚨 CRITICAL: Potentially sensitive data in AsyncStorage: ${key}`,
          fix: `Migrate "${key}" to SecureStore using secureStorage.setItem()`,
        });
      }

      // Check if value looks like a JWT token
      if (value && typeof value === 'string') {
        if (value.match(/^eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/)) {
          issues.push({
            severity: 'critical',
            category: 'storage',
            message: `🚨 CRITICAL: JWT token found in AsyncStorage: ${key}`,
            fix: 'Move all tokens to SecureStore immediately',
          });
        }

        // Check for other sensitive patterns
        Object.entries(SENSITIVE_PATTERNS).forEach(([name, pattern]) => {
          if (pattern.test(value)) {
            issues.push({
              severity: 'critical',
              category: 'storage',
              message: `🚨 CRITICAL: ${name} pattern found in AsyncStorage: ${key}`,
              fix: 'Remove sensitive data from AsyncStorage',
            });
          }
        });
      }
    });
  } catch (error) {
    issues.push({
      severity: 'low',
      category: 'storage',
      message: `Could not check AsyncStorage: ${error}`,
    });
  }

  return issues;
}

/**
 * Check console logs for sensitive data leakage
 */
export function checkLoggingPatterns(): SecurityIssue[] {
  const issues: SecurityIssue[] = [];

  // Override console methods to detect sensitive data
  const originalConsoleLog = console.log;
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;

  const wrapConsole = (method: typeof console.log, level: string) => {
    return (...args: any[]) => {
      const message = args.map(arg => String(arg)).join(' ');

      // Check for sensitive patterns in logs
      Object.entries(SENSITIVE_PATTERNS).forEach(([name, pattern]) => {
        if (pattern.test(message)) {
          issues.push({
            severity: 'high',
            category: 'logging',
            message: `🔒 HIGH: Potential ${name} in console.${level}()`,
            fix: 'Sanitize logs before logging. Use logger.ts with redaction',
          });
        }
      });

      // Call original method
      method.apply(console, args);
    };
  };

  // In development, monitor console methods
  if (__DEV__) {
    console.log = wrapConsole(originalConsoleLog, 'log');
    console.warn = wrapConsole(originalConsoleWarn, 'warn');
    console.error = wrapConsole(originalConsoleError, 'error');
  }

  return issues;
}

/**
 * Check API calls for hardcoded secrets
 */
export function checkAPICallSecurity(url: string, headers: Record<string, string>): SecurityIssue[] {
  const issues: SecurityIssue[] = [];

  // Check URL for embedded secrets
  Object.entries(SENSITIVE_PATTERNS).forEach(([name, pattern]) => {
    if (pattern.test(url)) {
      issues.push({
        severity: 'critical',
        category: 'api',
        message: `🚨 CRITICAL: ${name} in API URL`,
        fix: 'Never embed secrets in URLs. Use Authorization headers via Edge Functions',
      });
    }
  });

  // Check headers for sensitive patterns
  Object.entries(headers).forEach(([key, value]) => {
    if (key.toLowerCase() === 'authorization') {
      // Check if using proper Bearer token (should be from SecureStore)
      if (!value.startsWith('Bearer ')) {
        issues.push({
          severity: 'medium',
          category: 'api',
          message: '⚠️ WARNING: Non-standard Authorization header format',
          fix: 'Use "Bearer <token>" format with tokens from SecureStore',
        });
      }

      // Check if token looks like a secret key (not a JWT)
      Object.entries(SENSITIVE_PATTERNS).forEach(([name, pattern]) => {
        if (pattern.test(value)) {
          issues.push({
            severity: 'critical',
            category: 'api',
            message: `🚨 CRITICAL: ${name} in Authorization header`,
            fix: 'API keys should never be in client code. Use Edge Functions',
          });
        }
      });
    }
  });

  return issues;
}

/**
 * Run all security checks
 */
export async function runSecurityAudit(): Promise<SecurityCheckResult> {
  const allIssues: SecurityIssue[] = [];

  // 1. Check environment variables
  console.log('🔍 Checking environment variables...');
  const envIssues = checkEnvironmentVariables();
  allIssues.push(...envIssues);

  // 2. Check AsyncStorage
  console.log('🔍 Checking AsyncStorage...');
  const storageIssues = await checkAsyncStorageUsage();
  allIssues.push(...storageIssues);

  // 3. Check logging patterns
  console.log('🔍 Monitoring console logs...');
  const loggingIssues = checkLoggingPatterns();
  allIssues.push(...loggingIssues);

  // 4. Generate report
  const criticalCount = allIssues.filter(i => i.severity === 'critical').length;
  const highCount = allIssues.filter(i => i.severity === 'high').length;

  const result: SecurityCheckResult = {
    passed: criticalCount === 0 && highCount === 0,
    issues: allIssues,
    timestamp: new Date().toISOString(),
  };

  // Print summary
  console.log('\n🛡️ Security Audit Summary');
  console.log('─────────────────────────');
  console.log(`✅ Passed: ${result.passed ? 'YES' : 'NO'}`);
  console.log(`🚨 Critical: ${criticalCount}`);
  console.log(`🔒 High: ${highCount}`);
  console.log(`⚠️ Medium: ${allIssues.filter(i => i.severity === 'medium').length}`);
  console.log(`ℹ️ Low: ${allIssues.filter(i => i.severity === 'low').length}`);

  if (allIssues.length > 0) {
    console.log('\n📋 Issues Found:');
    allIssues.forEach((issue, i) => {
      console.log(`\n${i + 1}. [${issue.severity.toUpperCase()}] ${issue.category}`);
      console.log(`   ${issue.message}`);
      if (issue.fix) {
        console.log(`   💡 Fix: ${issue.fix}`);
      }
    });
  } else {
    console.log('\n✨ No security issues found!');
  }

  return result;
}

/**
 * Initialize security monitoring (call once on app startup)
 */
export function initSecurityMonitoring() {
  if (__DEV__) {
    console.log('🛡️ Security monitoring enabled (DEV mode)');
    
    // Run audit on startup
    runSecurityAudit().catch(console.error);

    // Set up periodic checks (every 5 minutes in dev)
    setInterval(() => {
      runSecurityAudit().catch(console.error);
    }, 5 * 60 * 1000);
  }
}

/**
 * Sanitize logs to remove sensitive data
 */
export function sanitizeLog(message: string): string {
  let sanitized = message;

  // Redact JWT tokens
  sanitized = sanitized.replace(
    /eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g,
    '[JWT_REDACTED]'
  );

  // Redact API keys
  sanitized = sanitized.replace(/sk_live_[a-zA-Z0-9]+/g, '[STRIPE_KEY_REDACTED]');
  sanitized = sanitized.replace(/sk_test_[a-zA-Z0-9]+/g, '[STRIPE_TEST_KEY_REDACTED]');
  sanitized = sanitized.replace(/sk-[a-zA-Z0-9]{20,}/g, '[OPENAI_KEY_REDACTED]');
  sanitized = sanitized.replace(/whsec_[a-zA-Z0-9]+/g, '[WEBHOOK_SECRET_REDACTED]');

  // Redact bearer tokens
  sanitized = sanitized.replace(/Bearer [a-zA-Z0-9_-]+/g, 'Bearer [REDACTED]');

  return sanitized;
}

export default {
  runSecurityAudit,
  initSecurityMonitoring,
  checkEnvironmentVariables,
  checkAsyncStorageUsage,
  checkLoggingPatterns,
  checkAPICallSecurity,
  sanitizeLog,
};
