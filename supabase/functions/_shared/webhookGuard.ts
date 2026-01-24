/**
 * WebhookGuard - Standardized Webhook Security
 * EK-P1-8: Unified webhook verification and protection
 *
 * Provides:
 * - Signature verification (HMAC-SHA256, ECDSA, etc.)
 * - Idempotency key handling (prevent replay attacks)
 * - Rate limiting per source IP
 * - Request body validation
 * - Fail-closed pattern (reject if verification fails)
 *
 * Usage:
 * ```typescript
 * const guard = new WebhookGuard({
 *   secretEnvVar: 'PROVIDER_WEBHOOK_SECRET',
 *   signatureHeader: 'X-Signature-256',
 *   signatureType: 'hmac-sha256',
 *   idempotencyHeader: 'X-Event-Id',
 * });
 *
 * const result = await guard.verify(req);
 * if (!result.valid) {
 *   return new Response(result.error, { status: result.status });
 * }
 * // Process webhook with result.body and result.idempotencyKey
 * ```
 */

import { Logger } from './logger.ts';

// =============================================================================
// TYPES
// =============================================================================

export type SignatureType = 'hmac-sha256' | 'hmac-sha1' | 'ecdsa-sha256' | 'bearer' | 'basic';

export interface WebhookGuardConfig {
  /** Environment variable name containing the secret */
  secretEnvVar: string;
  /** Header containing the signature */
  signatureHeader: string;
  /** Type of signature verification */
  signatureType: SignatureType;
  /** Optional header containing timestamp (for replay protection) */
  timestampHeader?: string;
  /** Optional header containing idempotency key */
  idempotencyHeader?: string;
  /** Maximum age of request in seconds (for replay protection) */
  maxAge?: number;
  /** Rate limit: max requests per window */
  rateLimit?: { maxRequests: number; windowMs: number };
  /** Whether to allow development mode (DANGER: set false in production) */
  allowDevMode?: boolean;
  /** Optional function name for logging */
  functionName?: string;
}

export interface VerificationResult {
  valid: boolean;
  error?: string;
  status: number;
  body?: string;
  idempotencyKey?: string;
  metadata?: Record<string, unknown>;
}

// =============================================================================
// RATE LIMITER
// =============================================================================

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(
  key: string,
  config: { maxRequests: number; windowMs: number },
): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + config.windowMs });
    return true;
  }

  if (record.count >= config.maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

// Periodic cleanup (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore) {
    if (now > record.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

// =============================================================================
// IDEMPOTENCY STORE
// =============================================================================

// Simple in-memory idempotency store (use Redis/KV for production scale)
const idempotencyStore = new Map<string, number>();
const IDEMPOTENCY_TTL = 24 * 60 * 60 * 1000; // 24 hours

function checkIdempotency(key: string): boolean {
  const now = Date.now();
  const existing = idempotencyStore.get(key);

  if (existing && now - existing < IDEMPOTENCY_TTL) {
    return false; // Already processed
  }

  idempotencyStore.set(key, now);
  return true;
}

// Periodic cleanup
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of idempotencyStore) {
    if (now - timestamp > IDEMPOTENCY_TTL) {
      idempotencyStore.delete(key);
    }
  }
}, 60 * 60 * 1000); // Every hour

// =============================================================================
// SIGNATURE VERIFICATION
// =============================================================================

async function verifyHmacSha256(
  body: string,
  signature: string,
  secret: string,
  timestamp?: string,
): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const data = timestamp ? encoder.encode(timestamp + body) : encoder.encode(body);

    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );

    const signed = await crypto.subtle.sign('HMAC', key, data);
    const expectedSignature = Array.from(new Uint8Array(signed))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    // Support both raw hex and prefixed formats
    const normalizedSig = signature.replace(/^sha256=/, '').toLowerCase();
    return normalizedSig === expectedSignature;
  } catch {
    return false;
  }
}

async function verifyHmacSha1(
  body: string,
  signature: string,
  secret: string,
): Promise<boolean> {
  try {
    const encoder = new TextEncoder();

    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-1' },
      false,
      ['sign'],
    );

    const signed = await crypto.subtle.sign('HMAC', key, encoder.encode(body));
    const expectedSignature = Array.from(new Uint8Array(signed))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const normalizedSig = signature.replace(/^sha1=/, '').toLowerCase();
    return normalizedSig === expectedSignature;
  } catch {
    return false;
  }
}

function verifyBearer(token: string, secret: string): boolean {
  const normalizedToken = token.replace(/^Bearer\s+/i, '');
  return normalizedToken === secret;
}

function verifyBasic(authHeader: string, secret: string): boolean {
  const normalizedAuth = authHeader.replace(/^Basic\s+/i, '');
  // Secret should be base64 encoded username:password
  return normalizedAuth === secret;
}

// =============================================================================
// WEBHOOK GUARD CLASS
// =============================================================================

export class WebhookGuard {
  private config: WebhookGuardConfig;
  private logger: Logger;
  private secret: string | null;

  constructor(config: WebhookGuardConfig) {
    this.config = config;
    this.logger = new Logger(config.functionName || 'webhook-guard');
    this.secret = Deno.env.get(config.secretEnvVar) || null;
  }

  /**
   * Verify incoming webhook request
   */
  async verify(req: Request): Promise<VerificationResult> {
    // EK-P0-4: Fail closed - reject if secret not configured
    if (!this.secret) {
      this.logger.error(`CRITICAL: ${this.config.secretEnvVar} is not configured`);
      return {
        valid: false,
        error: 'Service misconfigured',
        status: 500,
      };
    }

    // Rate limiting
    if (this.config.rateLimit) {
      const clientIp = req.headers.get('cf-connecting-ip') ||
        req.headers.get('x-forwarded-for')?.split(',')[0] ||
        'unknown';

      if (!checkRateLimit(clientIp, this.config.rateLimit)) {
        this.logger.securityEvent('Rate limit exceeded', { clientIp });
        return {
          valid: false,
          error: 'Rate limit exceeded',
          status: 429,
        };
      }
    }

    // Get request body
    const body = await req.text();

    // Get signature
    const signature = req.headers.get(this.config.signatureHeader);
    if (!signature) {
      this.logger.securityEvent('Missing signature header', {
        header: this.config.signatureHeader,
      });
      return {
        valid: false,
        error: 'Missing authentication',
        status: 401,
      };
    }

    // Get optional timestamp
    const timestamp = this.config.timestampHeader
      ? req.headers.get(this.config.timestampHeader)
      : undefined;

    // Check timestamp freshness (replay protection)
    if (timestamp && this.config.maxAge) {
      const requestTime = parseInt(timestamp, 10) * 1000; // Assume Unix timestamp
      const now = Date.now();
      if (isNaN(requestTime) || Math.abs(now - requestTime) > this.config.maxAge * 1000) {
        this.logger.securityEvent('Stale request timestamp', {
          timestamp,
          maxAge: this.config.maxAge,
        });
        return {
          valid: false,
          error: 'Request too old',
          status: 401,
        };
      }
    }

    // Verify signature based on type
    let isValid = false;
    switch (this.config.signatureType) {
      case 'hmac-sha256':
        isValid = await verifyHmacSha256(body, signature, this.secret, timestamp || undefined);
        break;
      case 'hmac-sha1':
        isValid = await verifyHmacSha1(body, signature, this.secret);
        break;
      case 'bearer':
        isValid = verifyBearer(signature, this.secret);
        break;
      case 'basic':
        isValid = verifyBasic(signature, this.secret);
        break;
      case 'ecdsa-sha256':
        // ECDSA verification is more complex - implement per provider
        this.logger.warn('ECDSA verification not implemented in generic guard');
        isValid = false;
        break;
    }

    if (!isValid) {
      this.logger.securityEvent('Invalid signature', {
        signatureType: this.config.signatureType,
      });
      return {
        valid: false,
        error: 'Invalid signature',
        status: 401,
      };
    }

    // Idempotency check
    let idempotencyKey: string | undefined;
    if (this.config.idempotencyHeader) {
      idempotencyKey = req.headers.get(this.config.idempotencyHeader) || undefined;
      if (idempotencyKey && !checkIdempotency(idempotencyKey)) {
        this.logger.info('Duplicate request detected', { idempotencyKey });
        return {
          valid: true, // Valid but duplicate
          status: 200,
          body,
          idempotencyKey,
          metadata: { duplicate: true },
        };
      }
    }

    return {
      valid: true,
      status: 200,
      body,
      idempotencyKey,
    };
  }

  /**
   * Create a standardized error response
   */
  errorResponse(result: VerificationResult, origin?: string | null): Response {
    return new Response(
      JSON.stringify({ error: result.error }),
      {
        status: result.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': origin || '*',
        },
      },
    );
  }
}

// =============================================================================
// FACTORY FUNCTIONS
// =============================================================================

/**
 * Create guard for RevenueCat webhooks
 */
export function createRevenueCatGuard(): WebhookGuard {
  return new WebhookGuard({
    secretEnvVar: 'REVENUECAT_WEBHOOK_SECRET',
    signatureHeader: 'Authorization',
    signatureType: 'bearer',
    functionName: 'revenuecat-webhook',
    rateLimit: { maxRequests: 100, windowMs: 60000 },
  });
}

/**
 * Create guard for iDenfy webhooks
 */
export function createIdenfyGuard(): WebhookGuard {
  return new WebhookGuard({
    secretEnvVar: 'IDENFY_API_SECRET',
    signatureHeader: 'x-idenfy-signature',
    signatureType: 'hmac-sha256',
    functionName: 'idenfy-webhook',
    rateLimit: { maxRequests: 50, windowMs: 60000 },
  });
}

/**
 * Create guard for PayTR webhooks
 */
export function createPayTRGuard(): WebhookGuard {
  return new WebhookGuard({
    secretEnvVar: 'PAYTR_MERCHANT_SALT',
    signatureHeader: 'hash',
    signatureType: 'hmac-sha256',
    functionName: 'paytr-webhook',
    rateLimit: { maxRequests: 100, windowMs: 60000 },
  });
}

export default WebhookGuard;
