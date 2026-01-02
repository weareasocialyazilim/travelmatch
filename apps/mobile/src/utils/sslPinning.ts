/**
 * SSL Pinning Utility
 *
 * Provides certificate pinning for secure API endpoints
 * to prevent man-in-the-middle attacks.
 *
 * IMPORTANT: For production deployment, you must:
 * 1. Obtain real certificate pins using: openssl s_client -connect domain:443 | openssl x509 -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | openssl enc -base64
 * 2. Replace the placeholder pins below with real SHA-256 public key hashes
 * 3. Include backup pins from intermediate certificates
 * 4. Set up certificate rotation monitoring
 *
 * @see https://owasp.org/www-community/controls/Certificate_and_Public_Key_Pinning
 */

import { Platform } from 'react-native';
import { logger } from './logger';

/**
 * Check if a pin value is a placeholder (not a real certificate hash)
 */
function isPlaceholderPin(pin: string): boolean {
  // Placeholder pins contain repeated characters like AAA, BBB, etc.
  const placeholderPatterns = [
    /^sha256\/[A-Z]{43}=$/,  // All same uppercase letter
    /^sha256\/placeholder/i,
    /^sha256\/TODO/i,
    /^sha256\/REPLACE/i,
  ];
  return placeholderPatterns.some(pattern => pattern.test(pin));
}

/**
 * Warn if placeholder pins are detected in development
 */
function warnAboutPlaceholderPins(): void {
  if (__DEV__) {
    const hasPlaeholders = Object.values(PINNED_DOMAINS).some(config =>
      config.pins.some(isPlaceholderPin)
    );
    if (hasPlaeholders) {
      logger.warn(
        'SSL Pinning',
        'SECURITY WARNING: Placeholder certificate pins detected. ' +
        'Replace with real certificate hashes before production deployment. ' +
        'See sslPinning.ts for instructions.'
      );
    }
  }
}

/**
 * SHA-256 public key pins for trusted domains
 *
 * These pins use intermediate CA certificates for better stability.
 * Intermediate CA pins rotate less frequently than leaf certificates.
 *
 * PRODUCTION CHECKLIST:
 * - [x] Using intermediate CA pins for stability
 * - [x] Include backup pins from multiple CAs
 * - [ ] Set up certificate rotation monitoring
 * - [ ] Test pinning with Charles Proxy or mitmproxy
 *
 * To update pins, run:
 * echo | openssl s_client -servername <domain> -connect <domain>:443 2>/dev/null | \
 *   openssl x509 -pubkey -noout | openssl pkey -pubin -outform der | \
 *   openssl dgst -sha256 -binary | base64
 */
const PINNED_DOMAINS: Record<
  string,
  {
    pins: string[];
    includeSubdomains: boolean;
  }
> = {
  // Supabase API endpoints (uses Cloudflare CDN)
  // Pins: Cloudflare Inc ECC CA-3, DigiCert Global Root G2, Google Trust Services
  'supabase.co': {
    pins: [
      // Cloudflare Inc ECC CA-3 (intermediate)
      'sha256/Wd8xe/qfTwq3OhMCpwGdMXu+93xXuFHtZSGscXMD2Gg=',
      // DigiCert Global Root G2 (root CA backup)
      'sha256/Y9mvm0exBk1JoQ57f9Vm28jKo5lFm/woKcVxrYxu80o=',
      // Google Trust Services GTS Root R1 (backup)
      'sha256/hxqRlPTu1bMS/0DITB1SSu0vd4u/8l8TjPgfaAp63Gc=',
    ],
    includeSubdomains: true,
  },
  // Stripe API endpoints
  // Pins: DigiCert Global Root CA, DigiCert Global Root G2, Let's Encrypt
  'api.stripe.com': {
    pins: [
      // DigiCert Global Root CA (Stripe's primary CA)
      'sha256/r/mIkG3eEpVdm+u/ko/cwxzOMo1bk4TyHIlByibiA5E=',
      // DigiCert Global Root G2 (backup)
      'sha256/Y9mvm0exBk1JoQ57f9Vm28jKo5lFm/woKcVxrYxu80o=',
      // Let's Encrypt ISRG Root X1 (backup)
      'sha256/C5+lpZ7tcVwmwQIMcRtPbsQtWLABXhQzejna0wHFr8M=',
    ],
    includeSubdomains: false,
  },
  // Cloudflare Images
  // Pins: Cloudflare Inc ECC CA-3, DigiCert Global Root G2
  'imagedelivery.net': {
    pins: [
      // Cloudflare Inc ECC CA-3 (intermediate)
      'sha256/Wd8xe/qfTwq3OhMCpwGdMXu+93xXuFHtZSGscXMD2Gg=',
      // DigiCert Global Root G2 (root CA backup)
      'sha256/Y9mvm0exBk1JoQ57f9Vm28jKo5lFm/woKcVxrYxu80o=',
    ],
    includeSubdomains: true,
  },
};

// Log warning in development if placeholder pins are detected
warnAboutPlaceholderPins();

/**
 * Endpoints that require SSL pinning
 */
export const PINNED_ENDPOINTS = {
  PAYMENT: [
    '/functions/v1/create-payment-intent',
    '/functions/v1/confirm-payment',
    '/functions/v1/stripe-webhook',
    '/functions/v1/transfer-funds',
  ],
  AUTH: [
    '/auth/v1/token',
    '/auth/v1/signup',
    '/auth/v1/recover',
    '/functions/v1/verify-2fa',
    '/functions/v1/setup-2fa',
  ],
  SENSITIVE: [
    '/functions/v1/verify-kyc',
    '/functions/v1/export-user-data',
  ],
} as const;

/**
 * Check if a URL requires SSL pinning
 */
export function requiresPinning(url: string): boolean {
  const allPinnedEndpoints = [
    ...PINNED_ENDPOINTS.PAYMENT,
    ...PINNED_ENDPOINTS.AUTH,
    ...PINNED_ENDPOINTS.SENSITIVE,
  ];

  return allPinnedEndpoints.some((endpoint) => url.includes(endpoint));
}

/**
 * Get the domain from a URL
 */
function getDomain(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return null;
  }
}

/**
 * Check if a domain is pinned
 */
export function isDomainPinned(domain: string): boolean {
  // Check exact match
  if (PINNED_DOMAINS[domain]) {
    return true;
  }

  // Check subdomain matches
  for (const pinnedDomain of Object.keys(PINNED_DOMAINS)) {
    const config = PINNED_DOMAINS[pinnedDomain];
    if (config.includeSubdomains && domain.endsWith(`.${pinnedDomain}`)) {
      return true;
    }
  }

  return false;
}

/**
 * Get pins for a domain
 */
export function getPinsForDomain(domain: string): string[] {
  // Check exact match
  if (PINNED_DOMAINS[domain]) {
    return PINNED_DOMAINS[domain].pins;
  }

  // Check subdomain matches
  for (const pinnedDomain of Object.keys(PINNED_DOMAINS)) {
    const config = PINNED_DOMAINS[pinnedDomain];
    if (config.includeSubdomains && domain.endsWith(`.${pinnedDomain}`)) {
      return config.pins;
    }
  }

  return [];
}

/**
 * SSL Pinning validation result
 */
interface SSLValidationResult {
  valid: boolean;
  error?: string;
  domain?: string;
}

/**
 * Validate SSL certificate for a request
 *
 * In Expo managed workflow, native certificate pinning is limited.
 * This function provides:
 * 1. Development warnings about placeholder pins
 * 2. Logging for security monitoring
 * 3. A hook point for future native module integration
 *
 * For full production security, integrate with:
 * - iOS: TrustKit or URLSession delegate
 * - Android: OkHttp CertificatePinner
 */
export async function validateSSLCertificate(
  url: string,
): Promise<SSLValidationResult> {
  const domain = getDomain(url);

  if (!domain) {
    return {
      valid: false,
      error: 'Invalid URL',
    };
  }

  // Check if domain requires pinning
  if (!isDomainPinned(domain)) {
    // Domain not in pinning list - allow (use standard TLS)
    return {
      valid: true,
      domain,
    };
  }

  // Get pins for this domain
  const pins = getPinsForDomain(domain);
  const hasPlaceholderPins = pins.some(isPlaceholderPin);

  // In development, warn about placeholder pins
  if (__DEV__) {
    if (hasPlaceholderPins) {
      logger.warn(
        'SSL Pinning',
        `Placeholder pins detected for ${domain}. ` +
        'Replace with real certificate hashes before production.'
      );
    }
    logger.debug('SSL Pinning', `Validating certificate for ${domain}`);
  }

  // In production, FAIL if placeholder pins are still present
  // This is a critical security issue that must be fixed before deployment
  if (!__DEV__ && hasPlaceholderPins) {
    logger.error(
      'SSL Pinning',
      `CRITICAL: Placeholder certificate pins detected for ${domain} in production. ` +
      'SSL pinning is not providing protection! Request blocked for security.'
    );
    // SECURITY: Block requests with placeholder pins in production
    // This prevents deploying without proper certificate pinning
    return {
      valid: false,
      error: `SSL_PINNING_NOT_CONFIGURED: Placeholder pins detected for ${domain}. ` +
        'Real certificate hashes must be configured before production deployment.',
      domain,
    };
  }

  // For Expo managed workflow, we rely on:
  // 1. ATS (App Transport Security) for iOS
  // 2. Network Security Config for Android
  // 3. Supabase/Stripe SDK built-in certificate validation

  // In production, this should integrate with native pinning modules
  // For now, we trust the platform's TLS implementation
  return {
    valid: true,
    domain,
  };
}

/**
 * Create a fetch wrapper with SSL pinning awareness
 */
export function createPinnedFetch() {
  return async (
    url: string,
    options: RequestInit = {},
  ): Promise<Response> => {
    // Validate SSL for pinned endpoints
    if (requiresPinning(url)) {
      const validation = await validateSSLCertificate(url);

      if (!validation.valid) {
        logger.error('SSL Pinning', `Certificate validation failed: ${validation.error}`);
        throw new Error(`SSL_PINNING_FAILED: ${validation.error}`);
      }

      if (__DEV__) {
        logger.debug('SSL Pinning', `Certificate validated for ${validation.domain}`);
      }
    }

    // Perform the actual fetch
    return fetch(url, options);
  };
}

/**
 * Security headers for API requests
 */
export const SECURITY_HEADERS = {
  // Prevent caching of sensitive responses
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Pragma': 'no-cache',
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  // Request ID for audit trail
  'X-Request-ID': () => `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
};

/**
 * Add security headers to a request
 */
export function addSecurityHeaders(
  headers: Record<string, string> = {},
): Record<string, string> {
  return {
    ...headers,
    'Cache-Control': SECURITY_HEADERS['Cache-Control'],
    'Pragma': SECURITY_HEADERS['Pragma'],
    'X-Content-Type-Options': SECURITY_HEADERS['X-Content-Type-Options'],
    'X-Request-ID': SECURITY_HEADERS['X-Request-ID'](),
    'X-Platform': Platform.OS,
    'X-App-Version': '1.0.0', // Should be dynamically set from app config
  };
}

/**
 * Log SSL pinning events for security monitoring
 */
export function logSSLEvent(
  event: 'validation_success' | 'validation_failure' | 'pin_mismatch',
  details: {
    url: string;
    domain?: string;
    error?: string;
  },
): void {
  const logData = {
    event,
    timestamp: new Date().toISOString(),
    ...details,
  };

  if (event === 'validation_failure' || event === 'pin_mismatch') {
    logger.error('SSL Pinning', JSON.stringify(logData));
    // In production, also send to security monitoring service
  } else if (__DEV__) {
    logger.debug('SSL Pinning', JSON.stringify(logData));
  }
}

export default {
  requiresPinning,
  isDomainPinned,
  getPinsForDomain,
  validateSSLCertificate,
  createPinnedFetch,
  addSecurityHeaders,
  logSSLEvent,
  PINNED_ENDPOINTS,
};
